import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';
import { useBookingStore } from '../store/useBookingStore';

type Props = NativeStackScreenProps<RootStackParamList, 'RoomDetail'>;

const getEquipmentIcon = (equipment: string): keyof typeof MaterialCommunityIcons.glyphMap => {
  if (equipment.includes('PC')) return 'desktop-classic';
  if (equipment.includes('AC')) return 'snowflake';
  if (equipment.includes('Projector')) return 'projector';
  return 'draw';
};

export default function RoomDetailScreen({ route, navigation }: Props) {
  const { roomId } = route.params;
  const { rooms, isRoomFavorited, toggleFavorite } = useBookingStore();

  const room = useMemo(
    () => rooms.find((r) => r.id === roomId) || rooms[0],
    [rooms, roomId]
  );

  if (!room) {
    return (
      <View style={styles.notFound}>
        <Text>Không tìm thấy thông tin phòng học.</Text>
      </View>
    );
  }

  const isFav = isRoomFavorited(room.id);
  const isAvailable = room.status === 'available';

  const handleStartBooking = () => {
    navigation.navigate('Booking', {
      roomId: room.id,
      roomName: room.name,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Photo */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: room.photo }} style={styles.image} resizeMode="cover" />

          {/* Status Badge Overlay */}
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isAvailable ? COLORS.success : COLORS.error },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isAvailable ? COLORS.success : COLORS.error },
              ]}
            >
              {isAvailable ? 'Sẵn sàng đặt' : 'Đang có lớp/sử dụng'}
            </Text>
          </View>

          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            activeOpacity={0.7}
            onPress={() => toggleFavorite(room.id)}
          >
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={22}
              color={isFav ? COLORS.danger : COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Room Information */}
        <View style={styles.contentCard}>
          <View style={styles.titleRow}>
            <Text style={styles.roomName}>{room.name}</Text>
            <View style={styles.buildingBadge}>
              <Text style={styles.buildingBadgeTxt}>
                Tòa {room.building} - Tầng {room.floor}
              </Text>
            </View>
          </View>

          {/* Quick Specs */}
          <View style={styles.specsRow}>
            <View style={styles.specBox}>
              <Ionicons name="people" size={22} color={COLORS.primary} style={styles.specIcon} />
              <Text style={styles.specVal}>{room.capacity} SV</Text>
              <Text style={styles.specLbl}>Sức chứa</Text>
            </View>
            <View style={styles.specBox}>
              <Ionicons name="business" size={22} color={COLORS.primary} style={styles.specIcon} />
              <Text style={styles.specVal}>Tòa {room.building}</Text>
              <Text style={styles.specLbl}>Khu vực</Text>
            </View>
            <View style={styles.specBox}>
              <Ionicons name="location" size={22} color={COLORS.primary} style={styles.specIcon} />
              <Text style={styles.specVal}>Tầng {room.floor}</Text>
              <Text style={styles.specLbl}>Vị trí phòng</Text>
            </View>
          </View>

          {/* Equipment List */}
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="lightning-bolt" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Trang thiết bị khả dụng</Text>
          </View>
          <View style={styles.equipmentGrid}>
            {room.equipment.map((eq, idx) => (
              <View key={idx} style={styles.eqItem}>
                <MaterialCommunityIcons name={getEquipmentIcon(eq)} size={16} color={COLORS.primary} />
                <Text style={styles.eqTxt}>{eq}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <View style={styles.sectionTitleRow}>
            <Ionicons name="document-text" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Mô tả & mục đích sử dụng</Text>
          </View>
          <Text style={styles.descTxt}>{room.description}</Text>

          {/* Campus Rules Notice */}
          <View style={styles.rulesBox}>
            <View style={styles.rulesTitleRow}>
              <Ionicons name="alert-circle" size={18} color="#92400E" />
              <Text style={styles.rulesTitle}>Quy định sử dụng phòng học VKU</Text>
            </View>
            <Text style={styles.ruleItem}>• Sinh viên mang theo thẻ sinh viên khi vào phòng.</Text>
            <Text style={styles.ruleItem}>• Giữ vệ sinh chung, không mang thức ăn vào phòng máy.</Text>
            <Text style={styles.ruleItem}>• Tắt tất cả thiết bị điện & máy lạnh khi kết thúc ca học.</Text>
            <Text style={styles.ruleItem}>• Check-in QR code trong vòng 15 phút đầu ca học.</Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.freeLbl}>Miễn phí cho SV VKU</Text>
          <Text style={styles.subLbl}>Đặt trước tối đa 7 ngày</Text>
        </View>
        <TouchableOpacity style={styles.bookBtn} activeOpacity={0.8} onPress={handleStartBooking}>
          <Ionicons name="calendar" size={18} color="#FFFFFF" />
          <Text style={styles.bookBtnTxt}>Đặt phòng ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 90 },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  imageContainer: { width: '100%', height: 220, position: 'relative' },
  image: { width: '100%', height: '100%' },
  statusBadge: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '700' },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 20,
  },
  contentCard: { padding: 16, backgroundColor: '#F4F7FB' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  roomName: { fontSize: 24, fontWeight: '800', color: COLORS.text, flex: 1 },
  buildingBadge: { backgroundColor: COLORS.primaryLight || '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  buildingBadgeTxt: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  specsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  specBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 18,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E0EAFF',
    elevation: 2,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  specIcon: { fontSize: 20, marginBottom: 4 },
  specVal: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  specLbl: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 18, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  equipmentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  eqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E0EAFF',
  },
  eqIcon: { fontSize: 14, marginRight: 6 },
  eqTxt: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  descTxt: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  rulesBox: {
    marginTop: 20,
    backgroundColor: '#FEF3C7',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  rulesTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  rulesTitle: { fontSize: 14, fontWeight: '800', color: '#92400E' },
  ruleItem: { fontSize: 12, color: '#78350F', marginBottom: 4, lineHeight: 18 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: { flex: 1 },
  freeLbl: { fontSize: 15, fontWeight: '800', color: COLORS.success },
  subLbl: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  bookBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 4,
  },
  bookBtnTxt: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
