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
import { isIOS, sleep } from "utils/common";
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
import { commonSvg } from "assets/svg/commonSvg";

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
  const dispatch = useDispatch()
  const { recordingList } = useSelector((state:RootState)=>state.recordingStates)
  const { onTextNoteSave } = useFirebaseRecordingListener()
  const scrollRef:any = useRef<ScrollView>()

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
      recording_type:3
    };

    onTextNoteSave(textnote,temporaryRecordingId,attachments)
    dispatch(setTempRecordingData(newTemporaryRecording))
    dispatch(setRecordingList([newTemporaryRecording, ...recordingList]));
    router.back()
  };

  const onWrite = (note: any) => {
    setTextnote(note);
  };

  const refreshNotesAfterAttachmentChange = async () => {
    await sleep(1500);
    scrollRef?.current?.scrollToEnd();
  };

  const removeAttachment = (i:number) =>{
    const temp = [...attachments]
    temp?.splice(i,1);
    setAttachments([...temp])
  }
                                                                      
  const renderImageThumbnail = useCallback(
    (item:any,index:number) => (
        <View style={[styles.thumbnailContainer]} key={index}>
        <Pressable style={styles.thumbnailClose} onPress={()=>removeAttachment(index)}>
          <SvgXml xml={commonSvg.smallClose?.replace(/#717171/g,Colors.bgColor)} />
        </Pressable>
          <Image
            source={{ uri: item.url }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
          />
          {/* {item.is_uploading && (
            <BlurView intensity={50} style={styles.blurOverlay}>
              <CircularLoader color={Colors.whiteWithOpacity(1)} />
            </BlurView>
          )} */}
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
            disabled={textnote==''}
          >
            <Text
              style={{
                fontFamily: "Primary-Semibold",
                fontSize: 16,
                color: textnote==''?Colors.text7:Colors.blue,
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
            fontFamily: 'Primary',
            fontSize: 14,
            lineHeight: 24
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
          height: attachments?.length>0?'auto':60,
          justifyContent: "center",
          alignItems:'center',
          backgroundColor: Colors.bgColor8,
          paddingHorizontal: 18,
          flexDirection:'row'
        }}
        offset={{ opened:attachments?.length>0?24 :34 }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} ref={scrollRef} contentContainerStyle={{paddingVertical:12}}>
          {attachments.map(renderImageThumbnail)}
        </ScrollView>
          <View
            style={{
              justifyContent: "flex-end",
              padding: 12,
              borderRadius: 100,
              backgroundColor: Colors.border,
              alignSelf: attachments?.length>0?"center":"flex-end",
              marginLeft:12
            }}
          >
            <Pressable onPress={() => setShowImagePicker(true)}>
              <SvgXml xml={home.img?.replace(/#0D0D0D/g, Colors.black2)} />
            </Pressable>
          </View>
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
        thumbnailClose:{position:'absolute',right:-5,top:-5,zIndex:10,backgroundColor:Colors.text,padding:4,borderRadius:12},
        thumbnailContainer: {
          position: "relative",
          marginRight: 8,
          width: 100,
          height: 100,
          borderRadius: 4,
          backgroundColor: Colors.inputBg2,
        },
        thumbnail: {
          width: 100,
          height: 100,
          borderRadius: 6,
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
