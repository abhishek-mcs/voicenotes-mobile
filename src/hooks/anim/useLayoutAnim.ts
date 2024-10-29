import { useEffect } from "react";
import { LayoutAnimation } from "react-native";

const useLayoutAnim = (dependency:any[]) => {
  
  const layoutAnimation = () => {
    LayoutAnimation.configureNext({
      duration: 250,
      create: 
      {
         type: LayoutAnimation.Types.easeInEaseOut,
         property: LayoutAnimation.Properties.opacity,
      },
      update: 
      {
         type: LayoutAnimation.Types.easeInEaseOut,
      }
     });
  }

  useEffect(() => {
    layoutAnimation();
  }, dependency);
};

export default useLayoutAnim;
