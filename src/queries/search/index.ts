import { useMutation, useQuery } from "react-query";
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
    return useMutation('set-search-history',(p:any) => {
        return axiosApi.post(`/search-history`,{keyword:p})
    },
    {
        onError:(error:any)=>{
            console.log('reg-search',error?.response?.data?.message);
        }
    })
}

export function useSearchHistory(){
    return useQuery('search-history',(p?:any) => {
        return axiosApi.get(`/search-history`)
    },
    {
        onError:(error:any)=>{
            console.log('reg-search',error?.response?.data?.message);
        }
    })
}