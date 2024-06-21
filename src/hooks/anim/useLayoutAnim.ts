import { useEffect } from "react";
import { LayoutAnimation } from "react-native";

const useLayoutAnim = (dependency:any[]) => {
  
  const layoutAnimation = () => {
    LayoutAnimation.configureNext({
      duration: 250,
      create: {
        type: LayoutAnimation.Types.easeIn,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeOut,
        property: LayoutAnimation.Properties.opacity,
      },
      delete: {
        type: LayoutAnimation.Types.easeOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
  }

  useEffect(() => {
    layoutAnimation();
  }, dependency);
};

export default useLayoutAnim;
