import { Stack } from "expo-router";

export default function Layout() {
    return(
        <Stack>
            <Stack.Screen
                name="index"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="bio"
                options={{
                    animation: "slide_from_right",
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="publication"
                options={{
                    animation: "slide_from_right",
                    headerShown: false
                }}
            />
        </Stack>
    )
}