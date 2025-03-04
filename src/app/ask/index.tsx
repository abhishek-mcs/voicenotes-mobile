import { useFocusEffect, useRouter } from "expo-router"
import { RootState } from 'redux/store/store';
import { useSelector } from 'react-redux';
import { useCallback } from "react";

export default () => {
    const router = useRouter();
    const {token} = useSelector((state: RootState) => state.userDetails);

    useFocusEffect(useCallback(() => {
      if (token) {
        router.navigate({
          pathname: '/home',
          params: {
            action: `ask-${Date.now()}`
          }
        })
      }else{
        router.navigate({pathname: '/auth/landingPage'})
      }        
    },[]));
}