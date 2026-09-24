import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, TimeSlot, Booking } from '../types';
import { COLORS } from '../constants';
import { DateSelector } from '../components/DateSelector';
import { TimeSlotGrid } from '../components/TimeSlotGrid';
import { QRModal } from '../components/QRModal';
import { bookingService } from '../services/bookingService';
import { useBookingStore } from '../store/useBookingStore';
import { formatDate, formatDateDisplay, isPastBookingSlot } from '../utils/helpers';

type Props = NativeStackScreenProps<RootStackParamList, 'Booking'>;

export default function BookingScreen({ route, navigation }: Props) {
  const { roomId, roomName } = route.params;
  const { user, addBooking } = useBookingStore();

  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookedSlotIds, setBookedSlotIds] = useState<string[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    setSelectedSlot(null);
    const unsubscribe = bookingService.subscribeBookedSlots(
      roomId,
      selectedDate,
      (ids) => {
        setBookedSlotIds(ids);
      }
    );
    return () => unsubscribe();
  }, [roomId, selectedDate]);

  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = bookingService.subscribeUserBookings(
      user.id,
      (bookings) => {
        setUserBookings(bookings.filter((b) => b.status === 'active' || b.status === 'checked-in'));
      }
    );
    return () => unsubscribe();
  }, [user]);

  const userBookingsOnSelectedDate = userBookings.filter((b) => b.date === selectedDate);

  useEffect(() => {
    if (selectedSlot && isPastBookingSlot(selectedDate, selectedSlot.startTime)) {
      setSelectedSlot(null);
    }
  }, [selectedDate, selectedSlot]);

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      Alert.alert('Chưa chọn ca học', 'Vui lòng chọn 1 khung giờ phù hợp trước khi xác nhận.');
      return;
    }

    if (!user) {
      Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để tiến hành đặt phòng học.');
      return;
    }

    if (isPastBookingSlot(selectedDate, selectedSlot.startTime)) {
      Alert.alert(
        'Khung giờ đã quá hạn',
        `Khung giờ ${selectedSlot.label} của ngày ${formatDateDisplay(selectedDate)} đã bắt đầu hoặc đã qua. Vui lòng chọn khung giờ khác.`
      );
      setSelectedSlot(null);
      return;
    }

    setIsLoading(true);

    try {
      const newBooking = await bookingService.createBooking({
        roomId,
        roomName,
        userId: user.id,
        userName: user.name,
        date: selectedDate,
        slot: selectedSlot,
      });

      addBooking(newBooking);
      setConfirmedBooking(newBooking);
    } catch (error: any) {
      Alert.alert('Không thể đặt phòng', error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    setConfirmedBooking(null);
    navigation.navigate('MainTabs');
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Room & User Header */}
        <View style={styles.headerCard}>
          <Text style={styles.roomLabel}>Phòng học đã chọn:</Text>
          <Text style={styles.roomTitle}>{roomName}</Text>
          <View style={styles.userInfoRow}>
            <Ionicons name="person-circle-outline" size={16} color="#E0E7FF" />
            <Text style={styles.userInfoText}>Sinh viên: {user?.name || 'Khách'} ({user?.studentId || 'N/A'})</Text>
          </View>
        </View>

        {/* Date Selector */}
        <DateSelector selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        {/* Time Slot Grid */}
        <TimeSlotGrid
          selectedDate={selectedDate}
          selectedSlotId={selectedSlot?.id || null}
          onSelectSlot={setSelectedSlot}
          bookedSlotIds={bookedSlotIds}
          userConflictingBookings={userBookingsOnSelectedDate}
        />

        {/* Booking Summary Box */}
        {selectedSlot && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryTitleRow}>
              <Ionicons name="receipt-outline" size={18} color={COLORS.primary} />
              <Text style={styles.summaryTitle}>Tóm tắt thông tin đặt chỗ</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phòng học:</Text>
              <Text style={styles.summaryVal}>{roomName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ngày đặt:</Text>
              <Text style={styles.summaryVal}>{formatDateDisplay(selectedDate)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Thời gian:</Text>
              <Text style={styles.summaryVal}>{selectedSlot.label}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            (!selectedSlot || isLoading) && styles.confirmBtnDisabled,
          ]}
          disabled={!selectedSlot || isLoading}
          activeOpacity={0.8}
          onPress={handleConfirmBooking}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.confirmBtnContent}>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.confirmBtnTxt}>Xác nhận đặt phòng ngay</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <QRModal
        visible={!!confirmedBooking}
        booking={confirmedBooking}
        title="Đặt phòng thành công!"
        onClose={handleFinish}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 90 },
  headerCard: {
    backgroundColor: COLORS.primary,
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  roomLabel: { fontSize: 13, color: '#93C5FD', fontWeight: '600' },
  roomTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginVertical: 4 },
  userInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  userInfoText: { fontSize: 13, color: '#E0E7FF', flex: 1 },
  summaryCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  summaryTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  summaryTitle: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { fontSize: 13, color: COLORS.textSecondary },
  summaryVal: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 16,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  confirmBtnDisabled: { backgroundColor: '#9CA3AF' },
  confirmBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confirmBtnTxt: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  passCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
  },
  successIcon: { fontSize: 48, marginBottom: 6 },
  passTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  passSub: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 16 },
  passTicket: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 20,
  },
  passCodeLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1 },
  passCode: { fontSize: 24, fontWeight: '900', color: COLORS.primary, marginVertical: 4 },
  qrPlaceholder: {
    marginVertical: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    width: 130,
  },
  qrTxt: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, marginTop: 4 },
  ticketDetail: { width: '100%', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  ticketRow: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  bold: { fontWeight: '700', color: COLORS.text },
  finishBtn: {
    backgroundColor: COLORS.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  finishBtnTxt: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
