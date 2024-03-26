import { useInfiniteQuery, useMutation, useQuery } from "react-query";
import axiosApi from "services/api/axios-api";

export function useRecordings(){
    return useInfiniteQuery(['all-recording'],async ({pageParam=1})=>{
        return await axiosApi.get('/recordings?page='+pageParam);
    },{
        getNextPageParam:(lastPage)=>{
            return lastPage.data?.next_page_url ? lastPage.data?.current_page + 1 : undefined;
        }
    })
}

export function useToggleStar(recording_id:number){
    return useMutation('toggle-star', () => {
        return axiosApi.patch(`/recordings/${recording_id}/star`)
    })
}

export function useCreate(){
    return useMutation('ai-create', ({recording_id,type}:{recording_id:number,type:string}) => {
        return axiosApi.get(`/ai-create?type=${type}&recording_id=${recording_id}`)
    })
}

export function useSaveEditedNote(recording_id:any){
    return useMutation('save-edited-note', ({transcript,title,tags}:{transcript:string,title:string,tags:string[]}) => {
        return axiosApi.patch(`/recordings/${recording_id}?transcript=${transcript}&title=${title}&tags=${tags}`)
    })
}

export function useUploadRecord(){
    return useMutation('upload-audio', (data:any) => {
        return axiosApi.post(`/recordings`,data,{
            headers: {"Content-Type": "multipart/form-data"}
        })
    })
}