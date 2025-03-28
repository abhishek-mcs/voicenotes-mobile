import { View, Text, SafeAreaView, StyleSheet, FlatList, Pressable } from 'react-native'
import Touchable from "components/common/Touchable";
import notifee, { AndroidImportance, AuthorizationStatus } from '@notifee/react-native'
import LargeButton from 'components/LargeButton'
import { useTheme } from "context"
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'expo-router' 
import * as Haptics from "expo-haptics";
import { SvgXml } from 'react-native-svg'
import { onboardingSvg } from 'assets/svg/onboardingSvg'
import Purchases from "react-native-purchases"
import { RootState } from 'redux/store/store'
import { useDispatch, useSelector } from 'react-redux'
import { useDialog } from 'context/DialogContext'
import { RepeatFrequency, TimestampTrigger, TriggerType, AndroidStyle } from "@notifee/react-native";
// import { setUserDetail } from 'redux/reducers/userDetails'
import { useQueryClient } from 'react-query'
import { setTempIsIAPPurchased } from 'redux/reducers/IAPStates'
import { AppEventsLogger } from 'react-native-fbsdk-next'
import { analytics } from '../../../../firebaseConfig'
import { setSelectedScreen } from 'redux/reducers/onboardingData'
import { settingsSvg } from 'assets/svg/settingsSvg'
import { isIOS, screenHeight, screenWidth } from 'utils/common';
import * as webBrowser from "expo-web-browser"
import { iapSvg } from 'assets/svg/iapSvg';

