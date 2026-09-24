import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Booking } from '../types';
import { parseTime } from '../utils/helpers';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const REMINDER_CHANNEL_ID = 'booking-reminders';

export const notificationService = {
  requestPermissions: async (): Promise<boolean> => {
    if (Platform.OS === 'web') return false;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
        name: 'Booking Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted) return true;

    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  },

  scheduleBookingReminder: async (booking: Booking): Promise<string | undefined> => {
    const granted = await notificationService.requestPermissions();
    if (!granted) return undefined;

    const slotStart = parseTime(booking.date, booking.startTime);
    const reminderAt = new Date(slotStart.getTime() - 15 * 60 * 1000);

    if (reminderAt.getTime() <= Date.now()) {
      return undefined;
    }

    // Schedule 15-min pre-slot reminder
    return Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Sắp đến giờ học',
        body: `15 phút nữa đến giờ check-in phòng ${booking.roomName} (${booking.startTime} – ${booking.endTime}).`,
        data: { bookingId: booking.id, roomId: booking.roomId },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderAt,
        channelId: REMINDER_CHANNEL_ID,
      },
    });
  },

  scheduleNoShowWarning: async (booking: Booking): Promise<string | undefined> => {
    const granted = await notificationService.requestPermissions();
    if (!granted) return undefined;

    const slotStart = parseTime(booking.date, booking.startTime);
    const noShowAt = new Date(slotStart.getTime() + 15 * 60 * 1000); // 15 mins after startTime

    if (noShowAt.getTime() <= Date.now()) {
      return undefined;
    }

    return Notifications.scheduleNotificationAsync({
      content: {
        title: 'Đã quá giờ check-in',
        body: `Ca đặt phòng ${booking.roomName} (${booking.startTime} - ${booking.endTime}) ngày ${booking.date} đã bị HỦY TỰ ĐỘNG do quá thời hạn check-in 15 phút.`,
        data: { bookingId: booking.id, type: 'no-show' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: noShowAt,
        channelId: REMINDER_CHANNEL_ID,
      },
    });
  },

  sendNoShowInstantNotification: async (booking: Booking): Promise<void> => {
    const granted = await notificationService.requestPermissions();
    if (!granted) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Thông báo Hủy Đặt Phòng',
        body: `Ca đặt phòng ${booking.roomName} (${booking.startTime} - ${booking.endTime}) ngày ${booking.date} đã bị HỦY TỰ ĐỘNG do quá thời hạn check-in 15 phút.`,
        data: { bookingId: booking.id, type: 'no-show' },
        sound: 'default',
      },
      trigger: null, // Send immediately
    });
  },

  cancelBookingReminder: async (notificationId?: string): Promise<void> => {
    if (!notificationId) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (e) {
      console.warn('[notificationService] cancel reminder notice:', e);
    }
  },
};
