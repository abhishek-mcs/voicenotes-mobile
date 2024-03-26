import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface userState {
  email: string,
  token: string,
  guestToken:string,
  userDetails:string
}

const initialState: userState = {
  email: '',
  token: '',
  guestToken:'',
  userDetails:''
}

export const userDetails = createSlice({
  name: 'user_details',
  initialState,
  reducers: {
    setUserDetail: (state, action: PayloadAction<string>) => {
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
    }
  }
})

// Action creators are generated for each case reducer function
export const { setEmail, setToken, setGuestToken, logOut, setUserDetail } = userDetails.actions

export default userDetails.reducer