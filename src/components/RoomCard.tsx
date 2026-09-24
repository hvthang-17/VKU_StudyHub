import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Room } from '../types';
import { COLORS } from '../constants';

interface RoomCardProps {
  room: Room;
  isFavorite: boolean;
  onPress: (room: Room) => void;
  onToggleFavorite: (roomId: string) => void;
}

const getEquipmentIcon = (equipment: string): keyof typeof MaterialCommunityIcons.glyphMap => {
  if (equipment.includes('PC')) return 'desktop-classic';
  if (equipment.includes('AC')) return 'snowflake';
  if (equipment.includes('Projector')) return 'projector';
  return 'draw';
};

export const RoomCard = React.memo<RoomCardProps>(({
  room,
  isFavorite,
  onPress,
  onToggleFavorite,
}) => {
  const isAvailable = room.status === 'available';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => onPress(room)}
    >
      {/* Room Photo & Badges */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: room.photo }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Status Badge */}
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
            {isAvailable ? 'Sẵn sàng' : 'Đang sử dụng'}
          </Text>
        </View>

        {/* Favorite Button Overlay */}
        <TouchableOpacity
          style={styles.favoriteButton}
          activeOpacity={0.7}
          onPress={() => onToggleFavorite(room.id)}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? COLORS.danger : COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Card Details */}
      <View style={styles.content}>
        {/* Room Header */}
        <View style={styles.headerRow}>
          <Text style={styles.roomName} numberOfLines={1}>
            {room.name}
          </Text>
          <View style={styles.buildingBadge}>
            <Text style={styles.buildingBadgeText}>
              Tòa {room.building} - Tầng {room.floor}
            </Text>
          </View>
        </View>

        {/* Capacity & Specs */}
        <View style={styles.infoRow}>
          <Ionicons name="people" size={16} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Sức chứa: <Text style={styles.boldText}>{room.capacity} SV</Text>
          </Text>
        </View>

        {/* Equipment Badges */}
        <View style={styles.equipmentRow}>
          {room.equipment.map((eq, index) => (
            <View key={index} style={styles.eqChip}>
              <MaterialCommunityIcons name={getEquipmentIcon(eq)} size={13} color={COLORS.primary} />
              <Text style={styles.eqText}>{eq}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2EAF7',
    elevation: 4,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 18,
  },
  imageContainer: {
    height: 168,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 18,
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  roomName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  buildingBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  buildingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  infoRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.text,
  },
  equipmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  eqChip: {
    backgroundColor: '#F5F8FF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E0EAFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  eqText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
