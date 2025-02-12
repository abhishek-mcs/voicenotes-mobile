import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, InteractionManager } from 'react-native';
import BottomSheet, { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import axiosApi from 'services/api/axios-api';
import { SafeAreaView } from 'react-native-safe-area-context';
import Touchable from 'components/common/Touchable';
import { isIOS, screenWidth } from 'utils/common';
import { useQueryClient } from 'react-query';
import { useTheme } from 'context';
import ThreeDotLoader from 'components/common/loaders/three-dot-loader';

export const CustomBackdrop = ({ style }: BottomSheetBackdropProps) => {
  const { Colors} = useTheme()
  return (
    <SafeAreaView
      style={[
        style,
        {
          backgroundColor: Colors.bgColor10(1), 
        },
      ]}
    >
      <View style={{borderRadius:12,marginHorizontal:16,backgroundColor:Colors.bgColor10(1),flex:1,width:screenWidth-32}}/>
    </SafeAreaView>
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
  const queryClient = useQueryClient();
  const [url, setUrl] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const textInputRef = useRef<TextInput>(null);
  const snapPoints = useMemo(() => [ isIOS ?  '94%' : '99%'], []);
  const { Colors } = useTheme()
  const styles = useStyles()

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
    setIsLoading(true)
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
      queryClient.resetQueries('single-recording');
    } catch (error) {
      setIsLoading(false)
      console.error("Error saving link:", error);
    }finally{
      setIsSaving(false)
      setIsLoading(false)
    }
  };

  const isSaveDisabled = useMemo(() =>!url?.length || isSaving, [url, isSaving]);

  return (
    <Portal>
      <BottomSheet
        enableOverDrag={false}
        style={styles.bottomSheet}
        backgroundStyle={{backgroundColor:Colors.bgColor8}}
        // backdropComponent={CustomBackdrop}
        ref={bottomSheetRef}
        index={isVisible ? 0 : -1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        onClose={onClose}
        handleStyle={{ backgroundColor: Colors.bgColor8 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Touchable
              onPress={onClose}
              style={styles.headerButton}
              activeOpacity={0.6}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Touchable>
            {isLoading ? (
              <View style={{ alignSelf: "flex-end" }}>
                <ThreeDotLoader
                style={{marginTop:-16,marginRight:-8}}
                  colorFilters={[
                    { keypath: "Left", color: Colors.text },
                    { keypath: "Mid", color: Colors.text },
                    { keypath: "Right", color: Colors.text },
                  ]}
                />
              </View>
            ) : (
              <Touchable
                disabled={isSaveDisabled}
                onPress={handleSave}
                style={styles.headerButton}
                activeOpacity={0.6}
              >
                <Text
                  style={{
                    ...styles.saveText,
                    color: isSaveDisabled ? Colors.grey : Colors.blue,
                  }}
                >
                  Save
                </Text>
              </Touchable>
            )}
          </View>
          <View style={styles.separator} />

          <Text style={styles.title}>
            {editingLink ? "Edit Link" : "Add New Link"}
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              ref={textInputRef}
              defaultValue={url}
              keyboardType="url"
              onChangeText={(url) => setUrl(url)}
              placeholder="Type or Paste URL"
              placeholderTextColor={Colors.grey3}
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

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
  bottomSheet: {
    marginTop: isIOS?0:20,
    paddingTop: 0,
    color: Colors.grey,
    backgroundColor:Colors.bgColor8,
    overflow:'hidden',
    borderTopEndRadius:12,
    borderTopStartRadius:12,
  },
  container: {
    flex: 1,
    backgroundColor:Colors.bgColor8,
  },
  content: {
    flex: 1,
    backgroundColor:Colors.bgColor8,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 8,
  },
  iosHandle: {
    height: 5,
    width: 36,
    alignSelf: 'center',
    backgroundColor: Colors.grey5WithOpacity(0.3),
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
    color:Colors.text
  },
  inputContainer: {
    marginHorizontal: 24,
  },
  input: {
    color: Colors.text1,
    fontFamily: 'Primary',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.inputBg2,
  },
}), [Colors]); // Recreate styles when Colors change
};

export default AddEditLinkBottomSheet;