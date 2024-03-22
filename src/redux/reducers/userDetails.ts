import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface userState {
  email: string,
  token: string
}

const initialState: userState = {
  email: '',
  token: ''
}

export const userDetails = createSlice({
  name: 'user_details',
  initialState,
  reducers: {
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload
    },
    setToken: (state, action: PayloadAction<string>)=>{
        state.token = action.payload
    },
    logOut: (state, action: PayloadAction<string>)=>{
        state.token= action.payload||'';
    }
  }
})

// Action creators are generated for each case reducer function
export const { setEmail, setToken, logOut } = userDetails.actions

export default userDetails.reducer