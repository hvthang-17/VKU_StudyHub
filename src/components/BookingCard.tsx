import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Booking } from '../types';
import { COLORS } from '../constants';
import { formatDateDisplay } from '../utils/helpers';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (booking: Booking) => void;
  onShowQr?: (booking: Booking) => void;
}

export const BookingCard: React.FC<BookingCardProps> = React.memo(({ booking, onCancel, onShowQr }) => {
  const getStatusBadge = () => {
    switch (booking.status) {
      case 'active':
        return { label: 'Đã đặt (Chờ check-in)', bg: '#DCFCE7', color: '#15803D' };
      case 'checked-in':
        return { label: 'Đã check-in', bg: '#DBEAFE', color: '#1D4ED8' };
      case 'completed':
        return { label: 'Hoàn thành', bg: '#F3F4F6', color: '#4B5563' };
      case 'cancelled':
        return { label: 'Đã hủy', bg: '#FEE2E2', color: '#B91C1C' };
      default:
        return { label: booking.status, bg: '#F3F4F6', color: '#4B5563' };
    }
  };

  const statusBadge = getStatusBadge();
  const canCancel = booking.status === 'active';

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.roomInfo}>
          <View style={styles.roomIconWrap}>
            <MaterialCommunityIcons name="door-open" size={22} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.roomName}>{booking.roomName}</Text>
            <Text style={styles.bookingCode}>Mã đặt: #{booking.id.slice(-6).toUpperCase()}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
          <Text style={[styles.statusText, { color: statusBadge.color }]}>
            {statusBadge.label}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Details Row */}
      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <View style={styles.detailLabelRow}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailLabel}>Ngày học</Text>
          </View>
          <Text style={styles.detailValue}>{formatDateDisplay(booking.date)}</Text>
        </View>
        <View style={styles.detailItem}>
          <View style={styles.detailLabelRow}>
            <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailLabel}>Khung giờ</Text>
          </View>
          <Text style={styles.detailValue}>
            {booking.startTime} – {booking.endTime}
          </Text>
        </View>
      </View>

      {/* Cancel Reason Warning (if any) */}
      {booking.status === 'cancelled' && booking.cancelReason && (
        <View style={styles.reasonRow}>
          <Ionicons name="alert-circle-outline" size={14} color="#DC2626" />
          <Text style={styles.reasonText}>{booking.cancelReason}</Text>
        </View>
      )}

      {/* Action Bar */}
      {(canCancel || (booking.status === 'checked-in' && onShowQr)) && (
        <View style={styles.actionRow}>
          {onShowQr && (booking.status === 'active' || booking.status === 'checked-in') && (
            <TouchableOpacity
              style={styles.qrBtn}
              activeOpacity={0.7}
              onPress={() => onShowQr(booking)}
            >
              <Ionicons name="qr-code-outline" size={16} color="#1D4ED8" />
              <Text style={styles.qrBtnText}>Show QR</Text>
            </TouchableOpacity>
          )}
          {canCancel && onCancel && (
            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.7}
              onPress={() => onCancel(booking)}
            >
              <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
              <Text style={styles.cancelBtnText}>Hủy phòng này</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  roomIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 15,
    marginRight: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  bookingCode: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reasonText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  actionRow: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  qrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    marginRight: 8,
  },
  qrBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
});
