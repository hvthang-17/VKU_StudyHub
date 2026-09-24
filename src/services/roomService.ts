import { collection, onSnapshot, query, orderBy, setDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Room } from '../types';

// Helper photos for mock rooms
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

const generate50Rooms = (): Room[] => {
  const buildings: ('A' | 'B' | 'C' | 'V')[] = ['A', 'B', 'C', 'V'];
  const roomsList: Room[] = [];

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

/** Sample mock room data for 50+ VKU campus study rooms & computer labs */
export const INITIAL_ROOMS: Room[] = generate50Rooms();

export const roomService = {
  /**
   * Subscribe to real-time room updates from Firestore, with instant fallback to INITIAL_ROOMS
   */
  subscribeToRooms: (onUpdate: (rooms: Room[]) => void): (() => void) => {
    // Immediate fallback feed
    onUpdate(INITIAL_ROOMS);

    if (!db) return () => { };

    try {
      const q = query(collection(db, 'rooms'), orderBy('name', 'asc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const roomsData: Room[] = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...(doc.data() as Omit<Room, 'id'>),
            }));
            onUpdate(roomsData);
          }
        },
        (error) => {
          console.log('[roomService] Firestore snapshot fallback active:', error.message);
        }
      );
      return unsubscribe;
    } catch (e) {
      console.log('[roomService] Firestore offline mode:', e);
      return () => { };
    }
  },

  /** Get single room by ID */
  getRoomById: async (roomId: string, roomsCache: Room[] = INITIAL_ROOMS): Promise<Room | null> => {
    const cached = roomsCache.find((r) => r.id === roomId);
    if (cached) return cached;
    return INITIAL_ROOMS.find((r) => r.id === roomId) || null;
  },

  /**
   * Seed/Upload the 60+ initial mock rooms into Cloud Firestore.
   * Useful for end-to-end real-time testing across multiple devices.
   */
  seedRoomsToFirestore: async (): Promise<{ success: boolean; count: number; message: string }> => {
    if (!db) {
      return { success: false, count: 0, message: 'Firestore chưa được khởi tạo.' };
    }

    try {
      let count = 0;
      for (const room of INITIAL_ROOMS) {
        const { id, ...roomData } = room;
        await setDoc(doc(db, 'rooms', id), roomData, { merge: true });
        count++;
      }
      return { success: true, count, message: `Đã nạp thành công ${count} phòng học lên Cloud Firestore!` };
    } catch (error: any) {
      console.error('[roomService] Seed rooms error:', error);
      return { success: false, count: 0, message: error.message || 'Lỗi khi nạp dữ liệu phòng.' };
    }
  },
};

