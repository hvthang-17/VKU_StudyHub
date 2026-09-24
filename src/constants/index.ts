import { TimeSlot, CapacityRange, Equipment, Building } from '../types';

export const COLORS = {
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',

  available: '#16A34A',
  availableLight: '#DCFCE7',

  occupied: '#DC2626',
  occupiedLight: '#FEE2E2',

  danger: '#EF4444',
  error: '#EF4444',
  success: '#10B981',

  disabled: '#9CA3AF',
  disabledLight: '#F3F4F6',

  white: '#FFFFFF',
  black: '#111827',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',

  info: '#0EA5E9',
  infoLight: '#E0F2FE',

  background: '#F9FAFB',
  card: '#FFFFFF',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  text: '#111827',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
};

// ── Departments ──────────────────────────────────────────────

export const DEPARTMENTS = [
  'Khoa Khoa học Máy tính',
  'Khoa Kỹ thuật Máy tính & Điện tử',
  'Khoa Kinh tế Số & Thương mại Điện tử',
  'Khoa Đào tạo Quốc tế',
];

// ── Time Slots ───────────────────────────────────────────────

export const TIME_SLOTS: TimeSlot[] = [
  { id: 'slot-1', label: '07:30 – 09:30', startTime: '07:30', endTime: '09:30' },
  { id: 'slot-2', label: '09:30 – 11:30', startTime: '09:30', endTime: '11:30' },
  { id: 'slot-3', label: '13:00 – 15:00', startTime: '13:00', endTime: '15:00' },
  { id: 'slot-4', label: '15:00 – 17:00', startTime: '15:00', endTime: '17:00' },
];

// ── Buildings ────────────────────────────────────────────────

export const BUILDINGS: Building[] = ['A', 'B', 'C', 'V'];

// ── Equipment Options ────────────────────────────────────────

export const EQUIPMENT_OPTIONS: Equipment[] = [
  'Projector',
  'Whiteboard',
  'High-spec PC',
  'AC',
];

export const EQUIPMENT_LIST = EQUIPMENT_OPTIONS;

// ── Capacity Ranges ──────────────────────────────────────────

export const CAPACITY_RANGES: CapacityRange[] = [
  { label: '2–5', min: 2, max: 5 },
  { label: '6–10', min: 6, max: 10 },
  { label: '11–15', min: 11, max: 15 },
  { label: '16–20', min: 16, max: 20 },
];

// ── Notification ─────────────────────────────────────────────

export const NOTIFICATION_MINUTES_BEFORE = 15;

// ── Misc ─────────────────────────────────────────────────────

export const SEARCH_DEBOUNCE_MS = 300;
export const MAX_BOOKING_DAYS_AHEAD = 7;

