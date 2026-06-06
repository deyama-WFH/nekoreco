import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Reminder } from '../types/models';

const APP_NOTIFICATION_KEY = 'nekorecoReminderId';

export async function syncLocalNotifications(reminders: Reminder[]) {
  if (Platform.OS === 'web') return;

  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((notification) => notification.content.data?.[APP_NOTIFICATION_KEY])
      .map((notification) => Notifications.cancelScheduledNotificationAsync(notification.identifier)),
  );

  const now = Date.now();
  await Promise.all(
    reminders
      .filter((reminder) => new Date(reminder.scheduledAt).getTime() > now)
      .map((reminder) =>
        Notifications.scheduleNotificationAsync({
          content: {
            title: reminder.title,
            body: reminder.body,
            data: {
              [APP_NOTIFICATION_KEY]: reminder.id,
              catId: reminder.catId,
              reminderType: reminder.reminderType,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(reminder.scheduledAt),
          },
        }),
      ),
  );
}
