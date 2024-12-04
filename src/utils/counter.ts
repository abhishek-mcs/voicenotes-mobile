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