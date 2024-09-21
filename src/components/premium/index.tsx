import { color } from "@rneui/base"
import Colors from "assets/Colors"
import { iapSvg } from "assets/svg/iapSvg"
import { settingsSvg } from "assets/svg/settingsSvg"
import Touchable from "components/common/Touchable"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableHighlight, View } from "react-native"
import Purchases from "react-native-purchases"
import { SvgXml } from "react-native-svg"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "redux/store/store"
import { isIOS, screenHeight, screenWidth } from "utils/common"
import * as webBrowser from 'expo-web-browser'
import * as Updates from 'expo-updates';
import { useQueryClient } from "react-query"
import { setTempIsIAPPurchased } from "redux/reducers/IAPStates"
import { analytics } from "../../../firebaseConfig"
import { commonSvg } from "assets/svg/commonSvg"
import { AppEventsLogger } from "react-native-fbsdk-next"
import { ImageBackground } from "expo-image"
import appsFlyer from "react-native-appsflyer"

const premiumBg = require('../../assets/images/premiumBg.png')

export default (props:any) => {
  const router = useRouter()
  const {from="home"}=useLocalSearchParams();
  const [isLoading,setIsLoading]=useState(false)
  const [selected, setSelected] = useState('believer')
  const {IAPOfferings}:any=useSelector((state:RootState)=>state.IAPStates)
  const {userDetails}:any=useSelector((state:RootState)=>state.userDetails)
  const pack=IAPOfferings?.availablePackages||[]
  const dispatch=useDispatch()
  const queryClient=useQueryClient()

  useEffect(()=>{
    // const load=async()=>{
    //   try{
    //   const firebaseID=await analytics().getAppInstanceId()
    //   await Purchases.setFirebaseAppInstanceID(firebaseID)
    //   // await Purchases.logIn(userDetails?.id)
    //   }catch{}
    // }
    // load()
  },[])
  
  const freeUser=()=>{
    router.dismissAll();
    return router?.replace("/home/")
  }

  const onUpgrade = async() => {
    try {
      if(selected=='free') {
        freeUser()
      };
      setIsLoading(true)
      await Purchases.setAttributes({'email':userDetails?.email})
      const productToBuy=selected=='monthly'?pack[1]?.product:pack[0]?.product;
      const { customerInfo } = await Purchases.purchaseStoreProduct(productToBuy);
      if ( typeof customerInfo.entitlements.active["Believer"] !== undefined ) {
        // Unlock that great "pro" content
        dispatch(setTempIsIAPPurchased(true))
        try {
          analytics()
            .logEvent(
              selected == "monthly"
                ? "monthly_subscription_success"
                : "lifetime_purchase_success"
            )
            appsFlyer.logEvent(selected == "monthly"
              ? "monthly_subscription_success"
              : "lifetime_purchase_success",{value:selected == "monthly"?pack[1]?.product?.priceString??"$10":pack[0]?.product?.priceString??"$50"})
            AppEventsLogger.logPurchase(
              selected == "monthly"
                ? pack[1]?.product?.price || 10
                : pack[0]?.product?.price || 50,
              pack[1]?.product?.currencyCode || "USD",
              {
                fb_currency:
                  selected == "monthly"
                    ? pack[1]?.product?.priceString || "$10.00"
                    : pack[0]?.product?.priceString || "$50.00",
                _eventName:
                  selected == "monthly" ? "Monthly Subscription" : "Lifetime",
              }
            );
        } catch {}
        if(from=="home"){
          router?.back();
          router?.back();
        }else{
          router.dismissAll()
          router?.replace("/home/")
        }
        await queryClient.invalidateQueries('user-data');
      }
    } catch (e:any) {
      if (!e.userCancelled) {
        // showError(e);
      }
    }
    setIsLoading(false)
  }

  const onRestore=async()=>{
    setIsLoading(true)
    const actives=await Purchases.restorePurchases();
    if(actives.activeSubscriptions.length==0||!userDetails?.subscription_status){
      Alert.alert('No purchases found','You have no purchases to restore',[{text:'OK',onPress:()=>{
        // Updates.reloadAsync()
      }}])
    }else{
      
        Alert.alert(
          'Restored',
          'You have successfully restored your purchase',
          [{text:'OK',onPress:async()=>{
            Updates.reloadAsync()
            await queryClient.invalidateQueries('user-data');
          }}])
    }
    setIsLoading(false)
  }

  return (
    <View style={styles.main}>
      <ImageBackground source={premiumBg} style={{height:'100%',width:'100%',flex:1}}>
        <View style={{height:isIOS?150:130,width:'100%',justifyContent:'flex-end',paddingLeft:32}}>
          <SvgXml xml={iapSvg.usersCount}/>
    {/* {from=="home"&& */}
         <Touchable style={[{position:'absolute',padding:10,zIndex:10, right:16,top:isIOS?65:45}]} onPress={()=>from=="home"?router?.back():freeUser()}>
           <SvgXml xml={iapSvg.close}/>
         </Touchable>
        </View>
      <View style={styles.container}>
        {/* <Image source={premium} style={styles.img} resizeMode="contain"/> */}
          <Text style={styles.title}>Unlock the power of your voice</Text>
          <View style={styles.descView}>
            <SvgXml xml={iapSvg.done} style={{marginTop:3.5}}/>
            <Text style={styles.desc}>Unlimited Everything: Record, Ask AI and Create content (summary, to-do, email).</Text>
          </View>
          <View style={styles.descView}>
          <SvgXml xml={iapSvg.done} style={{marginTop:3.5}}/>
            <Text style={styles.desc}>Human-level transcription in 55 languages.</Text>
          </View>
          <View style={styles.descView}>
          <SvgXml xml={iapSvg.done} style={{marginTop:3.5}}/>
            <Text style={styles.desc}>Sync with all your devices: Web, Mobile & Smartwatch.</Text>
          </View>
          <View style={[styles.descView]}>
          <SvgXml xml={iapSvg.done} style={{marginTop:3}}/>
            <Text style={styles.desc}>#1 AI voice app. As seen on</Text>
            <SvgXml xml={iapSvg.techCrunch} style={{marginLeft:4}}/>
          </View>
        <ScrollView style={styles.subContainer} showsVerticalScrollIndicator={false}>
          <Btn type="monthly" price={pack[1]?.product?.priceString?.replaceAll(' ','')||'$ 10.00'} selected={selected=='monthly'} onPress={()=>setSelected('monthly')} underlay="#f9f9f9" title="Monthly" isLoading={isLoading}/>
          <Btn type="believer" price={pack[0]?.product?.priceString?.replaceAll(' ','')||'$50.00'} selected={selected=='believer'} onPress={()=>setSelected('believer')} underlay="#f9f9f9" title="Believer" isLoading={isLoading}/>
          {/* {from=='signup'&&<Btn type="free" price={''} selected={selected=='free'} onPress={()=>setSelected('free')} underlay="#f9f9f9" title="Continue as free"/>} */}
          <Btn type="upgrade" onPress={onUpgrade} underlay={Colors.blackWithOpacity(0.8)} title={"Continue"} isLoading={isLoading}/>
        
        {/* <Text style={[styles.footerText]}>
        This subscription automatically renews unless it is canceled at least 24 hours before the end of the current period. If you have used a trial subscription previously, payment will be charged to your Apple ID account at the confirmation of purchase.
        </Text> */}

          <Touchable onPress={onRestore} style={{padding:8}}>
            <Text style={[styles.footerText,{color:Colors.grey3}]}>Restore</Text>
          </Touchable>
        </ScrollView>
        {/* <View style={styles.footer}>
          <Touchable onPress={()=>webBrowser.openBrowserAsync('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}>
            <Text style={[styles.footerText,{color:'#000'}]}>Terms of Service</Text>
          </Touchable>
          <Touchable onPress={()=>webBrowser.openBrowserAsync('https://help.voicenotes.com/en/articles/9196879-privacy-policy')}>
            <Text style={[styles.footerText,{color:'#000',marginHorizontal:16}]}>Privacy Policy</Text>
          </Touchable>
          <Touchable onPress={onRestore} style={{padding:8}}>
            <Text style={[styles.footerText,{color:Colors.grey3}]}>Restore</Text>
          </Touchable>
        </View> */}
      </View>
      </ImageBackground>
    </View>
  )
}