const Pricing = () => {
    const styles = useStyles()
    const router = useRouter()
    const dispatch=useDispatch()
    const iapSvgIcons:any = iapSvg
    const queryClient=useQueryClient()
    const {Colors,isLightMode}=useTheme()
    const {showDialog} = useDialog()
    const [loading,setLoading]=useState(false)
    const [selectedPlan, setSelectedPlan] = useState("yearly");
    const {IAPOfferings}:any=useSelector((state:RootState)=>state.IAPStates)
    const {userDetails}:any=useSelector((state:RootState)=>state.userDetails)
    const { showClose } = useSelector((state: RootState) => state.onboardingData);
    const pack=IAPOfferings?.availablePackages||[]
    const [isPermissionDenied, setIsPermissionDenied] = useState(false)
    const [error, setError] = useState('')

    const checkNotificationPermission = async () => {
        const settings = await notifee.getNotificationSettings()
        if (settings.authorizationStatus !== AuthorizationStatus.AUTHORIZED) {
            setIsPermissionDenied(true)
        }
    }

    useEffect(() => {
      console.log('New user in pricing', showClose);
      checkNotificationPermission()
    },[])

    const onContinue = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
          () => {}
        );
        dispatch(setTempIsIAPPurchased(true))
        if(selectedPlan == 'yearly') {
          trialEndsNotification()
          analytics().logEvent("free_trial_activated").catch(e=>{console.log(e)})
          AppEventsLogger.logEvent('fb_free_trial_activated');
        }
        if(showClose) {
          router.push("/home/")
        } else {
          if (isPermissionDenied && selectedPlan == 'yearly') {
            dispatch(setSelectedScreen(19))
          } else {
            analytics().logEvent("onboarding_continue_to_home").catch(e=>{console.log(e)})
            router.push("/home/")
          }
        }
    }

    const onStart = async () => {
      try {
        setLoading(true)
        
        await Purchases.setAttributes({'email': userDetails?.email})
        if (!pack || pack.length === 0) {
          console.error('No products available');
          showDialog('Error', 'Unable to fetch product information. Please try again later.',[],{userInterfaceStyle:isLightMode?"light":"dark"});
          setLoading(false);
          return;
        }
        if (selectedPlan == 'yearly') {
          analytics().logEvent("onboarding_free_trial_initiated").catch(e=>{console.log(e)})
        } else {
          analytics().logEvent("onboarding_monthly_subscription_initiated").catch(e=>{console.log(e)})
        }
        const productToBuy = selectedPlan == 'monthly' ? pack[1]?.product : pack[4]?.product;
        const { customerInfo } = await Purchases.purchaseStoreProduct(productToBuy);
        console.log('Customer info ',customerInfo);
        
        if ( typeof customerInfo.entitlements.active["Believer"] !== undefined ) {
          console.log('Purchased successfully', customerInfo.entitlements.active["Believer"]);
          dispatch(setTempIsIAPPurchased(true))
          try {
            analytics()
              .logEvent(
                selectedPlan == "monthly"
                  ? "onboarding_monthly_subscription_success"
                  : "onboarding_yearly_subscription_success"
              )
              AppEventsLogger.logPurchase(
                selectedPlan == "monthly"
                  ? pack[1]?.product?.price || 9.99
                  : pack[4]?.product?.price || 49.99,
                pack[1]?.product?.currencyCode || "USD",
                {
                  fb_currency:
                    selectedPlan == "monthly"
                      ? pack[1]?.product?.priceString || "$9.99"
                      : pack[4]?.product?.priceString || "$49.99",
                  _eventName:
                    selectedPlan == "monthly" ? "Monthly Subscription" : "Yearly Subscription",
                }
              );
          } catch {}
          await queryClient.invalidateQueries('user-data');
          setLoading(false)
          onContinue()
        }
      } catch (e: any) {
        if (!e.userCancelled) {
          console.log('error',e)
          //showError(e);
          setLoading(false)
          setError('Unable to complete the purchase. Please try again later.');
        }
      } finally {
        setLoading(false)
      }
    }

    // const getFutureDate = (days: number) => {
    //   const date = new Date();
    //   date.setDate(date.getDate() + days);
    
    //   return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    // };

    const createNotificationChannel = async (): Promise<string> => {
      return await notifee.createChannel({
          id: 'reminders',
          name: 'Reminders',
          importance: AndroidImportance.DEFAULT,
          vibration: true,
          lights: true,
          sound: 'default'
      });
    }

    const trialEndsNotification = async () => {
      try {
        const channelId = await createNotificationChannel();
        console.log('Channel created: ', channelId);
        
        let time = new Date()
        time.setDate(time.getDate() + 5);
        const trigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: time.getTime(), 
          repeatFrequency: RepeatFrequency.NONE,
          alarmManager: {
            allowWhileIdle: true,
          },
        };
    
        // Create the trigger notification
        const id = await notifee.createTriggerNotification(
          {
            id: `free-trial-ends-${Date.now()}-notification`,
            title: 'Voicenotes',
            body: 'Your Free Trial is ending soon!',
            android: {
              channelId,
              style: {
                type: AndroidStyle.BIGTEXT,
                text: 'Your Free Trial is ending soon!',
              },
            },
          },
          trigger
        );
    
        console.log('Notification scheduled with id: ', id);
      } catch (error) {
        console.error('Failed to schedule free trial notification:', error);
      }
    };

    const timelineData = [
        {
          id: "1",
          title: "Today",
          description: `Unlock all the app features like Unlimited recording, Ask AI and more.`,
          icon: <SvgXml xml={onboardingSvg.lock?.replace('black', Colors.black2)} style={styles.icon} />,
          height: 80,
        },
        {
          id: "2",
          title: "Day 5 - Reminder",
          description: "We'll send you a reminder that your trial is ending soon.",
          icon: <SvgXml xml={onboardingSvg.bell?.replace('black', Colors.black2)} style={styles.icon} />,
          height: 70,
        },
        {
          id: "3",
          title: "After day 7 - Billing starts",
          description: `Your free trial ends and you'll be charged, cancel anytime before.`,
          icon: <SvgXml xml={onboardingSvg.crown?.replace('black', Colors.black2)} style={styles.icon} />,
          height: 45,
        },
    ];

    const TimelineItem = ({ item }: any) => {
        return (
          <View style={styles.itemContainer}>

            <View style={styles.iconContainer}>
                {item.icon}
            </View>
            
      
            {/* Timeline Line */}
            <View style={[styles.timelineLine, { height: item.height}]} />
      
            {/* Text Content */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>
                {item.title}
              </Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        );
    };

    const defaultPriceMonthly = '$9.99';

    let priceString=(pack[1]?.product?.priceString?.replace(/\s*(?=\d)/, '')||defaultPriceMonthly)?.replace(/\.0+$/, '')
    const match = priceString?.match(/^[^\d]*[^\d\s]/);
    const currencySymbol=match?match[0]?.trim():"$";

    const priceMonth=(pack[1]?.product?.price||9.99).toFixed(2);
    const priceAnnualMonthly=((pack[4]?.product?.price||49.99)/12).toFixed(2);

    let priceAnnualMonthlyString=`${currencySymbol}${priceAnnualMonthly}`;
    let priceMonthString=`${currencySymbol}${priceMonth}`;

    if (priceString.startsWith('Rp')){
      priceMonthString = priceMonthString+'ribu';
      priceAnnualMonthlyString = priceAnnualMonthlyString+'ribu';
    }

  return (
    <SafeAreaView style={styles.mainContainer}>
        {showClose ? <Touchable onPress={() => router.back()} style={{ paddingHorizontal: 12, alignSelf: 'flex-end', marginRight: 2 }} activeOpacity={0.6}>
          <SvgXml xml={settingsSvg.close?.replace("#0D0D0D", Colors.black2)} width={30} height={30} />
        </Touchable> : ''}

        <View style={{flex: 1}}>
          <View style={styles.mainTextContainer}>
              <Text style={styles.mainText}>How your free </Text>
              <Text style={styles.mainText}>7-day trial works</Text>
          </View>

          <View style={{flex: 1, maxHeight: screenHeight/2.1}}>
              <FlatList
                data={timelineData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <TimelineItem item={item} />}
                contentContainerStyle={styles.timelineContainer}
                keyboardShouldPersistTaps='handled'
                showsVerticalScrollIndicator={false}
              />
          </View>
        </View> 
        
        {/* <View style={{flex: 1}}>
            <View style={styles.monthlyTextContainer}>
              <SvgXml xml={iapSvgIcons.usersCount2?.replace("#222222",Colors.text5).replaceAll('black',Colors.blackWithOpacity(1))}/>
            </View>
            <View style={styles.mainTextContainer}>
              <Text style={styles.mainText}>{`Upgrade your\nnotes & meetings`}</Text>
            </View>
            <View style={{flex:1, marginTop: 20 }}>
              <View style={styles.descView}>
                <SvgXml xml={isLightMode ? iapSvg.done : iapSvg.done_white} style={{marginTop:3.5}}/>
                <Text style={styles.desc}>Unlimited Everything: Record, Ask AI and Create content (summary, to-do, email).</Text>
              </View>
              <View style={styles.descView}>
                <SvgXml xml={isLightMode ? iapSvg.done : iapSvg.done_white} style={{marginTop:3.5}}/>
                <Text style={styles.desc}>Human-level transcription in 100+ languages.</Text>
              </View>
              <View style={styles.descView}>
                <SvgXml xml={isLightMode ? iapSvg.done : iapSvg.done_white} style={{marginTop:3.5}}/>
                <Text style={styles.desc}>Sync with all your devices: Web, Mobile & Smartwatch.</Text>
              </View>
              <View style={styles.descView}>
                <SvgXml xml={isLightMode ? iapSvg.done : iapSvg.done_white} style={styles.doneIcon} />
                <View style={styles.descTextContainer}>
                  <Text style={styles.desc}>#1 AI voice app. As seen on</Text>
                  <SvgXml xml={iapSvg.techCrunch} style={styles.techCrunchIcon} />
                </View>
              </View>
            </View>
          </View>
         */}
        
        <View style={styles.footerContainer}>

            <View style={styles.pricingContainer}>
              <Pressable
                style={[
                  styles.planContainer,
                  selectedPlan === "yearly" ? styles.selectedPlan : styles.unselectedPlan,
                ]}
                onPress={() => setSelectedPlan("yearly")}
              >
                <View style={styles.freeTag}>
                  <Text style={styles.freeTagText}>7 DAYS FREE</Text>
                </View>
                <View>
                    <Text style={styles.planTitle}>Yearly</Text>
                    <Text style={styles.planPrice}>{priceAnnualMonthlyString}/mo</Text>
                </View>
              
              </Pressable>
              
              <Pressable
                style={[
                  styles.planContainer,
                  selectedPlan === "monthly" ? styles.selectedPlan : styles.unselectedPlan,
                ]}
                onPress={() => setSelectedPlan("monthly")}
              >
                <Text style={styles.planTitle}>Monthly</Text>
                <Text style={styles.planPrice}>{priceMonthString}/mo</Text>
              </Pressable>
            </View>


            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
                <SvgXml xml={onboardingSvg.tick?.replace('black', Colors.black2)} /> 
                <Text style={{ fontFamily: 'Primary-Semibold', fontSize: 14, color: Colors.black2 }}>Cancel anytime</Text>
            </View>
            <View style={styles.buttonContainer1}>
                <LargeButton
                    underlayColor={Colors.blackWithOpacity(0.8)}
                    style={[styles.button, { backgroundColor: Colors.black2 }]}
                    onPress={onStart}
                    text={selectedPlan == 'monthly' ? `Subscribe for ${priceMonthString} / month` : "Start my free week"}
                    isLoading={loading}
                    color={Colors.white1}
                />
                 {error && error.length > 0 && (
                    <Text style={{color:Colors.redWithOpacity(1),fontFamily:'Primary',fontSize:12,marginTop:8}}>{error}</Text>
                  )}
            </View>
            <View style={styles.termsContainer}>
              <Touchable onPress={()=>webBrowser.openBrowserAsync('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',{toolbarColor:isLightMode?'#fff':'#000'})}>
                <Text style={[styles.footerText1,{color:Colors.blackWithOpacity(1)}]}>Terms of Service</Text>
              </Touchable>
              <Touchable onPress={()=>webBrowser.openBrowserAsync('https://help.voicenotes.com/en/articles/9196879-privacy-policy',{toolbarColor:isLightMode?'#fff':'#000'})}>
                <Text style={[styles.footerText1,{color:Colors.blackWithOpacity(1),marginHorizontal:16}]}>Privacy Policy</Text>
              </Touchable>
            </View>
        </View>
        
       
    </SafeAreaView>
  )
}

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.whiteWithOpacity(1),
        marginTop: isIOS ? 0 : screenHeight/15
    },
    mainTextContainer: {
        marginTop: screenHeight > 700 ? 12 : 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainText: {
        fontFamily: 'Secondary',
        fontSize: screenWidth/8,
        lineHeight: 56,
        textAlign: 'center',
        color: Colors.black2
    },
    monthlyTextContainer: {
      justifyContent: 'center',
      alignItems: 'center',
  },
    text: { 
        fontFamily: 'Primary-Semibold', 
        fontSize: screenWidth/28
    },
    timelineContainer: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingTop: isIOS ? 25 : screenWidth/20,
        paddingBottom: 10,
    },
    itemContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingBottom: screenHeight/35,
    },
    iconContainer: {
        height: 36,
        width: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: Colors.grey8,
        backgroundColor: Colors.bgColor2,
        zIndex: 10,
    },
    icon: {
        justifyContent: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        marginTop: 5,
    },
    timelineLine: {
        width: 12,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
        backgroundColor: Colors.blackWithOpacity(0.1),
        position: "absolute",
        left: 12,
        top: 35,
    },
    textContainer: {
        flex: 1,
        paddingLeft: 12
    },
    title: {
        fontFamily: 'Primary-Semibold',
        fontSize: screenHeight/45,
        lineHeight: screenHeight/40,
        color: Colors.black2,
    },
    description: {
        fontSize: screenHeight/50,
        lineHeight: screenHeight/35,
        fontFamily: 'Primary',
        color: Colors.text10,
        marginTop: 4,
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
      color: Colors.text5,
      lineHeight: 22,
      marginTop: -4,
    },
    pricingContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 5,
        paddingHorizontal: 22,
        paddingBottom: screenHeight > 720 ? 22 : 12,
        gap: 18
    },
    planContainer: {
        // width: 150,
        flex: 1,
        height: 84,
        borderRadius: 12,
        justifyContent: "center",
        // alignItems: "center",
        padding: 20,
        position: "relative",
    },
    selectedPlan: {
        borderWidth: 2,
        borderColor: Colors.green2, 
        backgroundColor: Colors.bottomBarButtonBg1,
    },
    unselectedPlan: {
        backgroundColor: Colors.bottomBarButtonBg1,
    },
    planTitle: {
        fontSize: 14,
        lineHeight: 17,
        fontFamily: 'Primary',
        color: Colors.black2,
    },
    planPrice: {
        fontSize: 18,
        lineHeight: 22,
        fontFamily: 'Primary-Semibold',
        color: Colors.black2,
        marginTop: 4,
    },
    freeTag: {
        position: "absolute",
        alignSelf: 'center',
        top: -10,
        backgroundColor: Colors.black2,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    freeTagText: {
        color: Colors.bgColor,
        fontSize: 10,
        lineHeight: 12,
        fontFamily: 'Primary-Medium'
    },
    buttonContainer1: {
        padding: 16,
        paddingBottom: 0,
        paddingTop: 12,
    },
    button: {
        height:48,
        justifyContent:'center',
        alignItems:'center',
        borderRadius:16,
        flexDirection:'row',
    },
    termsContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 14,
    },
    footerText1: {
      color: Colors.grey,
      fontFamily: "Primary",
      fontSize: 12,
      lineHeight: 15,
      textAlign: "center",
    },
    footerContainer: {
        position: 'absolute',
        bottom: isIOS ? 10 : 30,
        right: 0,
        left: 0
    }
  }), [Colors]);
}

export default Pricing