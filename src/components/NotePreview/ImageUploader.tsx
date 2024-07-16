import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  View,
  Text,
  Platform,
  ActionSheetIOS,
  TouchableOpacity,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { sleep } from "utils/Timer";
import { ATTACHMENT_TYPE } from "types";
import axiosApi from "services/api/axios-api";
import axios from "axios";
import { generateRandomIdentifier } from "utils/formatBigNumber";

const ImageUploader = ({
  showImagePicker = false,
  setShowImagePicker = (x: boolean) => {},
  setAttachments = (x: object) => {},
  noteId,
}: {
  noteId: string;
  showImagePicker?: boolean;
  setShowImagePicker?: Dispatch<SetStateAction<never[]>>;
  setAttachments: Dispatch<SetStateAction<never[]>>;
}) => {
  const [error, setError] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const validateAndConvertImage = async (uri) => {
    console.log({ uri });
    const fileExtension = uri.split(".").pop().toLowerCase();

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
  };

  const handleImageSelection = async (result) => {
    if (!result.cancelled && result?.assets?.length > 0) {
      try {
        const newImage = await validateAndConvertImage(result?.assets[0].uri);
        const temporaryImageId = Math.random();
        setAttachments((attachments) => [
          ...attachments,
          {
            description: "",
            id: temporaryImageId,
            type: ATTACHMENT_TYPE.IMAGE,
            url: newImage.uri,
            is_uploading: true,
          },
        ]);
        await uploadImage(newImage);
        setAttachments((attachments) =>
          attachments.filter((item) => item.id != temporaryImageId)
        );
        setError("");
        if (needsConversion) {
          console.log("Image was converted from HEIC/HEIF to JPEG");
        }
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const launchImagePicker = async (type) => {
    let permission;
    let launch;

    if (type === "library") {
      permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      launch = ImagePicker.launchImageLibraryAsync;
    } else if (type === "camera") {
      permission = await ImagePicker.requestCameraPermissionsAsync();
      launch = ImagePicker.launchCameraAsync;
    }

    if (permission.status !== "granted") {
      setError(`Permission to access ${type} was denied`);
      return;
    }

    let result = await launch({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
    });

    handleImageSelection(result);
  };

  const uploadImage = async (newImage) => {
    console.log("Uploading image");
    const identifier = generateRandomIdentifier();

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: newImage.uri,
        name: "photo.jpg",
        type: "image/jpeg", // Adjust this if you need to support other image types
      } as any);
      formData.append("type", "2");
      formData.append("identifier", identifier);

      const result = await axiosApi.post(`/attachment/${noteId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Upload successful:", result.data);
    } catch (error) {
      console.error("Upload error:", error);
      if (axios.isAxiosError(error)) {
        setError(
          "Failed to upload image: " +
            (error.response?.data?.message || error.message)
        );
      } else {
        setError(
          "Failed to upload image: " +
            (error instanceof Error ? error.message : String(error))
        );
      }
    }
  };

  const openImagePickerMenu = async () => {
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
    } else {
      setIsModalVisible(true);
    }
  };

  useEffect(() => {
    if (showImagePicker) {
      openImagePickerMenu();
    }
  }, [showImagePicker]);

  if (!showImagePicker) return null;

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {Platform.OS === "android" && (
        <Modal
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => {
            setIsModalVisible(false);
            setShowImagePicker(false);
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <View style={{ backgroundColor: "white", padding: 20 }}>
              <TouchableOpacity
                onPress={() => {
                  setIsModalVisible(false);
                  launchImagePicker("camera");
                }}
              >
                <Text style={{ fontSize: 18, padding: 10 }}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setIsModalVisible(false);
                  launchImagePicker("library");
                }}
              >
                <Text style={{ fontSize: 18, padding: 10 }}>
                  Choose from Library
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={{ fontSize: 18, padding: 10, color: "red" }}>
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
