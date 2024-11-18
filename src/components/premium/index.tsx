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

const Premium=(props:any) => {
  const router = useRouter()
  const { Colors, isLightMode } = useTheme()
  const styles = useStyles()
  const {from="home"}=useLocalSearchParams();
  const [isLoading,setIsLoading]=useState(false)
  const [selected, setSelected] = useState('believer')
  const {IAPOfferings}:any=useSelector((state:RootState)=>state.IAPStates)
  const {userDetails}:any=useSelector((state:RootState)=>state.userDetails)
  const pack=IAPOfferings?.availablePackages||[]
  const dispatch=useDispatch()
  const queryClient=useQueryClient()
  const insets = useSafeAreaInsets()
  const iapSvgIcons:any = iapSvg

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
      
      const productToBuy=selected=='monthly'?pack[1]?.product:pack[3]?.product;
      const { customerInfo } = await Purchases.purchaseStoreProduct(productToBuy);
      if ( typeof customerInfo.entitlements.active["Believer"] !== undefined ) {
        // Unlock that great "pro" content
        dispatch(setTempIsIAPPurchased(true))
        try {
          analytics()
            .logEvent(
              selected == "monthly"
                ? "monthly_subscription_success"
                : "yearly_subscription_success"
            )
            AppEventsLogger.logPurchase(
              selected == "monthly"
                ? pack[1]?.product?.price || 9.99
                : pack[3]?.product?.price || 49.99,
              pack[1]?.product?.currencyCode || "USD",
              {
                fb_currency:
                  selected == "monthly"
                    ? pack[1]?.product?.priceString || "$9.99"
                    : pack[3]?.product?.priceString || "$49.99",
                _eventName:
                  selected == "monthly" ? "Monthly Subscription" : "Yearly Subscription",
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
  const priceMonthString=(pack[1]?.product?.priceString?.replace(/\s*(?=\d)/, '')||'$9.99')?.replace('.00','')
  const priceAnnualString=(pack[3]?.product?.priceString?.replace(/\s*(?=\d)/, '')||'$49.99')?.replace('.00','')
  const priceMonth=(pack[1]?.product?.price||9.99).toFixed(2);
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(priceMonth * 12);
  const match = priceMonthString?.match(/^[^\d]*[^\d\s]/);
  const currencySymbol=match?match[0]?.trim():"$";
  const continueText=`Subscribe for ${selected=="monthly"?priceMonthString+' / month':priceAnnualString+' / year'}`
  const originPrice=`${currencySymbol}${(formattedPrice)}`?.replace(/\.\d+$/, '.99');
  return (
    <View style={styles.main}>
      <ImageBackground source={isLightMode?premiumBg:null} style={{height:screenHeight,backgroundColor:Colors.whiteWithOpacity(1),width:'100%',flex:1}}>
        <SafeAreaView style={{flex:1, paddingTop: insets.top}}>
          <Touchable style={styles.closeButton} onPress={()=>from=="home"?router?.back():freeUser()}>
            <SvgXml xml={iapSvg.close?.replace("#222222",Colors.text1)}/>
          </Touchable>
          <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
            <View style={{paddingLeft:32, marginBottom: 0}}>
              <SvgXml xml={iapSvgIcons.usersCount?.replace("#222222",Colors.text1).replaceAll('black',Colors.blackWithOpacity(1))}/>
            </View>
            <View style={styles.container}>
              <Text style={styles.title}>{`Upgrade your\nnotes & meetings`}</Text>
              <View style={styles.descView}>
                <SvgXml xml={iapSvg.done} style={{marginTop:3.5}}/>
                <Text style={styles.desc}>Unlimited Everything: Record, Ask AI and Create content (summary, to-do, email).</Text>
              </View>
              <View style={styles.descView}>
              <SvgXml xml={iapSvg.done} style={{marginTop:3.5}}/>
                <Text style={styles.desc}>Human-level transcription in 100+ languages.</Text>
              </View>
              <View style={styles.descView}>
              <SvgXml xml={iapSvg.done} style={{marginTop:3.5}}/>
                <Text style={styles.desc}>Sync with all your devices: Web, Mobile & Smartwatch.</Text>
              </View>
              <View style={styles.descView}>
                <SvgXml xml={iapSvg.done} style={styles.doneIcon} />
                <View style={styles.descTextContainer}>
                  <Text style={styles.desc}>#1 AI voice app. As seen on</Text>
                  <SvgXml xml={iapSvg.techCrunch} style={styles.techCrunchIcon} />
                </View>
              </View>
              <View style={styles.subContainer}>
                <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                  <Btn type="believer" isOverflow={((priceAnnualString+originPrice)?.length||0)>=14} originPrice={originPrice} price={priceAnnualString} selected={selected=='believer'} onPress={()=>setSelected('believer')} underlay={Colors.lightGrey} title="Believer" isLoading={isLoading}/>  
                  <Btn type="monthly" isOverflow={((priceAnnualString+originPrice)?.length||0)>=14} price={priceMonthString} selected={selected=='monthly'} onPress={()=>setSelected('monthly')} underlay={Colors.lightGrey} title="Monthly" isLoading={isLoading}/>             
                </View>
                <Btn type="upgrade" onPress={onUpgrade} underlay={Colors.blackWithOpacity(0.8)} title={continueText} isLoading={isLoading}/>
                <Touchable onPress={onRestore} style={{padding:8}}>
                  <Text style={[styles.footerText,{color:Colors.grey3}]}>Restore</Text>
                </Touchable>
        <View style={styles.footer}>
          <Touchable onPress={()=>webBrowser.openBrowserAsync('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}>
            <Text style={[styles.footerText1,{color:Colors.blackWithOpacity(1)}]}>Terms of Service</Text>
          </Touchable>
          <Touchable onPress={()=>webBrowser.openBrowserAsync('https://help.voicenotes.com/en/articles/9196879-privacy-policy')}>
            <Text style={[styles.footerText1,{color:Colors.blackWithOpacity(1),marginHorizontal:16}]}>Privacy Policy</Text>
          </Touchable>
        </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  )
}

export default  Premium;

const Btn = ({
  title,
  type,
  price='',
  onPress,
  underlay,
  selected = false,
  isLoading = false,
  originPrice,
  isOverflow=false
}: Props) => {
  const { Colors } = useTheme()
  const styles = useStyles()
  return(
  <Touchable
    onPress={onPress}
    style={[
      styles.btn,
      styles.border,
      type == "upgrade"
        ? styles.btnFilled
        : selected
        ? { borderColor: Colors.green2, borderWidth: 2,backgroundColor:Colors.pricingSelected }
        : {},
        isOverflow?{alignItems:'flex-end'}:{alignItems:'center'}
    ]}
    activeOpacity={1}
  >
    {type == "monthly" || type == "believer" || type == "free" ? (
      <>
        {/* <View>
          {type == "believer" && (
            <View style={styles.btnContent}>
              <SvgXml xml={iapSvg.limit} />
            </View>
          )}
          <Text style={styles.btnText}>{title}</Text>
        </View> */}
            {type != "monthly"&&<View style={[styles.limitted,styles.shadow]}>
              <SvgXml xml={iapSvg.limit}/>
            </View>}
        {type != "free" && (
          <View>
            {type != "monthly"&&isOverflow&&<Text style={styles.nonOfferPrice}>{originPrice}</Text>}
            <Text style={styles.btnPrice}>
              {price}{'  '}
              {type != "monthly"&& !isOverflow&&<Text style={styles.nonOfferPrice}>{originPrice}</Text>}
            </Text>
            <Text style={styles.btnPriceType}>
              {type == "believer" ? "per year" : "per month"}
            </Text>
          </View>
        )}
      </>
    ) : !isLoading ? (
      <Text
        style={[
          styles.btnText,
          { color: Colors.text4, fontSize: 16, fontFamily: "Primary-Semibold" },
        ]}
      >
        {title}
      </Text>
    ) : (
      <ActivityIndicator size={"small"} color={Colors.whiteWithOpacity(1)} />
    )}
  </Touchable>
)};

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
  main: { flex: 1, backgroundColor: Colors.whiteWithOpacity(1) },
  container: { flex: 1, marginTop: 14, paddingHorizontal: isIOS ? 0 : 5 },
  subContainer: {
    flex: 2,
    padding: screenHeight > 690 ? 16 : 8,
    paddingVertical: 0,
    marginTop: 4,
  },
  img: {
    width: "80%",
    height: screenHeight / 3.3,
    alignSelf: "center",
    marginTop: 20,
  },
  descView: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginBottom: screenHeight > 690 ? 17 : 12,
  },
  desc: {
    marginLeft: 9,
    fontSize: 16,
    fontFamily: "Primary-Medium",
    color: Colors.text1,
    lineHeight: 22,
    marginTop: -4,
  },
  border: { borderWidth: 2, borderColor: Colors.darkWithOpacity(0) },
  btnFilled: {
    minHeight: 58,
    width: "100%",
    backgroundColor: Colors.upgrade,
    justifyContent: "center",
    marginVertical: screenHeight > 690 ? 20 : 14,
    borderWidth: 0,
    marginTop: 24,
    alignItems: "center",
  },
  btn: {
    minHeight: 84,
    width: "48%",
    paddingVertical: 16,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 12,
    backgroundColor: Colors.pricing,
    borderRadius: 12,
  },
  btnContent: { marginBottom: 5, flexDirection: "row", alignItems: "center" },
  btnText: {
    fontSize: 16,
    fontFamily: "Primary-Semibold",
    color: Colors.black2,
  },
  offer: {
    color: Colors.redWithOpacity(1),
    fontFamily: "Primary-Semibold",
    fontSize: 10,
    textAlignVertical: "center",
    marginLeft: 4,
  },
  btnPrice: {
    fontSize: 20,
    fontFamily: "Primary-Semibold",
    color: Colors.black2,
  },
  btnPriceType: {
    color: Colors.black2,
    fontSize: 14,
    fontFamily: "Primary",
    marginTop: 0,
  },
  footerText: {
    color: Colors.grey,
    fontFamily: "Primary",
    fontSize: 14,
    lineHeight: 15,
    textAlign: "center",
    marginBottom: 4,
  },
  footerText1: {
    color: Colors.grey,
    fontFamily: "Primary",
    fontSize: 12,
    lineHeight: 15,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  title: {
    fontSize: screenWidth / 8,
    fontFamily: "Secondary",
    color: Colors.text1,
    marginBottom: 20,
    alignSelf: "flex-start",
    lineHeight: 64,
    marginHorizontal: 20,
  },
  closeButton: {
    position: "absolute",
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
    marginTop: 2,
    // marginRight: 9,
  },
  descTextContainer: {
    flex: 1,
    flexDirection: "row",
    // flexWrap: "wrap",
    alignItems: "center",
  },
  techCrunchIcon: {
    marginLeft: 4,
    // marginTop: 2,
  },
  nonOfferPrice: {
    fontFamily: "Primary-Medium",
    fontSize: 14,
    color: Colors.grey3,
    textDecorationLine: "line-through",
  },
  limitted: {
    position: "absolute",
    top: -12,
    alignSelf:'center',
    borderRadius: 10,
    backgroundColor: Colors.bgColor6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    left:'25%'
  },
  shadow: {
    shadowColor: Colors.blackWithOpacity(1),
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    shadowOffset: { width: 0, height: 0.5 },
    elevation: 2,
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
  isLoading?: boolean,
  originPrice?: string | null,
  isOverflow?:boolean|null
}