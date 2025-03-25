import { useEffect } from "react";
import database from "@react-native-firebase/database";
import * as Application from "expo-application";
import { isIOS } from "utils/common";
import * as Linking from "expo-linking";
import { useDialog } from "context/DialogContext";
import { useTheme } from "context";

export const useForceUpdateCheck = () => {
  const { showDialog } = useDialog();
  const { isLightMode } = useTheme();

  useEffect(() => {
    const checkForUpdate = async () => {
      try {
        database().ref("/app_versions").keepSynced(true)
        const snapshot = await database().ref("/app_versions").once("value");

        if (snapshot.exists()) {
          const data = snapshot.val();
          const installedVersion = Application.nativeApplicationVersion;
          const currentVersion = installedVersion ?? "2.0.0";
          const latestVersion = isIOS ? data?.ios??'1.0.0' : data?.android??'1.0.0';

          if (currentVersion < latestVersion) {
            showDialog(
              data?.title??'Update Required',
              data?.message??'A new version of the app is available. Please update to continue.',
              [
                {
                  text: "Update Now",
                  onPress: () => {
                    const storeURL = isIOS
                      ? "https://apps.apple.com/app/id6483293628"
                      : "https://play.google.com/store/apps/details?id=com.app.voicenotes";
                    Linking.openURL(storeURL);
                  },
                },
              ],
              {
                cancelable: false,
                userInterfaceStyle: isLightMode ? "light" : "dark",
              }
            );
          }
        }
      } catch (error) {
        console.error("Error checking app version:", error);
      }
    };

    checkForUpdate();
  }, []);
};
