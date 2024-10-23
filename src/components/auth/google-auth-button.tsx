import Colors from "assets/Colors"
import { authSvg } from "assets/svg/authSvg"
import { StyleSheet, Text } from "react-native"
import { TouchableHighlight } from "react-native"
import { SvgXml } from "react-native-svg"
import * as Google from "expo-auth-session/providers/google"
import { isIOS } from "utils/common"
import { androidGoogleClientID, API_URL, iosGoogleClientID, MAIN_URL } from "services/api/api-constants"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { setToken, setUserDetail } from "redux/reducers/userDetails"
import { setAuthToken } from "services/api/axios-api"
import { useQueryClient } from "react-query"
import { useRouter } from "expo-router"
import { signInWithGoogle } from "queries/auth"
import * as WebBrowser from 'expo-web-browser';

export default () => {
    const router = useRouter()
    const dispatch = useDispatch()
    const queryClient = useQueryClient()
    const socialSignIn = API_URL+'/api/auth/redirect/google'
    const [googleRequest, googleResponse, googlePromptAsync] = Google.useIdTokenAuthRequest({
        iosClientId: iosGoogleClientID,
        androidClientId: androidGoogleClientID,
        scopes: ["profile", "email"],
      })


      async function fetchUserInfo(token:string) {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
        const user = await response.json()
        if (token) {
            // setAuthToken(token,false);
            // dispatch(setToken(token));
            console.log(user,token)
            // dispatch(setUserDetail({name:user.name,email:user.email}))
            // queryClient.resetQueries('all-recording')
            // queryClient.resetQueries('user-data')
            // router.replace("/home/");
          }
      }

  useEffect(() => {
    if (googleResponse?.type === "success") {
      fetchUserInfo(googleResponse?.params?.id_token)
    }
  }, [googleResponse])

    return (
        <TouchableHighlight onPress={async()=>{
            googlePromptAsync();
        }} style={btn} underlayColor={Colors.greyWithOpacity(0.1)}>
            <><SvgXml xml={authSvg.google} />
            <Text style={btnTxt}>Continue with Google</Text></>
        </TouchableHighlight>
    )
}

const {btn,btnTxt}=StyleSheet.create({
    btn:{
        borderRadius:8,
        backgroundColor:Colors.whiteWithOpacity(1),
        marginTop:24,
        width:'100%',
        flexDirection:'row',
        alignItems:'center',
        height:44,
        justifyContent:'center'
    },
    btnTxt:{fontSize:16,fontFamily:'Primary',color:Colors.darkWithOpacity(1),marginLeft:8},
})