import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface HashState {
  relatedNoteId: any,
}

const initialState: HashState = {
  relatedNoteId: null,
}

export const relatedNoteStates = createSlice({
  name: 'relatedNote',
  initialState,
  reducers: {
    setRelatedNoteId: (state, action: PayloadAction<any>) => {
      state.relatedNoteId = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setRelatedNoteId } = relatedNoteStates.actions

export default relatedNoteStates.reducer