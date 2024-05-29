import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface suggestionStates {
  suggIndex:number
}

const initialState: suggestionStates = {
  suggIndex:-2
}

export const suggestionState = createSlice({
  name: 'suggestionState',
  initialState,
  reducers: {
    getNextSuggPair: ({suggIndex}) =>{
      suggIndex = suggIndex + 2;
      console.log("getNextSuggPairDone",suggIndex)
    }
  },
})

// Action creators are generated for each case reducer function
export const { getNextSuggPair } = suggestionState.actions

export default suggestionState.reducer