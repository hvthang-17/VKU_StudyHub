import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TimeSlot, Booking } from '../types';
import { TIME_SLOTS, COLORS } from '../constants';
import { isPastBookingSlot } from '../utils/helpers';

interface TimeSlotGridProps {
  selectedDate: string;
  selectedSlotId: string | null;
  onSelectSlot: (slot: TimeSlot) => void;
  bookedSlotIds: string[];           // Slots already booked by others for this room
  userConflictingBookings?: Booking[]; // User's own active bookings on this date
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  selectedDate,
  selectedSlotId,
  onSelectSlot,
  bookedSlotIds,
  userConflictingBookings = [],
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Ionicons name="time-outline" size={18} color={COLORS.primary} />
        <Text style={styles.label}>Chọn khung giờ (2 tiếng/ca)</Text>
      </View>
      <View style={styles.grid}>
        {TIME_SLOTS.map((slot) => {
          const isBooked = bookedSlotIds.includes(slot.id);
          const isSelected = selectedSlotId === slot.id;
          const isExpired = isPastBookingSlot(selectedDate, slot.startTime);

          // Check if current user already booked a room at this exact slot time
          const userConflict = userConflictingBookings.find(
            (b) => b.startTime === slot.startTime && b.endTime === slot.endTime
          );

          const isDisabled = isBooked || !!userConflict || isExpired;

          let badgeText = 'Sẵn sàng';
          let badgeBg = '#DCFCE7';
          let badgeColor = '#16A34A';

          if (isBooked) {
            badgeText = 'Đã có người đặt';
            badgeBg = '#F3F4F6';
            badgeColor = '#6B7280';
          } else if (userConflict) {
            badgeText = `Trùng lịch (${userConflict.roomName})`;
            badgeBg = '#FEF3C7';
            badgeColor = '#D97706';
          } else if (isExpired) {
            badgeText = 'Đã quá giờ đặt';
            badgeBg = '#FEE2E2';
            badgeColor = '#DC2626';
          } else if (isSelected) {
            badgeText = 'Đã chọn';
            badgeBg = '#DBEAFE';
            badgeColor = '#1D4ED8';
          }

          return (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.slotCard,
                isSelected && styles.slotCardSelected,
                (isBooked || isExpired) && styles.slotCardDisabled,
                !!userConflict && styles.slotCardConflict,
              ]}
              disabled={isDisabled}
              activeOpacity={0.75}
              onPress={() => onSelectSlot(slot)}
            >
              <View style={styles.timeRow}>
                <Text
                  style={[
                    styles.timeText,
                    isSelected && styles.timeTextSelected,
                    isDisabled && styles.timeTextDisabled,
                  ]}
                >
                  {slot.label}
                </Text>
              </View>

              <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                <Text style={[styles.badgeText, { color: badgeColor }]}>
                  {badgeText}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  slotCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  slotCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
  },
  slotCardDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    opacity: 0.65,
  },
  slotCardConflict: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
    opacity: 0.85,
  },
  timeRow: {
    marginBottom: 6,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  timeTextSelected: {
    color: COLORS.primary,
  },
  timeTextDisabled: {
    color: '#9CA3AF',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
