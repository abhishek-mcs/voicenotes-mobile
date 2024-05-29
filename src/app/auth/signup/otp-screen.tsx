import Colors from "assets/Colors"
import { useGlobalSearchParams, useRouter } from "expo-router"
import { useSignup } from "queries/auth"
import React, { useContext, useState } from "react"
import {ActivityIndicator, Alert,Dimensions,KeyboardAvoidingView,Platform,SafeAreaView,StyleSheet,Text,TouchableHighlight,View,} from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { setEmail, setGuestToken, setToken, setUserDetail } from "redux/reducers/userDetails"
import { setAuthToken } from "services/api/axios-api"
import {OTPInput} from "components/auth/otp-input"
import { useQueryClient } from "react-query"
import { useMoveGuestRecords } from "queries/home"
import { RootState } from "redux/store/store"
import Touchable from "components/common/Touchable"
import { SvgXml } from "react-native-svg"
import { commonSvg } from "assets/svg/commonSvg"

const errorContent='Sorry, the code you have entered is invalid.'

export default ()=>{
  const router=useRouter()
  const [otpText, setOTP] = useState('------')
  const [errorText, setErrorText] = useState('')
  const [resendEnable,setResend] = useState(true)
  const {email,password,name}:{email:string,password:string,name:string}=useGlobalSearchParams()
  const dispatch=useDispatch()
  const guestToken:string = useSelector(
    (state: RootState) => state.userDetails.guestToken
  );

  const signup=useSignup()
  const moveRecords=useMoveGuestRecords()
  const queryClient=useQueryClient()
  

  const continueDeletion = () => {
    if (otpText == "") {
      setErrorText(errorContent)
    } else handleSubmit()
  }

  const  handleSubmit = () => {
    if (otpText != "") {
    signup.mutate(
      {
        email: email,
        password: password,
        name: name,
        otp:otpText
      },
      {
        onSuccess: async (response: any, _variables: any, _context: any) => {
          const token = response.data?.authorisation?.token;
          const userData = response.data?.user
          if (token) {
            dispatch(setToken(token));
            dispatch(setUserDetail(userData))
            setAuthToken(token,false);
            // moveRecords.mutate(guestToken,{onSuccess:()=>{
              queryClient.resetQueries('all-recording')
              queryClient.resetQueries('user-data')
              router.replace("/home/");
            // }})
          }
        },
        onError: (error: any) => {
          console.log(error)
        },
      }
    );
    }else{
      setErrorText(errorContent)
    }
  }

  const resentOTP=()=>{
    // setResend(false)
    // generateOTP.mutate({type:6},{
    //   onSuccess:()=>{
    //     setTimeout(() => {
    //       setResend(true)
    //     }, 10000);
    //   }
    // })
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={{flex:1}}>
      <View style={{justifyContent:'space-between',flexDirection:'row',alignItems:'center',marginTop:16}}>
        <Touchable style={{height:56,paddingHorizontal:16}} onPress={()=>{router.back()}}>
          <SvgXml xml={commonSvg.back1}/>
        </Touchable>
        <Text style={styles.title}>Confirm Sign Up</Text>
        <View style={{width:56}}/>
      </View>
      <View style={styles.contentContainer}>
      <View style={[styles.box,{paddingHorizontal:24,paddingTop:25,paddingBottom:32}]}>
        <Text style={styles.otpDesc}>{`Enter the 6-digit code we sent to your email`}</Text>
        {/* <Text style={styles.otpDesc}>{secureEmail(userStore.email)}</Text> */}
        <OTPInput
        numberOfInputs={6}
        onChange={(v)=>{setOTP(v);errorText?.length!=0&&setErrorText("")}}
        otpValue={otpText}
        errorText={errorText}
        />
      </View>
      <TouchableHighlight onPress={continueDeletion} style={[styles.continueBtn,{opacity:otpText?.indexOf('-')!=-1 ? 0.2 : 1,backgroundColor:Colors.primary}]} disabled={otpText?.indexOf('-')!=-1} underlayColor={Colors.primaryWithOpacity(0.8)}>
        {(signup?.isLoading||moveRecords.isLoading)?
        <ActivityIndicator size={"small"} color={'#fff'} />
        :<Text style={[styles.continueBtnText,{color:"white"}]}>Sign Up</Text>}
      </TouchableHighlight>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const w=Dimensions.get("window").width
const rspValue=(v:number)=>(v*w)/390;
const isIOS=Platform.OS=='ios'

const styles=StyleSheet.create({
  container:{flex:1,backgroundColor:'#f8f8f8',paddingTop:16},
  contentContainer:{flex:1,backgroundColor:'#f8f8f8',padding:16},
  tabBarStyle:{height:6,marginBottom:isIOS?24:20,width:rspValue(198),alignSelf:'center',backgroundColor:'#f8f8f8',borderWidth:0,flexDirection:'row',justifyContent:'space-between'},
  tabBarIndicatorStyle:{height:6,width:rspValue(62),borderRadius:100,overflow:'hidden'},
  box:{paddingVertical:24,paddingHorizontal:16,backgroundColor:'#fff',borderRadius:12,shadowColor:'rgba(0, 0, 0, 0.0.04)',shadowOffset:{width:0,height:2},shadowRadius:10,shadowOpacity:0.1},
  checkOutline:{borderWidth: 1, height: 20, width: 20, borderRadius:5, borderColor:'rgba(113, 113, 113, 0.5)',alignSelf:'flex-start',marginTop:2},
  radioOutline:{borderWidth: 1, height: 20, width: 20, borderRadius:100, borderColor:'rgba(113, 113, 113, 0.5)',alignSelf:'flex-start',marginTop:2},
  checkFill:{backgroundColor:'#222',width:20,height:20,borderRadius:5,justifyContent:'center',alignItems:'center'},
  radioFill:{borderWidth:5,borderColor:'#222',backgroundColor:'#fff',width:20,height:20,borderRadius:100,justifyContent:'center',alignItems:'center'},
  continueBtn:{alignSelf:'center',backgroundColor:Colors.primary,marginVertical:32,position:'absolute',bottom:0,width:'100%',borderRadius:100,height:49,alignItems:'center',justifyContent:'center'},
  continueBtnText:{color:'#222',fontFamily:'Primary-Bold',fontSize:16,lineHeight:19.2},
  title:{fontSize:24,fontFamily:'Primary-Medium',color:'#222',textAlign:'center',marginBottom:32},
  checkBoxStyle:{minHeight:32, marginBottom:16},
  checkboxLabel:{alignSelf:'center',color:'#222',fontSize:14,lineHeight:22,fontFamily:'Primary',flex:1,marginLeft:6},
  textInput:{paddingTop:13,paddingBottom:13,paddingHorizontal:16,backgroundColor:'rgba(240, 240, 240, 1)',borderWidth:0,borderRadius:12,marginTop:20,fontSize:14,fontFamily:'Primary-Medium',lineHeight:19,color:'#222',textAlignVertical:'top'},
  otpDesc:{color:'#000',fontSize:14,fontFamily:'Primary',lineHeight:21,textAlign:'center'},
  feedBackTitle:{marginTop:20,fontFamily:'Primary-Semibold',fontSize:16,lineHeight:22}
})