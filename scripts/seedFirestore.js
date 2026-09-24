require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ROOM_PHOTOS = [
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
];

const generate50Rooms = () => {
  const buildings = ['A', 'B', 'C', 'V'];
  const roomsList = [];

  let count = 1;
  buildings.forEach((b) => {
    for (let floor = 1; floor <= 4; floor++) {
      for (let num = 1; num <= 4; num++) {
        const roomNum = `${floor}0${num}`;
        const isLab = num % 2 === 1;
        const capacity = isLab ? 20 + (num * 5) : 4 + (num * 2);
        const photo = ROOM_PHOTOS[(count - 1) % ROOM_PHOTOS.length];
        const status = (count % 3 === 0) ? 'occupied' : 'available';

        roomsList.push({
          id: `room-${b.toLowerCase()}${roomNum}`,
          name: isLab ? `Lab Máy Tính ${b}${roomNum}` : `Phòng Học Nhóm ${b}${roomNum}`,
          building: b,
          floor,
          capacity,
          photo,
          equipment: isLab
            ? ['Projector', 'Whiteboard', 'High-spec PC', 'AC']
            : ['Whiteboard', 'AC'],
          description: isLab
            ? `Phòng thực hành máy tính hiện đại tòa ${b}, tầng ${floor}. Được trang bị điều hòa và máy chiếu.`
            : `Phòng tự học nhóm yên tĩnh tòa ${b}, tầng ${floor}, thích hợp thảo luận bài tập lớn.`,
          status,
        });
        count++;
      }
    }
  });

  return roomsList;
};

async function seed() {
  console.log('🚀 Đang bắt đầu nạp 64 phòng học vào Cloud Firestore (vku-studyhub)...');
  const rooms = generate50Rooms();
  let successCount = 0;

  for (const room of rooms) {
    const { id, ...data } = room;
    try {
      await setDoc(doc(db, 'rooms', id), data, { merge: true });
      successCount++;
      process.stdout.write(`\r✅ Đã nạp thành công: ${successCount}/${rooms.length} phòng`);
    } catch (err) {
      console.error(`\n❌ Lỗi khi nạp phòng ${id}:`, err.message);
    }
  }

  console.log(`\n🎉 HOÀN THÀNH! Tất cả ${successCount} phòng học đã sẵn sàng trên Cloud Firestore.`);
  process.exit(0);
}

seed();