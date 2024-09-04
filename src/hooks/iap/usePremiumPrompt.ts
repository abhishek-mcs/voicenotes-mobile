import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { InteractionManager } from 'react-native';

const usePremiumPrompt=(isBeliever: boolean,isLoggedIn:boolean) => {
  const [lastPremiumShown, setLastPremiumShown] = useState<number | null>(null);

  const showPremiumOnAppOpen = useCallback(() => {
    if (isLoggedIn && !isBeliever) {
      router.navigate("/premium/");
    }
  }, [isLoggedIn, isBeliever]);

  useEffect(() => {
    AsyncStorage.getItem('lastPremiumShown').then(value => 
      setLastPremiumShown(value ? parseInt(value) : null)
    );
    InteractionManager.runAfterInteractions(()=>{
      showPremiumOnAppOpen()
    })
  }, []);

  const showPremiumPage = useCallback(async () => {
    const currentTime = Date.now();
    await AsyncStorage.setItem('lastPremiumShown', currentTime.toString());
    setLastPremiumShown(currentTime);
    router.navigate("/premium/");
  }, []);

  const checkAndShowPremium = useCallback(() => {
    if (isBeliever) return;
    const currentTime = Date.now();
    if (!lastPremiumShown || currentTime - lastPremiumShown > 600000) {
      showPremiumPage();
    }
  }, [isBeliever, lastPremiumShown, showPremiumPage]);

  return { showPremiumPage, checkAndShowPremium,showPremiumOnAppOpen };
};

export default usePremiumPrompt;