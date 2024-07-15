import { isAndroid, isIOS } from "utils/common";

export default async({setGenerateDummy,setUploading,setReduxRecordingList,recordingList,generateDummy,queryClient,scrollRef,addTranscriptRecord,file,uploadRecord,d,dispatchCanRecord,isRetry, parent_id}:any)=>{
  return new Promise(async(resolve, reject) => {
    await uploadRecord.mutateAsync(
        {audio:file,duration:d,isRetry:isRetry, parent_id: parent_id},
        {
          onSuccess: async(r:any) => {
            if(isIOS){
              await queryClient.resetQueries('all-recording')
              if(!!generateDummy){
                const filterDummy=generateDummy?.filter((g:any)=>g.audio.data.url!=file)
                setUploading(filterDummy.length)
                filterDummy.length==0?setGenerateDummy(null):setGenerateDummy(filterDummy)
              }else{
                setGenerateDummy(null)
              }
            }
            addTranscriptRecord.mutate(r?.data?.recording?.id,{
              onSuccess:async()=>{
                if(isAndroid){
                  if(!!generateDummy){
                  const filterDummy=generateDummy?.filter((g:any)=>g.audio.data.url!=file)
                  setUploading(filterDummy.length)
                  filterDummy.length==0?setGenerateDummy(null):setGenerateDummy(filterDummy)
                }else{
                  setGenerateDummy(null)
                }
              }
              },
              onError:()=>{
                const index=recordingList?.findIndex((r:any)=>r.id==r?.data?.recording_id)
                recordingList[index].transcript=null;
                setReduxRecordingList([...recordingList])
              }
            })
            dispatchCanRecord(r?.data?.can_record_more??true)
            resolve('success');
          },
          onError:(e:any)=>{
            let dump:any={isUploading:false,audio:{data:{url:file,duration:d}}}  
            if(e?.response?.data?.error_code=='ffmpeg_conversion_failed'){
              dump={isUploading:false,is_audio_corrupted:true,error:e?.response?.data?.message??'Recorded audio is corrupted. Please try again',audio:{data:{url:file,duration:d}}}  
            }
            const filterDummy=generateDummy?.filter((g:any)=>g.audio.data.url!==file)??[]
            setGenerateDummy(!!generateDummy?[dump,...filterDummy]:[dump])
            setUploading(0)
            reject('error: '+ e);
          }
        }
      )});
}