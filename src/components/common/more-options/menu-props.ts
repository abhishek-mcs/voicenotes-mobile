import { ContextMenuAction } from "react-native-context-menu-view";

export default interface menuProps { title: string, subtitle?: string, systemIcon?: string, icon?: string, iconColor?: string, destructive?: boolean, selected?: boolean, disabled?: boolean, inlineChildren?: boolean, actions?: Array<ContextMenuAction> }