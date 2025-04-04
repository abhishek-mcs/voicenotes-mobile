import SharePublish from "components/home/share-publish"
import { useLocalSearchParams } from "expo-router";

const Share = () => {
    const { note_id } = useLocalSearchParams()
    return <SharePublish note_id={note_id} />
}

export default Share;
