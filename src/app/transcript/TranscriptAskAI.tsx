import AIModal from "components/AIModal"
import { useNoteContext } from "context"

const TranscriptAskAI = ({}) =>{
    const { meetingAskAIData } = useNoteContext()

    return <AIModal showHeader={false} meetingData={meetingAskAIData} />
}

export default TranscriptAskAI