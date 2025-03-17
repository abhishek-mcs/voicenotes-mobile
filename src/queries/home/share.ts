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

export function useGetSharedList(id: string){
    return useQuery('share-list',() => {
        return axiosApi.get(`/shared-users/${id}`)
    },
    {
        onError:(error:any)=>{
            console.log('shared-list',error?.response?.data?.message);
        }
    })
}

export function useShareRecording(){
    const queryClient = useQueryClient();
    return useMutation('share-note',(p?:any) => {
        return axiosApi.post(`/recording/${p.id}/share`, { emails: [p.emails]})
    },
    {
        onSuccess:async(data:any)=>{
            await queryClient.invalidateQueries('shared-list')
        },
        onError:(error:any)=>{
            console.log('share-recording ',error?.response?.data?.message);
        }
    })
}

export function useRevokeShare(){
    const queryClient = useQueryClient();
    return useMutation('revoke-share',(p?:any) => {
        return axiosApi.post(`/recording/${p.id}/revoke`, { email: p.email})
    },
    {
        onSuccess:async(data:any)=>{
            await queryClient.invalidateQueries('shared-list')
        },
        onError:(error:any)=>{
            console.log('revoke-share ',error?.response?.data?.message);
        }
    })
}