import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  SafeAreaView,
  InteractionManager,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SvgXml } from "react-native-svg";
import { home } from "assets/svg/home";
import { useTheme } from "context";
import { isIOS } from "utils/common";
import ThreeDotLoader from "components/common/loaders/three-dot-loader";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import ImageUploader from "components/NotePreview/ImageUploader";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import CircularLoader from "components/common/loaders/circular-loader";
import { usePostRecord } from "queries/home";
import { NewNote } from "types";
import { useDispatch, useSelector } from "react-redux";
import { setRecordingList, setTempRecordingData } from "redux/reducers/recordingStates";
import { RootState } from "redux/store/store";
import { useFirebaseRecordingListener } from "hooks/firebase-listeners/useFirebaseRecordingListener";

const TextNote = () => {
  const router = useRouter();
  const {content}:any = useLocalSearchParams();
  const { Colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [textnote, setTextnote] = useState(content??"");
  const inputRef: any = useRef<TextInput>();
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const styles = useStyles()
  const textNoteMutation = usePostRecord()
  const dispatch = useDispatch()
  const { recordingList } = useSelector((state:RootState)=>state.recordingStates)
  const { listenToFirebaseStatus } = useFirebaseRecordingListener()

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      inputRef.current?.focus();
    });
  }, []);

  const onCancel = () => router?.back();

  const onDone = async() => {
    const temporaryRecordingId = Math.random().toString(36).substring(7);
    const newTemporaryRecording: NewNote = {
      id: temporaryRecordingId,
      temp_id:temporaryRecordingId,
      audio: { data: { url: null, duration:null } },
      isUploading: true,
      title: `New Recording`,
      transcript: null,
      recorded_at: new Date().getTime(),
      status: "saving",
      internalUrl: undefined,
      parent_id: null,
    };

    dispatch(setTempRecordingData(newTemporaryRecording))
    dispatch(setRecordingList([newTemporaryRecording, ...recordingList]));
    textNoteMutation.mutate({recording_type:3,transcript:textnote});
    listenToFirebaseStatus(temporaryRecordingId);
    router.back()
  };

  const onWrite = (note: any) => {
    setTextnote(note);
  };

  const refreshNotesAfterAttachmentChange = async () => {};
console.log(attachments)                                                                             
  const renderImageThumbnail = useCallback(
    (item:any,index:number) => (
        <View style={[styles.thumbnailContainer]} key={index}>
          <Image
            source={{ uri: item.url }}
            style={styles.thumbnail}
            contentFit="contain"
            transition={300}
            cachePolicy="memory-disk"
          />
          {item.is_uploading && (
            <BlurView intensity={50} style={styles.blurOverlay}>
              <CircularLoader color={Colors.whiteWithOpacity(1)} />
            </BlurView>
          )}
        </View>
    ),
    [attachments]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bgColor8 }}>
      {/* Header */}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          height: 60,
          paddingTop: isIOS ? 0 : 16,
          borderBottomColor: Colors.border,
          borderBottomWidth: 1,
          paddingHorizontal: 8,
        }}
      >
        <Pressable onPress={onCancel} style={{ padding: 12, width: "20%" }}>
          <Text
            style={{ fontFamily: "Primary", fontSize: 16, color: Colors.grey }}
          >
            Cancel
          </Text>
        </Pressable>

        <Text
          style={{
            fontFamily: "Primary-Semibold",
            fontSize: 16,
            color: Colors.text,
            width: "20%",
            textAlign: "center",
          }}
        >
          Write
        </Text>
        {isLoading ? (
          <View style={{ width:'20%', alignItems:'flex-end' }}>
            <ThreeDotLoader
              colorFilters={[
                { keypath: "Left", color: Colors.text },
                { keypath: "Mid", color: Colors.text },
                { keypath: "Right", color: Colors.text },
              ]}
            />
          </View>
        ) : (
          <Pressable
            onPress={onDone}
            style={{ padding: 12, width: "20%", alignItems: "flex-end" }}
          >
            <Text
              style={{
                fontFamily: "Primary-Semibold",
                fontSize: 16,
                color: Colors.blue,
              }}
            >
              Save
            </Text>
          </Pressable>
        )}
      </View>

      {/* Text Input Area */}
      <KeyboardAwareScrollView>
        <TextInput
          ref={inputRef}
          style={{
            flex: 1,
            borderColor: Colors.border,
            margin: 16,
            padding: 8,
            color: Colors.text,
          }}
          multiline
          placeholder="Write your note here..."
          placeholderTextColor={Colors.grey3}
          onChangeText={onWrite}
          value={textnote}
          onSubmitEditing={onDone}
          returnKeyType="done"
          scrollEnabled={false}
          selectTextOnFocus={false}
        />
      </KeyboardAwareScrollView>

      <ImageUploader
        showImagePicker={showImagePicker}
        setShowImagePicker={setShowImagePicker}
        setAttachments={setAttachments}
        onAttachmentUpdate={refreshNotesAfterAttachmentChange}
        noteType={3}
      />
      <KeyboardStickyView
        style={{
          height: 60,
          justifyContent: "center",
          backgroundColor: Colors.bgColor8,
        }}
        offset={{ opened: 34 }}
      >
        <ScrollView>
          {attachments.map(renderImageThumbnail)}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              padding: 12,
              borderRadius: 100,
              marginRight: 12,
              backgroundColor: Colors.border,
              alignSelf: "flex-end",
            }}
          >
            <Pressable onPress={() => setShowImagePicker(true)}>
              <SvgXml xml={home.img?.replace(/#0D0D0D/g, Colors.black2)} />
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardStickyView>
    </SafeAreaView>
  );
};

export default TextNote;

const useStyles = () => {
  const { Colors } = useTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        thumbnailContainer: {
          position: "relative",
          marginRight: 2.5,
          width: 100,
          height: 100,
          borderRadius: 4,
          backgroundColor: Colors.inputBg2,
          overflow: "hidden",
        },
        thumbnail: {
          width: 100,
          height: 100,
          borderRadius: 2,
          backgroundColor: Colors.inputBg2,
        },
        blurOverlay: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 2,
          overflow: 'hidden',
          justifyContent: 'center',
          alignItems: 'center',
        },
      }),
    [Colors]
  );
};
