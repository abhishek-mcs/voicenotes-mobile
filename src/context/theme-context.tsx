import Colors from "assets/Colors";
import React, { createContext, useContext, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "redux/store/store";

const ThemeContext = React.createContext({
    isDark: false,
    colors: Colors.light,
    setScheme: () => { },
});

export const ThemeProvider = ({ children }:any) => {
    const {savedTheme}:any=useSelector((state:RootState)=>state.userDetails)
  const [theme,setTheme] = useState<'light'|'dark'|'light-dark'|'auto'>(!!savedTheme?savedTheme:'light');

  const switchTheme = (scheme:any) => {
    setTheme(scheme);
  };

  const colors = theme=="dark" ? Colors.dark :theme=="light-dark"?Colors.dark: Colors.light;
  const value:any={colors,switchTheme}
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
