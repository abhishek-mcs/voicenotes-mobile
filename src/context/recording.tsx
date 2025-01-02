import { createContext, useContext, useState } from "react";

export const NoteContext=createContext({
    triggerTypingTitle:null,
    triggerTypingTranscript:null,
    setTriggerTypingTranscript:(val:any)=>{},
    setTriggerTypingTitle:(val:any)=>{},
    meetingAskAIData:null,
    setMeetingAskAIData: (val:any) => {},
    expandNote:-1,
    setExpandNote:(val:any)=>{}
})

export const NoteContextProvider=({children}:any)=>{
    const [triggerTypingTitle,setTriggerTypingTitle]=useState(null);
    const [triggerTypingTranscript, setTriggerTypingTranscript]=useState(null);
    const [meetingAskAIData,setMeetingAskAIData]=useState(null);
    const [expandNote,setExpandNote] = useState(-1)

    const value={triggerTypingTitle,triggerTypingTranscript,setTriggerTypingTitle,setTriggerTypingTranscript,meetingAskAIData,setMeetingAskAIData,expandNote,setExpandNote}
    return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
}

export const useNoteContext = () => useContext(NoteContext);