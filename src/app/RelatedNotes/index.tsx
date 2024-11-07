import { commonSvg } from "assets/svg/commonSvg"
import CircularLoader from "components/common/loaders/circular-loader"
import Touchable from "components/common/Touchable"
import NotePreview from "components/home/note-preview"
import { useTheme } from "context"
import { Audio } from "expo-av"
import { useRouter } from "expo-router"
import useLayoutAnim from "hooks/anim/useLayoutAnim"
import { useGetSingleRecording } from "queries/home/relatedNote"
import { useEffect, useRef, useState } from "react"
import { SafeAreaView, ScrollView, Text, View } from "react-native"
import { SvgXml } from "react-native-svg"
import { useQueryClient } from "react-query"
import { useSelector } from "react-redux"
import { RootState } from "redux/store/store"
import { isIOS, screenHeight } from "utils/common"

export default ({id=null,onBack=()=>{},onStartRecord=(v:any)=>{},continueProcessing=(v:any)=>{},syncUpNote=(v:any)=>{}})=>{
    const router=useRouter()
    const { Colors } = useTheme()
    const notePreviewRef = useRef<any>();
    const [isPlay,setIsPlay] = useState(-1)
    const [expand,setExpand] = useState(0)
    const [play,setPlay] = useState<Audio.Sound|null>()
    const [audioLoading,setAudioLoading] = useState(-1)
    // const [note,setNote] = useState<any>(null)
    const {tempRecordingData} = useSelector((state:RootState)=>state.recordingStates)
    const {relatedNoteLoaders} = useSelector((state:RootState)=>state.relatedNoteStates)
    // const {id}:{id:number}=useGlobalSearchParams<any>()
    
    const getIndividualNote = useGetSingleRecording(id)
    const note=getIndividualNote.data?.data
    const is_title_loading = relatedNoteLoaders.title==note?.id?relatedNoteLoaders.title:null;
    const is_transcript_loading = relatedNoteLoaders.transcript==note?.id?relatedNoteLoaders.transcript:null;
    const is_title_loading_subnote = relatedNoteLoaders.title!=note?.id?relatedNoteLoaders.title:null;
    const is_transcript_loading_subnote = relatedNoteLoaders.transcript!=note?.id?relatedNoteLoaders.transcript:null;
    const subnotes = note?.subnotes?.map((subnote:any) => ({
        ...subnote,
        is_transcript_loading:is_transcript_loading_subnote,
        is_title_loading:is_title_loading_subnote,
    }))||[];

    useLayoutAnim([expand])
    if(note)
    return (
        <SafeAreaView style={{backgroundColor:Colors.whiteWithOpacity(1),flex:1,paddingTop:isIOS?0:0}}>
            <View>
                <Touchable onPress={onBack} style={{flexDirection:'row',alignItems:'center',padding:12}}>
                    <SvgXml xml={commonSvg.back} height={21}/>
                    <Text style={{marginLeft:2,fontSize:16,fontFamily:'Primary',color:Colors.darkWithOpacity(1)}}>Back</Text>
                </Touchable>
                <ScrollView contentContainerStyle={{paddingBottom:400}} showsVerticalScrollIndicator={false}>
                    {getIndividualNote.isSuccess?
                    <NotePreview
                      ref={notePreviewRef}
                      note={{...note,is_title_loading,is_transcript_loading,subnotes:!!tempRecordingData.status?[...subnotes,tempRecordingData]:subnotes}}
                      index={0}
                      list={[note]}
                      isPlay={isPlay}
                      setIsPlay={setIsPlay}
                      play={play}
                      setPlay={setPlay}
                      audioLoading={audioLoading}
                      setAudioLoading={setAudioLoading}
                      onDeleteCallBack={onBack}
                      expand={expand}
                    //   setExpand={()=>setExpand(expand==0?-1:0)}
                      setExpand={()=>{}}
                      isSingle={true}
                      onStartRecord={onStartRecord}
                      continueProcessing={continueProcessing}
                      syncUpNote={syncUpNote}
                    />
                :<View style={{flex:1,height:screenHeight-300,alignItems:'center',justifyContent:'center'}}>
                    <CircularLoader width={20} height={20} />
                </View>}
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}