import { useEffect } from "react";
import { isAndroid } from "utils/common";
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import IAPKeys from "utils/constants/IAPKeys";
import { useDispatch } from "react-redux";
import { setIAPOffering } from "redux/reducers/IAPStates";

export default () =>{
    const dispatch = useDispatch();
    return useEffect(() => {
        const setup = async () => {
          if (isAndroid) {
            await Purchases.configure({ apiKey: IAPKeys.google });
          } else {
            await Purchases.configure({ apiKey: IAPKeys.apple });
          }
          
          const offerings = await Purchases.getOfferings();
          dispatch(setIAPOffering(offerings.current));
        };
    
        Purchases.setLogLevel(LOG_LEVEL.ERROR);
    
        setup()
          .catch(console.log);
      }, []);
}