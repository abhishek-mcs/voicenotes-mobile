import { ContextMenuAction } from "react-native-context-menu-view";

export type MenuOptionsType = {
    title: string;
    onPress: (() => void) | false;
    androidIcon?: string;
    actions?: MenuOptionsType[];
    searchable?: boolean;
}

export interface MenuProps {
    options: MenuOptionsType[];
    style?: any;
    children: React.ReactNode;
    isNative?: boolean;
}