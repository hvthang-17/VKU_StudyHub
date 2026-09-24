import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Room,
  Booking,
  FilterState,
  Building,
  Equipment,
  CapacityRange,
} from '../types';

// ── Store Interface ──────────────────────────────────────────

interface BookingStore {
  // ─── User Session ────────────────────────────────────────
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  clearStore: () => void;

  // ─── Rooms ───────────────────────────────────────────────
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;

  // ─── Filters ─────────────────────────────────────────────
  filters: FilterState;
  setSearchQuery: (query: string) => void;
  setBuilding: (building: Building | null) => void;
  setCapacityRange: (range: CapacityRange | null) => void;
  toggleEquipment: (eq: Equipment) => void;
  toggleFavoritesOnly: () => void;
  clearFilters: () => void;

  // ─── Bookings ────────────────────────────────────────────
  bookings: Booking[];
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  cancelBooking: (bookingId: string) => void;

  // ─── Favorites ───────────────────────────────────────────
  toggleFavorite: (roomId: string) => void;

  // ─── Computed Helpers ────────────────────────────────────
  getActiveBookings: () => Booking[];
  getBookingHistory: () => Booking[];
  isRoomFavorited: (roomId: string) => boolean;
}

// ── Default Filter State ─────────────────────────────────────

const defaultFilters: FilterState = {
  searchQuery: '',
  building: null,
  capacityRange: null,
  equipment: [],
  showFavoritesOnly: false,
};

// ── Store Creation ───────────────────────────────────────────

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      // ─── User Session ──────────────────────────────────────
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, bookings: [] }),
      clearStore: () => set({ user: null, bookings: [], filters: defaultFilters }),

      // ─── Rooms ─────────────────────────────────────────────
      rooms: [],
      setRooms: (rooms) => set({ rooms }),

      // ─── Filters ───────────────────────────────────────────
      filters: defaultFilters,

      setSearchQuery: (query) =>
        set((state) => ({
          filters: { ...state.filters, searchQuery: query },
        })),

      setBuilding: (building) =>
        set((state) => ({
          filters: { ...state.filters, building },
        })),

      setCapacityRange: (range) =>
        set((state) => ({
          filters: { ...state.filters, capacityRange: range },
        })),

      toggleEquipment: (eq) =>
        set((state) => {
          const current = state.filters.equipment;
          const updated = current.includes(eq)
            ? current.filter((e) => e !== eq)
            : [...current, eq];
          return { filters: { ...state.filters, equipment: updated } };
        }),

      toggleFavoritesOnly: () =>
        set((state) => ({
          filters: {
            ...state.filters,
            showFavoritesOnly: !state.filters.showFavoritesOnly,
          },
        })),

      clearFilters: () => set({ filters: defaultFilters }),

      // ─── Bookings ──────────────────────────────────────────
      bookings: [],
      setBookings: (bookings) => set({ bookings }),

      addBooking: (booking) =>
        set((state) => ({
          bookings: [booking, ...state.bookings],
        })),

      updateBooking: (bookingId, updates) =>
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, ...updates } : b
          ),
        })),

      cancelBooking: (bookingId) =>
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: 'cancelled' } : b
          ),
        })),

      // ─── Favorites ─────────────────────────────────────────
      toggleFavorite: (roomId) =>
        set((state) => {
          if (!state.user) return state;
          const favs = state.user.favorites || [];
          const updated = favs.includes(roomId)
            ? favs.filter((id) => id !== roomId)
            : [...favs, roomId];
          return { user: { ...state.user, favorites: updated } };
        }),

      // ─── Computed Helpers ──────────────────────────────────
      getActiveBookings: () => {
        return get().bookings.filter(
          (b) => b.status === 'active' || b.status === 'checked-in'
        );
      },

      getBookingHistory: () => {
        return get().bookings.filter(
          (b) => b.status === 'completed' || b.status === 'cancelled'
        );
      },

      isRoomFavorited: (roomId) => {
        const user = get().user;
        return user && user.favorites ? user.favorites.includes(roomId) : false;
      },
    }),
    {
      name: 'vku-studyhub-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        bookings: state.bookings,
        filters: state.filters,
      }),
    }
  )
);
