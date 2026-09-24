import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Room } from '../types';

/** Sample mock room data for VKU campus study rooms & computer labs */
export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-a101',
    name: 'Phòng Máy A101',
    building: 'A',
    floor: 1,
    capacity: 20,
    photo: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop',
    equipment: ['Projector', 'Whiteboard', 'High-spec PC', 'AC'],
    description: 'Phòng thực hành máy tính cấu hình cao tòa A. Thích hợp cho các lớp lập trình và đồ họa.',
    status: 'available',
  },
  {
    id: 'room-a202',
    name: 'Phòng Học Nhóm A202',
    building: 'A',
    floor: 2,
    capacity: 6,
    photo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop',
    equipment: ['Whiteboard', 'AC'],
    description: 'Phòng thảo luận nhóm nhỏ thoáng mát, yên tĩnh.',
    status: 'available',
  },
  {
    id: 'room-b301',
    name: 'Lab AI & Data B301',
    building: 'B',
    floor: 3,
    capacity: 15,
    photo: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop',
    equipment: ['Projector', 'High-spec PC', 'AC'],
    description: 'Phòng lab chuyên sâu Trí tuệ Nhân tạo & Khoa học Dữ liệu tòa B.',
    status: 'occupied',
  },
  {
    id: 'room-b305',
    name: 'Phòng Đồ Họa B305',
    building: 'B',
    floor: 3,
    capacity: 12,
    photo: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop',
    equipment: ['Projector', 'High-spec PC', 'AC'],
    description: 'Trang bị máy GPU chuyên dụng thiết kế đồ họa 3D.',
    status: 'available',
  },
  {
    id: 'room-c102',
    name: 'Phòng Thuyết Trình C102',
    building: 'C',
    floor: 1,
    capacity: 10,
    photo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop',
    equipment: ['Projector', 'Whiteboard', 'AC'],
    description: 'Phòng họp nhóm lớn tích hợp máy chiếu 4K và bảng trắng toàn tường.',
    status: 'available',
  },
  {
    id: 'room-c204',
    name: 'Phòng Học Nhóm C204',
    building: 'C',
    floor: 2,
    capacity: 4,
    photo: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop',
    equipment: ['Whiteboard', 'AC'],
    description: 'Phòng học yên tĩnh tối đa 4 sinh viên.',
    status: 'occupied',
  },
  {
    id: 'room-v101',
    name: 'VKU MakerSpace V101',
    building: 'V',
    floor: 1,
    capacity: 18,
    photo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop',
    equipment: ['Projector', 'Whiteboard', 'High-spec PC', 'AC'],
    description: 'Không gian sáng tạo công nghệ Việt - Hàn (VKU MakerSpace).',
    status: 'available',
  },
  {
    id: 'room-v202',
    name: 'Phòng Lab Viễn Thông V202',
    building: 'V',
    floor: 2,
    capacity: 8,
    photo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
    equipment: ['Whiteboard', 'High-spec PC', 'AC'],
    description: 'Phòng thực hành mạng & viễn thông tòa V.',
    status: 'available',
  },
];

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
};

