import { useInfiniteQuery, useMutation, useQuery } from "react-query";
import axiosApi from "services/api/axios-api";

export function useRecordings(){
    return useInfiniteQuery(['all-recording'],async ({pageParam=1})=>{
        return await axiosApi.get('/recordings?page='+pageParam);
    },{
        getNextPageParam:(lastPage)=>{
            return lastPage.data?.next ? lastPage.data.links?.current_page + 1 : undefined;
        },
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useToggleStar(recording_id:number){
    return useMutation('toggle-star', () => {
        return axiosApi.patch(`/recordings/${recording_id}/star`)
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useCreate(){
    return useMutation('ai-create', (data:{recording_id:number,type:string}) => {
        return axiosApi.get(`/ai-create`, { params: data });
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useSaveEditedNote(recording_id:any){
    return useMutation('save-edited-note', (data:any)=> {
        return axiosApi.patch(`/recordings/${recording_id}`,data)
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useUploadRecord(){
    return useMutation('upload-audio', async(data:any) => {
        const uri = data.audio;
        const filetype = uri.split(".").pop();
        const filename = uri.split("/").pop();

        const formData:any = new FormData();
        formData.append("audio", {
          uri: uri,
          name: filename,
          type: `audio/${filetype}`,
        });
        formData.append("duration", data.duration.toString());
        return axiosApi.post(`/recordings`,formData,{
            headers: {"Content-Type": "multipart/form-data"}
        })
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useDeleteRecording(recording_id:number){
    return useMutation('delete-recording', (p?:any)=> {
        return axiosApi.delete(`/recordings/${recording_id}`)
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useAddTranscript(){
    return useMutation('add-transcript',(recording_id:number) => {
        return axiosApi.patch(`/recordings/${recording_id}/transcript`)
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useAddTitle(){
    return useMutation('add-title',(recording_id:number) => {
        return axiosApi.patch(`/recordings/${recording_id}/title`)
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useGetTags(){
    return useQuery('all-tags',(p?:any)=> {
        return axiosApi.get(`/tags`)
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useGetUserData(){
    return useQuery('user-data',(p?:any)=> {
        return axiosApi.get(`/auth/me`)
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useMoveGuestRecords(){
    return useMutation('move-records',(token:string)=> {
        return axiosApi.post(`/move-from-guest`,{token})
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useSignedUrl(){
    return useMutation('audio-signed-url',(recording_id:number) => {
        return axiosApi.get(`/recordings/${recording_id}/signed-url`)
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}