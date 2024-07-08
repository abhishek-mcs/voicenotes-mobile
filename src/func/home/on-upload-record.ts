export default async({setGenerateDummy,setUploading,setReduxRecordingList,recordingList,generateDummy,queryClient,scrollRef,addTranscriptRecord,file,uploadRecord,d,dispatchCanRecord,isRetry}:any)=>{
  return new Promise(async(resolve, reject) => {
    await uploadRecord.mutateAsync(
        {audio:file,duration:d,isRetry:isRetry},
        {
          onSuccess: async(r:any) => {
            await queryClient.invalidateQueries('all-recording');
            dispatchCanRecord(r?.data?.can_record_more??true)
            if(!!generateDummy){
              const filterDummy=generateDummy?.filter((g:any)=>g.audio.data.url!=file)
              setUploading(filterDummy.length)
              filterDummy.length==0?setGenerateDummy(null):setGenerateDummy(filterDummy)
            }else{
              setGenerateDummy(null)
            }
            scrollRef&&scrollRef.current?.scrollToOffset({animated: true, offset: 0});
            addTranscriptRecord.mutate(r?.data?.recording?.id,{
              onError:()=>{
                recordingList[0].transcript=null;
                setReduxRecordingList([...recordingList])
              }
            });
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