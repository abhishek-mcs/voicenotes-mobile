import AsyncStorage from "@react-native-async-storage/async-storage"
import { Language } from "utils/constants/languages"

const RECENT_LANGUAGES_KEY = 'recent_languages'
const MAX_RECENT_LANGUAGES = 3

// Get the list of recently used languages
export const getRecentLanguages = async (): Promise<Language[]> => {
    try {
        const recentLanguagesStr = await AsyncStorage.getItem(RECENT_LANGUAGES_KEY)
        if (!recentLanguagesStr) return []
        
        return JSON.parse(recentLanguagesStr)
    } catch (error) {
        console.warn('Error getting recent languages:', error)
        return []
    }
}

// Add a language to recent list
export const addRecentLanguage = async (language: Language) => {
    try {
        const currentRecent = await getRecentLanguages()
        
        // Remove if language already exists
        const filteredRecent = currentRecent.filter(lang => lang.code !== language.code)
        
        // Add new language to start of array and limit to MAX_RECENT_LANGUAGES
        const newRecent = [language, ...filteredRecent].slice(0, MAX_RECENT_LANGUAGES)
        
        await AsyncStorage.setItem(RECENT_LANGUAGES_KEY, JSON.stringify(newRecent))
    } catch (error) {
        console.warn('Error adding recent language:', error)
    }
}

// Clear all recent languages
export const clearRecentLanguages = async () => {
    try {
        await AsyncStorage.removeItem(RECENT_LANGUAGES_KEY)
    } catch (error) {
        console.warn('Error clearing recent languages:', error)
    }
} 