import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';

const STORAGE_KEY = '@download_directory';

export const saveFileAndroid = async (fileUri: string, fileName: string): Promise<void> => {
  try {
    // Try to get the stored directory URI
    let directoryUri = await AsyncStorage.getItem(STORAGE_KEY);

    if (!directoryUri) {
      // If no stored URI, request directory access
      const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        directoryUri = permissions.directoryUri;
        // Store the directory URI for future use
        await AsyncStorage.setItem(STORAGE_KEY, directoryUri);
      } else {
        throw new Error('Directory permission not granted');
      }
    }

    // Try to save the file
    try {
        const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });

      const destinationUri = await StorageAccessFramework.createFileAsync(
        directoryUri,
        fileName,
        'audio/mpeg'
      );
      await FileSystem.writeAsStringAsync(destinationUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch (error) {
      console.error('Error saving file:', error);
      // If saving fails, the stored URI might be invalid. Clear it and try again.
      await AsyncStorage.removeItem(STORAGE_KEY);
      return saveFileAndroid(fileUri, fileName); // Recursive call to try again
    }
  } catch (error) {
    console.error('Error in saveFile:', error);
    // Handle the error (e.g., show an error message to the user)
  }
};