import { createContext, useState } from "react";

export const NoteContext=createContext({
    triggerTypingTitle:null,
    triggerTypingTranscript:null,
    setTriggerTypingTranscript:(val:any)=>{},
    setTriggerTypingTitle:(val:any)=>{},
})

export const NoteContextProvider=({children}:any)=>{
    const [triggerTypingTitle,setTriggerTypingTitle]=useState(null);
    const [triggerTypingTranscript, setTriggerTypingTranscript]=useState(null);
    const value={triggerTypingTitle,triggerTypingTranscript,setTriggerTypingTitle,setTriggerTypingTranscript}
    return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
}