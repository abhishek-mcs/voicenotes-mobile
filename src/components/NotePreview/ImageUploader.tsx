import React, { useEffect, useState } from 'react';
import { View, Button, Image, Text, Platform, ActionSheetIOS, TouchableOpacity, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const ImageUploader = ({showImagePicker = false, setShowImagePicker = (x:boolean)=>{}}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const validateAndConvertImage = async (uri) => {
    console.log({uri});
    const fileExtension = uri.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
      return { uri, needsConversion: false };
    } else if (['heic', 'heif'].includes(fileExtension)) {
      try {
        const convertedImage = await ImageManipulator.manipulateAsync(
          uri,
          [],
          { format: ImageManipulator.SaveFormat.JPEG }
        );
        return { uri: convertedImage.uri, needsConversion: true };
      } catch (error) {
        console.error('Error converting image:', error);
        throw new Error('Failed to convert HEIC/HEIF image to JPEG');
      }
    } else {
      throw new Error('Invalid file type. Please select a JPG, PNG, HEIC, or HEIF image.');
    }
  };

  const handleImageSelection = async (result) => {
    if (!result.cancelled && result?.assets?.length > 0) {
      try {
        const { uri, needsConversion } = await validateAndConvertImage(result?.assets[0].uri);
        console.log({uri, needsConversion});
        
        setSelectedImage({ ...result, uri });
        setError('');
        if (needsConversion) {
          console.log('Image was converted from HEIC/HEIF to JPEG');
        }
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const launchImagePicker = async (type) => {
    let permission;
    let launch;

    if (type === 'library') {
      permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      launch = ImagePicker.launchImageLibraryAsync;
    } else if (type === 'camera') {
      permission = await ImagePicker.requestCameraPermissionsAsync();
      launch = ImagePicker.launchCameraAsync;
    }

    if (permission.status !== 'granted') {
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

  const uploadImage = async () => {
    if (!selectedImage) {
      setError('No image selected');
      return;
    }

    try {
      const result = await FileSystem.uploadAsync('YOUR_UPLOAD_URL', selectedImage.uri, {
        fieldName: 'photo',
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload successful:', result);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload image');
    }
  };

  const openImagePickerMenu = async () => {
    if (Platform.OS === 'ios') {
      await  sleep(200);
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            launchImagePicker('camera');
          } else if (buttonIndex === 2) {
            launchImagePicker('library');
          }
          setShowImagePicker(false);

        }
      );
    } else {
      setIsModalVisible(true);
    }
  };

  useEffect(()=>{
    if(showImagePicker){
      openImagePickerMenu()
    }
  },[showImagePicker])
  useEffect(()=>{
    setSelectedImage(null)
  },[])

  console.log({showImagePicker});
  

  if(!showImagePicker) return null
  console.log({selectedImage});
  

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {selectedImage && <Button title="Upload Image" onPress={uploadImage} disabled={!selectedImage} />}
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      {selectedImage && (
        <Image
          source={{ uri: selectedImage.uri }}
          style={{ width: 200, height: 200, marginTop: 20 }}
        />
      )}

      {Platform.OS === 'android' && (
        <Modal
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() =>{
            setIsModalVisible(false);
            setShowImagePicker(false);
          }
          }
        >
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ backgroundColor: 'white', padding: 20 }}>
              <TouchableOpacity onPress={() => { setIsModalVisible(false); launchImagePicker('camera'); }}>
                <Text style={{ fontSize: 18, padding: 10 }}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setIsModalVisible(false); launchImagePicker('library'); }}>
                <Text style={{ fontSize: 18, padding: 10 }}>Choose from Library</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={{ fontSize: 18, padding: 10, color: 'red' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default ImageUploader;