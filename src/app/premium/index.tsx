import Colors from "assets/Colors"
import { iapSvg } from "assets/svg/iapSvg"
import { settingsSvg } from "assets/svg/settingsSvg"
import Touchable from "components/common/Touchable"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Image, SafeAreaView, StyleSheet, Text, TouchableHighlight, View } from "react-native"
import Purchases from "react-native-purchases"
import { SvgXml } from "react-native-svg"
import { useSelector } from "react-redux"
import { RootState } from "redux/store/store"

export default (props:any) => {
  const router = useRouter()
  const [isLoading,setIsLoading]=useState(true)
  const [selected, setSelected] = useState('monthly')
  const {IAPOfferings}:any=useSelector((state:RootState)=>state.IAPStates)
  const pack=IAPOfferings?.availablePackages||[]
  console.log(pack[0])
  const onUpgrade = async() => {
    try {
      const productToBuy=selected=='monthly'?pack[1]?.product:pack[0]?.product;
      console.warn(productToBuy?.productIdentifier)
      const { customerInfo } = await Purchases.purchaseStoreProduct(productToBuy);
      if ( typeof customerInfo.entitlements.active["Believer"] !== undefined ) {
        // Unlock that great "pro" content
        router.replace("/home/")
      }
    } catch (e:any) {
      if (!e.userCancelled) {
        // showError(e);
      }
    }
  }

  return (
    <SafeAreaView style={styles.main}>
    <Touchable style={{position:'absolute',padding:10,right:10,top:30,zIndex:10}} onPress={()=>router?.back()}>
      <SvgXml xml={settingsSvg.close}/>
    </Touchable>
      <View style={styles.container}>
        <Image source={{uri:'https://voicenotes.com/_nuxt/payment.C2X8M5Sn.png'}} style={styles.img}/>
        <View style={styles.subContainer}>
          <Text style={styles.title}>Upgrade for more</Text>
          <View style={styles.descView}>
            <SvgXml xml={iapSvg.done}/>
            <Text style={styles.desc}>Limitless recording, instead of 1 min/note</Text>
          </View>
          <View style={styles.descView}>
            <SvgXml xml={iapSvg.done}/>
            <Text style={styles.desc}>Smartest AI models (GPT-4 Turbo, Claude Opus)</Text>
          </View>
          <Btn type="monthly" price={pack[1]?.product?.priceString||'$10.00'} selected={selected=='monthly'} onPress={()=>setSelected('monthly')} underlay="#f9f9f9" title="Monthly"/>
          <Btn type="believer" price={pack[0]?.product?.priceString||'$50.00'} selected={selected=='believer'} onPress={()=>setSelected('believer')} underlay="#f9f9f9" title="Believer"/>
          <Btn type="upgrade" onPress={onUpgrade} underlay={Colors.primaryWithOpacity(0.8)} title="Upgrade"/>
        </View>
      </View>
    </SafeAreaView>
  )
}

const Btn = ({title,type,price,onPress,underlay,selected=false}:Props) =>
  <TouchableHighlight onPress={onPress} style={[styles.btn,styles.border,type=="upgrade"?styles.btnFilled:selected?{borderColor:Colors.primary}:{}]} underlayColor={underlay}>
    <>{(type=='monthly'||type=='believer')?
    <><View>
        <Text style={styles.btnText}>{title}</Text>
        {type=="believer"&&
        <View style={styles.btnContent}>
          <SvgXml xml={iapSvg.limit} /> 
          <Text style={styles.offer}>Only for the first 1k members </Text>
        </View>}
      </View>
      <Text style={styles.btnPrice}>{price}<Text style={styles.btnPriceType}>{type=='believer'?'/lifetime':'/monthly'}</Text></Text>
    </>
    :<Text style={[styles.btnText,{color:'#fff'}]}>{title}</Text>}</>
  </TouchableHighlight>


const styles = StyleSheet.create({
  main:{flex:1,backgroundColor:'#fff'},
  container:{flex:1},
  subContainer:{flex:2,padding:16},
  img:{flex:1,width:'100%',height:'100%'},
  title:{fontSize:30,fontFamily:'Primary-Medium',color:'#222',marginBottom:24},
  descView:{flexDirection:'row',alignItems:'flex-start',marginBottom:12},
  desc:{marginLeft:9,fontSize:16,fontFamily:'Primary-Regular',color:'#222',lineHeight:22},
  border:{borderWidth:1,borderColor:Colors.greyWithOpacity(0.5)},
  btnFilled:{height:56,width:'100%',backgroundColor:Colors.primary,justifyContent:'center',marginVertical:20},
  btn:{minHeight:60,width:'100%',paddingVertical:8,justifyContent:'space-between',alignItems:'center',flexDirection:'row',paddingHorizontal:16,marginTop:16,backgroundColor:'#fff',borderRadius:8},
  btnContent:{marginTop:4,flexDirection:'row',alignItems:'center'},
  btnText:{fontSize:16,fontFamily:'Primary-Medium',color:'#222'},
  offer:{color:'#FF4538', fontFamily:'Primary-Regular',fontSize:12,textAlignVertical:'center',marginLeft:4},
  btnPrice:{fontSize:16,fontFamily:'Primary-Medium',color:'#222'},
  btnPriceType:{color:Colors.grey,fontSize:14,fontFamily:'Primary-Regular',marginLeft:4},
})

interface Props {
  type: string,
  price?: string,
  onPress: () => void,
  underlay: string,
  title: string,
  selected?: boolean
}