import { useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react"
import Purchases from "react-native-purchases";
import { useDispatch } from "react-redux";
import { setIAPInfo, setIsIAPPurchased } from "redux/reducers/IAPStates";

export default () =>{
    const dispatch = useDispatch();
    return useFocusEffect(useCallback(()=>{
        (async()=>{
            try {
                const customerInfo = await Purchases.getCustomerInfo();
                dispatch(setIAPInfo(customerInfo))
                dispatch(setIsIAPPurchased(customerInfo?.activeSubscriptions?.length>0||false))
              } catch (e) {}
        })()
    },[]))
}