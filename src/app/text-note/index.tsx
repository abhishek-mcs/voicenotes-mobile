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
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SvgXml } from "react-native-svg";
import { home } from "assets/svg/home";
import { useNoteContext, useTheme } from "context";
import { isIOS, isSmallDevice, screenHeight, sleep } from "utils/common";
import ThreeDotLoader from "components/common/loaders/three-dot-loader";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import ImageUploader from "components/NotePreview/ImageUploader";
import { Image } from "expo-image";
import CircularLoader from "components/common/loaders/circular-loader";
import { usePostRecord } from "queries/home";
import { NewNote } from "types";
import { useDispatch, useSelector } from "react-redux";
import { setRecordingList, setTempRecordingData } from "redux/reducers/recordingStates";
import { RootState } from "redux/store/store";
import { useFirebaseRecordingListener } from "hooks/firebase-listeners/useFirebaseRecordingListener";
import { commonSvg } from "assets/svg/commonSvg";
import { useDialog } from "context/DialogContext";
import { useNetInfo } from "@react-native-community/netinfo";

const TextNote = () => {
  const router = useRouter();
  const {content}:any = useLocalSearchParams();
  const { Colors, isLightMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [limitAlert, setLimitAlert] = useState(false);
  const [textnote, setTextnote] = useState(content??"");
  const inputRef: any = useRef<TextInput>();
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const styles = useStyles()
  const dispatch = useDispatch()
  const { recordingList } = useSelector((state:RootState)=>state.recordingStates)
  const { onTextNoteSave } = useFirebaseRecordingListener()
  const scrollRef:any = useRef<ScrollView>()
  const { noteListScrollRef } = useNoteContext()
  const { userDetails }: any = useSelector(
    (state: RootState) => state.userDetails
  );
  const { isTempIAPPurchased }: any = useSelector(
    (state: RootState) => state.IAPStates
  );
  const isBeliever = userDetails?.subscription_status||isTempIAPPurchased
  const { showDialog } = useDialog()

  const netinfo = useNetInfo()

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      inputRef.current?.focus();
    });
  }, []);

  const onCancel = () => router?.back();

  const onDone = async() => {
    setIsLoading(true)
    const temporaryRecordingId = Math.random().toString(36).substring(7);
    const newTemporaryRecording: NewNote = {
      id: temporaryRecordingId,
      temp_id:temporaryRecordingId,
      audio: { data: { url: null, duration:null } },
      isUploading: true,
      title: `New note`,
      transcript: null,
      recorded_at: new Date().getTime(),
      status: netinfo?.isConnected?"saving":"upload_failed",
      internalUrl: undefined,
      parent_id: null,
      recording_type:3,
      text_note: textnote,
      imageAttachments: attachments
    };

    onTextNoteSave(newTemporaryRecording)
    dispatch(setTempRecordingData(newTemporaryRecording))
    dispatch(setRecordingList([newTemporaryRecording, ...recordingList]));
    recordingList?.length>0&&
    noteListScrollRef?.current?.scrollToIndex({index:0,animated:true})
    router.back()
    setIsLoading(false)
  };

  const onWrite = (note: any) => {
    let n: string = note
    if(!isBeliever&&note?.length>=1500&&!limitAlert){
      setLimitAlert(true)
      showDialog('', "Please enter a maximum of 1500 characters. It's fair usage policy, but contact us for more.",[{
        onPress:()=>setLimitAlert(false),
        text:"Ok"
      }],{userInterfaceStyle:isLightMode?"light":"dark"})
    }
    setTextnote(n);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bgColor8, paddingTop:isIOS?0:50}}>
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
        <Pressable onPress={onCancel} style={{ padding: 12, width: "30%" }}>
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
            width: "30%",
            textAlign: "center",
          }}
        >
          Write
        </Text>
        {isLoading ? (
          <View style={{ width:'30%', alignItems:'flex-end' }}>
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
            style={{ padding: 12, width: "30%", alignItems: "flex-end" }}
            disabled={textnote==''||isLoading}
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
        <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{padding:16,paddingBottom:isIOS?0:300}}
        extraKeyboardSpace={isIOS?-screenHeight*2:-200}
        >
        <TextInput
          ref={inputRef}
          style={{
            color: Colors.text,
            fontFamily: 'Primary',
            fontSize: 14,
            lineHeight: textnote?.length>0?20:18,
            paddingBottom:isIOS?60:0
          }}
          multiline
          placeholder="Write here..."
          placeholderTextColor={Colors.grey3}
          onChangeText={onWrite}
          value={textnote}
          returnKeyLabel="return"
          scrollEnabled={false}
          selectTextOnFocus={false}
          {...(isBeliever?{}:{maxLength:1500})}
        />

      <ImageUploader
        showImagePicker={showImagePicker}
        setShowImagePicker={setShowImagePicker}
        setAttachments={setAttachments}
        onAttachmentUpdate={refreshNotesAfterAttachmentChange}
        noteType={3}
      />
        </KeyboardAwareScrollView>

      <KeyboardStickyView
        style={{
          height: attachments?.length>0?'auto':60,
          justifyContent: "center",
          alignItems:'center',
          backgroundColor: Colors.bgColor8,
          paddingHorizontal: 18,
          flexDirection:'row',
          paddingBottom:14 
        }}
        offset={{ opened:isIOS?isSmallDevice?4:34:0 }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} ref={scrollRef} contentContainerStyle={{paddingVertical:12}}>
          {attachments.map(renderImageThumbnail)}
        </ScrollView>
          <Pressable
            onPress={() => setShowImagePicker(true)}
            style={{
              justifyContent: "flex-end",
              padding: 12,
              borderRadius: 100,
              backgroundColor: Colors.border,
              alignSelf: attachments?.length>0?"center":"flex-end",
              marginLeft:12
            }}
          >
            <SvgXml xml={home.img?.replace(/#0D0D0D/g, Colors.black2)} />
          </Pressable>
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
