import { useInfiniteQuery, useMutation, useQuery } from "react-query";
import axiosApi from "services/api/axios-api";

export function useRecordings(){
    return useInfiniteQuery(['all-recording'],async ({pageParam=1})=>{
        return await axiosApi.get('/recordings?page='+pageParam);
    },{
        getNextPageParam:(lastPage)=>{
            return lastPage.data?.next ? lastPage.data.links?.current_page + 1 : undefined;
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
    return useMutation('save-edited-note', (data:any)=> {
        return axiosApi.patch(`/recordings/${recording_id}`,data)
    })
}

export function useUploadRecord(){
    return useMutation('upload-audio', async(data:any) => {
        const uri = data.audio;
        const filetype = uri.split(".").pop();
        const filename = uri.split("/").pop();

        const formData = new FormData();
        formData.append("audio", {
          uri: uri,
          name: filename,
          type: `audio/${filetype}`,
        });
        formData.append("duration", data.duration.toString());
        return axiosApi.post(`/recordings`,formData,{
            headers: {"Content-Type": "multipart/form-data"}
        })
    })
}

export function useDeleteRecording(recording_id:number){
    return useMutation('delete-recording', (p?:any)=> {
        return axiosApi.delete(`/recordings/${recording_id}`)
    })
}

export function useAddTranscript(){
    return useMutation('add-transcript',(recording_id:number) => {
        return axiosApi.patch(`/recordings/${recording_id}/transcript`)
    })
}

export function useAddTitle(){
    return useMutation('add-title',(recording_id:number) => {
        return axiosApi.patch(`/recordings/${recording_id}/title`)
    })
}

export function useGetTags(){
    return useQuery('all-tags',(p?:any)=> {
        return axiosApi.get(`/tags`)
    })
}

export function useGetUserData(){
    return useQuery('user-data',(p?:any)=> {
        return axiosApi.get(`/auth/me`)
    })
}

export function useMoveGuestRecords(){
    return useMutation('move-records',(token:string)=> {
        return axiosApi.post(`/move-from-guest`,{token})
    })
}

export function useSignedUrl(){
    return useMutation('audio-signed-url',(recording_id:number) => {
        return axiosApi.get(`/recordings/${recording_id}/signed-url`)
    })
}