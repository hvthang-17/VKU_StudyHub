import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { Booking } from '../types';
import { COLORS } from '../constants';
import { formatDateDisplay } from '../utils/helpers';
import { createBookingQrPayload } from '../utils/qrHelpers';

interface QRModalProps {
  visible: boolean;
  booking: Booking | null;
  title?: string;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ visible, booking, title = 'Mã QR Check-in', onClose }) => {
  if (!booking) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Ticket Icon */}
          <View style={styles.iconWrap}>
            <Ionicons name="ticket-outline" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Quét mã này tại phòng học để check-in</Text>

          {/* QR */}
          <View style={styles.qrBox}>
            <QRCode value={createBookingQrPayload(booking)} size={190} />
          </View>

          <Text style={styles.code}>#{booking.id.slice(-6).toUpperCase()}</Text>

          {/* Dashed divider */}
          <View style={styles.dashed} />

          {/* Detail Rows */}
          <View style={styles.detailBox}>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="door-open" size={16} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Phòng</Text>
              <Text style={styles.detailVal}>{booking.roomName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={16} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Sinh viên</Text>
              <Text style={styles.detailVal}>{booking.userName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Ngày</Text>
              <Text style={styles.detailVal}>{formatDateDisplay(booking.date)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Giờ</Text>
              <Text style={styles.detailVal}>{booking.startTime} – {booking.endTime}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.closeBtn} activeOpacity={0.8} onPress={onClose}>
            <Text style={styles.closeBtnText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    width: '100%', backgroundColor: '#FFFFFF', borderRadius: 28, padding: 26, alignItems: 'center',
    elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24,
  },
  iconWrap: {
    width: 62, height: 62, borderRadius: 20, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  title: { fontSize: 22, fontWeight: '900', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, marginBottom: 16, textAlign: 'center' },
  qrBox: {
    padding: 16, backgroundColor: '#FFFFFF', borderRadius: 18,
    borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 12,
  },
  code: { fontSize: 22, fontWeight: '900', color: COLORS.primary, letterSpacing: 1.5, marginBottom: 8 },
  dashed: {
    width: '100%', height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1', marginVertical: 10,
  },
  detailBox: { width: '100%', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, marginBottom: 18 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  detailLabel: { fontSize: 13, color: COLORS.textSecondary, width: 72 },
  detailVal: { fontSize: 14, fontWeight: '700', color: COLORS.text, flex: 1 },
  closeBtn: {
    width: '100%', backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 16, alignItems: 'center',
    elevation: 3, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10,
  },
  closeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
