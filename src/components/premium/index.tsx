import { iapSvg } from "assets/svg/iapSvg"
import Touchable from "components/common/Touchable"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableHighlight, View } from "react-native"
import Purchases from "react-native-purchases"
import { SvgXml } from "react-native-svg"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "redux/store/store"
import { isIOS, screenHeight, screenWidth} from "utils/common"
import * as Updates from 'expo-updates';
import { useQueryClient } from "react-query"
import { setTempIsIAPPurchased } from "redux/reducers/IAPStates"
import { analytics } from "../../../firebaseConfig"
import { AppEventsLogger } from "react-native-fbsdk-next"
import { ImageBackground } from "expo-image"
import * as webBrowser from "expo-web-browser"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTheme } from "context"

const premiumBg = require('../../assets/images/premiumBg.png')

export default (props:any) => {
  const { Colors } = useTheme()
  const styles = useStyles()
  const router = useRouter()
  const {from="home"}=useLocalSearchParams();
  const [isLoading,setIsLoading]=useState(false)
  const [selected, setSelected] = useState('believer')
  const {IAPOfferings}:any=useSelector((state:RootState)=>state.IAPStates)
  const {userDetails}:any=useSelector((state:RootState)=>state.userDetails)
  const pack=IAPOfferings?.availablePackages||[]
  const dispatch=useDispatch()
  const queryClient=useQueryClient()
  const insets = useSafeAreaInsets()

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

      if (!pack || pack.length === 0) {
        console.error('No products available');
        Alert.alert('Error', 'Unable to fetch product information. Please try again later.');
        setIsLoading(false);
        return;
      }
      
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
        console.log('error',e)
        //showError(e);
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
        <SafeAreaView style={{flex:1, paddingTop: insets.top}}>
          <Touchable style={styles.closeButton} onPress={()=>from=="home"?router?.back():freeUser()}>
            <SvgXml xml={iapSvg.close}/>
          </Touchable>
          <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
            <View style={{paddingLeft:32, marginBottom: 20}}>
              <SvgXml xml={iapSvg.usersCount}/>
            </View>
            <View style={styles.container}>
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
              <View style={styles.descView}>
                <SvgXml xml={iapSvg.done} style={styles.doneIcon} />
                <View style={styles.descTextContainer}>
                  <Text style={styles.desc}>
                    #1 AI voice app. As seen on
                  </Text>
                  <SvgXml xml={iapSvg.techCrunch} style={styles.techCrunchIcon} />
                </View>
              </View>
              <View style={styles.subContainer}>
                <Btn type="monthly" price={pack[1]?.product?.priceString?.replaceAll(' ','')||'$ 10.00'} selected={selected=='monthly'} onPress={()=>setSelected('monthly')} underlay={Colors.lightGrey} title="Monthly" isLoading={isLoading}/>
                <Btn type="believer" price={pack[0]?.product?.priceString?.replaceAll(' ','')||'$50.00'} selected={selected=='believer'} onPress={()=>setSelected('believer')} underlay={Colors.lightGrey} title="Believer" isLoading={isLoading}/>
                <Btn type="upgrade" onPress={onUpgrade} underlay={Colors.blackWithOpacity(0.8)} title={"Continue"} isLoading={isLoading}/>
              
                <Touchable onPress={onRestore} style={{padding:8}}>
                  <Text style={[styles.footerText,{color:Colors.grey3}]}>Restore</Text>
                </Touchable>
              </View>
            </View>
        <View style={styles.footer}>
          <Touchable onPress={()=>webBrowser.openBrowserAsync('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}>
            <Text style={[styles.footerText1,{color:Colors.blackWithOpacity(1)}]}>Terms of Service</Text>
          </Touchable>
          <Touchable onPress={()=>webBrowser.openBrowserAsync('https://help.voicenotes.com/en/articles/9196879-privacy-policy')}>
            <Text style={[styles.footerText1,{color:Colors.blackWithOpacity(1),marginHorizontal:16}]}>Privacy Policy</Text>
          </Touchable>
        </View>
          </ScrollView>
        </SafeAreaView>
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
}: Props) => {
  const { Colors } = useTheme()
  const styles = useStyles()
  return (
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
          { color: Colors.whiteWithOpacity(1), fontSize: 16, fontFamily: "Primary-Semibold" },
        ]}
      >
        {title}
      </Text>
    ) : (
      <ActivityIndicator size={"small"} color={Colors.whiteWithOpacity(1)} />
    )}
  </TouchableHighlight>
)};

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
  main:{flex:1,backgroundColor:Colors.whiteWithOpacity(1)},
  container:{flex:1,marginTop:14, paddingHorizontal: isIOS ? 0 : 5},
  subContainer:{flex:2,padding:screenHeight>690?16:8,paddingVertical:0,marginTop:4},
  img:{width:'80%',height:screenHeight/3.3,alignSelf:'center',marginTop:20},
  descView:{flexDirection:'row',alignItems:'flex-start',paddingHorizontal:20,marginBottom:screenHeight>690?17:12},
  desc:{marginLeft:9,fontSize:16,fontFamily:'Primary-Medium',color:Colors.darkWithOpacity(1),lineHeight:22,marginTop:-4},
  border:{borderWidth:2,borderColor:Colors.darkWithOpacity(0)},
  btnFilled:{height:56,width:'100%',backgroundColor:Colors.black2,justifyContent:'center',marginVertical:screenHeight>690?20:14,borderWidth:0,marginTop:24},
  btn:{minHeight:64,width:'100%',paddingVertical:8,justifyContent:'space-between',alignItems:'center',flexDirection:'row',paddingHorizontal:16,marginTop:12,backgroundColor:Colors.darkWithOpacity(0.05),borderRadius:12},
  btnContent:{marginBottom:5,flexDirection:'row',alignItems:'center'},
  btnText:{fontSize:16,fontFamily:'Primary-Semibold',color:Colors.black2},
  offer:{color:Colors.redWithOpacity(1), fontFamily:'Primary-Semibold',fontSize:10,textAlignVertical:'center',marginLeft:4},
  btnPrice:{fontSize:16,fontFamily:'Primary-Semibold',color:Colors.black2,textAlign:'right'},
  btnPriceType:{color:Colors.black2,fontSize:12,fontFamily:'Primary',marginTop:4,textAlign:'right'},
  footerText:{color:Colors.grey,fontFamily:'Primary',fontSize:14,lineHeight:15,textAlign:'center',marginBottom:4},
  footerText1:{color:Colors.grey,fontFamily:'Primary',fontSize:12,lineHeight:15,textAlign:'center'},
  footer:{flexDirection:'row',alignItems:'center',justifyContent:'center',paddingVertical:14},
  title:{
    fontSize:screenWidth/8,
    fontFamily:'Secondary',
    color:Colors.darkWithOpacity(1),
    marginBottom:20,
    alignSelf:'center',
    lineHeight:64,
    marginHorizontal:20
  },
  closeButton: {
    position: 'absolute',
    padding: 10,
    zIndex: 10,
    right: 16,
    top: isIOS ? 45 : 25,
  },
  scrollViewContent: {
    flexGrow: 1,
    // paddingTop: isIOS ? 30 : 50,
  },
  doneIcon: {
    marginTop: 3,
    marginRight: 9,
  },
  descTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  techCrunchIcon: {
    marginLeft: 4,
    marginTop: 2,
  },
}), [Colors]); // Recreate styles when Colors change
};

interface Props {
  type: string,
  price?: string,
  onPress: () => void,
  underlay: string,
  title: string,
  selected?: boolean,
  isLoading?: boolean
}