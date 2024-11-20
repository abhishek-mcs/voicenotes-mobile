import dark from "assets/Colors/dark";
import light from "assets/Colors/light";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setSavedTheme } from "redux/reducers/userDetails";
import { RootState } from "redux/store/store";

const ThemeContext = React.createContext({
    theme: "dark",
    isLightMode: true,
    Colors: light,
    switchTheme: (v:string) => { },
});

export const ThemeProvider = ({ children }:any) => {
  const {savedTheme}:any=useSelector((state:RootState)=>state.userDetails)
  const colorScheme = useColorScheme()
  const dispatch = useDispatch()
  const [theme,setTheme] = useState<'light'|'dark'|'light-dark'|'auto'>(savedTheme||'auto');
  
  const switchTheme = (scheme:any) => {
    setTheme(scheme);
    dispatch(setSavedTheme(scheme))
  };
  
  const isLightMode = theme=="auto"? colorScheme=="light" : theme == "light"
  const Colors = theme=="auto"? (colorScheme=='dark'? dark : light ):( theme=="dark" ? dark : light);
  const value:any={Colors,switchTheme,isLightMode,theme}
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
