/**
 * Format a "YYYY-MM-DD" string to "DD/MM/YYYY" display format.
 */
export const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

/**
 * Format a Date object to "YYYY-MM-DD" string.
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get the short day name (Mon, Tue, ...) for a date.
 */
export const getDayName = (date: Date): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

/**
 * Generate an array of the next N days starting from today.
 */
export const getNextDays = (count: number): Date[] => {
  const days: Date[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
};

/**
 * Generate a unique booking ID.
 * Format: BK-XXXXXX (6 random alphanumeric characters)
 */
export const generateBookingId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'BK-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Validate email format.
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate VKU student ID format (e.g., 21IT123, 22CS045).
 */
export const isValidStudentId = (id: string): boolean => {
  const re = /^\d{2}[A-Z]{2}\d{3}$/;
  return re.test(id.toUpperCase());
};

/**
 * Parse "HH:MM" string to a Date object on a given date.
 */
export const parseTime = (dateStr: string, timeStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

/**
 * Check if the current time is within the check-in window
 * (15 min before slot start to 15 min after slot start).
 */
export const isWithinCheckInWindow = (
  dateStr: string,
  startTime: string,
  windowMinutes: number = 15
): boolean => {
  const slotStart = parseTime(dateStr, startTime);
  const now = new Date();
  const windowStart = new Date(slotStart.getTime() - windowMinutes * 60000);
  const windowEnd = new Date(slotStart.getTime() + windowMinutes * 60000);
  return now >= windowStart && now <= windowEnd;
};

/**
 * Check if the check-in window (15 mins after slot startTime) has expired.
 * Example: slotStart 09:30, 15m window => expired after 09:45.
 */
export const hasCheckInExpired = (
  dateStr: string,
  startTime: string,
  windowMinutes: number = 15
): boolean => {
  const slotStart = parseTime(dateStr, startTime);
  const now = new Date();
  const windowEnd = new Date(slotStart.getTime() + windowMinutes * 60000);
  return now > windowEnd;
};

/**
 * Check if a date string is today.
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if a "YYYY-MM-DD" string is today.
 */
export const isDateStringToday = (dateStr: string): boolean => {
  return formatDate(new Date()) === dateStr;
};

/**
 * A slot is considered expired for booking when it belongs to today
 * and the user's current time is already at/after the slot start time.
 * Example: now 10:35 => 07:30-09:30 and 09:30-11:30 are expired.
 */
export const isPastBookingSlot = (dateStr: string, startTime: string): boolean => {
  if (!isDateStringToday(dateStr)) return false;
  return new Date() >= parseTime(dateStr, startTime);
};
