import { useFocusEffect, useRouter } from "expo-router"

export default () => {
    const router = useRouter();

    useFocusEffect(() => {
        router.navigate({
            pathname: '/home/',
            params: {
              action: `searchDeeplink-${Date.now()}`
            }
        })
    });
}