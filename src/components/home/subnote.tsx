import { FlatList } from "react-native";
import NotePreview from "./note-preview";
import { useEffect, useState } from "react";
import useLayoutAnim from "hooks/anim/useLayoutAnim";

interface Props {
    list: any[]
    isPlay: boolean
    setIsPlay: (val:boolean)=>void
    play:any
    setPlay:(val:any)=>void
    audioLoading:any
    setAudioLoading:(val:any)=>void
    onUploadRetry:()=>void
    expand:any
    setExpand:(val:any)=>void
}
export default ({list=[],isPlay=false,setIsPlay,setPlay,play,setAudioLoading,audioLoading,onUploadRetry,expand,setExpand}:Props)=>{
    const [expandNote,setExpandNote]=useState(-1)
    
    useLayoutAnim([expandNote])

    const onExpand=(index:number)=>{
        setExpandNote(index==expandNote?-1:index)
        expand!=-1&&setExpand(-1)
    }

    useEffect(()=>{
        expand!=-1&&setExpandNote(-1)
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
                setExpand={onExpand}
                />
        )}
      />
    )
}