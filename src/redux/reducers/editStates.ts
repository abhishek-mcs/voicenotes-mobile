import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface HashState {
  editNoteRedux: any,
  noteId: string,
}

const initialState: HashState = {
  editNoteRedux:{},
  noteId: ''
}

export const editStates = createSlice({
  name: 'edit',
  initialState,
  reducers: {
    setEditNote: (state, action: PayloadAction<any>) => {
      state.editNoteRedux = action.payload
    },
    setNoteId: (state, action: PayloadAction<string>) => {
      state.noteId = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setEditNote, setNoteId } = editStates.actions

export default editStates.reducer