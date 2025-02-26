import { View, Text, StyleSheet, Pressable, Modal, Animated, PanResponder, Platform, Alert } from "react-native";
import { useMemo, useState, useEffect, useRef } from "react";
import { useTheme } from "context";
import { Switch } from "@rneui/themed";
import { SvgXml } from "react-native-svg";
import { settingsSvg } from "assets/svg/settingsSvg";
import notifee, { AndroidImportance, AndroidNotificationSetting, RepeatFrequency, TimestampTrigger, TriggerType, AndroidStyle } from "@notifee/react-native";
import { cancelNotification, getNotification, setNotification } from "utils/cache";
import SwitchAndroid from "components/common/SwitchAndroid";
import { isIOS } from "utils/common";
import CustomTimePicker from "components/common/TimePicker";

const motivators = {
    morning: "Good morning! Take a moment for a quick brain dump and clear your mind for what's ahead.",
    evening: "How did your day go? Any story-worthy moments, or plans for tomorrow?"
}

const Reminders: React.FC = () => {
    const styles = useStyles()
    const { Colors, isLightMode } = useTheme()

    const [timePicker, setTimePicker] = useState(false)
    const [morningTime, setMorningTime] = useState<Date | null>(null)
    const [eveningTime, setEveningTime] = useState<Date | null>(null)
    const [active, setActive] = useState<{morning: boolean, evening: boolean}>({ morning: false, evening: false })
    const [working, setWorking] = useState<'morning' | 'evening' | null>(null)
    const translateY = useState(new Animated.Value(0))[0]

    const notificationChannel = useRef<string | undefined>(undefined)
    const activeType = useRef<'morning' | 'evening' | null>(null)

    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
            if (gesture.dy > 0) {
                translateY.setValue(gesture.dy)
            }
        },
        onPanResponderRelease: (_, gesture) => {
            if (gesture.dy > 100) {
                Animated.timing(translateY, {
                    toValue: 300,
                    duration: 200,
                    useNativeDriver: true
                }).start(() => {
                    setTimePicker(false)
                    translateY.setValue(0)
                })
            } else {
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true
                }).start()
            }
        }
    }), [])

    const TimePicker = () => {

        const [time, setTime] = useState(activeType.current === 'morning' ? morningTime : eveningTime)
        useEffect(() => {
            if (timePicker) {
                translateY.setValue(300)
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true
                }).start()
            }
        }, [timePicker])

        const saveTime = () => {
            const secureDate = getNextValidTime(time)
            activeType.current === 'morning' ? setMorningTime(secureDate) : setEveningTime(secureDate)
            setTimePicker(false)
        }

        return (
            <Modal
                visible={timePicker}
                onRequestClose={() => setTimePicker(false)}
                transparent
                animationType="none"
                presentationStyle="overFullScreen"
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Animated.View style={[styles.picker, { transform: [{ translateY }] }]}>
                        <View style={styles.dismiss} {...panResponder.panHandlers}>
                            <View style={styles.slider}></View>
                        </View>
                        <View style={styles.choose}>
                            <CustomTimePicker
                                date={time || new Date()}
                                onDateChange={setTime}
                                style={{ width: '80%' }}
                            />
                        </View>
                        <View style={styles.save}>
                            <Pressable onPress={saveTime} style={styles.saveButton}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        )
    }

    const getNextValidTime = (date?: Date | null): Date => {
        if(!date) return new Date()
        const now = new Date()
        
        const todayTarget = new Date()
        todayTarget.setHours(date.getHours(), date.getMinutes(), 0, 0)
        now.setSeconds(0, 0)
        
        if (todayTarget.getTime() > now.getTime() + 30000) {
            const result = new Date()
            result.setHours(date.getHours(), date.getMinutes(), 0, 0)
            return result
        }
        
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(date.getHours(), date.getMinutes(), 0, 0)
        return tomorrow
    }

    const checkAndroidPermissions = async (): Promise<boolean> => {
        if(Platform.OS !== 'android') return true
        const settings = await notifee.getNotificationSettings();
        if (settings.android.alarm == AndroidNotificationSetting.ENABLED) {
            return true
        } else {
            Alert.alert(
                'Alarm permission required',
                'Voicenotes requires alarm permission to send your reminders in this device. Please grant it from settings.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open settings', onPress: () => notifee.openAlarmPermissionSettings() }
                ]
            )
            return false
        }
    }

    const chooseTime = (type: 'morning' | 'evening') => {
        if(!active[type]) return
        activeType.current = type
        setTimePicker(true)
    }

    const createNotificationChannel = async (): Promise<string> => {
        await notifee.requestPermission();
        if(Platform.OS !== 'android') return ''
        if(notificationChannel.current) return notificationChannel.current
        return await notifee.createChannel({
            id: 'reminders',
            name: 'Reminders',
            importance: AndroidImportance.DEFAULT,
            vibration: true,
            lights: true,
            sound: 'default'
        });
    }

    const scheduleNotification = async (type: 'morning' | 'evening', dateObject?: Date) => {
        setWorking(type)
        createNotificationChannel().then(channel => {
            notificationChannel.current = channel;
        })
        try {
            if(!await checkAndroidPermissions()) {
                setWorking(null)
                return
            }
    
            const time = dateObject || getNextValidTime(type === 'morning' ? morningTime : eveningTime)
            const trigger: TimestampTrigger = {
                type: TriggerType.TIMESTAMP,
                timestamp: time.getTime(),
                repeatFrequency: RepeatFrequency.DAILY,
                alarmManager: {
                    allowWhileIdle: true,
                }
            };
    
            const id = await notifee.createTriggerNotification(
                {
                    id: `${type}-${time.getTime()}-notification`,
                    title: 'Voicenotes',
                    body: motivators[type],
                    android: {
                        channelId: notificationChannel.current,
                        style: {
                            type: AndroidStyle.BIGTEXT,
                            text: motivators[type]
                        },
                    },
                },
                trigger
            )
    
            await setNotification({ time, type, id, active: true })
            setActive(prev => ({ ...prev, [type]: true }))
        } catch(error) {
            setActive(prev => ({ ...prev, [type]: false }))
            Alert.alert('Oops', 'Failed to schedule notification since this time has likely passed for today. Please try again with a different time.')
            console.error(error)
        } finally {
            setWorking(null)
        }
    }

    const clearNotification = async (type: 'morning' | 'evening') => {
        const notification = await getNotification(type)
        if(notification) {
            notifee.getTriggerNotificationIds().then(ids => {
                for(const id of ids) {
                    if(id.includes(type)) {
                        notifee.cancelNotification(id)
                    }
                }
            })
            await cancelNotification(notification)
            setActive(prev => ({ ...prev, [type]: false }))
        } else console.warn('No notification found for', type)
    }

    const updateNotification = async (type: 'morning' | 'evening') => {
        await clearNotification(type)
        await scheduleNotification(type)
    }

    useEffect(() => {
        if (!morningTime || !active.morning) return;

        getNotification('morning').then(notification => {
            if (!notification) return;
            
            const storedTime = new Date(notification.time);
            if (
                storedTime.getHours() !== morningTime.getHours() ||
                storedTime.getMinutes() !== morningTime.getMinutes()
            ) {
                updateNotification('morning');
            }
        });
    }, [morningTime]);

    useEffect(() => {
        if (!eveningTime || !active.evening) return;

        getNotification('evening').then(notification => {
            if (!notification) return;
            
            const storedTime = new Date(notification.time);
            if (
                storedTime.getHours() !== eveningTime.getHours() ||
                storedTime.getMinutes() !== eveningTime.getMinutes()
            ) {
                updateNotification('evening');
            }
        });
    }, [eveningTime]);

    useEffect(() => {
        const getDefaultTime = (type: 'morning' | 'evening') => {
            const now = new Date()
            return new Date(now.getFullYear(), now.getMonth(), now.getDate(), type === 'morning' ? 9 : 19, 0, 0, 0)
        }

        const checkNotification = (type: 'morning' | 'evening') => {
            const setTime = (time: Date) => type === 'morning' ? setMorningTime(time) : setEveningTime(time)
            getNotification(type).then(notification => {
                if(notification) {
                    setTime(new Date(notification.time))
                    setActive(prev => ({ ...prev, [type]: notification.active }))
                } else {
                    const defaultTime = getDefaultTime(type)
                    setTime(defaultTime)
                }
            })
        }

        checkNotification('morning')
        checkNotification('evening')
    }, [])

    const Notification = ({time, type, border}: {time: Date | null, type: 'morning' | 'evening', border?: boolean}) => {
        return <View style={[styles.reminder, border ? { borderBottomWidth: 1, borderBottomColor: Colors.blackWithOpacity(0.1) } : {}]}>
            <View style={styles.label}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <SvgXml xml={settingsSvg[type].replaceAll('{color}', Colors.blackWithOpacity(1))} />
                    <Text style={styles.labelText}>{String(type).charAt(0).toUpperCase() + String(type).slice(1)}</Text>
                </View>
                <Pressable style={styles.time} onPress={() => chooseTime(type)}>
                    <Text style={{ color: Colors.blackWithOpacity(1) }}>{time ? time.toLocaleTimeString("en-US", { timeStyle: 'short' }) : new Date().toLocaleTimeString("en-US", { timeStyle: 'short' })}</Text>
                </Pressable>
            </View>
            <View style={{ paddingLeft: 2 }}>
                {isIOS && <Switch
                    value={active[type] || working === type}
                    onValueChange={(value) => {
                        if(value) scheduleNotification(type)
                        else clearNotification(type)
                    }}
                    style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                    trackColor={{ true: Colors.blackWithOpacity(1), false: Colors.grey2WithOpacity(1) }}
                    thumbColor={(!isLightMode && active[type]) ? 'black' : 'white'}
                />}
                <SwitchAndroid
                    value={active[type] || working === type}
                    onValueChange={(value) => {
                        if(value) scheduleNotification(type)
                        else clearNotification(type)
                    }}
                    style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                    trackColor={{ true: Colors.blackWithOpacity(1), false: Colors.grey2WithOpacity(0.2) }}
                    thumbColor={(!isLightMode && active[type]) ? 'black' : 'white'}
                />
            </View>
        </View>
    }
    
    return (
        <View style={styles.root}>
            <TimePicker />
            <View style={styles.header}>
                <Text style={styles.headerText}>Daily Notifications</Text>
            </View>
            <View style={styles.body}>
                <View style={styles.content}>
                    <Notification time={morningTime} type="morning" border />
                    <Notification time={eveningTime} type="evening" />
                </View>
            </View>
        </View>
    )
}

