import { useFocusEffect, useRouter, useSegments } from "expo-router";
import { useCallback, useEffect } from "react";
import * as Linking from "expo-linking";

export const useDeeplink = () =>{
    const router = useRouter();
  const segments = useSegments();

  useFocusEffect(useCallback(() => {
    console.log('\n\nfocused\n\n')
    const handleDeepLink = ({ url }: { url: string }) => {
      console.log("🔗 Deep Link Received:", url);

      if (url) {
        const parsed = Linking.parse(url);
        if (parsed.path) {
          const query = parsed.queryParams;
          const pathName = `/${parsed.path}${query}`
        //   router.push(pathName);
        }
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Handle initial deep link if app was cold-started
    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink({ url: initialUrl });
      }
    })();

    return () => {
      subscription.remove(); // Cleanup listener on unmount
    };
  }, []));
}