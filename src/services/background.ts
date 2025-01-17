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
    if(Platform.OS === 'android'){
      const channelId = await createNotificationChannel();
      await notifee.displayNotification({
        id: 'background',
        title: upload ? 'Uploading note' : 'Recording in progress',
        body: upload ? 'Please wait until your note is uploaded & processed.' : 'You can continue using your device normally.',
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
    }
};

export const stopSilentBackgroundService = async () => {
    if (Platform.OS === 'android') {
      await notifee.stopForegroundService();
    }
};

export const showCompletionNotification = async () => {
    try {
      if (AppState.currentState !== 'active') {
        // Get all displayed notifications
        const displayedNotifications = await notifee.getDisplayedNotifications();
        
        // Check if there's already a notification with the 'completion' channel
        const hasCompletionNotification = displayedNotifications.some(
          notification => notification.notification.android?.channelId === 'completion'
        );

        // Only proceed if no completion notification exists
        if (!hasCompletionNotification) {
          const channelId = await notifee.createChannel({
            id: 'completion',
            name: 'Note status',
            importance: AndroidImportance.HIGH,
            vibration: true,
            lights: true,
            sound: 'default'
          });

          await notifee.displayNotification({
            title: 'Voicenotes',
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
      }
    } catch (error) {
      console.warn('Failed to show completion notification:', error);
    }
};