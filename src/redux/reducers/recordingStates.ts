import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Note } from "types";

export interface HashState {
  recordingList: any[];
  recordingCreateList: any[];
  tempRecordings: any;
  tempRecordingData:any;
  triggerTypingTitle:any;
  triggerTypingTranscript:any;
}

const initialState: HashState = {
  recordingList: [],
  recordingCreateList: [],
  tempRecordings: [],
  tempRecordingData:{},
  triggerTypingTitle:null,
  triggerTypingTranscript:null
};

export const recordingStates = createSlice({
  name: "recordingStates",
  initialState,
  reducers: {
    setTriggerTypingTitle: (state, action: PayloadAction<any>) => {
      state.triggerTypingTitle = action.payload;
    },
    setTriggerTypingTranscript: (state, action: PayloadAction<any>) => {
      state.triggerTypingTranscript = action.payload;
    },
    setRecordingList: (state, action: PayloadAction<object[]>) => {
      state.recordingList = action.payload;
    },
    setCreateRecordingList: (state, action: PayloadAction<object[]>) => {
      state.recordingCreateList = action.payload;
    },
    setTempRecordings: (state, action: PayloadAction<any>) => {
      state.tempRecordings = action.payload;
    },
    setTempRecordingData: (state, action: PayloadAction<any>) => {
      state.tempRecordingData = action.payload;
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
    deleteRecording: (state, action: PayloadAction<{ id: string }>) => {
      const { id: recordingId } = action.payload;
    
      const filterRecordings = (recordings: Note[]): Note[] => {
        return recordings.filter(recording => {
          if (recording.id === recordingId) {
            return false; // Remove this recording
          }
          if (recording.subnotes) {
            recording.subnotes = filterRecordings(recording.subnotes);
          }
          return true;
        });
      };
    
      state.recordingList = filterRecordings(state.recordingList);
    },
    deleteRecordingsFromState: (state, action: PayloadAction<any>) => {
      const recordingsToBeDeleted = action.payload;
      const recordingIdsToBeDeleted = recordingsToBeDeleted.map((rec: any) => rec.id);
      return {
        ...state,
        recordingList: state.recordingList.filter(
          (recording: any) => !recordingIdsToBeDeleted.includes(recording.id)
        ),
      };
    },
    updateTempRecordingData: (state, action: PayloadAction<any>) => {
      if( action.payload === 'processed')
        state.tempRecordingData=[]
      else
        state.tempRecordingData.status= action.payload??'upload_failed'
    },
    updateRecordingDetails: (state, action: PayloadAction<any>) => {
      const { recordingId, temporaryRecordingId, data } = action.payload;

      const updateRecording = (recording: Note): Note => {
        // Check if this is the recording we want to update
        if (
          recording.id === recordingId ||
          recording.id === temporaryRecordingId
        ) {
          return {
            ...recording,
            ...data,
            id: recordingId,
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

      return {
        ...state,
        recordingList: state.recordingList.map(updateRecording),
      };
    },
  },
});

export const {
  setTempRecordings,
  setTempRecordingData,
  setRecordingList,
  setRelatedNotes,
  updateTitle,
  updateTranscript,
  deleteRecording,
  deleteRecordingsFromState,
  updateRecordingDetails,
  updateTempRecordingData,
  setTriggerTypingTitle,
  setTriggerTypingTranscript,
  setCreateRecordingList
} = recordingStates.actions;

export default recordingStates.reducer;
