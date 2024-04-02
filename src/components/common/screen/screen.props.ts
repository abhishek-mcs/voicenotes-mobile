import { ViewStyle } from "react-native"
import { KeyboardOffsets, ScreenPresets } from "./screen.presets"

export interface ScreenProps {
  children?: React.ReactNode

  style?: ViewStyle|ViewStyle[]

  preset?: ScreenPresets | undefined

  backgroundColor?: string

  statusBar?: "light-content" | "dark-content"

  statusBarColor?: string

  /**
   * Should we not wrap in SafeAreaView? Defaults to false.
   */
  unsafe?: boolean

  /**
   * By how much should we offset the keyboard? Defaults to none.
   */
  keyboardOffset?: KeyboardOffsets

  navigation?: any

  navbarStyle?: ViewStyle
}
