import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// ---------- Firebase config ----------
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

// ---------- Type (inline to avoid importing react-native types) ----------
interface SeedRoom {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  photo: string;
  equipment: string[];
  description: string;
}

export const SEED_ROOMS: SeedRoom[] = [
  {
    id: 'room-A101',
    name: 'Lab A101',
    building: 'A',
    floor: 1,
    capacity: 20,
    photo: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=600',
    equipment: ['High-spec PC', 'AC', 'Projector'],
    description: 'Computer lab with 20 high-spec workstations. Ideal for programming classes and group projects.',
  },
  {
    id: 'room-A201',
    name: 'Lab A201',
    building: 'A',
    floor: 2,
    capacity: 15,
    photo: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600',
    equipment: ['High-spec PC', 'AC'],
    description: 'Multimedia lab with design-focused workstations and dual monitors.',
  },
  {
    id: 'room-A302',
    name: 'Study Room A302',
    building: 'A',
    floor: 3,
    capacity: 8,
    photo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
    equipment: ['Whiteboard', 'AC'],
    description: 'Quiet study room with whiteboard. Great for small group discussions.',
  },
  {
    id: 'room-A303',
    name: 'Seminar A303',
    building: 'A',
    floor: 3,
    capacity: 12,
    photo: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=600',
    equipment: ['Projector', 'Whiteboard', 'AC'],
    description: 'Seminar room with projector and whiteboard. Suitable for presentations.',
  },
  {
    id: 'room-B102',
    name: 'Lab B102',
    building: 'B',
    floor: 1,
    capacity: 18,
    photo: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600',
    equipment: ['High-spec PC', 'AC', 'Projector'],
    description: 'Networking and security lab with specialized equipment.',
  },
  {
    id: 'room-B201',
    name: 'Study Room B201',
    building: 'B',
    floor: 2,
    capacity: 6,
    photo: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600',
    equipment: ['Whiteboard'],
    description: 'Small study room for focused group work. Cozy and quiet.',
  },
  {
    id: 'room-B305',
    name: 'Lab B305',
    building: 'B',
    floor: 3,
    capacity: 20,
    photo: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
    equipment: ['High-spec PC', 'AC', 'Whiteboard'],
    description: 'Software engineering lab with latest development tools installed.',
  },
  {
    id: 'room-C101',
    name: 'Lecture Hall C101',
    building: 'C',
    floor: 1,
    capacity: 20,
    photo: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600',
    equipment: ['Projector', 'AC'],
    description: 'Large lecture hall with stadium seating and AV equipment.',
  },
  {
    id: 'room-C202',
    name: 'Study Room C202',
    building: 'C',
    floor: 2,
    capacity: 4,
    photo: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600',
    equipment: ['Whiteboard', 'AC'],
    description: 'Intimate study room for pair programming or small team meetings.',
  },
  {
    id: 'room-C301',
    name: 'Lab C301',
    building: 'C',
    floor: 3,
    capacity: 16,
    photo: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600',
    equipment: ['High-spec PC', 'AC', 'Projector', 'Whiteboard'],
    description: 'Fully equipped AI/ML lab with GPU workstations.',
  },
  {
    id: 'room-V101',
    name: 'Innovation Hub V101',
    building: 'V',
    floor: 1,
    capacity: 10,
    photo: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=600',
    equipment: ['Projector', 'Whiteboard', 'AC'],
    description: 'Creative innovation space with flexible seating and brainstorming tools.',
  },
  {
    id: 'room-V202',
    name: 'Study Room V202',
    building: 'V',
    floor: 2,
    capacity: 5,
    photo: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600',
    equipment: ['Whiteboard', 'AC'],
    description: 'Modern study pod with soundproofing for focused work.',
  },
  {
    id: 'room-V301',
    name: 'Lab V301',
    building: 'V',
    floor: 3,
    capacity: 14,
    photo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600',
    equipment: ['High-spec PC', 'AC', 'Whiteboard'],
    description: 'IoT and embedded systems lab with Arduino and Raspberry Pi kits.',
  },
  {
    id: 'room-B203',
    name: 'Meeting Room B203',
    building: 'B',
    floor: 2,
    capacity: 8,
    photo: 'https://images.unsplash.com/photo-1431540015159-0f296d6fda8e?w=600',
    equipment: ['Projector', 'Whiteboard', 'AC'],
    description: 'Professional meeting room with video conferencing setup.',
  },
  {
    id: 'room-A401',
    name: 'Lab A401',
    building: 'A',
    floor: 4,
    capacity: 12,
    photo: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600',
    equipment: ['High-spec PC', 'AC'],
    description: 'Mobile development lab with iOS and Android testing devices.',
  },
];

// ---------- Seed Function ----------
declare const process: any;

async function seedRooms() {
  console.log('🚀 VKU StudyHub – Bắt đầu nạp dữ liệu phòng học...\n');

  let success = 0;
  let failed = 0;

  for (const room of SEED_ROOMS) {
    try {
      await setDoc(doc(db, 'rooms', room.id), {
        ...room,
        status: 'available',
        createdAt: new Date().toISOString(),
      });
      success++;
      console.log(`  ✅ ${room.name} (${room.building}-${room.floor}F, ${room.capacity} chỗ)`);
    } catch (error: any) {
      failed++;
      console.error(`  ❌ ${room.name}: ${error.message}`);
    }
  }

  console.log(`\n📊 Kết quả: ${success} thành công, ${failed} thất bại / ${SEED_ROOMS.length} tổng phòng.`);

  if (success === SEED_ROOMS.length) {
    console.log('🎉 Nạp dữ liệu hoàn tất! Mở app VKU StudyHub để xem danh sách phòng.\n');
  }

  process.exit(0);
}

seedRooms().catch((err) => {
  console.error('❌ Lỗi seed:', err.message);
  process.exit(1);
});
