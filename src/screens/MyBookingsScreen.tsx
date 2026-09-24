import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../types';
import { COLORS } from '../constants';
import { BookingCard } from '../components/BookingCard';
import { QRModal } from '../components/QRModal';
import { QRScanner } from '../components/QRScanner';
import { bookingService } from '../services/bookingService';
import { useBookingStore } from '../store/useBookingStore';

type TabType = 'active' | 'history';

export default function MyBookingsScreen() {
  const { user, bookings, setBookings, cancelBooking, updateBooking } = useBookingStore();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [qrBooking, setQrBooking] = useState<Booking | null>(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = bookingService.subscribeUserBookings(
      user.id,
      (fetchedBookings) => {
        setBookings(fetchedBookings);
      }
    );

    return () => unsubscribe();
  }, [user, setBookings]);

  const activeBookings = useMemo(
    () => bookings.filter((b: Booking) => b.status === 'active' || b.status === 'checked-in'),
    [bookings]
  );

  const historyBookings = useMemo(
    () => bookings.filter((b: Booking) => b.status === 'completed' || b.status === 'cancelled'),
    [bookings]
  );

  const currentList = activeTab === 'active' ? activeBookings : historyBookings;

  const handleCancelBooking = (booking: Booking) => {
    Alert.alert(
      'Hủy lịch đặt phòng',
      `Bạn có chắc chắn muốn hủy lịch đặt phòng "${booking.roomName}" vào lúc ${booking.startTime} ngày ${booking.date}?`,
      [
        { text: 'Quay lại', style: 'cancel' },
        {
          text: 'Xác nhận Hủy',
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingService.cancelBooking(booking.id);
              cancelBooking(booking.id);
              Alert.alert('Thành công', 'Lịch đặt phòng đã được hủy thành công.');
            } catch (e: any) {
              Alert.alert('Lỗi', e.message || 'Không thể hủy lịch đặt phòng.');
            }
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleScanQr = async (qrValue: string) => {
    if (!user?.id) {
      Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để check-in.');
      return;
    }

    setIsCheckingIn(true);
    try {
      const checkedInBooking = await bookingService.checkInWithQr(qrValue, user.id);
      updateBooking(checkedInBooking.id, {
        status: 'checked-in',
        checkedInAt: checkedInBooking.checkedInAt,
      });
      setScannerVisible(false);
      Alert.alert('Checked in!', `Bạn đã check-in thành công phòng ${checkedInBooking.roomName}.`);
    } catch (e: any) {
      Alert.alert('Không thể check-in', e.message || 'Vui lòng thử quét lại mã QR.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Title Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="calendar" size={22} color={COLORS.primary} />
          <Text style={styles.title}>Lịch Đặt Phòng Của Tôi</Text>
        </View>
        <Text style={styles.subtitle}>
          Quản lý ca học & mã QR check-in vào phòng
        </Text>
      </View>

      {/* Segmented Tab Switcher */}
      <TouchableOpacity style={styles.scanBtn} activeOpacity={0.8} onPress={() => setScannerVisible(true)}>
        <Ionicons name="scan-outline" size={18} color="#FFFFFF" />
        <Text style={styles.scanBtnText}>Scan to Check-in</Text>
      </TouchableOpacity>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'active' && styles.tabBtnActive]}
          activeOpacity={0.8}
          onPress={() => setActiveTab('active')}
        >
          <Text
            style={[styles.tabTxt, activeTab === 'active' && styles.tabTxtActive]}
          >
            Đang hoạt động ({activeBookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
          activeOpacity={0.8}
          onPress={() => setActiveTab('history')}
        >
          <Text
            style={[styles.tabTxt, activeTab === 'history' && styles.tabTxtActive]}
          >
            Lịch sử ({historyBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <FlatList
        data={currentList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookingCard booking={item} onCancel={handleCancelBooking} onShowQr={setQrBooking} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="file-tray-outline" size={38} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có lịch đặt phòng nào</Text>
            <Text style={styles.emptySub}>
              {activeTab === 'active'
                ? 'Bạn chưa đặt lịch phòng học nào đang hoạt động.'
                : 'Lịch sử phòng học đã hoàn thành hoặc bị hủy sẽ xuất hiện tại đây.'}
            </Text>
          </View>
        }
      />

      <QRModal
        visible={!!qrBooking}
        booking={qrBooking}
        onClose={() => setQrBooking(null)}
      />

      <QRScanner
        visible={scannerVisible}
        isProcessing={isCheckingIn}
        onScanned={handleScanQr}
        onClose={() => setScannerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { margin: 16, padding: 18, backgroundColor: '#FFFFFF', borderRadius: 22, borderWidth: 1, borderColor: '#E5E7EB', elevation: 2, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text, flex: 1 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  scanBtn: {
    marginHorizontal: 16,
    marginTop: 0,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
  },
  scanBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabTxt: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  tabTxtActive: { color: COLORS.primary, fontWeight: '800' },
  listContent: { padding: 16 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 20 },
  emptyIconWrap: { width: 78, height: 78, borderRadius: 28, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  emptySub: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
});
