import { createContext, useContext, useRef, useState, RefObject } from "react";
import { FlatList } from "react-native";

interface NoteContextType {
    triggerTypingTitle: number | null;
    triggerTypingTranscript: number | null;
    setTriggerTypingTranscript: (val: any) => void;
    setTriggerTypingTitle: (val: any) => void;
    meetingAskAIData: any | null; // Replace 'any' with your specific type
    setMeetingAskAIData: (val: any) => void; // Replace 'any' with your specific type
    expandNote: number;
    setExpandNote: (val: number) => void;
    noteListScrollRef: RefObject<FlatList>;
  }

export const NoteContext=createContext<NoteContextType>({
    triggerTypingTitle:null,
    triggerTypingTranscript:null,
    setTriggerTypingTranscript:(val:any)=>{},
    setTriggerTypingTitle:(val:any)=>{},
    meetingAskAIData:null,
    setMeetingAskAIData: (val:any) => {},
    expandNote:-1,
    setExpandNote:(val:any)=>{},
    noteListScrollRef: {
        current: null
    }
})

export const NoteContextProvider=({children}:any)=>{
    const [triggerTypingTitle,setTriggerTypingTitle]=useState(null);
    const [triggerTypingTranscript, setTriggerTypingTranscript]=useState(null);
    const [meetingAskAIData,setMeetingAskAIData]=useState(null);
    const [expandNote,setExpandNote] = useState(-1)
    const noteListScrollRef = useRef<FlatList>(null)

    const value={triggerTypingTitle,triggerTypingTranscript,setTriggerTypingTitle,setTriggerTypingTranscript,meetingAskAIData,setMeetingAskAIData,expandNote,setExpandNote,noteListScrollRef}
    return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
}

export const useNoteContext = () => useContext(NoteContext);