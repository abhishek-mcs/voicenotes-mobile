import { useDispatch } from "react-redux";
import database from "@react-native-firebase/database";
import { RecordingStatus } from "func/firebase/recording-event-listener";
import {
  setCurrentlyOpenedMeetingTranscript,
  updateRecordingDetails,
  updateTempRecordingData,
} from "redux/reducers/recordingStates";
import { fetchSingleRecording, sleep } from "utils/common";
import { useNoteContext, useTheme } from "context";
import { setCanRecord } from "redux/reducers/userDetails";
import {
  setRelatedNoteTitleLoad,
  setRelatedNoteTranscriptLoad,
} from "redux/reducers/relatedNoteStates";
import { useQueryClient } from "react-query";
import { useGetRelatedRecording } from "queries/home/relatedNote";
import { usePostRecord } from "queries/home";
import axiosApi from "services/api/axios-api";
import { generateRandomIdentifier } from "utils/formatBigNumber";
import { useDialog } from "context/DialogContext";
import { useEffect } from "react";

export function useFirebaseRecordingListener() {
  const dispatch = useDispatch();
  const { setTriggerTypingTitle, setTriggerTypingTranscript, setExpandNote } =
    useNoteContext();
  const queryClient = useQueryClient();
  const relatedNotes = useGetRelatedRecording();
  const {showDialog} = useDialog();
  const {isLightMode} = useTheme();

  const uploadImage = async (newImage: string,noteId:any,isLast:boolean) => {
    const identifier = generateRandomIdentifier();

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: newImage,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);
      formData.append("type", "2");
      formData.append("identifier", identifier);

      const result = await axiosApi.post(`/attachment/${noteId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if(result&&isLast){
        queryClient.invalidateQueries('all-recording')
        queryClient.resetQueries('streaks');
        console.log('Upload successfull');
      }
      
    } catch (error) {
      console.error("Upload error:", error);
      showDialog(
        "Upload Error",
        "Failed to upload image. Please try again later."
      ,[],{userInterfaceStyle:isLightMode?"light":"dark"});
    }
  };

  const onTextNoteSave = async(textnote:string='',temporaryRecordingId:any,images:any[]=[]) => {
    // const t = textnote?.replace(/\n/g, '<br>');
    const data = await axiosApi.post(`/recordings/new`,{recording_type:3,transcript:textnote})
    const noteId = data?.data?.recording?.id
    listenToFirebaseStatus(noteId,temporaryRecordingId);
    images?.length>0&&images?.map(async(img,i)=>await uploadImage(img?.url,noteId,i==images?.length-1))
  }

  useEffect(() => {
    return () => {
        // Cleanup all listeners when component unmounts
        console.log('Cleanup all firebase db listeners')
        const firebasePath = "processStatuses/recording";
        const baseRef = database().ref(firebasePath);
        baseRef.off('value');
    };
}, []);

const updateNoteBasedOnStatus = async ({status,dbRef,recordingId,temporaryRecordingId,teamSummaryId,isTitleGenerated,isTitleTriggered,isTranscriptTriggered,isProcessCompleted,is_transcript_only,dbListener}:any)=>{
  // Validate the status value
  if (isNaN(status)) {
    console.error("Invalid status value");
    return; // Exit if the status is not a number
  }

  console.log("firebase snapshot");
  let updatedStatus = "uploading";
  // Handle different recording statuses
  if (
    status === RecordingStatus.AUDIO_UPLOADED ||
    status === RecordingStatus.PROCESSING_AUDIO
  ) {
    updatedStatus = "processing"; // Update status to processing
    console.log("audio uploaded");
    // Dispatch actions to update recording details in the Redux store as processing without title and transcript
    dispatch(
      updateRecordingDetails({
        recordingId,
        data: { status: updatedStatus },
        temporaryRecordingId,
      })
    );
    dispatch(updateTempRecordingData(updatedStatus));
  } else if (status === RecordingStatus.UPLOADED_FAILED) {
    updatedStatus = "upload_failed";
    console.log("audio uploaded failed");
    dispatch(
      updateRecordingDetails({
        recordingId,
        data: { status: updatedStatus },
        temporaryRecordingId,
      })
    );
    dispatch(updateTempRecordingData(updatedStatus));
  } else if (status === RecordingStatus.GENERATE_TITLE_FAILED) {
    updatedStatus = "processing_failed";
    console.log("title geneation failed;waiting", recordingId);
    dispatch(
      updateRecordingDetails({
        recordingId,
        data: { status: updatedStatus },
        temporaryRecordingId,
      })
    );
    dispatch(updateTempRecordingData(updatedStatus));
  } else if (status === RecordingStatus.GENERATE_TRANSCRIPT_FAILED) {
    updatedStatus = "processing_failed";
    console.log("transcript geneation failed;waiting", recordingId);
    dispatch(
      updateRecordingDetails({
        recordingId,
        data: { status: updatedStatus, is_transcript_loading: false },
        temporaryRecordingId,
      })
    );
    dispatch(updateTempRecordingData(updatedStatus));
  } else if (
    teamSummaryId &&
    status === RecordingStatus.MEETING_SUMMARY_GENERATED
  ) {
    console.log("summary generation worked");
    updatedStatus = "processed";
    await sleep(5000);
    const updatedNote = await fetchSingleRecording(recordingId);
    console.log(updatedNote?.data?.creations);
    dispatch(
      updateRecordingDetails({
        recordingId,
        data: {
          ...updatedNote.data,
          status: updatedStatus,
          is_transcript_loading: false,
        },
      })
    );
    !isTranscriptTriggered && setTriggerTypingTranscript(recordingId);
    
    setTimeout(() => {
      if(!updatedNote?.data?.parent_id) setExpandNote(0);
      
      dbRef.off("value",dbListener);
      dbRef.remove();
    }, 600);
  } else if (
    (status === RecordingStatus.PROCESS_COMPLETED ||
      status === RecordingStatus.TITLE_GENERATED ||
      status === RecordingStatus.TRANSCRIPT_GENERATED) &&
    !teamSummaryId
  ) {
    console.log(status)
    const isProcessOver = true;
    updatedStatus = "processed";
    console.log("formatted");
    const updatedNote = await fetchSingleRecording(recordingId);
    console.log("updated note: ", updatedNote.data.title);
    isProcessCompleted = isTitleTriggered && isTranscriptTriggered 
    !isProcessCompleted &&
      dispatch(
        updateRecordingDetails({
          recordingId,
          data: {
            ...updatedNote?.data,
            title:
              !is_transcript_only &&
              status == RecordingStatus.TRANSCRIPT_GENERATED
                ? null
                : updatedNote?.data?.title,
            status: updatedStatus,
            is_transcript_loading: false,
          },
        })
      );
    if (!isTranscriptTriggered && (status == RecordingStatus.TRANSCRIPT_GENERATED || updatedNote?.data?.transcript != null )){
      setTriggerTypingTranscript(recordingId);
      isTranscriptTriggered =true;
      dispatch(setRelatedNoteTranscriptLoad(false));
      relatedNotes.mutate(recordingId);
    }
    isTitleGenerated =
      updatedNote?.data?.title != null || is_transcript_only;
    if(!isTitleTriggered && isTitleGenerated){
      setTriggerTypingTitle(recordingId);
      isTitleTriggered = true;
      dispatch(setRelatedNoteTitleLoad(false));
      queryClient.invalidateQueries("single-recording");
    }
    dispatch(updateTempRecordingData(updatedStatus));
    dispatch(setCanRecord(updatedNote?.data?.can_record_more));
    if(is_transcript_only && updatedNote?.data?.recording_type == 2)
      dispatch(
        setCurrentlyOpenedMeetingTranscript(
          updatedNote.data?.transcript
        )
      );
    console.log("removing firebase listener");
    if(isProcessCompleted)
      setTimeout(() => {
        if(!updatedNote?.data?.parent_id) setExpandNote(0);
        
        dbRef.off("value",dbListener);
        dbRef.remove();
      }, 600);
  }

}

  const listenToFirebaseStatus = async (
    recordingId: string | number,
    temporaryRecordingId: string | null = null,
    is_transcript_only = false,
    teamSummaryId = null
  ) => {
    try {
    // Define the Firebase path for recording statuses
      const firebasePath = "processStatuses/recording";
      let isListenerTriggered = false;
      const dbRef = database().ref(firebasePath).child(`${recordingId}`);

      console.log("firebase listen", firebasePath +'/' +recordingId);
        // First check if the path exists
      const onceSnap = await dbRef.once('value');
      if (!onceSnap.exists()) {
          console.log("Path doesn't exist yet, waiting...");
          // Set up a listener for child added
          const pathExistsListener = database()
              .ref(firebasePath)
              .on('child_added', (snapshot) => {
                  if (snapshot.key === recordingId.toString()) {
                      // Path now exists, set up the value listener
                      console.log("Path now exists, set up the value listener");
                      setupValueListener();
                      // Remove the child_added listener
                      database().ref(firebasePath).off('child_added', pathExistsListener);
                  }
              });
      } else {
        // Path exists, set up the value listener directly
          console.log('Path exists, set up the value listener directly',onceSnap.val())
          setupValueListener();
      }

    // Initialize flags to track the state of title and transcript generation
      let isTitleGenerated = false || is_transcript_only;
      let isTitleTriggered = false || is_transcript_only;
      let isTranscriptTriggered = false;
      let isProcessCompleted = false;
    // Set up a listener for changes in the Firebase database at the specified path
      async function setupValueListener(){
        const dbListener = dbRef.on(
        "value",
        async (snapshot) => {

          isListenerTriggered = true;

          console.log("firebase listen value");
          if (!snapshot?.exists()) {
            console.log("Snapshot does not exist");
            return;
          }

          console.log("snapshot", snapshot?.exists());

        // If the snapshot exists, retrieve the status value
          if (snapshot?.exists()) {
            const status = +snapshot.val();

            updateNoteBasedOnStatus({status,dbRef,recordingId,temporaryRecordingId,teamSummaryId,isTitleGenerated,isTitleTriggered,isTranscriptTriggered,isProcessCompleted,is_transcript_only,dbListener})
          } else {
            console.log("Snapshot does not exist");
          }
        },
        (error) => {
          console.log("Firebase listener error:", error);
        }
      );
      if(!isListenerTriggered&&!isNaN(onceSnap.val())){
        await sleep(5000)
        const onceSnap2 = await dbRef.once('value');
        console.log('updating note with firebase once triggering method',onceSnap2.val())
        updateNoteBasedOnStatus({status:onceSnap2.val(),dbRef,recordingId,temporaryRecordingId,teamSummaryId,isTitleGenerated,isTitleTriggered,isTranscriptTriggered,isProcessCompleted,is_transcript_only,dbListener})
      }
    }
    } catch (e) {
      console.log("Error processing snapshot:", e);
      // Update UI to show error state if needed
      dispatch(
        updateRecordingDetails({
          recordingId,
          data: { status: "processing_failed" },
          temporaryRecordingId,
        })
      );
    }
  };
  return {listenToFirebaseStatus,onTextNoteSave}
}

// interface UseFirebaseRecordingListenerProps {
//   recordingId: string | number; // Adjust type based on your use case
//   temporaryRecordingId?: string | null; // Optional parameter
//   is_transcript_only?: boolean; // Optional parameter
//   teamSummaryId?: string | null; // Optional parameter
// }
