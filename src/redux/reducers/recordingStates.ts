import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface HashState {
  recordingList: object[],
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
  },
})

// Action creators are generated for each case reducer function
export const { setTempRecordings,setRecordingList } = recordingStates.actions

export default recordingStates.reducer