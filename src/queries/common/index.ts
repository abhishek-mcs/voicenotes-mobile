import { useQuery, UseQueryResult } from "react-query";
import axiosApi from "services/api/axios-api";
import { VoiceNote } from "types";

export function useAllRecordings(token: string): UseQueryResult<VoiceNote[], Error> {
    return useQuery('recordings', 
        async () => {

            const response = await axiosApi.get(`/recordings/all`);
            
            if (response.data) {
                return response.data as VoiceNote[];
            }
            
            return [];
        },
        {
            enabled: !!token,
            onError: (error: any) => {
                console.warn(error?.response?.data?.message);
            },
        }
    );
}