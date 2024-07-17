import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import axiosApi from 'services/api/axios-api';

interface AddEditLinkBottomSheetProps {
  noteId: string;
  onAttachmentUpdate: () => void;
  editingLink: { id: string; url: string } | null;
  isVisible: boolean;
  onClose: () => void;
}

const AddEditLinkBottomSheet: React.FC<AddEditLinkBottomSheetProps> = ({ 
  noteId,
  onAttachmentUpdate, 
  editingLink,
  isVisible,
  onClose
}) => {
  const [url, setUrl] = React.useState('');
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['70%', '90%'], []);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
      if (editingLink) {
        setUrl(editingLink.url);
      } else {
        setUrl('');
      }
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible, editingLink]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  const handleSave = async () => {
    if (!url) return;
    try {
      let response;
      if (editingLink) {
        response = await axiosApi.patch(`/attachment/${editingLink.id}`, {
          type: 1,
          url: url
        });
      } else {
        response = await axiosApi.post(`/attachment/${noteId}`, {
          type: 1,
          url: url
        });
      }
      onAttachmentUpdate();
      onClose();
    } catch (error) {
      console.error("Error saving link:", error);
    }
  };

  useEffect(() => {
    return () => {
      onClose();
    };
  }, []);

  return (
    <Portal>
      <BottomSheet
        ref={bottomSheetRef}
        index={isVisible ? 0 : -1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        onClose={onClose}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={keyboardHeight}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.contentContainer}>
            <Text style={styles.title}>{editingLink ? 'Edit Link' : 'Add New Link'}</Text>
            <TextInput
              style={styles.input}
              value={url}
              onChangeText={setUrl}
              placeholder="Type or paste URL..."
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              autoFocus={true}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={onClose}>
                <Text style={styles.buttonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={handleSave}
                disabled={!url.length}
              >
                <Text style={styles.buttonTextSave}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </BottomSheet>
    </Portal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonTextCancel: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonTextSave: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddEditLinkBottomSheet;