import { useQuery } from "react-query";
import axiosApi from "services/api/axios-api";

export function useGetSingleRecording(id:number){
    return useQuery('single-recording',(p?:any) => {
        return axiosApi.get(`/recordings/${id}`)
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useGetRelatedRecording(id:number){
    return useQuery('related-recording',(p?:any) => {
        return axiosApi.get(`/recordings/${id}/related`)
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}