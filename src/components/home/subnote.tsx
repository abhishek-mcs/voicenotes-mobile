import { FlatList } from "react-native";
import { useEffect, useState } from "react";
import useLayoutAnim from "hooks/anim/useLayoutAnim";
import { Audio } from "expo-av";
import NotePreview from "./note-preview";

interface Props {
    list: any[]
    onUploadRetry:()=>void
    expand:any
    setExpand:(val:any)=>void
    hashFilter:string
}
export default ({list=[],onUploadRetry,expand,setExpand,hashFilter=''}:Props)=>{
    const [expandNote,setExpandNote]=useState(-1)
    const [isPlay,setIsPlay]=useState(-1)
    const [audioLoading,setAudioLoading]=useState(-1)
    const [play,setPlay] = useState<Audio.Sound|null>()

    useLayoutAnim([expandNote])

    const onExpand=(index:number)=>{
        setExpandNote(index==expandNote?-1:index)
        expand!=-1&&setExpand(-1)
    }

    useEffect(()=>{
        expand!=-1&&expandNote!=-1&&setExpandNote(-1)
    },[expand])

    return (
        <FlatList
        style={{paddingHorizontal:18}}
        data={list}
        scrollEnabled={false}
        keyExtractor={(itm, i):any => `${itm?.id + "-" + i?.toString()}`}
        renderItem={({item,index})=>(
            <NotePreview
                note={item}
                index={index}
                list={list}
                isPlay={isPlay}
                setIsPlay={setIsPlay}
                play={play}
                setPlay={setPlay}
                audioLoading={audioLoading}
                setAudioLoading={setAudioLoading}
                onUploadRetry={onUploadRetry}
                expand={expandNote}
                isSubnote={true}
                setExpand={()=>onExpand(index)}
                hashFilter={hashFilter}
                />
        )}
      />
    )
}