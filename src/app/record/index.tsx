import { Redirect, useFocusEffect, useRouter } from "expo-router"
import { useEffect } from "react";

export default () => {
    const router = useRouter();

    useFocusEffect(() => {
        router.navigate({
            pathname: '/home/',
            params: {
              action: `record-${Date.now()}`
            }
          })
    });
}