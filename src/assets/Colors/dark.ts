const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';
const primary = '#000';
const secondary='rgba(255, 255, 255, 0.12)';
const tertiary='rgba(33, 33, 33, 1)'
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
  primary: 'rgba(14, 57, 52, 1)', // Darker version of the primary color
  primaryWithOpacity: (opacity:number) => `rgba(39, 79, 71, ${opacity})`,
  darkWithOpacity: (opacity:number) => `rgba(34, 34, 34, ${opacity})`, // Same as in light mode
  blackWithOpacity: (opacity:number) => `rgba(255, 255, 255, ${opacity})`, // Lightening for readability
  whiteWithOpacity: (opacity:number) => `rgba(0, 0, 0, ${opacity})`, // Same as in light mode
  greyWithOpacity: (opacity:number) => `rgba(180, 180, 180, ${opacity})`, // Slightly lighter for dark mode
  grey2WithOpacity: (opacity:number) => `rgba(255, 255, 255, ${opacity})`, // Darker version for background
  grey3WithOpacity: (opacity:number) => `rgba(113, 113, 113, ${opacity})`, // Same grey for consistency
  greenWithOpacity: (opacity:number) => `rgba(88, 169, 66, ${opacity})`, // Keep accent color
  green2WithOpacity: (opacity:number) => `rgba(73, 144, 53, ${opacity})`,
  green3WithOpacity: (opacity:number) => `rgba(39, 79, 71, ${opacity})`, // Adjusted for dark mode
  green4WithOpacity: (opacity:number) => `rgba(110, 217, 64, ${opacity})`, // Accent colors unchanged
  grey4WithOpacity: (opacity:number) => `rgba(221, 221, 221, 0.25)`, // Slightly darker for readability
  grey5WithOpacity: (opacity:number) => `rgba(100, 100, 107, ${opacity})`, // Darker shade for background elements
  redWithOpacity: (opacity:number) => `rgba(255, 99, 79, ${opacity})`, // Slightly lighter red for dark mode
  lightBlueWithOpacity: (opacity:number) => `rgba(60,110,180, ${opacity})`, // Keep blue consistent but adjusted slightly
  lightRoseWithOpacity: (opacity:number) => `rgba(120, 110, 110, ${opacity})`, // More muted for dark mode
  yellowWithOpacity: (opacity:number) => `rgba(214, 162, 67, ${opacity})`, // Accent yellow unchanged
  grey: '#c5c5c5', // Slightly lighter grey for dark mode
  green: '#6fb573', // Darker green for dark mode
  green2: '#4e7f56', // Darker shade of secondary green
  lightGrey: '#303030', // Darker background grey
  grey3: '#828282', // Slightly adjusted grey for text
  grey4: '#444444', // Darker grey for secondary elements
  grey5: 'rgba(60, 60, 67, 1)', // Same opacity color as original
  grey6: '#a3a3a3', // Lighter grey for readability
  grey7: '#4d4d4d', // Adjusted darker shade
  grey8: '#3b3b3b', // Darker grey for background elements
  grey9: '#888888', // Lighter grey for dark mode text
  grey10: '#6d6d6d', // Darker shade of grey for muted elements
  brownWithOpacity: (opacity:number) => `rgba(140, 97, 50, ${opacity})`, // Darker brown
  black2: `#f5f5f5`, // Inverted to light color for text readability
  blue: '#5397FF', // Slightly lighter blue for dark mode accents
  white1: '#3a3a3a', // Darker background
  white2: '#2f2f2f', // Even darker version
  white3: '#383838', // Darker shade for cards or surfaces
  white4: '#2d2d2d', // Background grey for dark mode
  lightBlue: 'rgba(60,110,180,1)', // Adjusted for consistency
  darkBlue: "#0D0F59", // Darker blue for dark mode
  yellow: "rgba(214, 162, 67, 1)", // Accent yellow unchanged
  bgColor:'#000',
  bgColor1:'#0d0d0d',
  bgColor2:'#171717',
  bgColor3: (opacity:number) => secondary,
  bgColor4:'#0d0d0d',
  bgColor5:tertiary,
  bgColor6:tertiary,
  bgColor7:tertiary,
  bgColor8:'#0d0d0d',
  bgColor9:'#000',
  dragBar:'rgba(60, 60, 67, 0.3)',
  streak1:'#343434',
  streak2:'#171717',
  inputBg:'#000',
  inputBg2:secondary,
  inputBg3:secondary,
  text:'#fff',
  text1:'#9b9b9b',
  text2:'#222',
  text3:'rgba(221, 221, 221, 0.5)',
  text4:'#fff',
  text5:'#fff',
  bottomBarButtonBg:'rgba(255, 69, 56, 0.15)',
  bottomBarCancelBg:'rgba(255, 69, 56, 0.15)',
  bottomBarButtonBg1:tertiary,
  settingsBtnBg:tertiary,
  settingsBtnText:'#fff',
  bottomBarText:'#fff',
  bottomBarText1:'#fff',
  more:'#fff',
  underlayColorBlack:"rgba(0,0,0,0.7)",
  refresh:'#fff',
  emptyShare:'#9b9b9b',
  suggestionBg:tertiary,
  border:secondary,
  askClose:'#ffffff',
  askLogo:'#ffffff',
  upgradeBtn:'#0d0d0d',
  upgrade:tertiary,
  pricing:secondary,
  pricingSelected:secondary,
  back:'#FFFFFF',
};
