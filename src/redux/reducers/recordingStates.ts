import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface HashState {
  recordingList: any[],
  tempRecordings: any,
}

const initialState: HashState = {
  recordingList: [],
  tempRecordings: null,
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
    }
  },
})

// Action creators are generated for each case reducer function
export const { setTempRecordings,setRecordingList,setRelatedNotes } = recordingStates.actions

export default recordingStates.reducer