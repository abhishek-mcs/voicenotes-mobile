import { useMutation, useQueryClient } from "react-query";
import axiosApi from "services/api/axios-api";
import { SettingsPayload } from "types";

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