const useStyles = () => {
    const { Colors } = useTheme()
    return useMemo(() => StyleSheet.create({
        root: {
            flex: 1,
            width: '100%',
        },
        header: {
            width: '100%',
            paddingVertical: 5,
            paddingHorizontal: 20
        },
        headerText: {
            fontFamily: 'Primary-Bold',
            fontSize: 14,
            color: Colors.blackWithOpacity(1)
        },
        body: {
            paddingHorizontal: 20,
            paddingVertical: 10,
        },
        content: {
            backgroundColor: Colors.blackWithOpacity(0.05),
            padding: 10,
            paddingHorizontal: 15,
            borderRadius: 10
        },
        reminder: {
            width: '100%',
            padding: 5,
            paddingVertical: 15,
            gap: 5,
            flexDirection: 'row',
        },
        time: {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.white1,
            borderRadius: 5,
            paddingHorizontal: 8,
            paddingVertical: 5
        },
        label: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        labelText: {
            fontFamily: 'Primary-Bold',
            fontSize: 14,
            color: Colors.blackWithOpacity(1)
        },
        description: {
            justifyContent: 'center',
        },
        descriptionText: {
            fontFamily: 'Primary-Regular',
            fontSize: 12,
            color: Colors.blackWithOpacity(0.5)
        },
        picker: {
            width: '100%',
            height: 300,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            backgroundColor: Colors.white1
        },
        dismiss: {
            width: '100%',
            flex: 0.5,
            justifyContent: 'center',
            alignItems: 'center'
        },
        slider: {
            width: '10%',
            height: '20%',
            backgroundColor: Colors.blackWithOpacity(0.5),
            borderRadius: 50
        },
        choose: {
            width: '100%',
            flex: 8,
            padding: 10,
            justifyContent: 'center',
            alignItems: 'center'
        },
        save: {
            width: '100%',
            flex: 3,
            alignItems: 'center'
        },
        saveButton: {
            backgroundColor: Colors.blackWithOpacity(1),
            padding: 10,
            borderRadius: 10,
            width: '85%',
            justifyContent: 'center',
            alignItems: 'center'
        },
        saveButtonText: {
            fontFamily: 'Primary-Bold',
            fontSize: 14,
            color: Colors.white1
        }
    }), [Colors])
}

export default Reminders;