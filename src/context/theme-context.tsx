import dark from "assets/Colors/dark";
import light from "assets/Colors/light";
import React, { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "redux/store/store";

const ThemeContext = React.createContext({
    theme: "dark",
    isLightMode: true,
    Colors: light,
    setScheme: () => { },
});

export const ThemeProvider = ({ children }:any) => {
  const {savedTheme}:any=useSelector((state:RootState)=>state.userDetails)
  const colorScheme = useColorScheme()
  const [theme,setTheme] = useState<'light'|'dark'|'light-dark'|'auto'>('dark');

  const switchTheme = (scheme:any) => {
    setTheme(scheme);
  };
  const isLightMode = theme=="auto"? colorScheme=="light" : theme == "light"
  const Colors = theme=="auto"? colorScheme : theme=="dark" ? dark : light;
  const value:any={Colors,switchTheme,isLightMode}
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
