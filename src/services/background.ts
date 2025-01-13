import notifee, { AndroidForegroundServiceType, AndroidImportance, AndroidVisibility } from "@notifee/react-native";
import { AppState, Platform } from "react-native";

const createNotificationChannel = async (type: 'upload' | 'recording') => {
    const channelId = await notifee.createChannel({
        id: type,
        name: type === 'upload' ? 'Background Activities' : 'Recording',
        importance: AndroidImportance.HIGH,
      });
    return channelId;
};

export const startSilentBackgroundService = async (type: 'upload' | 'recording') => {
    await notifee.requestPermission();
    const channelId = await createNotificationChannel(type);
      await notifee.displayNotification({
        id: type,
        title: type === 'upload' ? '' : 'Recording in progress',
        body: type === 'upload' ? '' : 'Tap here and hit the DONE button to save your note.',
        android: {
          channelId,
          asForegroundService: true,
          ongoing: true,
          autoCancel: false,
          importance: AndroidImportance.HIGH,
          visibility: type === 'upload' ? AndroidVisibility.SECRET : AndroidVisibility.PUBLIC,
          foregroundServiceTypes: [
            type === 'recording' ? AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_MICROPHONE : AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_SHORT_SERVICE
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