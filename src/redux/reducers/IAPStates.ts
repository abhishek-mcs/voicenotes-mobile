import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface IAPState {
  IAPOfferings: object|null,
}

const initialState: IAPState = {
  IAPOfferings:null
}

export const IAPStates = createSlice({
  name: 'IAP',
  initialState,
  reducers: {
    setIAPOffering: (state, action: PayloadAction<object|null>) => {
      state.IAPOfferings = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setIAPOffering } = IAPStates.actions

export default IAPStates.reducer