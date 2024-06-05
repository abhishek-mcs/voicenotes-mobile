export default ({setGenerateDummy,setReduxRecordingList,recordingList,generateDummy,queryClient,scrollRef,addTranscriptRecord,deactivateKeepAwake,file,uploadRecord,d,isRetry}:any)=>{
      uploadRecord.mutate(
        {audio:file,duration:d,isRetry:isRetry},
        {
          onSuccess: async(r:any) => {
            await queryClient.invalidateQueries('all-recording');
            if(!!generateDummy){
              const filterDummy=generateDummy?.filter((g:any)=>g.audio.data.url!=file)
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
          },
          onError:()=>{
            deactivateKeepAwake()
            const dump={isUploading:false,audio:{data:{url:file,duration:d}}}  
            const filterDummy=generateDummy?.filter((g:any)=>g.audio.data.url!==file)??[]
            setGenerateDummy(!!generateDummy?[...filterDummy,dump]:[dump])
          }
        }
      );
}