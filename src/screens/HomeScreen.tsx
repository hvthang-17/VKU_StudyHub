import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, SafeAreaView, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { RootStackParamList, MainTabParamList, Room } from '../types';
import { COLORS } from '../constants';
import { useBookingStore } from '../store/useBookingStore';
import { roomService } from '../services/roomService';
import { RoomCard } from '../components/RoomCard';
import { SearchBar } from '../components/SearchBar';
import { FilterChips } from '../components/FilterChips';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  const { user, rooms, setRooms, filters, setSearchQuery, toggleFavorite, isRoomFavorited } = useBookingStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsub = roomService.subscribeToRooms((list) => setRooms(list));
    return () => unsub();
  }, [setRooms]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    roomService.subscribeToRooms((list) => {
      setRooms(list);
      setRefreshing(false);
    });
  }, [setRooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        if (!r.name.toLowerCase().includes(q) && !`tòa ${r.building.toLowerCase()}`.includes(q)) return false;
      }
      if (filters.building && r.building !== filters.building) return false;
      if (filters.capacityRange && (r.capacity < filters.capacityRange.min || r.capacity > filters.capacityRange.max)) return false;
      if (filters.equipment.length > 0 && !filters.equipment.every((eq) => r.equipment.includes(eq))) return false;
      if (filters.showFavoritesOnly && !user?.favorites?.includes(r.id)) return false;
      return true;
    });
  }, [rooms, filters, user?.favorites]);

  const handleRoomPress = useCallback((r: Room) => {
    navigation.navigate('RoomDetail', { roomId: r.id });
  }, [navigation]);

  const handleToggleFav = useCallback((id: string) => toggleFavorite(id), [toggleFavorite]);

  const renderRoomItem = useCallback(({ item }: { item: Room }) => (
    <RoomCard room={item} isFavorite={isRoomFavorited(item.id)} onPress={handleRoomPress} onToggleFavorite={handleToggleFav} />
  ), [isRoomFavorited, handleRoomPress, handleToggleFav]);

  const keyExtractor = useCallback((item: Room) => item.id, []);

  const renderHeader = useMemo(() => (
    <View style={styles.headerContainer}>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.logoMark}>
            <MaterialCommunityIcons name="school" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.badge}>
            <Ionicons name="flash" size={12} color="#DBEAFE" />
            <Text style={styles.badgeText}>VKU StudyHub</Text>
          </View>
        </View>
        <Text style={styles.greetingText}>Xin chào, {user?.name || 'Sinh viên VKU'}</Text>
        <Text style={styles.heroTitle}>Tìm phòng học phù hợp cho buổi học tiếp theo</Text>
        <Text style={styles.subGreeting}>Đặt phòng, nhận QR và check-in ngay trên điện thoại.</Text>
        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatPill}>
            <Ionicons name="business" size={15} color="#BFDBFE" />
            <Text style={styles.heroStatText}>{rooms.length} phòng</Text>
          </View>
          <View style={styles.heroStatPill}>
            <Ionicons name="filter" size={15} color="#BFDBFE" />
            <Text style={styles.heroStatText}>{filteredRooms.length} phù hợp</Text>
          </View>
        </View>
      </View>
      <SearchBar value={filters.searchQuery} onChangeText={setSearchQuery} />
      <FilterChips />
      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>Đang hiển thị <Text style={styles.countText}>{filteredRooms.length}</Text> phòng phù hợp với lựa chọn của bạn</Text>
      </View>
    </View>
  ), [user?.name, rooms.length, filters.searchQuery, setSearchQuery, filteredRooms.length]);
  const renderEmpty = useMemo(() => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="search" size={34} color={COLORS.primary} />
      </View>
      <Text style={styles.emptyTitle}>Không tìm thấy phòng phù hợp</Text>
      <Text style={styles.emptySubtitle}>Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc.</Text>
    </View>
  ), []);


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <FlatList
        data={filteredRooms}
        renderItem={renderRoomItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F7FB' },
  listContent: { paddingBottom: 24 },
  headerContainer: { backgroundColor: '#F4F7FB', paddingBottom: 8 },
  heroCard: {
    margin: 16,
    padding: 18,
    borderRadius: 28,
    backgroundColor: COLORS.primaryDark,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 6,
  },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  logoMark: { width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  greetingText: { fontSize: 14, color: '#BFDBFE', fontWeight: '600', marginBottom: 6 },
  heroTitle: { fontSize: 26, lineHeight: 32, color: '#FFFFFF', fontWeight: '900', maxWidth: 310 },
  subGreeting: { fontSize: 14, color: '#DCEBFF', marginTop: 10, lineHeight: 20 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  heroStatsRow: { flexDirection: 'row', gap: 8, marginTop: 18 },
  heroStatPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999 },
  heroStatText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  summaryBar: { paddingHorizontal: 18, paddingVertical: 6, marginBottom: 6 },
  summaryText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 20 },
  emptyIconWrap: { width: 68, height: 68, borderRadius: 24, backgroundColor: '#EAF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  countText: { fontWeight: '700', color: COLORS.primary },
});

