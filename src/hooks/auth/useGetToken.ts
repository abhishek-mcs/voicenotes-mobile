import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNetInfo } from "@react-native-community/netinfo";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setToken } from "redux/reducers/userDetails";
import { setAuthToken } from "services/api/axios-api";

export const useGetToken = () =>{
    const netinfo = useNetInfo()
    const dispatch = useDispatch()
    useEffect(()=>{
        (async function(){
          const t = await AsyncStorage.getItem('authToken')??''
          if(!!t){
            dispatch&&dispatch(setToken(t))
            setAuthToken(t,false,netinfo);
          }
        })()
      },[])
}