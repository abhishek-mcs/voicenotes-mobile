import React, { Dispatch, SetStateAction, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Platform,
  ActionSheetIOS,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { sleep } from "utils/Timer";
import { ATTACHMENT_TYPE } from "types";
import axiosApi from "services/api/axios-api";
import { generateRandomIdentifier } from "utils/formatBigNumber";
import { useQueryClient } from "react-query";
import { useTheme } from "context";
import { useDialog } from "context/DialogContext";


interface ImageUploaderProps {
  noteId: string;
  showImagePicker: boolean;
  setShowImagePicker: Dispatch<SetStateAction<boolean>>;
  setAttachments: (v:any)=>void;
  onAttachmentUpdate: () => Promise<void>;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  noteId,
  showImagePicker,
  setShowImagePicker,
  setAttachments,
  onAttachmentUpdate,
}) => {
  const { Colors, isLightMode } = useTheme()
  const queryClient = useQueryClient();
  const {showDialog} = useDialog()
  const validateAndConvertImage = useCallback(async (uri: string) => {
    const fileExtension:string = uri?.split(".").pop()?.toLowerCase()??'';
    if (["jpg", "jpeg", "png"].includes(fileExtension)) {
      return { uri, needsConversion: false };
    } else if (["heic", "heif"].includes(fileExtension)) {
      try {
        const convertedImage = await ImageManipulator.manipulateAsync(uri, [], {
          format: ImageManipulator.SaveFormat.JPEG,
        });
        return { uri: convertedImage.uri, needsConversion: true };
      } catch (error) {
        console.error("Error converting image:", error);
        throw new Error("Failed to convert HEIC/HEIF image to JPEG");
      }
    } else {
      throw new Error(
        "Invalid file type. Please select a JPG, PNG, HEIC, or HEIF image."
      );
    }
  }, []);

  const uploadImage = useCallback(async (newImage: { uri: string }) => {
    const identifier = generateRandomIdentifier();

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: newImage.uri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);
      formData.append("type", "2");
      formData.append("identifier", identifier);

      const result = await axiosApi.post(`/attachment/${noteId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if(result){
        queryClient.resetQueries("single-recording")
        console.log('Upload successfull');
      }
      
    } catch (error) {
      console.error("Upload error:", error);
      showDialog(
        "Upload Error",
        "Failed to upload image. Please try again later."
      ,[],{userInterfaceStyle:isLightMode?"light":"dark"});
    }
  }, [noteId]);

  const handleImageSelection = useCallback(async (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets?.length > 0) {
      result.assets?.forEach(async(itm)=>{
        const newImage = await validateAndConvertImage(itm?.uri);
        const temporaryImageId = Math.random();
        setAttachments((prevAttachments:any) => [
          ...prevAttachments,
          {
            description: "",
            id: temporaryImageId,
            type: ATTACHMENT_TYPE.IMAGE,
            url: newImage.uri,
            is_uploading: true,
          },
        ]);
        handleSelectedImage(newImage,temporaryImageId)
      })
    }},[validateAndConvertImage, setAttachments])

  const handleSelectedImage = useCallback(async (newImage:any,temporaryImageId:any) => {
      try {
        await uploadImage(newImage);
        await onAttachmentUpdate();
        setAttachments((prevAttachments:any) =>
          prevAttachments.filter((item:any) => item.id !== temporaryImageId)
        );
        if (newImage.needsConversion) {
          console.log("Image was converted from HEIC/HEIF to JPEG");
        }
      } catch (error) {
        console.log("Error in uploading image: " + error);
        showDialog("Error", "Failed to upload image. Please try again.",[],{userInterfaceStyle:isLightMode?"light":"dark"});
      }
  }, [uploadImage, onAttachmentUpdate]);

  const launchImagePicker = useCallback(async (type: "library" | "camera") => {
    try{
    let permission: ImagePicker.MediaLibraryPermissionResponse | ImagePicker.CameraPermissionResponse;
    let launch: () => Promise<ImagePicker.ImagePickerResult>;

    if (type === "library") {
      permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      launch = () => ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
        allowsMultipleSelection:true
      });
    } else {
      permission = await ImagePicker.requestCameraPermissionsAsync();
      launch = () => ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
        allowsMultipleSelection:true
      });
    }

    if (permission?.status !== "granted") {
      showDialog("Permission Denied", `Permission to access ${type} was denied`,[],{userInterfaceStyle:isLightMode?"light":"dark"});
      return;
    }

    const result = await launch();
    handleImageSelection(result);
  } catch (error) {
    showDialog("", "Failed to access camera or library. Please try again later.",[],{userInterfaceStyle:isLightMode?"light":"dark"});
  }
  }, [handleImageSelection]);

  const openImagePickerMenu = useCallback(async () => {
    if (Platform.OS === "ios") {
      await sleep(300);
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Library"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            launchImagePicker("camera");
          } else if (buttonIndex === 2) {
            launchImagePicker("library");
          }
          setShowImagePicker(false);
        }
      );
    }
  }, [launchImagePicker, setShowImagePicker]);

  useEffect(() => {
    if (showImagePicker) {
      openImagePickerMenu();
    }
  }, [showImagePicker, openImagePickerMenu]);

  if (!showImagePicker) return null;

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {Platform.OS === "android" && (
        <Modal
          transparent={true}
          visible={showImagePicker}
          onRequestClose={() => setShowImagePicker(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: Colors.bgColor10(0.5),
            }}
          >
            <View style={{ backgroundColor: Colors.bgColor2, padding: 20}}>
              <TouchableOpacity
                onPress={() => {
                  setShowImagePicker(false);
                  launchImagePicker("camera");
                }}
              >
                <Text style={{ fontSize: 18, padding: 10,color:Colors.text }}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowImagePicker(false);
                  launchImagePicker("library");
                }}
              >
                <Text style={{ fontSize: 18, padding: 10,color:Colors.text }}>
                  Choose from Library
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowImagePicker(false)}>
                <Text style={{ fontSize: 18, padding: 10, color: Colors.redWithOpacity(1) }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default ImageUploader;