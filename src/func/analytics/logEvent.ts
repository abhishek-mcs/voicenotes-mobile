import appsFlyer from "react-native-appsflyer";

export const logEvent = async (event='af_login',value={value:'success'}) => {
    try {
      appsFlyer.getAppsFlyerUID((uid) => {
        console.log("📌 Appsflyer UID:", uid);
  
        appsFlyer.logEvent(
          event,
          value,
          (res) => console.log("✅ Appsflyer login event success:", res),
          (err) => console.log("❌ Appsflyer login event failed:", err)
        );
      });
    } catch (error) {
      console.log("⚠️ Appsflyer Tracking Error:", error);
    }
  };