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
    },
    updateTitle: (state, action: PayloadAction<any>) => {
      const list=state.recordingList
      console.log(list[action.payload?.index].title)
      list[action.payload?.index].title = action.payload?.title
      console.log(list[action.payload?.index].title)
      state.recordingList = [...list]
    },
    updateTranscript: (state, action: PayloadAction<any>) => {
      const list=state.recordingList
      console.log(list[action.payload?.index].transcript)
      list[action.payload?.index].transcript = action.payload?.transcript
      console.log(list[action.payload?.index].transcript)
      state.recordingList = [...list]
    },
  },
})

// Action creators are generated for each case reducer function
export const { setTempRecordings,setRecordingList,setRelatedNotes,updateTitle,updateTranscript } = recordingStates.actions

export default recordingStates.reducer