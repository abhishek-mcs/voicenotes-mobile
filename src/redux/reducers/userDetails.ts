import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface userState {
  email: string,
  token: string,
  guestToken:string,
  userDetails:string,
  canRecord:boolean,
  lang:string
}

const initialState: userState = {
  email: '',
  token: '',
  guestToken:'',
  userDetails:'',
  canRecord:false,
  lang:'Detect language'
}

export const userDetails = createSlice({
  name: 'user_details',
  initialState,
  reducers: {
    setUserDetail: (state, action: PayloadAction<any>) => {
      state.userDetails = action.payload
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload
    },
    setToken: (state, action: PayloadAction<string>)=>{
        state.token = action.payload
    },
    setGuestToken: (state, action: PayloadAction<string>)=>{
        state.guestToken = action.payload
    },
    logOut: (state, action: PayloadAction<string>)=>{
        state.token= action.payload||'';
    },
    setLang: (state, action: PayloadAction<string>)=>{
        state.lang= action.payload||'';
    },
    setCanRecord:(state, action: PayloadAction<boolean>)=>{
      state.canRecord= action.payload||true;
    },
  }
})

// Action creators are generated for each case reducer function
export const { setEmail, setToken, setGuestToken, logOut, setUserDetail,setLang, setCanRecord } = userDetails.actions

export default userDetails.reducer