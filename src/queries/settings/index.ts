import { useMutation, useQueryClient } from "react-query";
import axiosApi from "services/api/axios-api";

export function useSaveSettings(){
    const queryClient=useQueryClient()
    return useMutation('save-settings',(p:any) => {
        return axiosApi.patch(`/settings`,p)
    },
    {
        onSuccess:()=>{
            queryClient.invalidateQueries('user-data')
        },
        onError:(error:any)=>{
            console.log('save settings',error?.response?.data?.message);
        }
    })
}