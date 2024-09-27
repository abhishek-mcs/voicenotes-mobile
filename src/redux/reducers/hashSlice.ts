import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface HashState {
  hashTags: string[],
  hashFilter: string,
}

const initialState: HashState = {
  hashFilter:'',
  hashTags: [],
}

export const hashSlice = createSlice({
  name: 'hash',
  initialState,
  reducers: {
    setHashTags: (state, action: PayloadAction<string[]>) => {
      state.hashTags = action.payload
    },
    setTagsFilter: (state, action: PayloadAction<string>) => {
      state.hashFilter = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setTagsFilter, setHashTags } = hashSlice.actions

export default hashSlice.reducer