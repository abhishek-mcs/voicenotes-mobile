import { color } from "@rneui/base"
import Colors from "assets/Colors"
import { iapSvg } from "assets/svg/iapSvg"
import { settingsSvg } from "assets/svg/settingsSvg"
import Touchable from "components/common/Touchable"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableHighlight, View } from "react-native"
import Purchases from "react-native-purchases"
import { SvgXml } from "react-native-svg"
import { useSelector } from "react-redux"
import { RootState } from "redux/store/store"
import { screenHeight, screenWidth } from "utils/common"
import * as webBrowser from 'expo-web-browser'

const premium = require('../../assets/images/premium.png')

export default (props:any) => {
  const router = useRouter()
  const [isLoading,setIsLoading]=useState(false)
  const [selected, setSelected] = useState('believer')
  const {IAPOfferings}:any=useSelector((state:RootState)=>state.IAPStates)
  const {userDetails}:any=useSelector((state:RootState)=>state.userDetails)
  const pack=IAPOfferings?.availablePackages||[]
  const onUpgrade = async() => {
    try {
      setIsLoading(true)
      await Purchases.setAttributes({'email':userDetails?.email})
      const productToBuy=selected=='monthly'?pack[1]?.product:pack[0]?.product;
      console.warn(productToBuy)
      const { customerInfo } = await Purchases.purchaseStoreProduct(productToBuy);
      if ( typeof customerInfo.entitlements.active["Believer"] !== undefined ) {
        // Unlock that great "pro" content
        router?.back()
        router?.back()
      }
    } catch (e:any) {
      if (!e.userCancelled) {
        // showError(e);
      }
    }
    setIsLoading(false)
  }

  return (
    <SafeAreaView style={styles.main}>
    <Touchable style={{position:'absolute',padding:10,right:8,top:8,zIndex:10}} onPress={()=>router?.back()}>
      <SvgXml xml={settingsSvg.close}/>
    </Touchable>
      <View style={styles.container}>
        <Image source={premium} style={styles.img} resizeMode="contain"/>
        <ScrollView style={styles.subContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Upgrade for more</Text>
          <View style={styles.descView}>
            <SvgXml xml={iapSvg.done}/>
            <Text style={styles.desc}>Limitless recording, instead of 1 min/note</Text>
          </View>
          <View style={[styles.descView]}>
            <SvgXml xml={iapSvg.done}/>
            <Text style={styles.desc}>Smartest AI models (GPT-4 Turbo, Claude Opus)</Text>
          </View>
          <Btn type="believer" price={pack[0]?.product?.priceString||'$50.00'} selected={selected=='believer'} onPress={()=>setSelected('believer')} underlay="#f9f9f9" title="Believer"/>
          <Btn type="monthly" price={pack[1]?.product?.priceString||'$10.00'} selected={selected=='monthly'} onPress={()=>setSelected('monthly')} underlay="#f9f9f9" title="Monthly"/>
          <Btn type="upgrade" onPress={onUpgrade} underlay={Colors.primaryWithOpacity(0.8)} title="Upgrade" isLoading={isLoading}/>
        
        <Text style={styles.footerText}>
        This subscription automatically renews unless it is canceled at least 24 hours before the end of the current period. If you have used a trial subscription previously, payment will be charged to your Apple ID account at the confirmation of purchase.
        </Text>
        </ScrollView>
        <View style={styles.footer}>
          <Touchable onPress={()=>webBrowser.openBrowserAsync('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}>
            <Text style={[styles.footerText,{color:'#000'}]}>Terms of Service</Text>
          </Touchable>
          <Touchable onPress={()=>webBrowser.openBrowserAsync('https://help.voicenotes.com/en/articles/9196879-privacy-policy')}>
            <Text style={[styles.footerText,{color:'#000'}]}>Privacy Policy</Text>
          </Touchable>
        </View>
      </View>
    </SafeAreaView>
  )
}

const Btn = ({title,type,price,onPress,underlay,selected=false,isLoading=false}:Props) =>
  <TouchableHighlight onPress={onPress} style={[styles.btn,styles.border,type=="upgrade"?styles.btnFilled:selected?{borderColor:Colors.primary,borderWidth:2}:{}]} underlayColor={underlay}>
    {(type=='monthly'||type=='believer')?
    <><View>
        <Text style={styles.btnText}>{title}</Text>
        {type=="believer"&&
        <View style={styles.btnContent}>
          <SvgXml xml={iapSvg.limit} /> 
          <Text style={styles.offer}>Limited launch offer</Text>
        </View>}
      </View>
      <Text style={styles.btnPrice}>{price}<Text style={styles.btnPriceType}>{type=='believer'?'/lifetime':'/monthly'}</Text></Text>
    </>
    :!isLoading?<Text style={[styles.btnText,{color:'#fff',fontSize:16,fontFamily:'Primary-Semibold'}]}>{title}</Text>
    : <ActivityIndicator size={"small"} color={"#fff"}/>
  }
  </TouchableHighlight>


const styles = StyleSheet.create({
  main:{flex:1,backgroundColor:'#fff'},
  container:{flex:1},
  subContainer:{flex:2,padding:16,paddingVertical:0},
  img:{width:'80%',height:screenHeight/3,alignSelf:'center',marginTop:20},
  title:{fontSize:20,fontFamily:'Primary-Semibold',color:'#222',marginBottom:20,alignSelf:'center'},
  descView:{flexDirection:'row',alignItems:'flex-start',paddingHorizontal:20,marginBottom:17},
  desc:{marginLeft:9,fontSize:14,fontFamily:'Primary-Regular',color:'#222',lineHeight:22,marginTop:-4},
  border:{borderWidth:1,borderColor:'rgba(229, 229, 229, 0.9)'},
  btnFilled:{height:56,width:'100%',backgroundColor:'#0E3934',justifyContent:'center',marginVertical:20,borderWidth:0},
  btn:{minHeight:48,width:'100%',paddingVertical:8,justifyContent:'space-between',alignItems:'center',flexDirection:'row',paddingHorizontal:16,marginTop:16,backgroundColor:'#fff',borderRadius:8},
  btnContent:{marginTop:4,flexDirection:'row',alignItems:'center'},
  btnText:{fontSize:14,fontFamily:'Primary-Medium',color:'#222'},
  offer:{color:'#FF4538', fontFamily:'Primary-Semibold',fontSize:10,textAlignVertical:'center',marginLeft:4},
  btnPrice:{fontSize:14,fontFamily:'Primary-Medium',color:'#222'},
  btnPriceType:{color:Colors.grey,fontSize:14,fontFamily:'Primary-Medium',marginLeft:4},
  footerText:{color:'#9B9B9B',fontFamily:'Primary',fontSize:11,lineHeight:15,paddingHorizontal:16,textAlign:'center',marginBottom:4},
  footer:{flexDirection:'row',alignItems:'center',justifyContent:'center',bottom:-12},
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