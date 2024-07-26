import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface HashState {
  editNoteRedux: any,
}

const initialState: HashState = {
  editNoteRedux:{}
}

export const editStates = createSlice({
  name: 'edit',
  initialState,
  reducers: {
    setEditNote: (state, action: PayloadAction<any>) => {
      state.editNoteRedux = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setEditNote } = editStates.actions

export default editStates.reducer