const Btn = ({
  title,
  type,
  price,
  onPress,
  underlay,
  selected = false,
  isLoading = false,
}: Props) => (
  <TouchableHighlight
    onPress={onPress}
    style={[
      styles.btn,
      styles.border,
      type == "upgrade"
        ? styles.btnFilled
        : selected
        ? { borderColor: Colors.green2, borderWidth: 2 }
        : {},
    ]}
    underlayColor={underlay}
  >
    {type == "monthly" || type == "believer" || type == "free" ? (
      <>
        <View>
          {type == "believer" && (
            <View style={styles.btnContent}>
              <SvgXml xml={iapSvg.limit} />
            </View>
          )}
          <Text style={styles.btnText}>{title}</Text>
        </View>
        {type != "free" && (
          <View>
            <Text style={styles.btnPrice}>{price}</Text>
            <Text style={styles.btnPriceType}>
              {type == "believer" ? "One-time" : "Per month"}
            </Text>
          </View>
        )}
      </>
    ) : !isLoading ? (
      <Text
        style={[
          styles.btnText,
          { color: "#fff", fontSize: 16, fontFamily: "Primary-Semibold" },
        ]}
      >
        {title}
      </Text>
    ) : (
      <ActivityIndicator size={"small"} color={"#fff"} />
    )}
  </TouchableHighlight>
);

