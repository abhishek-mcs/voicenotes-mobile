import { useFocusEffect, useRouter } from "expo-router"
import { RootState } from 'redux/store/store';
import { useSelector } from 'react-redux';
import { useCallback } from "react";
import * as Linking from "expo-linking";

export default () => {
    const router = useRouter();

    useFocusEffect(useCallback(() => {
      const handleDeepLink = ({ url }: { url: string }) => {
        console.log("🔗 Deep Link Received:", url);
  
        if (url) {
          const parsed = Linking.parse(url);
          if (parsed.path) {
            const query = parsed.queryParams;
            const pathName = `/${parsed.path}${query}`
        // router.navigate({
        //   pathname: '/home',
        //   params: {
        //     file: `ask-${Date.now()}`
        //   }
        // })
          }
        }
      };
      Linking.getInitialURL().then((initialUrl)=>{
        if (initialUrl) {
          handleDeepLink({ url: initialUrl });
        }
      }).catch(()=>{});
    },[]));
}