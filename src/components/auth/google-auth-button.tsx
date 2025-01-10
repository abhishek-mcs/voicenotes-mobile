import { authSvg } from "assets/svg/authSvg"
import { StyleSheet, Text } from "react-native"
import { TouchableHighlight } from "react-native"
import { SvgXml } from "react-native-svg"
import * as Google from "expo-auth-session/providers/google"
import { androidGoogleClientID, iosGoogleClientID } from "services/api/api-constants"
import { useEffect, useMemo } from "react"
import { useTheme } from "context"

export default () => {
  const { Colors } = useTheme()
  const {btn,btnTxt} = useStyles()
  const [googleResponse, googlePromptAsync]:any = Google.useIdTokenAuthRequest({
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

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
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
  }), [Colors]); // Recreate styles when Colors change
};