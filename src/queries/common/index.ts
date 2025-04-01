import { useQuery, UseQueryResult } from "react-query";
import axiosApi from "services/api/axios-api";
import { VoiceNote } from "types";

export function useAllRecordings(token: string): UseQueryResult<VoiceNote[], Error> {
    return useQuery<VoiceNote[], Error>(
        'recordings',
        async ({ signal }) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, 5000);

            try {
                const response = await axiosApi.get('/recordings/all', { signal: controller.signal });
                clearTimeout(timeoutId);
                return response.data;
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        },
        {
            enabled: !!token,
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
            staleTime: 30000,
            onError: (error: any) => {
                console.warn('All recordings fetch error:', error?.response?.data?.message);
            },
        }
    );
}