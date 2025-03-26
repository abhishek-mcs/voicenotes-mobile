// counter to keep track of how many notes have been recorded since last login
// this is used for prompt the user to review the app

import AsyncStorage from "@react-native-async-storage/async-storage"
import { VoiceNote } from "types"

const THRESHOLD = 5 // how many notes should be recorded before prompting
const COUNTER = 'voicenotes_record_counter' // label for async storage

export const shouldPromptNow = async (): Promise<boolean> => {
    const count = await AsyncStorage.getItem(COUNTER)
    if(!count || count === 'completed') return false

    const shouldPrompt = parseInt(count) === THRESHOLD
    if (shouldPrompt) {
        await clearCounter()
    }
    return shouldPrompt
}

export const incrementCounter = async () => {
    const value = await AsyncStorage.getItem(COUNTER)
    if(value === 'completed') return

    let count = parseInt(value || '0')
    count++;

    await AsyncStorage.setItem(COUNTER, count.toString())
}

const clearCounter = async () => {
    await AsyncStorage.setItem(COUNTER, 'completed')
}

export const deleteCounter = async () => {
    await AsyncStorage.removeItem(COUNTER)
}

// cache to keep track of notification times

export type Notification = {
    time: Date
    type: 'morning' | 'evening'
    id: string,
    active: boolean
}

export const setNotification = async (notification: Notification) => {
    await AsyncStorage.setItem(`vn-${notification.type}-notification`, JSON.stringify(notification))
}

export const getNotification = async (type: 'morning' | 'evening'): Promise<Notification | null> => {
    const value = await AsyncStorage.getItem(`vn-${type}-notification`)
    if(!value) return null
    const data = JSON.parse(value)
    if(data.type !== type) return null
    return data
}

export const cancelNotification = async (notification: Notification) => {
    const value = await AsyncStorage.getItem(`vn-${notification.type}-notification`)
    if(!value) return
    const data = JSON.parse(value)
    await AsyncStorage.setItem(`vn-${notification.type}-notification`, JSON.stringify({ ...data, active: false }))
}

export const deleteNotification = async (type: 'morning' | 'evening') => {
    await AsyncStorage.removeItem(`vn-${type}-notification`)
}

export const updateRecordings = async (recordings: VoiceNote[]) => {
    if(recordings.length > 0) await AsyncStorage.setItem('recordings', JSON.stringify(recordings))
}

export const getRecordings = async (): Promise<VoiceNote[]> => {
    const value = await AsyncStorage.getItem('recordings')
    if(!value) return []
    return JSON.parse(value)
}

export const deleteRecordings = async () => {
    await AsyncStorage.removeItem('recordings')
}