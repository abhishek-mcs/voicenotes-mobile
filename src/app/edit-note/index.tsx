import Touchable from "components/common/Touchable";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  InteractionManager,
} from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatTranscript2, isIOS, screenHeight } from "utils/common";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { TextInput } from "react-native";
import { useQueryClient } from "react-query";
import { useSaveAICreation, useSaveEditedNote } from "queries/home";
import {
  setCurrentlyOpenedMeetingTranscript,
  updateTitle,
  updateTranscript,
} from "redux/reducers/recordingStates";
import ThreeDotLoader from "components/common/loaders/three-dot-loader";
import { useGetSingleRecording } from "queries/home/relatedNote";
import { useTheme } from "context";
import { useDialog } from "context/DialogContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const EditNote = () => {
    const router = useRouter();
    const params:any = useLocalSearchParams();
    const {editNoteRedux} = useSelector((state:RootState)=>state.editStates)
    const {showDialog} = useDialog()


  const [editNote, setEditNote] = useState<any>(editNoteRedux);
  const [editNoteSummary, setEditNoteSummary] = useState<string>(
   editNote?.recording_type==2?
   editNote?.creations?.find((t:any)=>t?.type=="team-summary")?.content?.data?.replace(/- /g, '• ')?.replace(/\* /g,'• ')?.trimStart()??'':''
  )
  const dispatch = useDispatch();
  const saveEditedNote = editNote?.recording_type==2?
  useSaveAICreation(editNote?.creations?.find((t:any)=>t?.type=="team-summary")?.id)
  :useSaveEditedNote(editNote?.id);
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const titleInputRef = useRef<TextInput>(null);
  const transcriptInputRef = useRef<TextInput>(null);
  const { Colors, isLightMode } = useTheme()
  const styles = useStyles()

  const handleTitleSubmit = () => {
    transcriptInputRef.current?.focus();
  };

  const onSaveEdit = async () => {
    if ((editNote?.transcript?.length === 0&&editNote?.recording_type!=2) || (editNoteSummary?.length === 0&&editNote?.recording_type==2) || editNote?.title?.length === 0) {
      return showDialog("", `Title and ${editNote?.recording_type==2?'Summary':'Transcript'} cannot be empty`,[],{userInterfaceStyle:isLightMode?"light":"dark"});
    }
    setIsLoading(true);
    const tags = editNote?.tags?.flatMap((tag: any) => tag?.name);
    const temp = { ...editNote };

    const transcript = editNote?.transcript;
    const content = editNoteSummary?.replace(/\* /g,'');
    const recording_id = editNote?.recording_id
    const data = editNote?.recording_type==2?{content,recording_id}:{transcript,tags} 

    await saveEditedNote.mutateAsync(
      {title:editNote?.title,...data},{
        onSuccess:(e:any)=>{
          dispatch(updateTitle({index:params?.index,title:editNote?.title}))
          dispatch(updateTranscript({index:params?.index,transcript:editNote?.transcript}))
          dispatch(setCurrentlyOpenedMeetingTranscript(editNote?.transcript))
          queryClient.resetQueries('all-recording')
          queryClient.resetQueries('single-recording')
          setIsLoading(false)
        },
        onError: (e: any) => {
          setEditNote(temp);
          setIsLoading(false);
        },
      }
    );
    router?.back();
  };
  const onCancelEdit = () => {
    router?.back();
  };

  useEffect(() => {
    console.log(editNote?.isEditMeetingTranscript)
    InteractionManager.runAfterInteractions(() => {
      titleInputRef.current?.focus();
    });
  }, []);

  const KeyboardWrapper = useCallback(({children}:any) => isIOS?
  children:(
    <KeyboardAwareScrollView
    automaticallyAdjustKeyboardInsets
    bottomOffset={0}
    >
      {children}
    </KeyboardAwareScrollView>
  ),[])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor:Colors.bgColor8, paddingTop: isIOS?0:50 }}>

