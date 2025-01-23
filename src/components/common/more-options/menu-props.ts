import { ContextMenuAction } from "react-native-context-menu-view";

export interface MenuProps {
    options: {
        title: string;
        systemIcon?: string;
        androidIcon?: string;
        onPress?: () => void;
        actions?: Array<{
            title: string;
            onPress: () => void;
            androidIcon?: string;
            searchable?: boolean;
        }>;
        destructive?: boolean;
    }[];
    style?: any;
    children: React.ReactNode;
    isNative?: boolean;
}