import {NewNote} from "types";

export const createTempRecDetails = (
    {
        uri = "",
        duration = 0,
        parentId = null,
    }: TempRecDetails
) => {
    const temporaryRecordingId = Math.random().toString(36).substring(7);
    const newTemporaryRecording: NewNote = {
        id: temporaryRecordingId,
        temp_id: temporaryRecordingId,
        audio: {data: {url: uri, duration}},
        isUploading: true,
        title: `New Recording`,
        transcript: null,
        recorded_at: new Date().getTime(),
        status: "uploading",
        internalUrl: uri,
        parent_id: parentId,
    };
    return newTemporaryRecording;
};

interface TempRecDetails {
    uri?: string;
    duration?: number;
    parentId?: string | null;
}
