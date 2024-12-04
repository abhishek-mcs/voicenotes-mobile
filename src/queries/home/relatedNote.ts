import { useMutation, useQuery, useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { setRelatedNotes } from "redux/reducers/recordingStates";
import axiosApi from "services/api/axios-api";

export function useGetSingleRecording(id:string|null){
    return useQuery('single-recording',() => {
        return axiosApi.get(`/recordings/${id}`)
    },
    {
        onError:(error:any)=>{
            console.log('single',error?.response?.data?.message);
        }
    })
}

export function useGetRelatedRecording(index?:number){
    const queryClient = useQueryClient()
    const dispatch = useDispatch()
    return useMutation('related-recording',(id?:any) => {
        return axiosApi.get(`/recordings/${id}/related`)
    },
    {
        onSuccess:async(data:any)=>{
            // dispatch(setRelatedNotes({related_notes:relatedNotes,index}));
            await queryClient.resetQueries('all-recording')
        },
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}