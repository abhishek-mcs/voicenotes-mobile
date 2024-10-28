import dark from "assets/Colors/dark";
import light from "assets/Colors/light";
import React, { createContext, useContext, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "redux/store/store";

const ThemeContext = React.createContext({
    theme: "dark",
    Colors: light,
    setScheme: () => { },
});

export const ThemeProvider = ({ children }:any) => {
  const {savedTheme}:any=useSelector((state:RootState)=>state.userDetails)
  const [theme,setTheme] = useState<'light'|'dark'|'light-dark'|'auto'>('dark');

  const switchTheme = (scheme:any) => {
    setTheme(scheme);
  };

  const Colors = theme=="dark" ? dark : light;
  const value:any={Colors,switchTheme}
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
