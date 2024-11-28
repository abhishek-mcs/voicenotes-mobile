// DialogContext.js
import { createContext, useContext, useState } from "react";
import { Alert } from "react-native";
import Dialog from "react-native-dialog";
import { isAndroid } from "utils/common";
import { useTheme } from "./theme-context";

interface DialogButton {
    text: string;
    onPress?: () => void;
    style?: string; // Optional style property
}

interface DialogContextType {
    showDialog: (
        title: string,
        description: string,
        buttons?: DialogButton[],
        options?: { userInterfaceStyle?: string } // Optional options object
    ) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error("useDialog must be used within a DialogProvider");
    }
    return context;
};

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [buttons, setButtons] = useState<DialogButton[]>([]);
    const {Colors} = useTheme()

    const showDialog: DialogContextType['showDialog'] = (title='', description='', buttonArray=[], options={}) => {
        const b:any=buttonArray
        const opt:any=options
        if(isAndroid){
            setTitle(title);
            setDescription(description);
            setButtons(buttonArray); // Assuming the second button is the confirm button
            setVisible(true);
        }else{
            Alert.alert(title,description,b,opt)
        }
    };

    const handleCancel = () => {
        setVisible(false);
    };
    
    return (
        <DialogContext.Provider value={{ showDialog }}>
            {children}
            <Dialog.Container visible={visible} onBackdropPress={handleCancel} contentStyle={{backgroundColor:Colors.bgColor6}}>
                {!!title&&<Dialog.Title style={{color:Colors.text}}>{title}</Dialog.Title>}
                {!!description&&<Dialog.Description style={{color:Colors.text}}>{description}</Dialog.Description>}
                {buttons.length>0?buttons.map((button:any, index) => (
                    button?.style?.includes('cancel')?
                    <Dialog.Button label="Cancel" onPress={handleCancel} />
                    :<Dialog.Button key={index} label={button?.text} onPress={()=>{
                        button?.onPress();
                        setVisible(false);
                    }} />
                )):
                <Dialog.Button label="Ok" onPress={handleCancel} />}
            </Dialog.Container>
        </DialogContext.Provider>
    );
};