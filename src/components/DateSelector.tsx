import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { formatDate, getNextDays, isToday } from '../utils/helpers';

interface DateSelectorProps {
  selectedDate: string; // "YYYY-MM-DD"
  onSelectDate: (dateStr: string) => void;
  daysCount?: number;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onSelectDate,
  daysCount = 7,
}) => {
  const days = useMemo(() => getNextDays(daysCount), [daysCount]);

  const getVietnameseDayName = (date: Date): string => {
    if (isToday(date)) return 'Hôm nay';
    const dayIndex = date.getDay(); // 0 = Sun, 1 = Mon...
    const map = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return map[dayIndex];
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
        <Text style={styles.label}>Chọn ngày học</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((dateObj) => {
          const dateStr = formatDate(dateObj);
          const isSelected = selectedDate === dateStr;
          const dayName = getVietnameseDayName(dateObj);
          const dayNumber = dateObj.getDate();
          const monthNumber = dateObj.getMonth() + 1;

          return (
            <TouchableOpacity
              key={dateStr}
              style={[styles.dayCard, isSelected && styles.dayCardActive]}
              activeOpacity={0.75}
              onPress={() => onSelectDate(dateStr)}
            >
              <Text style={[styles.dayName, isSelected && styles.dayNameActive]}>
                {dayName}
              </Text>
              <Text style={[styles.dayNumber, isSelected && styles.dayNumberActive]}>
                {dayNumber}
              </Text>
              <Text style={[styles.monthLabel, isSelected && styles.monthLabelActive]}>
                Thg {monthNumber}
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
    marginVertical: 10,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  dayCard: {
    width: 68,
    height: 84,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dayCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  dayNameActive: {
    color: '#E0E7FF',
    fontWeight: '700',
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  dayNumberActive: {
    color: '#FFFFFF',
  },
  monthLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  monthLabelActive: {
    color: '#E0E7FF',
    fontWeight: '600',
  },
});
