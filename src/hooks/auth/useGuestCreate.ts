import { useNetInfo } from "@react-native-community/netinfo"
import { useEffect } from "react"
import { setGuestToken } from "redux/reducers/userDetails"
import { setAuthToken } from "services/api/axios-api"

export default (token:string,guestToken:string,createGuestUser:any,dispatch:any)=>{
  const netInfo=useNetInfo()
    return useEffect(()=>{
        if(!!token){
          setAuthToken(token,false,netInfo)
        }else if(!!guestToken){
          setAuthToken(guestToken,true,netInfo)
        }else {
          createGuestUser?.mutate({},{
            onSuccess(data:any) {
                dispatch(setGuestToken(data?.data?.guestUser?.token||""))
            },
            onError(error:any) {
                // console.log(error,'Create guest user failed')
            },
          })
        }
      },[token,guestToken])
}