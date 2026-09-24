import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  deleteDoc,
  runTransaction,
} from 'firebase/firestore';
import * as dotenv from 'dotenv';

// 1. Load environment variables
dotenv.config();

// 2. Firebase Initialization
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

declare const process: any;

// Helper to generate booking ID
const generateBookingId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'TEST-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Booking function using Firestore Transaction + deterministic slot lock.
// Đây là phần quan trọng để test race condition thật sự:
// - Cả 2 request cùng đọc cùng 1 document lock.
// - Firestore transaction đảm bảo chỉ 1 request được ghi lock trước.
// - Request còn lại sẽ retry/đọc lại lock và bị từ chối.
async function attemptBooking(data: {
  studentName: string;
  studentId: string;
  roomId: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
}) {
  const bookingId = generateBookingId();
  const startTimeStamp = Date.now();
  const slotLockId = `${data.roomId}_${data.date}_${data.startTime.replace(':', '')}`;
  const slotLockRef = doc(db, 'slot_locks', slotLockId);
  const bookingRef = doc(db, 'bookings', bookingId);

  console.log(`[${data.studentName}] ⏳ Bắt đầu transaction đặt ca phòng ${data.roomName}...`);

  const newBooking = {
    id: bookingId,
    roomId: data.roomId,
    roomName: data.roomName,
    userId: data.studentId,
    userName: data.studentName,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  await runTransaction(db, async (transaction) => {
    const lockSnap = await transaction.get(slotLockRef);

    if (lockSnap.exists()) {
      const lockData = lockSnap.data();
      if (lockData && lockData.status === 'active') {
        throw new Error(
          `Khung giờ (${data.startTime}-${data.endTime}) vừa có người khác đặt trước!`
        );
      }
    }

    transaction.set(slotLockRef, {
      bookingId,
      roomId: data.roomId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      userId: data.studentId,
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    transaction.set(bookingRef, newBooking);
  });

  const elapsed = Date.now() - startTimeStamp;
  return { bookingId, lockId: slotLockId, elapsed };
}

async function runConcurrentTest() {
  console.log('============================================================');
  console.log('🧪 VKU StudyHub – MÔ PHỎNG ĐẶT PHÒNG ĐỒNG THỜI (RACE CONDITION)');
  console.log('============================================================\n');

  // Test parameters
  const testRoomId = 'room-A101';
  const testRoomName = 'Lab A101';
  const testDate = '2026-09-30'; // Test date
  const testSlot = { startTime: '07:30', endTime: '09:30' };

  console.log(`📌 Ca học thử nghiệm: ${testRoomName} | Ngày: ${testDate} | Khung giờ: ${testSlot.startTime} – ${testSlot.endTime}`);
  console.log('⚡ Đang gửi 2 yêu cầu ĐỒNG THỜI từ Sinh viên A & Sinh viên B...\n');

  // Request 1: Sinh viên A (21IT001)
  const reqA = attemptBooking({
    studentName: 'Sinh viên A (21IT001)',
    studentId: 'user-21IT001',
    roomId: testRoomId,
    roomName: testRoomName,
    date: testDate,
    startTime: testSlot.startTime,
    endTime: testSlot.endTime,
  });

  // Request 2: Sinh viên B (21IT002)
  const reqB = attemptBooking({
    studentName: 'Sinh viên B (21IT002)',
    studentId: 'user-21IT002',
    roomId: testRoomId,
    roomName: testRoomName,
    date: testDate,
    startTime: testSlot.startTime,
    endTime: testSlot.endTime,
  });

  // Run concurrently
  const results = await Promise.allSettled([reqA, reqB]);

  console.log('\n------------------- KẾT QUẢ XỬ LÝ -------------------');
  const successfulBookings: Array<{ bookingId: string; lockId: string }> = [];
  let successCount = 0;
  let failedCount = 0;

  results.forEach((res, index) => {
    const student = index === 0 ? 'Sinh viên A' : 'Sinh viên B';
    if (res.status === 'fulfilled') {
      successCount++;
      successfulBookings.push({ bookingId: res.value.bookingId, lockId: res.value.lockId });
      console.log(`✅ [${student}] ĐẶT THÀNH CÔNG!`);
      console.log(`   └ Mã đơn: ${res.value.bookingId} | Lock: ${res.value.lockId} | Thời gian phản hồi: ${res.value.elapsed}ms`);
    } else {
      failedCount++;
      console.log(`❌ [${student}] BỊ HỆ THỐNG TỪ CHỐI / BÁO LỖI:`);
      console.log(`   └ Lỗi: ${res.reason.message}`);
    }
  });

  // Cleanup test booking + slot lock documents
  for (const item of successfulBookings) {
    try {
      await deleteDoc(doc(db, 'bookings', item.bookingId));
      await deleteDoc(doc(db, 'slot_locks', item.lockId));
      console.log(`\n🧹 Đã dọn dẹp dữ liệu test: booking=${item.bookingId}, lock=${item.lockId}.`);
    } catch (e: any) {
      console.warn('⚠️ Lỗi dọn dẹp:', e.message);
    }
  }

  console.log('\n------------------- KẾT LUẬN -------------------');
  if (successCount === 1 && failedCount === 1) {
    console.log('🎉 PASS: Chỉ 1 sinh viên đặt thành công, sinh viên còn lại bị chặn đúng như mong đợi.');
    process.exit(0);
  }

  console.log(`❌ FAIL: Kỳ vọng 1 thành công + 1 thất bại, nhưng nhận được ${successCount} thành công + ${failedCount} thất bại.`);
  console.log('   Nếu cả 2 đều thành công, hệ thống chưa chống race condition đúng.');
  process.exit(1);
}

runConcurrentTest().catch((err) => {
  console.error('❌ Lỗi chạy test:', err.message);
  process.exit(1);
});
