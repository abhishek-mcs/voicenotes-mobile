import { useQuery, UseQueryResult } from "react-query";
import axiosApi from "services/api/axios-api";
import { VoiceNote } from "types";

export function useAllRecordings(): UseQueryResult<VoiceNote[], Error> {
    return useQuery('recordings', 
        async () => {
        const response = await axiosApi.get(`/recordings/all`);
        
        if (response.data && response.data.data) {
            return response.data.data as VoiceNote[];
        }
        
        console.log('Unexpected API response structure:', response);
        return [];
        },
        {
        onError: (error: any) => {
            console.warn(error?.response?.data?.message);
        },
        }
    );
}