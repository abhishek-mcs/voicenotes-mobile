export default async({setGenerateDummy,setUploading,setReduxRecordingList,recordingList,generateDummy,queryClient,scrollRef,addTranscriptRecord,deactivateKeepAwake,file,uploadRecord,d,isRetry}:any)=>{
  return new Promise(async(resolve, reject) => {
    await uploadRecord.mutateAsync(
        {audio:file,duration:d,isRetry:isRetry},
        {
          onSuccess: async(r:any) => {
            await queryClient.invalidateQueries('all-recording');
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
            deactivateKeepAwake()
            resolve('success');
          },
          onError:()=>{
            deactivateKeepAwake()
            const dump={isUploading:false,audio:{data:{url:file,duration:d}}}  
            const filterDummy=generateDummy?.filter((g:any)=>g.audio.data.url!==file)??[]
            setGenerateDummy(!!generateDummy?[...filterDummy,dump]:[dump])
            setUploading(0)
            console.log('error upload failed')
            reject('error');
          }
        }
      )});
}