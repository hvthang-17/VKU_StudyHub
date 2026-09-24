import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { useBookingStore } from '../store/useBookingStore';
import { authService } from '../services/authService';

export default function ProfileScreen() {
  const user = useBookingStore((s) => s.user);
  const bookings = useBookingStore((s) => s.bookings);
  const setUser = useBookingStore((s) => s.setUser);
  const clearStore = useBookingStore((s) => s.clearStore);

  const stats = React.useMemo(() => {
    const total = bookings.length;
    const active = bookings.filter((b) => b.status === 'active').length;
    const checkedInOrCompleted = bookings.filter((b) => b.status === 'checked-in' || b.status === 'completed').length;
    const cancelled = bookings.filter((b) => b.status === 'cancelled').length;
    return { total, active, checkedInOrCompleted, cancelled };
  }, [bookings]);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng VKU StudyHub?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            setUser(null);
            clearStore();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={st.container}>
      {/* Hero Card */}
      <View style={st.heroCard}>
        <View style={st.avatarRing}>
          <Image
            source={{ uri: user?.avatar || 'https://ui-avatars.com/api/?name=VKU&background=2563EB&color=fff' }}
            style={st.avatar}
          />
        </View>
        <Text style={st.userName}>{user?.name || 'Sinh viên VKU'}</Text>
        <Text style={st.userEmail}>{user?.email || 'sv@vku.udn.vn'}</Text>
        <View style={st.roleBadge}>
          {user?.role === 'admin' ? (
            <Ionicons name="shield-checkmark" size={14} color={COLORS.primary} />
          ) : (
            <Ionicons name="school-outline" size={14} color={COLORS.primary} />
          )}
          <Text style={st.roleTxt}>{user?.role === 'admin' ? 'QTV Quản lý' : 'Sinh viên VKU'}</Text>
        </View>
      </View>

      {/* Booking Statistics Section */}
      <View style={st.infoSection}>
        <View style={st.sectionTitleRow}>
          <Ionicons name="stats-chart-outline" size={20} color={COLORS.primary} />
          <Text style={st.sectionTitle}>Thống kê đặt phòng</Text>
        </View>

        <View style={st.statsGrid}>
          <View style={st.statCard}>
            <Text style={[st.statValue, { color: COLORS.primary }]}>{stats.total}</Text>
            <Text style={st.statLabel}>Tổng ca đặt</Text>
          </View>
          <View style={st.statCard}>
            <Text style={[st.statValue, { color: COLORS.success }]}>{stats.checkedInOrCompleted}</Text>
            <Text style={st.statLabel}>Đã nhận phòng</Text>
          </View>
          <View style={st.statCard}>
            <Text style={[st.statValue, { color: '#D97706' }]}>{stats.active}</Text>
            <Text style={st.statLabel}>Chờ check-in</Text>
          </View>
          <View style={st.statCard}>
            <Text style={[st.statValue, { color: COLORS.danger }]}>{stats.cancelled}</Text>
            <Text style={st.statLabel}>Đã hủy / No-show</Text>
          </View>
        </View>
      </View>

      {/* Info Section */}
      <View style={st.infoSection}>
        <View style={st.sectionTitleRow}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={st.sectionTitle}>Thông tin cá nhân</Text>
        </View>

        <View style={st.infoRow}>
          <View style={st.infoIconWrap}>
            <Ionicons name="id-card-outline" size={18} color={COLORS.primary} />
          </View>
          <View style={st.infoContent}>
            <Text style={st.infoLabel}>Mã sinh viên</Text>
            <Text style={st.infoVal}>{user?.studentId || 'N/A'}</Text>
          </View>
        </View>

        <View style={st.infoRow}>
          <View style={st.infoIconWrap}>
            <MaterialCommunityIcons name="book-education-outline" size={18} color={COLORS.primary} />
          </View>
          <View style={st.infoContent}>
            <Text style={st.infoLabel}>Khoa chuyên ngành</Text>
            <Text style={st.infoVal}>{user?.department || 'N/A'}</Text>
          </View>
        </View>

        <View style={st.infoRow}>
          <View style={st.infoIconWrap}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
          </View>
          <View style={st.infoContent}>
            <Text style={st.infoLabel}>Trạng thái tài khoản</Text>
            <Text style={[st.infoVal, { color: COLORS.success }]}>Đã xác thực</Text>
          </View>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={st.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
        <Text style={st.logoutTxt}>Đăng xuất tài khoản</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  heroCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 28, alignItems: 'center', marginBottom: 16,
    elevation: 4, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20,
  },
  avatarRing: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14, padding: 3,
  },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  userName: { fontSize: 22, fontWeight: '900', color: COLORS.text },
  userEmail: { fontSize: 14, color: COLORS.gray600, marginTop: 4 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EFF6FF', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, marginTop: 12,
  },
  roleTxt: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  infoSection: {
    backgroundColor: '#FFFFFF', borderRadius: 22, padding: 20, marginBottom: 20,
    elevation: 3, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 14,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray600,
    fontWeight: '600',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoIconWrap: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: COLORS.gray600, marginBottom: 2 },
  infoVal: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#FEF2F2', borderRadius: 18, paddingVertical: 16, marginBottom: 30,
    borderWidth: 1.5, borderColor: '#FECACA',
  },
  logoutTxt: { color: COLORS.danger, fontSize: 16, fontWeight: '800' },
});

