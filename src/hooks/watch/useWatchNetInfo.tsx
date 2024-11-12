import { useNetInfo } from "@react-native-community/netinfo";
import { useEffect } from "react";
import { sendMessage } from "react-native-watch-connectivity";
import { isIOS } from "utils/common";

export default ()=>{
    const netInfo = useNetInfo();
  
    useEffect(() => {
      isIOS&&
      sendMessage(
        {internetType: netInfo.type}, 
        reply => {console.log(reply)},
        error => { 
            if (error) { 
              console.log("error", error)
            }
        }
      )
    }, [netInfo.type]);
}