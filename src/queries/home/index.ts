import { useLogout } from "queries/auth";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "react-query";
import axiosApi from "services/api/axios-api";

export function useRecordings(tags?:string){
    const logout =useLogout()
    return useInfiniteQuery(['all-recording',tags],async ({pageParam=1})=>{
        return await axiosApi.get('/recordings?page='+pageParam+(!!tags?`&tags[]=${tags}`:''));
    },{
        getNextPageParam:(lastPage)=>{
            return lastPage.data?.links?.next ? lastPage.data.meta?.current_page + 1 : undefined;
        },
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
            if(error?.response?.data?.message?.includes('Unauthenticated')){
                logout.mutateAsync('');
            }
        }
    })
}

export function useToggleStar(recording_id:number){
    const queryClient = useQueryClient();
    return useMutation('toggle-star', (p?:any) => {
        return axiosApi.patch(`/recordings/${recording_id}/star`)
    },
    {   onSuccess:()=>{
            queryClient.invalidateQueries('all-recording')
            queryClient.invalidateQueries('all-tags')
        },
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useCreate(){
    const queryClient = useQueryClient();
    return useMutation('ai-create', (data:{recording_id:number,type:string}) => {
        return axiosApi.post(`/ai-create`, data);
    },
    {
        onSuccess:()=>{
            queryClient.invalidateQueries('all-recording')
        },
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
    const queryClient=useQueryClient()
    return useMutation('delete-recording', (p?:any)=> {
        return axiosApi.delete(`/recordings/${recording_id}`)
    },
    {
        onSuccess:()=>{
          queryClient.invalidateQueries('all-recording')
          queryClient.invalidateQueries('all-tags')
        },
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

export function useGetUserData(token:any){
   
    return useQuery('user-data',(p?:any)=> {
        if(!!token)
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

export function useSuggestions(){
    return useQuery('suggestions',(p?:any) => {
        return axiosApi.get(`/recordings/ask-ai/suggestions`)
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useAskSomething(){
    return useMutation('ask-me-something',(p?:any) => {
        return axiosApi.get(`/recordings/suggestion`)
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useAskAI(isGuest:boolean=true){
    return useMutation('chat',(data?:any) => {
        const {question="",id=null} = data;
        const params={question}
        if(isGuest){
            const endPoints = '/recordings/ask-ai';
            return axiosApi.get(endPoints,{params: {question}});
        }else{
            const endPoints = isGuest?'/recordings/ask-ai':!!id?`/ai-chat-thread/${id}/messages`:'/ai-chat-thread';
            return axiosApi.post(endPoints,params);
        }
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useStreak(token:any){
    return useQuery('streaks',(p?:any) => {
    if(!!token)
        return axiosApi.get(`/streaks`)
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}