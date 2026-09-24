import { Booking } from '../types';

export interface BookingQrPayload {
  type: 'VKU_STUDYHUB_BOOKING';
  version: 1;
  bookingId: string;
  roomId: string;
  userId: string;
  date: string;
  startTime: string;
}

export const createBookingQrPayload = (booking: Booking): string => {
  const payload: BookingQrPayload = {
    type: 'VKU_STUDYHUB_BOOKING',
    version: 1,
    bookingId: booking.id,
    roomId: booking.roomId,
    userId: booking.userId,
    date: booking.date,
    startTime: booking.startTime,
  };

  return JSON.stringify(payload);
};

export const parseBookingQrPayload = (value: string): BookingQrPayload | null => {
  try {
    const parsed = JSON.parse(value) as Partial<BookingQrPayload>;
    if (
      parsed.type !== 'VKU_STUDYHUB_BOOKING' ||
      parsed.version !== 1 ||
      !parsed.bookingId ||
      !parsed.roomId ||
      !parsed.userId ||
      !parsed.date ||
      !parsed.startTime
    ) {
      return null;
    }

    return parsed as BookingQrPayload;
  } catch {
    return null;
  }
};
