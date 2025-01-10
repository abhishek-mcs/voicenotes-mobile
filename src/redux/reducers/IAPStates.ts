import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface IAPState {
  IAPOfferings: object|null,
  IAPInfo:object|null
  isIAPPurchased:boolean
  isTempIAPPurchased:boolean
}

const initialState: IAPState = {
  IAPOfferings:null,
  IAPInfo:null,
  isIAPPurchased:false,
  isTempIAPPurchased:false
}

export const IAPStates = createSlice({
  name: 'IAPStates',
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
    setTempIsIAPPurchased: (state, action: PayloadAction<boolean>) => {
      state.isTempIAPPurchased = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setIAPOffering,setIAPInfo,setIsIAPPurchased,setTempIsIAPPurchased } = IAPStates.actions

export default IAPStates.reducer