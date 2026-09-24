import {
  collection,
  doc,
  updateDoc,
  getDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Booking, TimeSlot } from '../types';
import { TIME_SLOTS } from '../constants';
import { generateBookingId, isPastBookingSlot, isWithinCheckInWindow, hasCheckInExpired } from '../utils/helpers';
import { notificationService } from './notificationService';
import { parseBookingQrPayload } from '../utils/qrHelpers';

export const bookingService = {
  /**
   * Real-time listener for booked slots of a specific room on a specific date.
   */
  subscribeBookedSlots: (
    roomId: string,
    date: string,
    onUpdate: (bookedSlotIds: string[], activeBookings: Booking[]) => void
  ): (() => void) => {
    if (!db) {
      onUpdate([], []);
      return () => { };
    }

    try {
      const q = query(
        collection(db, 'bookings'),
        where('roomId', '==', roomId),
        where('date', '==', date),
        where('status', 'in', ['active', 'checked-in'])
      );

      return onSnapshot(
        q,
        (snapshot) => {
          const activeBookings: Booking[] = snapshot.docs.map(
            (d) => d.data() as Booking
          );

          const bookedSlotIds = activeBookings
            .map((b) => {
              const matchedSlot = TIME_SLOTS.find(
                (s) => s.startTime === b.startTime && s.endTime === b.endTime
              );
              return matchedSlot ? matchedSlot.id : null;
            })
            .filter((id): id is string => id !== null);

          onUpdate(bookedSlotIds, activeBookings);
        },
        (error) => {
          console.warn('[bookingService] subscribeBookedSlots fallback:', error.message);
          onUpdate([], []);
        }
      );
    } catch (e) {
      console.warn('[bookingService] Firestore offline:', e);
      onUpdate([], []);
      return () => { };
    }
  },
  /**
   * Real-time listener for all bookings of a specific user.
   */
  subscribeUserBookings: (
    userId: string,
    onUpdate: (bookings: Booking[]) => void
  ): (() => void) => {
    if (!db || !userId) {
      onUpdate([]);
      return () => { };
    }

    try {
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', userId)
      );

      return onSnapshot(
        q,
        (snapshot) => {
          const bookings: Booking[] = snapshot.docs.map(
            (d) => d.data() as Booking
          );
          bookings.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          onUpdate(bookings);
        },
        (error) => {
          console.warn('[bookingService] subscribeUserBookings fallback:', error.message);
          onUpdate([]);
        }
      );
    } catch (e) {
      console.warn('[bookingService] Firestore user bookings offline:', e);
      onUpdate([]);
      return () => { };
    }
  },

  /**
   * Check if user already has an active booking on the date and time slot.
   */
  checkUserTimeConflict: async (
    userId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<{ hasConflict: boolean; conflictingBooking?: Booking }> => {
    if (!db || !userId) return { hasConflict: false };

    try {
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', userId),
        where('date', '==', date),
        where('status', 'in', ['active', 'checked-in'])
      );

      const snapshot = await getDocs(q);
      const userBookingsOnDate: Booking[] = snapshot.docs.map(
        (d) => d.data() as Booking
      );

      const conflicting = userBookingsOnDate.find(
        (b) => b.startTime === startTime && b.endTime === endTime
      );

      if (conflicting) {
        return { hasConflict: true, conflictingBooking: conflicting };
      }
    } catch (e) {
      console.warn('[bookingService] checkUserTimeConflict notice:', e);
    }

    return { hasConflict: false };
  },

  /**
   * Create a new booking in Firestore with conflict validation.
   */
  createBooking: async (data: {
    roomId: string;
    roomName: string;
    userId: string;
    userName: string;
    date: string;
    slot: TimeSlot;
  }): Promise<Booking> => {
    if (isPastBookingSlot(data.date, data.slot.startTime)) {
      throw new Error(
        `Khung giờ ${data.slot.label} của hôm nay đã bắt đầu hoặc đã qua. Vui lòng chọn khung giờ khác.`
      );
    }

    const bookingId = generateBookingId();
    const newBooking: Booking = {
      id: bookingId,
      roomId: data.roomId,
      roomName: data.roomName,
      userId: data.userId,
      userName: data.userName,
      date: data.date,
      startTime: data.slot.startTime,
      endTime: data.slot.endTime,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    if (db) {
      // Use Firestore Transaction for atomic concurrency safety (Race Condition prevention)
      const slotLockRef = doc(
        db,
        'slot_locks',
        `${data.roomId}_${data.date}_${data.slot.startTime.replace(':', '')}`
      );

      await runTransaction(db, async (transaction) => {
        const lockSnap = await transaction.get(slotLockRef);

        if (lockSnap.exists()) {
          const lockData = lockSnap.data();
          if (lockData && lockData.status === 'active') {
            throw new Error(
              'Khung giờ này vừa có người khác đặt thành công. Vui lòng chọn khung giờ khác.'
            );
          }
        }

        // Check user time conflict
        const userConflict = await bookingService.checkUserTimeConflict(
          data.userId,
          data.date,
          data.slot.startTime,
          data.slot.endTime
        );
        if (userConflict.hasConflict) {
          throw new Error(
            `Bạn đã có lịch đặt phòng "${userConflict.conflictingBooking?.roomName}" vào khung giờ này rồi.`
          );
        }

        // Lock slot and create booking atomically
        transaction.set(slotLockRef, {
          bookingId,
          roomId: data.roomId,
          date: data.date,
          startTime: data.slot.startTime,
          userId: data.userId,
          status: 'active',
          createdAt: new Date().toISOString(),
        });

        transaction.set(doc(db, 'bookings', bookingId), newBooking);
      });

      const notificationId = await notificationService.scheduleBookingReminder(newBooking);
      await notificationService.scheduleNoShowWarning(newBooking);
      if (notificationId) {
        newBooking.notificationId = notificationId;
        await updateDoc(doc(db, 'bookings', bookingId), { notificationId });
      }
    }

    return newBooking;
  },

  /**
   * Cancel an existing booking in Firestore.
   */
  cancelBooking: async (bookingId: string): Promise<void> => {
    if (db) {
      try {
        const bookingRef = doc(db, 'bookings', bookingId);
        const bookingSnap = await getDoc(bookingRef);
        const booking = bookingSnap.exists() ? (bookingSnap.data() as Booking) : null;

        await updateDoc(bookingRef, {
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
        });

        if (booking) {
          await notificationService.cancelBookingReminder(booking.notificationId);

          const slotLockRef = doc(
            db,
            'slot_locks',
            `${booking.roomId}_${booking.date}_${booking.startTime.replace(':', '')}`
          );
          await updateDoc(slotLockRef, {
            status: 'cancelled',
            cancelledAt: new Date().toISOString(),
          });
        }
      } catch (e: any) {
        console.warn('[bookingService] cancelBooking notice:', e.message);
      }
    }
  },

  /**
   * Check in a booking from a scanned QR payload.
   * Admins can scan any student's QR code. Students present their QR code to admins.
   */
  checkInWithQr: async (qrValue: string, scannerUserId?: string, scannerRole?: string): Promise<Booking> => {
    const payload = parseBookingQrPayload(qrValue);
    if (!payload) {
      throw new Error('Mã QR không hợp lệ hoặc không thuộc VKU StudyHub.');
    }

    if (!db) {
      throw new Error('Không thể kết nối Firestore để check-in.');
    }

    const bookingRef = doc(db, 'bookings', payload.bookingId);
    const bookingSnap = await getDoc(bookingRef);
    if (!bookingSnap.exists()) {
      throw new Error('Không tìm thấy booking tương ứng với mã QR này.');
    }

    const booking = bookingSnap.data() as Booking;

    // Business rule: Only admin can scan QR codes to check in students, OR if student is allowed, it must be their own booking
    if (scannerRole !== 'admin' && scannerUserId && booking.userId !== scannerUserId) {
      throw new Error('Chỉ Admin/Quản lý phòng mới có quyền quét mã QR check-in.');
    }

    if (booking.roomId !== payload.roomId || booking.userId !== payload.userId) {
      throw new Error('Thông tin QR không khớp với booking.');
    }

    if (booking.status === 'checked-in') {
      return booking;
    }

    if (booking.status !== 'active') {
      throw new Error('Booking này không còn ở trạng thái có thể check-in.');
    }

    if (!isWithinCheckInWindow(booking.date, booking.startTime, 15)) {
      throw new Error('Chỉ được check-in trong khoảng 15 phút trước/sau giờ bắt đầu ca học.');
    }

    const checkedInAt = new Date().toISOString();
    await updateDoc(bookingRef, {
      status: 'checked-in',
      checkedInAt,
      updatedAt: checkedInAt,
    });

    return { ...booking, status: 'checked-in', checkedInAt };
  },

  /**
   * Scan active bookings and auto-cancel any booking that passed 15 minutes after start time without check-in.
   * Updates Firestore status, releases slot_locks, and triggers immediate no-show notification.
   */
  autoCancelExpiredBookings: async (bookings: Booking[]): Promise<Booking[]> => {
    let hasChanges = false;
    const updatedBookings = await Promise.all(
      bookings.map(async (booking) => {
        if (booking.status === 'active' && hasCheckInExpired(booking.date, booking.startTime, 15)) {
          hasChanges = true;
          const cancelledBooking: Booking = {
            ...booking,
            status: 'cancelled',
            updatedAt: new Date().toISOString(),
          };

          if (db) {
            try {
              // Update booking status in Firestore
              await updateDoc(doc(db, 'bookings', booking.id), {
                status: 'cancelled',
                updatedAt: new Date().toISOString(),
                cancelReason: 'Quá thời hạn check-in (15 phút)',
              });

              // Release slot lock in Firestore
              const slotLockRef = doc(
                db,
                'slot_locks',
                `${booking.roomId}_${booking.date}_${booking.startTime.replace(':', '')}`
              );
              await updateDoc(slotLockRef, {
                status: 'cancelled',
                cancelledAt: new Date().toISOString(),
              });
            } catch (e: any) {
              console.warn('[bookingService] autoCancelExpiredBookings Firestore notice:', e.message);
            }
          }

          // Trigger instant no-show push notification
          await notificationService.sendNoShowInstantNotification(booking);

          return cancelledBooking;
        }
        return booking;
      })
    );

    return updatedBookings;
  },
};

