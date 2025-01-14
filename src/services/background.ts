import notifee, { AndroidForegroundServiceType, AndroidImportance, AndroidVisibility } from "@notifee/react-native";
import { AppState, Platform } from "react-native";

const createNotificationChannel = async () => {
    const channelId = await notifee.createChannel({
        id: 'background',
        name: 'Background Activities',
        importance: AndroidImportance.MIN,
        vibration: false,
        lights: false,
        sound: 'default'
      });
    return channelId;
};

export const startSilentBackgroundService = async (upload: boolean = false) => {
    await notifee.requestPermission();
    const channelId = await createNotificationChannel();
      await notifee.displayNotification({
        id: 'background',
        title: '',
        body: '',
        android: {
          channelId,
          asForegroundService: true,
          ongoing: true,
          autoCancel: false,
          importance: AndroidImportance.HIGH,
          visibility: AndroidVisibility.SECRET,
          foregroundServiceTypes: upload ? [
            AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_DATA_SYNC
          ] : [
            AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_MICROPHONE,
            AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_DATA_SYNC
          ],
          pressAction: {
            id: 'default',
          },
        }
      });
};

export const stopSilentBackgroundService = async () => {
    if (Platform.OS === 'android') {
      await notifee.stopForegroundService();
    }

    try {
        await notifee.cancelAllNotifications();
    } catch (error) {
        console.warn('Failed to dismiss notifications:', error);
    }
};

export const showCompletionNotification = async () => {
    try {
      if (AppState.currentState !== 'active') {
        const channelId = await createNotificationChannel();
        await notifee.displayNotification({
          title: Platform.OS === 'ios' ? 'Voicenotes' : '',
          body: 'Your note is now ready to view.',
          android: {
            channelId,
            importance: AndroidImportance.HIGH,
            visibility: AndroidVisibility.PUBLIC,
            pressAction: {
              id: 'default',
            },
          },
          ios: {
            foregroundPresentationOptions: {
              badge: true,
              sound: true,
              banner: true,
              list: true,
            },
          },
        });
      }
    } catch (error) {
      console.warn('Failed to show completion notification:', error);
    }
};