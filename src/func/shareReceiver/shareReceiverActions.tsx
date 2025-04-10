import {router} from "expo-router";


export const createTextNote = (content: string): void => {
    router.push({
        pathname: "/text-note/",
        params: {content: content}, // Pass the content as a parameter
    });
};

export const createImageNote = (filePath: string): void => {
    router.push({
        pathname: "/text-note/",
        params: {
            content: "",
            imagePath: filePath ?? ''
        }
    });
};

export const createAudioNote = (fileUrl = '') => {
    router.push({
        pathname: "/home/",
        params: {
            action: `uploadSharedAudio-${Date.now()}`,
            filePath: fileUrl ?? ''
        }
    });
}
