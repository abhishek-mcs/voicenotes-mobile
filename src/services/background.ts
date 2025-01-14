import notifee, { AndroidForegroundServiceType, AndroidImportance, AndroidVisibility } from "@notifee/react-native";
import { AppState, Platform } from "react-native";

const createNotificationChannel = async () => {
    const channelId = await notifee.createChannel({
        id: 'background',
        name: 'Background Activities',
        importance: AndroidImportance.HIGH,
      });
    return channelId;
};

export const startSilentBackgroundService = async () => {
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
          foregroundServiceTypes: [
            AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_MICROPHONE,
            AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_DATA_SYNC,
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
        const channelId = await notifee.createChannel({
          id: 'upload',
          name: 'Upload Status',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          lights: true
        });
        await notifee.displayNotification({
          title: 'Note Ready',
          body: 'Your voice note has been transcribed and is ready to view.',
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