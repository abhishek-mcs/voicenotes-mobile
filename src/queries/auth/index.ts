import axios from "axios";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { setToken } from "redux/reducers/userDetails";
import { RootState } from "redux/store/store";
import { API_URL } from "services/api/api-constants";
import axiosApi, { setAuthToken } from "services/api/axios-api";

export function useGuestToken(){
    return useMutation('guest-token',async (p?:any)=>{
        return await axios.post(API_URL+'/api/guest');
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useSignup(){
    return useMutation('signup',async ({name,email,password,otp}:{name:string,email:string,password:string,otp:any})=>{
        return await axios.post(`${API_URL}/api/auth/register?name=${name}&email=${email}&password=${password}${!!otp?'&otp='+otp:''}`);
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useLogin(){
    return useMutation('login',async ({email,password}:{password:string,email:string}) => {
        return await axios.post(`${API_URL}/api/auth/login?password=${password}&email=${email}`);
    })
}

export function signInWithGoogle() {
    return useMutation("sign_in_google_mutation", async(params:any) => 
     await axios.post(`${API_URL}/api/auth/token`,params)
    )
}

export function useLogout(){
    const {guestToken} = useSelector((state: RootState) => state.userDetails);
    const dispatch=useDispatch()
    const queryClient=useQueryClient()
    const route = useRouter()
    const logout=()=>{
        setAuthToken(guestToken,true)
        queryClient.resetQueries('all-recording')
        queryClient.resetQueries('user-data')
        queryClient.resetQueries('all-tags')
        dispatch(setToken(''))
        route.replace("/home/")
    }
    return useMutation('logout',async (p?:any)=> {
        return await axiosApi.post(`auth/logout`);
    },
    {
        onSuccess:logout,
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
            if(error?.response?.data?.message?.includes('Unauthenticated')){
                logout()
            }
        }
    })
}