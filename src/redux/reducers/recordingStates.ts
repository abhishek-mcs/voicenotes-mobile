import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Note } from "types";

export interface HashState {
  recordingList: any[];
  tempRecordings: any;
}

const initialState: HashState = {
  recordingList: [],
  tempRecordings: [],
};

export const recordingStates = createSlice({
  name: "recordingStates",
  initialState,
  reducers: {
    setRecordingList: (state, action: PayloadAction<object[]>) => {
      state.recordingList = action.payload;
    },
    setTempRecordings: (state, action: PayloadAction<any>) => {
      state.tempRecordings = action.payload;
    },
    setRelatedNotes: (state, action: PayloadAction<any>) => {
      state.recordingList[action.payload?.index].related_notes =
        action.payload?.related_notes;
    },
    updateTitle: (state, action: PayloadAction<any>) => {
      const list = state.recordingList;
      list[action.payload?.index].title = action.payload?.title;
      state.recordingList = [...list];
    },
    updateTranscript: (state, action: PayloadAction<any>) => {
      console.log(state.recordingList[action.payload?.index].transcript);
      state.recordingList[action.payload?.index].transcript =
        action.payload?.transcript;
      console.log(state.recordingList[action.payload?.index].transcript);
    },
    deleteFromTempRecordings: (state, action: PayloadAction<any>) => {
      const selectedRecoreding = action.payload;
      const selectedRecordingUrl = selectedRecoreding["audio"]?.data?.url;
      const filteredTempRecordings = state.tempRecordings.filter(
        (recording: any) => {
          const recordingUrl = recording?.audio?.data?.url;
          return recordingUrl !== selectedRecordingUrl;
        }
      );
      state.tempRecordings = filteredTempRecordings;
    },

    updateRecordingDetails: (state, action: PayloadAction<any>) => {
      const { recordingId, temporaryRecordingId, data } = action.payload;

      const updateRecording = (recording: Note): Note => {
        // Check if this is the recording we want to update
        if (recording.id === recordingId || recording.id === temporaryRecordingId) {
          return {
            ...recording,
            ...data,
            id: recordingId,
            audioUrl: recording.audioUrl 
          };
        }
    
        // If this recording has subnotes, check them too
        if (recording.subnotes) {
          const updatedSubnotes = recording.subnotes.map(updateRecording);
          if (updatedSubnotes !== recording.subnotes) {
            return { ...recording, subnotes: updatedSubnotes };
          }
        }
    
        // If no changes, return the original recording
        return recording;
      };
    
      const newRecordingList = state.recordingList.map(updateRecording);
    
      return {
        ...state,
        recordingList: newRecordingList
      };
    },
  },
});

export const {
  setTempRecordings,
  setRecordingList,
  setRelatedNotes,
  updateTitle,
  updateTranscript,
  deleteFromTempRecordings,
  updateRecordingDetails,
} = recordingStates.actions;

export default recordingStates.reducer;
