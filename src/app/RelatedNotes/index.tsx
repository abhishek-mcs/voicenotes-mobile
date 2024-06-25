import Colors from "assets/Colors"
import { commonSvg } from "assets/svg/commonSvg"
import Touchable from "components/common/Touchable"
import NotePreview from "components/home/note-preview"
import { Audio } from "expo-av"
import { useGlobalSearchParams, useRouter } from "expo-router"
import { useGetRelatedRecording, useGetSingleRecording } from "queries/home/relatedNote"
import { useCallback, useEffect, useRef, useState } from "react"
import { ActivityIndicator, FlatList, SafeAreaView, ScrollView, Text, View } from "react-native"
import { SvgXml } from "react-native-svg"
import { useQueryClient } from "react-query"
import { isIOS } from "utils/common"

export default ()=>{
    const router=useRouter()
    const notePreviewRef = useRef<any>();
    const [isPlay,setIsPlay] = useState(-1)
    const [expand,setExpand] = useState(0)
    const [play,setPlay] = useState<Audio.Sound|null>()
    const [audioLoading,setAudioLoading] = useState(-1)
    const notePreviewRef2 = useRef<any>();
    const [isPlay2,setIsPlay2] = useState(-1)
    const [play2,setPlay2] = useState<Audio.Sound|null>()
    const [audioLoading2,setAudioLoading2] = useState(-1)
    const {id}:{id:number}=useGlobalSearchParams<any>()
    
    const getIndividualNote = useGetSingleRecording(id)
    const getRelatedNote = useGetRelatedRecording(id)
    const queryClient = useQueryClient()
    const note = getIndividualNote.data?.data
    const relatedNotes = getRelatedNote.data?.data

    useEffect(()=>{
        // return ()=>{
            queryClient.resetQueries('single-recording')
            queryClient.resetQueries('related-recording')
        // }
    },[])

    return (
        <SafeAreaView style={{backgroundColor:'#fff',flex:1,paddingTop:isIOS?0:32}}>
            <View>
                <Touchable onPress={()=>router.back()} style={{flexDirection:'row',alignItems:'center',padding:12}}>
                    <SvgXml xml={commonSvg.back} height={21}/>
                    <Text style={{marginLeft:2,fontSize:16,fontFamily:'Primary',color:Colors.darkWithOpacity(1)}}>Back</Text>
                </Touchable>
                <ScrollView contentContainerStyle={{paddingBottom:100}} showsVerticalScrollIndicator={false}>
                    {getIndividualNote.isFetched&&
                    <NotePreview
                      ref={notePreviewRef}
                      note={note}
                      index={0}
                      list={[note]}
                      isPlay={isPlay}
                      setIsPlay={setIsPlay}
                      play={play}
                      setPlay={setPlay}
                      audioLoading={audioLoading}
                      setAudioLoading={setAudioLoading}
                      onDeleteCallBack={()=>{router.back()}}
                      expand={expand}
                      setExpand={()=>setExpand(expand==0?-1:0)}
                      isSingle={true}
                    />}
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}