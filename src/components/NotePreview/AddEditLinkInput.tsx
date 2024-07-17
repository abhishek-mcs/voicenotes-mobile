import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import axiosApi from 'services/api/axios-api';

interface AddEditLinkModalProps {
  noteId: string;
  onAttachmentUpdate: () => void;
  editingLink: { id: string; url: string } | null;
  isVisible: boolean;
  onClose: () => void;
}

const AddEditLinkModal: React.FC<AddEditLinkModalProps> = ({ 
  noteId,
  onAttachmentUpdate, 
  editingLink,
  isVisible,
  onClose
}) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (editingLink) {
      setUrl(editingLink.url);
    } else {
      setUrl('');
    }
  }, [editingLink, isVisible]);

  const handleSave = async () => {
    if (!url) {
      return;
    }

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
      // You might want to show an error message to the user here
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingLink ? 'Edit Link' : 'Add New Link'}
              </Text>
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
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave} disabled={!url?.length}>
                  <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  buttonContainer: {
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
    backgroundColor: Platform.OS === 'ios' ? '#007AFF' : '#2196F3',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButtonText: {
    color: Platform.OS === 'ios' ? '#007AFF' : '#2196F3',
  },
  saveButtonText: {
    color: '#fff',
  },
});

export default AddEditLinkModal;