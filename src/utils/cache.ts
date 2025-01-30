// counter to keep track of how many notes have been recorded since last login
// this is used for prompt the user to review the app

import AsyncStorage from "@react-native-async-storage/async-storage"

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
const NOTIFICATION_TIMES = 'voicenotes_notification_times'

export const setNotificationTime = async (time: Date, type: 'morning' | 'night', id: string) => {
    await AsyncStorage.setItem(NOTIFICATION_TIMES, JSON.stringify({ time, type, id }))
}

export const getNotificationTime = async (type: 'morning' | 'night'): Promise<Date | null> => {
    const value = await AsyncStorage.getItem(NOTIFICATION_TIMES)
    if(!value) return null
    const data = JSON.parse(value)
    if(data.type !== type) return null
    return new Date(data.time)
}

export const getNotificationByType = async (type: 'morning' | 'night'): Promise<string | null> => {
    const value = await AsyncStorage.getItem(NOTIFICATION_TIMES)
    if(!value) return null
    const data = JSON.parse(value)
    if(data.type !== type) return null
    return data.id
}

export const deleteNotificationTime = async (type: 'morning' | 'night') => {
    await AsyncStorage.removeItem(NOTIFICATION_TIMES)
}