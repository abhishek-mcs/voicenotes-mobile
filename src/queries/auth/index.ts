import axios from "axios";
import { useMutation } from "react-query";
import { API_URL } from "services/api/api-constants";
import axiosApi from "services/api/axios-api";

export function useGuestToken(){
    return useMutation('guest-token',async (p?:any)=>{
        return await axiosApi.post('/guest');
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

export function useLogout(){
    return useMutation('logout',async (p?:any)=> {
        return await axiosApi.post(`auth/logout`);
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}