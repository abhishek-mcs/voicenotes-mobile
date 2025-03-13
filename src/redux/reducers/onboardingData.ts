import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface userData {
    selectedScreen: number,
    referrer: number | null,
    language: string,
    age_group: number | null,
    note_taking_frequency: number | null,
    revisit_frequency: number | null,
    note_types: number[],
    userEmail: string,
    name: string,
}

const initialState: userData = {
    selectedScreen: 1,
    referrer: null,
    language: '',
    age_group: null,
    note_taking_frequency: null,
    revisit_frequency: null,
    note_types: [],
    userEmail: '',
    name: '',
}

export const onboardingData = createSlice({
  name: 'onboardingData',
  initialState,
  reducers: {
    setSelectedScreen: (state, action: PayloadAction<number>) => {
        state.selectedScreen = action.payload
    },
    setReferrer: (state, action: PayloadAction<number>) => {
      state.referrer = action.payload
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload
    },
    // setToken: (state, action: PayloadAction<string>)=>{
    //     state.token = action.payload
    //     AsyncStorage?.setItem('authToken',action.payload)
    // },
    setAgeGroup: (state, action: PayloadAction<number>)=>{
        state.age_group = action.payload
    },
    setNoteTakingFrequency: (state, action: PayloadAction<number>)=>{
        state.note_taking_frequency= action.payload;
    },
    setRevisitFrequency: (state, action: PayloadAction<number>)=>{
        state.revisit_frequency= action.payload;
    },
    setNoteTypes:(state, action: PayloadAction<number[]>)=>{
      state.note_types= action.payload
    },
    setUserEmail: (state, action: PayloadAction<string>) => {
        state.userEmail = action.payload
    },
    setName: (state, action: PayloadAction<string>) => {
        state.name = action.payload
    },
  }
})

// Action creators are generated for each case reducer function
export const { setSelectedScreen, setReferrer, setLanguage, setAgeGroup, setNoteTakingFrequency, setRevisitFrequency, setNoteTypes, setUserEmail, setName } = onboardingData.actions

export default onboardingData.reducer