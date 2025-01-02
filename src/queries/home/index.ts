import axios from "axios";
import { useLogout } from "queries/auth";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "react-query";
import axiosApi from "services/api/axios-api";
import { useGetRelatedRecording } from "./relatedNote";
import { Platform } from "react-native";
import * as Device from 'expo-device';
import { currentVersion } from "services/api/api-constants";


export function useRecordings(tags?:string){
    const logout =useLogout()
    return useInfiniteQuery(tags=='shared'?['published-recordings']:['all-recording',tags],async ({pageParam=1})=>{
        return await axiosApi.get((tags=='shared'?'/recordings/public?page=':'/recordings?page=')+pageParam+(!!tags?`&tags[]=${tags}`:''));
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

export function usePostRecord(){
    const queryClient = useQueryClient();
    return useMutation('post-record', (p?:any) => {
        return axiosApi.post(`/recordings/new`,p)
    },
    {   onSuccess:async()=>{
            await queryClient.invalidateQueries('all-recording');
            await queryClient.resetQueries('streaks');
        },
        onError:(error:any)=>{
            alert('Something went wrong')
            console.log(error?.response?.data?.message,'post record');
        }
    })
}

export function useToggleStar(recording_id:number){
    const queryClient = useQueryClient();
    return useMutation('toggle-star', (p?:any) => {
        return axiosApi.patch(`/recordings/${recording_id}/star`)
    },
    {   onSuccess:async()=>{
            await queryClient.invalidateQueries('all-recording')
            await queryClient.invalidateQueries('all-tags')
        },
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useCreate(){
    return useMutation('ai-create', (data:any) => {
        return axiosApi.post(`/ai-create/new`, data);
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
        const {parent_id, recorded_at} = data
        const filetype = uri.split(".").pop();
        const filename = uri.split("/").pop();

        const formData:any = new FormData();
        formData.append("audio", {
          uri: uri,
          name: filename,
          type: `audio/${filetype}`,
        });
        parent_id && formData.append("parent_id", parent_id);

        const deviceInfo = {
            platform: Platform.OS,
            manufacturer: Device.manufacturer ,
            modelName: Device.modelName ,
            deviceType: Device.deviceType === null? null: Device.DeviceType[Device.deviceType],
            osVersion: Device.osVersion,
            appVersion:  currentVersion
        }

        formData.append("duration", data.duration.toString());
        formData.append("device_info",JSON.stringify(deviceInfo));
        formData.append("recorded_at", data?.recorded_at?.toString());
        return axiosApi.post(`/recordings`,formData,{
            headers: {"Content-Type": "multipart/form-data"}
        })
    },
    {
        onError:(error:any)=>{
            if(error?.response?.data?.error_code==="ffmpeg_conversion_failed"){
                console.log("Corrupted audio");
            }else{
                console.error('Error in upload audio api: ', error);
            }
        }
    })
}

export function useUploadChatRecord(){
    return useMutation('chat-upload-audio', async(data:any) => {
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
        const endPoint =`/ai-chat-thread/${data?.id?data?.id+'/':''}audio`;
        console.log(endPoint);
        return axiosApi.post(endPoint,formData,{
            headers: {"Content-Type": "multipart/form-data"}
        })
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useVoiceChatResponse(){
    return useMutation('voice-chat-response', (data:any)=> {
        return axiosApi.get(`/ai-chat-thread/${data?.id}/audio-answer`)
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
        onSuccess:async()=>{
          await queryClient.invalidateQueries('all-recording')
          await queryClient.invalidateQueries('all-tags')
        },
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useDeleteFormattedNote(id:number){
    const queryClient=useQueryClient()
    return useMutation('delete-formatted-note', (p?:any)=> {
        return axiosApi.delete(`/ai-create/${id}`)
    },
    {
        onSuccess:async()=>{
          await queryClient.invalidateQueries('all-recording')
        },
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useGetAiCreation(){
    const queryClient=useQueryClient()
    return useMutation('get-formatted-note', async(id?:any)=> {
        return await axiosApi.get(`/ai-create/${id}`)
    },
    {
        onSuccess:async()=>{
          await queryClient.invalidateQueries('all-recording')
        },
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useSaveAICreation(id?:any){
    const queryClient=useQueryClient()
    return useMutation('save-edited-creation', ({recording_id,content,title}:any)=> {
        return axiosApi.post(`/ai-create/${id}`,{recording_id,content,title})
    },
    {
        onSuccess:async()=>{
          await queryClient.invalidateQueries('all-recording')
        },
        onError:(error:any)=>{
            console.log(error?.response?.data?.message,'save-edited-creation');
        }
    })
}

export function useRegenerateTeamSummaryCreation(){
    const queryClient=useQueryClient()
    return useMutation('regenerate-team-creation', (id:any)=> {
        return axiosApi.post(`/ai-create/${id}/regenerate`)
    },
    {
        onSuccess:async()=>{
          await queryClient.invalidateQueries('all-recording')
        },
        onError:(error:any)=>{
            console.log(error?.response?.data?.message,'regenerate-team-creation');
        }
    })
}

export function useAddTranscript(doGenerateTitle=false,recordingList:any=[],setReduxRecordingList:any=()=>{}){
    const queryC=useQueryClient()
    const addTitle=useAddTitle()
    const addRelatedNotes=useGetRelatedRecording()
    let rec_id:number;
    return useMutation('add-transcript',(recording_id:number) => {
        if (!recording_id) {
            throw new Error("recording_id is required");
        }
        doGenerateTitle&&(rec_id=recording_id)
        return axiosApi.patch(`/recordings/${recording_id}/transcript`)
    },
    {
        onSuccess:async()=>{
            await queryC.resetQueries(['all-recording'])
            doGenerateTitle&&!!rec_id&&addTitle.mutate(rec_id,{
                onError:(error:any)=>{
                    const index=recordingList?.findIndex((r:any)=>r.id==rec_id)
                    recordingList[index].title=null;
                    setReduxRecordingList([...recordingList])
                }
            })
            doGenerateTitle&&!!rec_id&&addRelatedNotes.mutate(rec_id)
        },
        onError:(error:any)=>{
            console.log("add-transcript: ", error);
            
            console.log('add-transcript',error?.response?.data?.message);
        }
    })
}

export function useAddTitle(){
    const queryClient=useQueryClient();
    return useMutation('add-title',(recording_id:number) => {
        return axiosApi.patch(`/recordings/${recording_id}/title`)
    },
    {
        onSuccess:async()=>{
            await queryClient.resetQueries(['all-recording']);
            await queryClient.resetQueries('streaks');
        },
        onError:(error:any)=>{
            console.log('add-title',error?.response?.data?.message);
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

export function usePinTag(id:any){
    return useMutation('pin-tag',(p?:any)=> {
        return axiosApi.patch(`/tags/${id}/pin`,p)
    },
    {
        onError:(error:any)=>{
            console.log('pin/unpin tag',error?.response?.data?.message);
        }
    })
}

export function usePinTagDelete(id:any){
    return useMutation('pin-tag-delete',(p?:any)=> {
        return axiosApi.delete(`/tags/${id}`)
    },
    {
        onError:(error:any)=>{
            console.log('pin delete',error?.response?.data?.message);
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
            console.log('auth me',error?.response?.data?.message);
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

export function useSignedUrlForChat(){
    return useMutation('chat-audio-signed-url',(url:string) => {
        return axios.get(url)
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message,'chat-audio-signed-url');
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

export function useAskAIHistory(tags?:string){
    return useInfiniteQuery(['ask-ai-history'],async ({pageParam=1})=>{
        return await axiosApi.get('/ai-chat-thread');
    },{
        getNextPageParam:(lastPage)=>{
            return lastPage.data?.links?.next ? lastPage.data.meta?.current_page + 1 : undefined;
        },
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useGetAskChat(){
    return useMutation('get-chat',(data?:any) => axiosApi.get(`/ai-chat-thread/${data?.id}`),  
        {
            onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
        })
}

export function useFetchMeetingAskChats(){
    return useMutation('fetch-meeting-ask-chats',(recording_id?:any) => axiosApi.post(`ai-chat-thread/recording/ask`,{recording_id}),  
        {
            onError:(error:any)=>{
            console.log(error?.response?.data?.message,'fetch-meeting-ask-chats');
        }
        })
}

export function useDeleteAskHistory(){
    return useMutation('get-chat',(data?:any) => axiosApi.delete(`/ai-chat-thread/${data?.id}`),  
        {
            onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
        })
}
export function useAskAI(isGuest:boolean=true,post:boolean=true){
    return useMutation('chat',(data?:any) => {
        const {question="",id=null} = data;
        const params={question}
        if(isGuest){
            const endPoints = '/recordings/ask-ai';
            return axiosApi.get(endPoints,{params: {question}});
        }else{
            const endPoints = isGuest?'/recordings/ask-ai':!!id?`/ai-chat-thread/${id}/messages`:'/ai-chat-thread';
            if(post) return axiosApi.post(endPoints,params);
            else return axiosApi.get(endPoints);
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