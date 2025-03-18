import { View, Text, SafeAreaView, StyleSheet, FlatList, Platform, Pressable } from 'react-native'
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
import { setFreeTrialStartDate, setSelectedScreen } from 'redux/reducers/onboardingData'
import { settingsSvg } from 'assets/svg/settingsSvg'

const Pricing = () => {
    const styles = useStyles()
    const router = useRouter()
    const dispatch=useDispatch()
    const queryClient=useQueryClient()
    const {Colors,isLightMode}=useTheme()
    const {showDialog} = useDialog()
    const [loading,setLoading]=useState(false)
    const [selectedPlan, setSelectedPlan] = useState("yearly");
    const {IAPOfferings}:any=useSelector((state:RootState)=>state.IAPStates)
    const {userDetails}:any=useSelector((state:RootState)=>state.userDetails)
    const pack=IAPOfferings?.availablePackages||[]
    const [isPermissionDenied, setIsPermissionDenied] = useState(false)
    const notificationChannel = useRef<string | undefined>(undefined)
    const [error, setError] = useState('')

    const checkNotificationPermission = async () => {
        const settings = await notifee.getNotificationSettings()
        if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
            setIsPermissionDenied(true)
        }
    }

    useEffect(() => {
      checkNotificationPermission()
    },[])

    const onContinue = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
          () => {}
        );
        if(selectedPlan == 'yearly') {
          dispatch(setFreeTrialStartDate(new Date()))
          trialEndsNotification()
          analytics().logEvent("free_trial_activated").catch(e=>{console.log(e)})
          AppEventsLogger.logEvent('fb_free_trial_activated');
        }
        if (isPermissionDenied) {
          dispatch(setSelectedScreen(19))
        } else {
          router.push("/home/")
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
        const productToBuy = selectedPlan == 'monthly' ? pack[1]?.product : pack[4]?.product;
        const { customerInfo } = await Purchases.purchaseStoreProduct(productToBuy);
        if ( typeof customerInfo.entitlements.active["Believer"] !== undefined ) {
          console.log('Purchased successfully');
          dispatch(setTempIsIAPPurchased(true))
          try {
            analytics()
              .logEvent(
                selectedPlan == "monthly"
                  ? "monthly_subscription_success"
                  : "yearly_subscription_success"
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
          onContinue()
        }
      } catch (e: any) {
        if (!e.userCancelled) {
          console.log('error',e)
          //showError(e);
          setLoading(false)
          setError('Unable to complete the purchase. Please try again later.');
        }
      }
    }

    const getFutureDate = (days: number) => {
      const date = new Date();
      date.setDate(date.getDate() + days);
    
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

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
      createNotificationChannel().then(channel => {
        notificationChannel.current = channel;
      })
      try {
        let time = new Date()
        time.setDate(time.getDate() + 5);
        const trigger: TimestampTrigger = {
            type: TriggerType.TIMESTAMP,
            timestamp: time.getTime(),
            repeatFrequency: RepeatFrequency.NONE,
            alarmManager: {
                allowWhileIdle: true,
            }
        };

        const id = await notifee.createTriggerNotification(
            {
                id: `free-trial-ends-${time.getTime()}-notification`,
                title: 'Voicenotes',
                body: "Your free trial ends soon.",
                android: {
                    channelId: notificationChannel.current,
                    style: {
                        type: AndroidStyle.BIGTEXT,
                        text: "Your free trial ends soon."
                    },
                },
            },
            trigger
        )
      } catch(error) {
          console.error('Free trial ends notification failed ',error)
      } 
    }

    const timelineData = [
        {
          id: "1",
          title: "Today",
          description: `Take as many notes as you want. \nAsk AI anything from your notes. \nSee for yourself what the buzz is about!`,
          icon: <SvgXml xml={onboardingSvg.lock?.replace('black', Colors.black2)} style={styles.icon} />,
        },
        {
          id: "2",
          title: "Day 5 - Your trial is ending",
          description: "We'll send you a reminder that your trial is ending soon.",
          icon: <SvgXml xml={onboardingSvg.bell?.replace('black', Colors.black2)} style={styles.icon} /> 
        },
        {
          id: "3",
          title: "After day 7 - Billing starts",
          description: `You'll be charged on ${getFutureDate(7)} unless you cancel anytime before.`,
          icon: <SvgXml xml={onboardingSvg.crown?.replace('black', Colors.black2)} style={styles.icon} />,
          isLast: true 
        },
    ];

    const TimelineItem = ({ item }: any) => {
        return (
          <View style={styles.itemContainer}>

            <View style={styles.iconContainer}>
                {item.icon}
            </View>
            
      
            {/* Timeline Line */}
            <View style={[styles.timelineLine, { height: item.isLast ? 40 : 67}]} />
      
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


  return (
    <SafeAreaView style={styles.mainContainer}>
      <Touchable onPress={() => router.back()} style={{ padding: 12, alignSelf: 'flex-end', marginRight: 2 }} activeOpacity={0.6}>
          <SvgXml xml={settingsSvg.close?.replace("#0D0D0D", Colors.black2)} width={30} height={30} />
        </Touchable>
        <View style={styles.mainTextContainer}>
            <Text style={styles.mainText}>How your free </Text>
            <Text style={styles.mainText}>7-day trial works</Text>
        </View>

        <View>
            <FlatList
              data={timelineData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <TimelineItem item={item} />}
              contentContainerStyle={styles.timelineContainer}
            />
        </View>

        
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
                    underlayColor={Colors.settingsBtnBg}
                    style={[styles.button, { backgroundColor: Colors.settingsBtnBg }]}
                    onPress={onStart}
                    text={selectedPlan == 'monthly' ? `Subscribe for ${priceMonthString} / month` : "Start my free week"}
                    isLoading={loading}
                    color={Colors.text4}
                />
                 {error && error.length > 0 && (
                    <Text style={{color:Colors.redWithOpacity(1),fontFamily:'Primary',fontSize:14,marginTop:8}}>{error}</Text>
                  )}
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
        marginTop: Platform.OS === 'ios' ? 0 : 30
    },
    mainTextContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainText: {
        fontFamily: 'Secondary',
        fontSize: 48,
        lineHeight: 56,
        textAlign: 'center',
        color: Colors.black2
    },
    text: { 
        fontFamily: 'Primary-Semibold', 
        fontSize: 16
    },
    timelineContainer: {
        paddingHorizontal: 16,
        paddingTop: 27,
        paddingBottom: 10,
    },
    itemContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingBottom: 24,
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
        fontSize: 16,
        lineHeight: 20,
        color: Colors.black2,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        fontFamily: 'Primary',
        color: Colors.text10,
        marginTop: 4,
    },
    pricingContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        // marginTop: 10,
        padding: 22,
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
    footerContainer: {
        position: 'absolute',
        bottom: 40,
        right: 0,
        left: 0
    }
  }), [Colors]);
}

export default Pricing