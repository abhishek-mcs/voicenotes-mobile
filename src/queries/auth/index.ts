import { useNetInfo } from "@react-native-community/netinfo";
import axios from "axios";
import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { setHashTags, setHashTagsData, setPinnedTags, setPinnedTagsData } from "redux/reducers/hashSlice";
import { setToken } from "redux/reducers/userDetails";
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
    const dispatch=useDispatch()
    const queryClient=useQueryClient()
    const route = useRouter()
    const netInfo=useNetInfo()
    const logout=()=>{
        setAuthToken('',false,netInfo)
        queryClient.clear()
        dispatch(setToken(''))
        dispatch(setPinnedTags([]))
        dispatch(setPinnedTagsData([]))
        dispatch(setHashTags([]))
        dispatch(setHashTagsData([]))
        route.replace("/onboarding/")
        // route.replace("/auth/landingPage/")
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

//Check if email exists already
export function useCheckEmail(){
    return useMutation("check_email", (p?:any)=>{
        console.log('Email Api inside');
        return axios.post(API_URL+"/api/auth/check-email",p)
    })
}

//Get enums for user preferences
export function useGetPreferenceEnums() {
    return useQuery(
      'get_preference_enums',
      async () => {
        console.log('Enums API called');
        const response = await axios.get(API_URL + '/api/preferences-options');
        return response.data;
      },
      {
        onSuccess: (data: any) => {
          console.log('Preference enums success:');
        },
        onError: (error: any) => {
          console.error('Preference enums error:', error?.response?.data?.message || error.message);
        },
      }
    );
}

//Get user preferences during onboarding
export function useGetPreferences(){
    return useMutation("get_preferences", (p?:any)=>{
        return axiosApi.post(API_URL+"/api/preferences",p)
    })
}

//Verify email in settings after onboarding
export function useVerifyEmail(){
    return useMutation("verify_email", (p?:any)=>{
        return axiosApi.post(API_URL+"/api/auth/verify-email",p)
    })
}

//Register after onboarding
export function useOnboardingSignup(){
    return useMutation("onboarding_signup", (p?:any)=>{
        return axios.post(API_URL+"/api/auth/register",p)
    })
}

export function useResetPassword(){
    return useMutation("reset-password", (p?:any)=>{
        return axios.post(API_URL+"/api/auth/reset-password",p)
    })
}

export async function uploadDP(file: string,isLightMode=true,showDialog: ((arg0: string, arg1: string, arg2: never[], arg3: { userInterfaceStyle: string; }) => void)) {
    const formData = new FormData();
    const filename = file.split('/').pop();

    if(!filename) {
        showDialog('Unknown file', "VoiceNotes couldn't infer the filename of this photo. Please select another one.",[],{userInterfaceStyle:isLightMode?"light":"dark"})
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