import Premium from "components/premium";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { AppEventsLogger } from "react-native-fbsdk-next";

export default (props: any) => {
  const { from = "home", email = "" } = useLocalSearchParams();

  useEffect(() => {
    if (email)
      AppEventsLogger.logEvent(
        AppEventsLogger.AppEvents.CompletedRegistration,
        {
          [AppEventsLogger.AppEventParams.RegistrationMethod]: `${email}`,
        }
      );
  }, [email]);

  return <Premium />;
};
