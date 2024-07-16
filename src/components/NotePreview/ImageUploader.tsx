import React, { useState } from 'react';
import { View, Button, Image, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

const ImageUploader = () => {
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');

  const validateAndConvertImage = async (uri) => {
    const fileInfo = await FileSystem.getInfoAsync(uri);
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
    if (!result.cancelled) {
      try {
        const { uri, needsConversion } = await validateAndConvertImage(result.uri);
        setImage({ ...result, uri });
        setError('');
        if (needsConversion) {
          console.log('Image was converted from HEIC/HEIF to JPEG');
        }
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const selectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Permission to access media library was denied');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    handleImageSelection(result);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('Permission to access camera was denied');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    handleImageSelection(result);
  };

  const uploadImage = async () => {
    if (!image) {
      setError('No image selected');
      return;
    }

    try {
      const result = await FileSystem.uploadAsync('YOUR_UPLOAD_URL', image.uri, {
        fieldName: 'photo',
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload successful:', result);
      // Handle successful upload (e.g., show success message)
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload image');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Select from Gallery" onPress={selectImage} />
      <Button title="Take Photo" onPress={takePhoto} />
      <Button title="Upload Image" onPress={uploadImage} disabled={!image} />
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      {image && (
        <Image
          source={{ uri: image.uri }}
          style={{ width: 200, height: 200, marginTop: 20 }}
        />
      )}
    </View>
  );
};

export default ImageUploader;