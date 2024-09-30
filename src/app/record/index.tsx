import { Redirect, useFocusEffect, useRouter } from "expo-router"
import { useEffect } from "react";
import { RootState } from 'redux/store/store';
import { useSelector } from 'react-redux';

export default () => {
    const router = useRouter();
    const {token} = useSelector((state: RootState) => state.userDetails);

    useFocusEffect(() => {
      if (token) {
        router.navigate({
          pathname: '/home/',
          params: {
            action: `record-${Date.now()}`
          }
        })
      }else{
        router.navigate({pathname: '/auth/landingPage/'})
      }  
    });
}
