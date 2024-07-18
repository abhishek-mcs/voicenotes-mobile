import { useMutation, useQuery, useQueryClient } from "react-query";
import axiosApi from "services/api/axios-api";

export function useUnpublishRecording(){
    const queryClient = useQueryClient();
    return useMutation('unpublish-recording',(p?:any) => {
        return axiosApi.patch(`/recordings/${p?.id}/public`)
    },
    {
        onSuccess:async(error:any)=>{
            await queryClient.invalidateQueries('published-recordings')
        },
        onError:(error:any)=>{
            console.log('unpublish',error?.response?.data?.message);
        }
    })
}

export function useGetPublishedRecording(){
    return useQuery('published-recordings',(p?:any) => {
        return axiosApi.get(`/recordings/public?page=1`)
    },
    {
        onError:(error:any)=>{
            console.log('published-recordings',error?.response?.data?.message);
        }
    })
}