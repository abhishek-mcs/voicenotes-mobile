import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface HashState {
  relatedNoteId: any;
  relatedNoteLoaders: {
    transcript: false;
    title: false;
    summary: false;
  };
}

const initialState: HashState = {
  relatedNoteId: null,
  relatedNoteLoaders: {
    transcript: false,
    title: false,
    summary: false,
  },
};

export const relatedNoteStates = createSlice({
  name: "relatedNote",
  initialState,
  reducers: {
    setRelatedNoteId: (state, action: PayloadAction<any>) => {
      state.relatedNoteId = action.payload;
    },
    setRelatedNoteTitleLoad: (state, action: PayloadAction<any>) => {
      state.relatedNoteLoaders.title = action.payload;
    },
    setRelatedNoteTranscriptLoad: (state, action: PayloadAction<any>) => {
      state.relatedNoteLoaders.transcript = action.payload;
    },
    setRelatedNoteSummaryLoad: (state, action: PayloadAction<any>) => {
      state.relatedNoteLoaders.summary = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setRelatedNoteId,
  setRelatedNoteTitleLoad,
  setRelatedNoteTranscriptLoad,
  setRelatedNoteSummaryLoad,
} = relatedNoteStates.actions;

export default relatedNoteStates.reducer;