const styles = StyleSheet.create({
  main:{flex:1,backgroundColor:'#fff'},
  container:{flex:1,marginTop:14},
  subContainer:{flex:2,padding:screenHeight>690?16:8,paddingVertical:0,marginTop:4},
  img:{width:'80%',height:screenHeight/3.3,alignSelf:'center',marginTop:20},
  title:{fontSize:56,fontFamily:'Secondary',color:'#222',marginBottom:20,alignSelf:'center',lineHeight:64,marginHorizontal:20},
  descView:{flexDirection:'row',alignItems:'flex-start',paddingHorizontal:20,marginBottom:screenHeight>690?17:12},
  desc:{marginLeft:9,fontSize:16,fontFamily:'Primary-Medium',color:'#222',lineHeight:22,marginTop:-4},
  border:{borderWidth:2,borderColor:Colors.darkWithOpacity(0)},
  btnFilled:{height:56,width:'100%',backgroundColor:Colors.black2,justifyContent:'center',marginVertical:screenHeight>690?20:14,borderWidth:0,marginTop:24},
  btn:{minHeight:64,width:'100%',paddingVertical:8,justifyContent:'space-between',alignItems:'center',flexDirection:'row',paddingHorizontal:16,marginTop:12,backgroundColor:Colors.darkWithOpacity(0.05),borderRadius:12},
  btnContent:{marginBottom:5,flexDirection:'row',alignItems:'center'},
  btnText:{fontSize:16,fontFamily:'Primary-Semibold',color:Colors.black2},
  offer:{color:'#FF4538', fontFamily:'Primary-Semibold',fontSize:10,textAlignVertical:'center',marginLeft:4},
  btnPrice:{fontSize:16,fontFamily:'Primary-Semibold',color:Colors.black2,textAlign:'right'},
  btnPriceType:{color:Colors.black2,fontSize:12,fontFamily:'Primary',marginTop:4,textAlign:'right'},
  footerText:{color:'#9B9B9B',fontFamily:'Primary',fontSize:14,lineHeight:15,textAlign:'center',marginBottom:4},
  footer:{flexDirection:'row',alignItems:'center',justifyContent:'center',bottom:40,paddingVertical:10},
})

interface Props {
  type: string,
  price?: string,
  onPress: () => void,
  underlay: string,
  title: string,
  selected?: boolean,
  isLoading?: boolean
}