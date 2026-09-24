import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Building, Equipment, CapacityRange } from '../types';
import { BUILDINGS, EQUIPMENT_LIST, CAPACITY_RANGES, COLORS } from '../constants';
import { useBookingStore } from '../store/useBookingStore';

export const FilterChips: React.FC = () => {
  const {
    filters,
    setBuilding,
    setCapacityRange,
    toggleEquipment,
    toggleFavoritesOnly,
    clearFilters,
  } = useBookingStore();

  const activeCount =
    (filters.building ? 1 : 0) +
    (filters.capacityRange ? 1 : 0) +
    filters.equipment.length +
    (filters.showFavoritesOnly ? 1 : 0);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Clear Filters Button */}
        {activeCount > 0 && (
          <TouchableOpacity
            style={styles.clearChip}
            onPress={clearFilters}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={14} color={COLORS.error} />
            <Text style={styles.clearChipText}>Xóa bộ lọc ({activeCount})</Text>
          </TouchableOpacity>
        )}

        {/* Favorites Filter */}
        <TouchableOpacity
          style={[
            styles.chip,
            filters.showFavoritesOnly && styles.chipActive,
          ]}
          onPress={toggleFavoritesOnly}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.chipText,
              filters.showFavoritesOnly && styles.chipTextActive,
            ]}
          >
            <Ionicons
              name={filters.showFavoritesOnly ? 'heart' : 'heart-outline'}
              size={14}
              color={filters.showFavoritesOnly ? '#FFFFFF' : COLORS.danger}
            />{' '}
            Đã thích
          </Text>
        </TouchableOpacity>

        {/* Building Chips */}
        {BUILDINGS.map((b) => {
          const isActive = filters.building === b;
          return (
            <TouchableOpacity
              key={b}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setBuilding(isActive ? null : (b as Building))}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                Tòa {b}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Capacity Chips */}
        {CAPACITY_RANGES.map((cap) => {
          const isActive = filters.capacityRange?.label === cap.label;
          return (
            <TouchableOpacity
              key={cap.label}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setCapacityRange(isActive ? null : (cap as CapacityRange))}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                <Ionicons name="people" size={14} color={isActive ? '#FFFFFF' : COLORS.primary} />{' '}
                {cap.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Equipment Chips */}
        {EQUIPMENT_LIST.map((eq) => {
          const isActive = filters.equipment.includes(eq as Equipment);
          return (
            <TouchableOpacity
              key={eq}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => toggleEquipment(eq as Equipment)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                <MaterialCommunityIcons name="lightning-bolt" size={14} color={isActive ? '#FFFFFF' : COLORS.primary} />{' '}
                {eq}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#DCE7F9',
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  clearChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  clearChipText: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '700',
  },
});
