import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, Keyboard, InteractionManager } from 'react-native';
import BottomSheet, { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import axiosApi from 'services/api/axios-api';
import { SafeAreaView } from 'react-native-safe-area-context';
import Touchable from 'components/common/Touchable';
import Colors from 'assets/Colors';
import { isIOS } from 'utils/common';

const CustomBackdrop = ({ style }: BottomSheetBackdropProps) => {
  return (
    <View
      style={[
        style,
        {
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        },
      ]}
    />
  );
};

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
  const [isSaving, setIsSaving] = React.useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const textInputRef = useRef<TextInput>(null);
  const snapPoints = useMemo(() => [ isIOS ?  '94%' : '95%'], []);

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
      if (editingLink) {
        setUrl(editingLink.url);
      } else {
        setUrl('');
      }
      focusTextInput();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible, editingLink]);

  const focusTextInput = () => {
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
    });
  };

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    } else if (index === 0) {
      focusTextInput();
    }
  }, [onClose]);

  const handleSave = async () => {
    if (!url) return;

    let httpUrl = url;
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      httpUrl = `http://${url}`;
    }
    setUrl(httpUrl);
    setIsSaving(true)

    try {
      if (editingLink) {
        await axiosApi.patch(`/attachment/${editingLink.id}`, {
          type: 1,
          url: httpUrl
        });
      } else {
        await axiosApi.post(`/attachment/${noteId}`, {
          type: 1,
          url: httpUrl
        });
      }
      onAttachmentUpdate();
      onClose();
    } catch (error) {
      console.error("Error saving link:", error);
    }finally{
      setIsSaving(false)
    }
  };

  const isSaveDisabled = useMemo(() =>!url?.length || isSaving, [url, isSaving]);

  return (
    <Portal>
      <BottomSheet
        style={styles.bottomSheet}
        backdropComponent={CustomBackdrop}
        ref={bottomSheetRef}
        index={isVisible ? 0 : -1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        onClose={onClose}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Touchable onPress={onClose} style={styles.headerButton} activeOpacity={0.6}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Touchable>
            <Touchable disabled={isSaveDisabled} onPress={handleSave} style={styles.headerButton} activeOpacity={0.6}>
              <Text style={{ ...styles.saveText,color: isSaveDisabled? Colors.grey :"#007AFF" }}>Save</Text>
            </Touchable>
          </View>
          <View style={styles.separator} />

          <Text style={styles.title}>{editingLink ? 'Edit Link' : 'Add New Link'}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              ref={textInputRef}
              defaultValue={url}
              keyboardType="url"
              onChangeText={url=>setUrl(url)}
              placeholder="Type or Paste URL"
              placeholderTextColor="#717171"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              autoComplete="off"
            />
          </View>
        </View>
      </BottomSheet>
    </Portal>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    marginTop: 0,
    paddingTop: 0,
    color: 'gray',
    backgroundColor:'gray'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.darkWithOpacity(0.1),
    marginTop: 8,
  },
  iosHandle: {
    height: 5,
    width: 36,
    alignSelf: 'center',
    backgroundColor: 'rgba(60, 60, 67, 0.3)',
    borderRadius: 20,
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 0,
    marginHorizontal: 12,
  },
  headerButton: {
    padding: 0,
    paddingTop: 0,
    paddingBottom: 8,
  },
  cancelText: {
    fontFamily: 'Primary',
    fontSize: 16,
    color: Colors.grey,
  },
  saveText: {
    fontFamily: 'Primary-Semibold',
    fontSize: 16,

  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 10,
  },
  inputContainer: {
    marginHorizontal: 24,
  },
  input: {
    color: '#222',
    fontFamily: 'Primary',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.darkWithOpacity(0.05),
  },
});

export default AddEditLinkBottomSheet;