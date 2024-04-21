import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface IAPState {
  IAPOfferings: object|null,
  IAPInfo:object|null
  isIAPPurchased:boolean
}

const initialState: IAPState = {
  IAPOfferings:null,
  IAPInfo:null,
  isIAPPurchased:false
}

export const IAPStates = createSlice({
  name: 'IAP',
  initialState,
  reducers: {
    setIAPOffering: (state, action: PayloadAction<object|null>) => {
      state.IAPOfferings = action.payload
    },
    setIAPInfo: (state, action: PayloadAction<object|null>) => {
      state.IAPInfo = action.payload
    },
    setIsIAPPurchased: (state, action: PayloadAction<boolean>) => {
      state.isIAPPurchased = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setIAPOffering,setIAPInfo,setIsIAPPurchased } = IAPStates.actions

export default IAPStates.reducer