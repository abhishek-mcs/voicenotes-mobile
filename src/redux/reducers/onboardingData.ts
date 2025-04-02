import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface userData {
    preferenceEnums: any,
    selectedScreen: number,
    referrer: number | null,
    language: string,
    age_group: number | null,
    note_taking_frequency: number | null,
    revisit_frequency: number | null,
    note_types: number[],
    userEmail: string,
    name: string,
    showClose: boolean | null,
    emailVerified: boolean | null,
}

const initialState: userData = {
    preferenceEnums: { 
      "age_group": [
        {"label": "Under 20", "value": 1}, 
        {"label": "20s", "value": 2}, 
        {"label": "30s", "value": 3}, 
        {"label": "40s", "value": 4}, 
        {"label": "50+", "value": 5}
      ], 
      "note_taking_frequency": [
        {"label": "Rarely (0-2/week)", "value": 1}, 
        {"label": "Almost every day", "value": 2}, 
        {"label": "Every day", "value": 3}, 
        {"label": "More than 5 times daily", "value": 4}
      ], 
      "note_types": [
        {"label": "Journaling", "value": 1}, 
        {"label": "Meetings", "value": 2}, 
        {"label": "To-do", "value": 3}, 
        {"label": "Research", "value": 4}, 
        {"label": "Lectures", "value": 5}, 
        {"label": "Book highlights", "value": 6}, 
        {"label": "Other", "value": 7}
      ], 
      "referrer": [
        {"label": "App Store", "value": 1}, 
        {"label": "TikTok", "value": 2}, 
        {"label": "YouTube", "value": 3}, 
        {"label": "Facebook/Instagram", "value": 4}, 
        {"label": "Google Search", "value": 5}, 
        {"label": "Friends & Family", "value": 6}, 
        {"label": "Reddit", "value": 8}, 
        {"label": "Other", "value": 7}
      ], 
      "revisit_frequency": [
        {"label": "Rarely", "value": 1}, 
        {"label": "Occasionally", "value": 2}, 
        {"label": "All the time", "value": 3}
      ]
    },
    selectedScreen: 1,
    referrer: null,
    language: '',
    age_group: null,
    note_taking_frequency: null,
    revisit_frequency: null,
    note_types: [],
    userEmail: '',
    name: '',
    showClose: null,
    emailVerified: null,
}

export const onboardingData = createSlice({
  name: 'onboardingData',
  initialState,
  reducers: {
    setPreferenceEnums: (state, action: PayloadAction<any>) => {
      state.preferenceEnums = action.payload
  },
    setSelectedScreen: (state, action: PayloadAction<number>) => {
        state.selectedScreen = action.payload
    },
    setReferrer: (state, action: PayloadAction<any>) => {
      state.referrer = action.payload
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload
    },
    // setToken: (state, action: PayloadAction<string>)=>{
    //     state.token = action.payload
    //     AsyncStorage?.setItem('authToken',action.payload)
    // },
    setAgeGroup: (state, action: PayloadAction<any>)=>{
        state.age_group = action.payload
    },
    setNoteTakingFrequency: (state, action: PayloadAction<any>)=>{
        state.note_taking_frequency= action.payload;
    },
    setRevisitFrequency: (state, action: PayloadAction<any>)=>{
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
    setShowClose: (state, action: PayloadAction<boolean>) => {
      state.showClose = action.payload
    },
    setEmailVerified: (state, action: PayloadAction<boolean>) => {
      state.emailVerified = action.payload
    },
  }
})

// Action creators are generated for each case reducer function
export const { setPreferenceEnums, setSelectedScreen, setReferrer, setLanguage, setAgeGroup, setNoteTakingFrequency, setRevisitFrequency, setNoteTypes, setUserEmail, setName, setShowClose, setEmailVerified } = onboardingData.actions

export default onboardingData.reducer