<View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 12,
          borderBottomColor: Colors.border,
          borderBottomWidth: 1,
          height:  50,
        }}
      >
        <Touchable
          onPress={onCancelEdit}
          style={{ padding: 12, alignSelf: "flex-end" }}
          activeOpacity={0.6}
        >
          <Text
            style={{ fontFamily: "Primary", fontSize: 16, color: Colors.grey }}
          >
            Cancel
          </Text>
        </Touchable>
        {isLoading ? (
          <View style={{ alignSelf: "flex-end" }}>
            <ThreeDotLoader 
                colorFilters={[
                  {keypath:'Left',color:Colors.text},
                  {keypath:'Mid',color:Colors.text},
                  {keypath:'Right',color:Colors.text}
                ]}/>
          </View>
        ) : (
          <Touchable
            onPress={onSaveEdit}
            style={{ padding: 12, alignSelf: "flex-end" }}
            activeOpacity={0.6}
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
          </Touchable>
        )}
      </View>
        <View style={styles.editContainer}>
          {!editNote?.isEditMeetingTranscript&&
          <TextInput
            ref={titleInputRef}
            style={styles.titleInput}
            autoComplete="off"
            autoCorrect={true}
            selectTextOnFocus={false}
            value={editNote?.title}
            placeholder="Title"
            placeholderTextColor={Colors.grey6}
            onChangeText={(txt) =>
              setEditNote((n: any) => {
                return { ...n, title: txt };
              })
            }
            multiline
            onSubmitEditing={handleTitleSubmit}
            returnKeyType="next"
          />}
          <KeyboardWrapper>
            <TextInput
              ref={transcriptInputRef}
              style={styles.textInput}
              editable={true}
              selectTextOnFocus={false}
              multiline
              enablesReturnKeyAutomatically
              autoComplete="off"
              autoCorrect={true}
              scrollEnabled={isIOS}
              placeholder="Transcript"
              placeholderTextColor={Colors.grey6}
              value={
                // (editNote?.recording_type==2&&!editNote?.isEditMeetingTranscript)?
                // editNoteSummary:
                editNote?.recording_type==3?
                formatTranscript2(editNote?.transcript)
                :editNote?.transcript
                ?.replaceAll(/<b\/?>/g, '')
                ?.replaceAll(/<\/b\/?>/g, '')
                ?.replaceAll(/<br\/?>/g, "\n")
                ?.replace(/&amp;/g, '&')
                ?.replace(/&nbsp;/g, '&')
              }
              onChangeText={(txt) =>{
                setEditNote((n: any) => {
                  return { 
                    ...n, 
                    ...(
                      editNote?.recording_type==2&&!editNote?.isEditMeetingTranscript?
                      {
                        creation:[
                          ...n?.creations,
                          {
                            ...n?.creations?.find((t:any)=>t?.type=="team-summary"),
                            content:{
                              data:txt
                            }
                          }
                        ]
                      }
                      :{transcript: txt}
                  )};
                })
                setEditNoteSummary(txt)
              }}
            />
          </KeyboardWrapper>
        </View>
    </SafeAreaView>
  );
};

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
  editContainer: {
    marginTop: 6,
    marginHorizontal: 12,
  },
  row: { flexDirection: "row", alignItems: "center" },
  titleInput: {
    paddingHorizontal: 12,
    fontFamily: "Primary-Bold",
    fontSize: 16,
    lineHeight: 28,
    fontWeight: "500",
    color: Colors.text5,
    marginBottom: 6,
  },
  textInput: {
    paddingHorizontal: 12,
    paddingBottom: isIOS? screenHeight/1.6:screenHeight/4,
    minHeight: 100,
    fontFamily: "Primary",
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "400",
    textAlignVertical: "top",
    textAlign: "left",
    color: Colors.text5,
  },
}), [Colors]
)}

export default EditNote