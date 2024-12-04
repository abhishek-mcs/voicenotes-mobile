import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface HashState {
  hashTags: string[],
  hashTagsData: string[],
  hashFilter: string,
  pinnedTags: string[],
  pinnedTagsData: any[],
}

const initialState: HashState = {
  hashFilter:'',
  hashTags: [],
  hashTagsData: [],
  pinnedTags: [],
  pinnedTagsData: [],
}

export const hashSlice = createSlice({
  name: 'hash',
  initialState,
  reducers: {
    setHashTags: (state, action: PayloadAction<string[]>) => {
      state.hashTags = action.payload
    },
    setHashTagsData: (state, action: PayloadAction<string[]>) => {
      state.hashTagsData = action.payload
    },
    setTagsFilter: (state, action: PayloadAction<string>) => {
      state.hashFilter = action.payload
    },
    setPinnedTags: (state, action: PayloadAction<string[]>) => {
      state.pinnedTags = action.payload
    },
    setPinnedTagsData: (state, action: PayloadAction<string[]>) => {
      state.pinnedTagsData = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setTagsFilter, setHashTags, setPinnedTags, setPinnedTagsData, setHashTagsData } = hashSlice.actions

export default hashSlice.reducer