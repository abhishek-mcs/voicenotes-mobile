import { useNetInfo } from "@react-native-community/netinfo";
import axios from "axios";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { useMutation, useQueryClient } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { setHashTags, setHashTagsData, setPinnedTags, setPinnedTagsData } from "redux/reducers/hashSlice";
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
    return useMutation('signup',async ({name,email,password,otp=null,source=null}:{name:string,email:string,password:string,otp?:any,source?:any})=>{
        const params=!!otp?{otp,password,name,email,source}:{password,name,email,source}
        return await axios.post(`${API_URL}/api/auth/register`,params);
    },
    {
        onError:(error:any)=>{
            console.log(error?.response?.data?.message);
        }
    })
}

export function useLogin(){
    return useMutation('login',async ({email,password}:{password:string,email:string}) => {
        return await axios.post(`${API_URL}/api/auth/login`,{password,email});
    })
}

export function signInWithGoogle() {
    return useMutation("sign_in_google_mutation", async(params:any) => 
        await axios.get(`${API_URL}/api/auth/google/login`,{params})
    )
}

export function signInWithApple() {
    return useMutation("sign_in_apple_mutation", (params:any) =>
        axios.get(`${API_URL}/api/auth/apple/login`, {params})
    )
}

export function useLogout(){
    const {guestToken} = useSelector((state: RootState) => state.userDetails);
    const dispatch=useDispatch()
    const queryClient=useQueryClient()
    const route = useRouter()
    const netInfo=useNetInfo()
    const logout=()=>{
        setAuthToken(guestToken,true,netInfo)
        queryClient.clear()
        dispatch(setToken(''))
        dispatch(setPinnedTags([]))
        dispatch(setPinnedTagsData([]))
        dispatch(setHashTags([]))
        dispatch(setHashTagsData([]))
        route.replace("/auth/landingPage/")
    }
    return useMutation('logout',async (p?:any)=> {
        return await axiosApi.post(`auth/logout`);
    },
    {
        onSuccess:logout,
        onError:(error:any)=>{
            console.log('error logout',error?.response?.data?.message);
            if(error?.response?.data?.message?.includes('Unauthenticated')){
                logout()
            }
        }
    })
}

export function useCheckEmail(){
    return useMutation("check_email", (p?:any)=>{
        return axios.post(API_URL+"/api/auth/check-email",p)
    })
}

export async function uploadDP(file: string,isLightMode=true) {
    const formData = new FormData();
    const filename = file.split('/').pop();

    if(!filename) {
        Alert.alert('Unknown file', "VoiceNotes couldn't infer the filename of this photo. Please select another one.",[],{userInterfaceStyle:isLightMode?"light":"dark"})
        return
    }

    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    formData.append('image', {
        uri: file,
        name: filename,
        type,
    } as any);

    const response = await axiosApi.post('/profile/profile_picture/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    if(!response.data.photo_url) throw new Error(`Unexpected response from API! Full response was ${response.data}`)
    
    return response.data.photo_url
}

export async function changePassword(newPasswd: string, confirmPasswd: string, firstTime: boolean, oldPasswd?: string) {
    const payload: {
      confirm_password: string;
      new_password: string;
      old_password?: string;
      first_time: boolean;
    } = {
      confirm_password: confirmPasswd,
      new_password: newPasswd,
      first_time: firstTime,
      old_password: "something"
    };
  
    if (oldPasswd !== undefined) {
      payload.old_password = oldPasswd;
    }

    try {
      const response = await axiosApi.post('/auth/change-password', payload);
      return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // Throw an error with more details
            throw new Error(error.response.data.message || 'An error occurred while changing the password');
        }
        // If it's not an Axios error, just throw it as is
        throw error;
    }
}