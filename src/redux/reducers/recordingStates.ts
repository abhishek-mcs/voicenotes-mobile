import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface HashState {
  recordingList: any[],
  tempRecordings: any,
}

const initialState: HashState = {
  recordingList: [],
  tempRecordings: [],
}

export const recordingStates = createSlice({
  name: 'recordingStates',
  initialState,
  reducers: {
    setRecordingList: (state, action: PayloadAction<object[]>) => {
      state.recordingList = action.payload
    },
    setTempRecordings: (state, action: PayloadAction<any>) => {
      state.tempRecordings = action.payload
    },
    setRelatedNotes: (state, action: PayloadAction<any>) => {
      state.recordingList[action.payload?.index].related_notes = action.payload?.related_notes
    },
    updateTitle: (state, action: PayloadAction<any>) => {
      const list = state.recordingList
      list[action.payload?.index].title = action.payload?.title
      state.recordingList = [...list]
    },
    updateTranscript: (state, action: PayloadAction<any>) => {
      console.log(state.recordingList[action.payload?.index].transcript)
      state.recordingList[action.payload?.index].transcript = action.payload?.transcript
      console.log(state.recordingList[action.payload?.index].transcript)
    },
    deleteFromTempRecordings: (state, action: PayloadAction<any>) => {
      const selectedRecoreding = action.payload
      const selectedRecordingUrl = selectedRecoreding["audio"]?.data?.url
      const filteredTempRecordings = state.tempRecordings.filter((recording: any) => {
        const recordingUrl = recording?.audio?.data?.url
        return recordingUrl !== selectedRecordingUrl
      })
      state.tempRecordings = filteredTempRecordings
    },

    updateRecordingDetails :(state, action: PayloadAction<any>) => {
    return {
      ...state,
      recordingList: state.recordingList.map(recording =>
        recording.id === action.payload.recordingId
          ? { ...recording, ...action.payload.details }
          : recording
      )
    }
    },
    updateRecordingStatus:(state, action: PayloadAction<any>) => {
      return {
        ...state,
        recordingList: state.recordingList.map(recording => 
          (recording.id === action.payload.recordingId || 
           (recording.tempId && recording.tempId === action.payload.temporaryId))
            ? { ...recording, status: action.payload.status }
            : recording
        )
      };
    }
  }
})

// Action creators are generated for each case reducer function
export const { setTempRecordings, setRecordingList, setRelatedNotes, updateTitle, updateTranscript, deleteFromTempRecordings, updateRecordingDetails, updateRecordingStatus } = recordingStates.actions

export default recordingStates.reducer