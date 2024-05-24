export default ({setGenerateDummy,queryClient,scrollRef,addTranscriptRecord,deactivateKeepAwake,file,uploadRecord,d,isRetry}:any)=>{
    setGenerateDummy({isUploading:true,audio:{data:{url:file,duration:d}}})
      uploadRecord.mutate(
        {audio:file,duration:d,isRetry:isRetry},
        {
          onSuccess: async(r:any) => {
            await queryClient.invalidateQueries('all-recording');
            setGenerateDummy(null)
            scrollRef&&scrollRef.current?.scrollToOffset({animated: true, offset: 0});
            addTranscriptRecord.mutate(r?.data?.recording?.id);
            deactivateKeepAwake()
          },
          onError:()=>{
            deactivateKeepAwake()
            setGenerateDummy({isUploading:false,audio:{data:{url:file}}})
          }
        }
      );
}