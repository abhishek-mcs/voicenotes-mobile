import { useMutation, useQueryClient } from "react-query";
import * as Device from 'expo-device';
import axiosApi from "services/api/axios-api";
import { Author, Publication, SettingsPayload } from "types";
import { currentVersion } from "services/api/api-constants";
import axios from "axios";
import { Alert } from "react-native";

export function useSaveSettings() {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, SettingsPayload>(
    'save-settings',
    (p: SettingsPayload) => {
      return axiosApi.patch(`/settings`, p);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user-data');
      },
      onError: (error: any) => {
        console.log('save settings', error?.response?.data?.message);
      }
    }
  );
}

export async function changeEmail({email="",password="", otp=""}) {
  try {
      const response = await axiosApi.patch(otp ? '/settings/email/update' : '/settings/email/change', {
          email,
          otp,
          password
      });
      return response.data;
  } catch (error) {
      throw error;
  }
}

export async function submitReview(review: string) {
  try {
    const response = await axiosApi.post('/feedback', {
      review,
      platform: Device.osName,
      device_details: {
        platform: Device.osName,
        modelName: Device.modelName,
        osVersion: Device.osVersion,
        appVersion: currentVersion,
        deviceType: Device.DeviceType,
        manufacturer: Device.manufacturer
      }
    })
    return response.data
  } catch (error) { throw error }
}

// PUBLISH queries

export async function uploadAvatar(
  file: string, 
  is_author: boolean, 
  isLightMode = true,
  showDialog: (title: string, message: string, actions: never[], options: { userInterfaceStyle: string }) => void
): Promise<{ url: string, path: string } | undefined> {
  try {
      const filename = file.split('/').pop();

      if (!filename) {
          showDialog(
              'Unknown file', 
              "VoiceNotes couldn't infer the filename of this photo. Please select another one.",
              [],
              { userInterfaceStyle: isLightMode ? "light" : "dark" }
          );
          return;
      }

      // First get the signed URL
      const signedUrlResponse = await axiosApi.post(
          `/publications/avatar/signed-url?is_author=${is_author ? 1 : 0}`,
          { filename: filename }
      );

      const { url, path } = signedUrlResponse.data;

      // Read the file as blob
      const response = await fetch(file);
      const blob = await response.blob();

      // Upload directly to S3 with correct content type
      await fetch(url, {
          method: 'PUT',
          body: blob,
          headers: {
              'Content-Type': blob.type,
              'Accept': 'application/json',
          }
      });

      return { url: file, path };
  } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || 'Failed to upload avatar');
      }
      throw error;
  }
}

export async function editPublication(
  description: string,
  is_public: boolean,
  slug: string,
  title: string,
  avatar?: string
): Promise<Publication | undefined> {
  try {
    const response = await axiosApi.patch(`/publications/${slug}`, {
      description,
      is_public: is_public ? 1 : 0,
      slug,
      title,
      avatar
    });

    return response.data.data;
  } catch (error) {
    Alert.alert(
      'Error',
      'Failed to update this publication. Please try again later.',
      [{ text: 'OK' }]
    );
    return;
  }
}

export async function createPublication(
  avatar: string,
  description: string,
  is_public: boolean,
  slug: string,
  title: string  
): Promise<Publication | undefined> {
  try {
    const response = await axiosApi.post('/publications', {
      avatar,
      description,
      is_public: is_public ? 1 : 0,
      slug,
      title
    });

    return response.data.data;
  } catch (error) {
    console.warn(error)
    Alert.alert(
      'Error',
      'Failed to create your publication. Please try again later.',
      [{ text: 'OK' }]
    );
    return;
  }
}

export async function checkSlug(
  slug: string
): Promise<{available: boolean, slug: string, suggestions: null | string[] } | undefined> {
  try {
    const response = await axiosApi.get(`/publications/slug/check`, {
      params: { slug }
    });

    return response.data;
  } catch (error) {
    console.warn(error)
    Alert.alert(
      'Error',
      'Failed to check username availability. Please try again later.',
      [{ text: 'OK' }]
    );
    return;
  }
}

export async function updateAuthor(
  name: string,
  about: string,
  website: string | null,
  avatar?: string
) : Promise<Author> {
  const response = await axiosApi.patch('/publications/author', {
    name, about, website, avatar
  })

  return response.data.data;
}

export async function createAuthor(
  name: string,
  about: string,
  avatar: string,
  website: string | null
) : Promise<Author> {
  const response = await axiosApi.post('/publications/author', {
    name, about, website, avatar
  })

  return response.data.data;
}

export async function togglePage(slug: string, is_public: boolean) {
  const response = await axiosApi.patch(`/publications/${slug}/status`, { is_public })
  return response.data.data
}