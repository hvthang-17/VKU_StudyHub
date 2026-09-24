/** Equipment available in a room */
export type Equipment = 'Projector' | 'Whiteboard' | 'High-spec PC' | 'AC';

/** Building identifiers on VKU campus */
export type Building = 'A' | 'B' | 'C' | 'V';

/** Room availability status */
export type RoomStatus = 'available' | 'occupied';

/** Booking lifecycle status */
export type BookingStatus = 'active' | 'checked-in' | 'completed' | 'cancelled';

// ============================================================
// Core Data Models
// ============================================================

/** A study room or computer lab on campus */
export interface Room {
  id: string;
  name: string;
  building: Building;
  floor: number;
  capacity: number;
  photo: string;
  equipment: Equipment[];
  description: string;
  status: RoomStatus;
}

/** A registered user (VKU student) */
export interface User {
  id: string;
  uid?: string;
  name: string;
  studentId: string;
  email: string;
  department?: string;
  role?: 'student' | 'admin';
  avatar?: string;
  favorites?: string[];
  createdAt?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  studentId: string;
  department: string;
  password?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

/** A discrete 2-hour time slot */
export interface TimeSlot {
  id: string;
  label: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
}

/** A room booking / reservation */
export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  userId: string;
  userName: string;
  date: string;           // "YYYY-MM-DD"
  startTime: string;      // "HH:MM"
  endTime: string;        // "HH:MM"
  status: BookingStatus;
  createdAt: string;      // ISO timestamp
  checkedInAt?: string;   // ISO timestamp (set on check-in)
  notificationId?: string; // expo-notifications scheduled ID
  cancelReason?: string;   // Reason if cancelled (e.g. "Quá thời hạn check-in (15 phút)")
  updatedAt?: string;      // ISO timestamp
}

// ============================================================
// Filter / UI State
// ============================================================

/** Capacity range option for filtering */
export interface CapacityRange {
  label: string;
  min: number;
  max: number;
}

/** Active filter state managed by Zustand */
export interface FilterState {
  searchQuery: string;
  building: Building | null;
  capacityRange: CapacityRange | null;
  equipment: Equipment[];
  showFavoritesOnly: boolean;
}

// ============================================================
// Navigation Param Types
// ============================================================

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  RoomDetail: { roomId: string };
  Booking: { roomId: string; roomName: string };
};

export type MainTabParamList = {
  Home: undefined;
  MyBookings: undefined;
  Profile: undefined;
};

