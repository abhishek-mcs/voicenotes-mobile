import { View, Text, StyleSheet, Pressable, Modal, Animated, PanResponder } from "react-native";
import { useMemo, useState, useEffect } from "react";
import { useTheme } from "context";
import { Switch } from "@rneui/themed";
import { SvgXml } from "react-native-svg";
import { settingsSvg } from "assets/svg/settingsSvg";
import Picker from "react-native-date-picker";
import Header from "./header";

type Props = {
    onClose: () => void
}

const Reminders: React.FC<Props> = (props) => {
    const styles = useStyles()
    const { Colors, theme } = useTheme()

    const [timePicker, setTimePicker] = useState(false)
    const translateY = useState(new Animated.Value(0))[0]

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
        const [date, setDate] = useState(new Date())

        useEffect(() => {
            if (timePicker) {
                translateY.setValue(300)
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true
                }).start()
            }
        }, [timePicker])

        const saveTime = (time: string) => {
            setTimePicker(false)
        }

        useEffect(() => {
            console.log(theme)
        }, [theme])

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
                            <Picker
                                date={date}
                                onDateChange={setDate}
                                mode="time"
                                theme={theme !== 'auto' ? theme as 'light' | 'dark' : undefined}
                            />
                        </View>
                        <View style={styles.save}>
                            <Pressable onPress={() => saveTime('09:00 AM')} style={styles.saveButton}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        )
    }

    const chooseTime = (type: 'morning' | 'night') => {
        setTimePicker(true)
    }
    
    return (
        <Header
            onCancel={props.onClose}
            label="Notifications"
            cancelLabel="Back"
            working={false}
        >
            <View style={styles.root}>
                <TimePicker />
                <View style={styles.header}>
                    <Text style={styles.headerText}>Daily Notifications</Text>
                </View>
                <View style={styles.body}>
                    <View style={styles.content}>
                        <View style={[styles.reminder, { borderBottomWidth: 1, borderBottomColor: Colors.blackWithOpacity(0.1) }]}>
                            <View style={styles.heading}>
                                <View style={styles.label}>
                                    <View style={{ flexDirection: 'row', gap: 5}}>
                                        <SvgXml xml={settingsSvg.morning.replaceAll('{color}', Colors.blackWithOpacity(1))} />
                                        <Text style={styles.labelText}>Morning intention</Text>
                                    </View>
                                    <Pressable style={styles.time} onPress={() => chooseTime('morning')}>
                                        <Text style={{ color: Colors.blackWithOpacity(1) }}>09:00 AM</Text>
                                    </Pressable>
                                </View>
                                <View style={{ paddingLeft: 2, alignSelf: 'flex-end' }}>
                                    <Switch
                                        value={true}
                                        onValueChange={() => {}}
                                        style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                                        trackColor={{ true: Colors.blackWithOpacity(1), false: Colors.grey2WithOpacity(1) }}
                                    />
                                </View>
                            </View>
                            <View style={styles.description}>
                                <Text style={styles.descriptionText}>Start your day with a quick voicenote to set your intention and get ready to tackle the day.</Text>
                            </View>
                        </View>
                        <View style={styles.reminder}>
                            <View style={styles.heading}>
                                <View style={styles.label}>
                                    <View style={{ flexDirection: 'row', gap: 5 }}>
                                        <SvgXml xml={settingsSvg.night.replaceAll('{color}', Colors.blackWithOpacity(1))} />
                                        <Text style={styles.labelText}>Evening reflection</Text>
                                    </View>
                                    <Pressable style={styles.time} onPress={() => chooseTime('night')}>
                                        <Text style={{ color: Colors.blackWithOpacity(1) }}>10:00 PM</Text>
                                    </Pressable>
                                </View>
                                <View style={{ paddingLeft: 2 }}>
                                    <Switch
                                        value={false}
                                        onValueChange={() => {}}
                                        style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                                        trackColor={{ true: Colors.blackWithOpacity(1), false: Colors.grey2WithOpacity(1) }}
                                    />
                                </View>
                            </View>
                            <View style={styles.description}>
                                <Text style={styles.descriptionText}>Wrap up the day with a voicenote. Share your highlights or just relfect before bed.</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </Header>
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
        },
        heading: {
            flexDirection: 'row',
            gap: 5
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