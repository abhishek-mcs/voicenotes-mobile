import { useMutation, useQuery, useQueryClient } from "react-query";
import axiosApi from "services/api/axios-api";

export function useSearch(q:string){
    return useQuery(['search',q],()=>{
        return axiosApi.get(`/search?query=${q}`)
    },
    {   enabled:!!q,
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useSetSearchHistory(){
    const queryClient = useQueryClient()
    return useMutation('set-search-history',(id:any) => {
        return axiosApi.post(`/search-history`,{uuid:id})
    },
    {
        onSuccess:()=>{
            queryClient.resetQueries('search-history')
        },
        onError:(error:any)=>{
            console.log('set-search-history',error?.response?.data?.message);
        }
    })
}

export function useSearchHistory(){
    return useQuery('search-history',(p?:any) => {
        return axiosApi.get(`/search-history`)
    },
    {
        onError:(error:any)=>{
            console.log('search-history',error?.response?.data?.message);
        }
    })
}

export function useDeleteSearchHistory(){
    const queryClient = useQueryClient()
    return useMutation('delete-search-history',(id:any) => {
        return axiosApi.delete(`/search-history/${id}`)
    },
    {
        onSuccess:async()=>{
            queryClient.invalidateQueries('search-history')
        },
        onError:(error:any)=>{
            console.log('delete-search',error?.response?.data?.message);
        }
    })
}