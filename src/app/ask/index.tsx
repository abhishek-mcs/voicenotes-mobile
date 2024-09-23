import { useFocusEffect, useRouter } from "expo-router"
import { useEffect } from "react";

export default () => {
    const router = useRouter();

    useFocusEffect(() => {
        router.navigate({
            pathname: '/home/',
            params: {
              action: `ask-${Date.now()}`
            }
          })
    });
}