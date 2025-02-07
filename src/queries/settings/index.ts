import { useMutation, useQueryClient } from "react-query";
import * as Device from 'expo-device';
import axiosApi from "services/api/axios-api";
import { SettingsPayload } from "types";
import { currentVersion } from "services/api/api-constants";

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