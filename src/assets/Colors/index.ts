const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';
const primary = 'rgba(14, 57, 52, 1)';
export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
  primary,
  primaryWithOpacity: (opacity:number) => `rgba(39, 79, 71, ${opacity})`,
  darkWithOpacity: (opacity:number) => `rgba(34, 34, 34, ${opacity})`,
  blackWithOpacity: (opacity:number) => `rgba(0, 0, 0, ${opacity})`,
  whiteWithOpacity: (opacity:number) => `rgba(255, 255, 255, ${opacity})`,
  greyWithOpacity: (opacity:number) => `rgba(130, 130, 130, ${opacity})`,
  grey2WithOpacity: (opacity:number) => `rgba(13, 13, 13, ${opacity})`,
  greenWithOpacity: (opacity:number) => `rgba(88, 169, 66, ${opacity})`,
  grey:'#9b9b9b',
  green:'#58a942',
  lightGrey:'#f9f9f9',
  grey3:'#717171',
  brownWithOpacity: (opacity:number) => `rgba(214,162,67,${opacity})`,
  black2:`#0d0d0d`,
};
