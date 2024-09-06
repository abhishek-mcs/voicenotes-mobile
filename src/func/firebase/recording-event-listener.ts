import { ref, onValue, Database, remove } from "firebase/database";
import { db } from "../../../firebaseConfig";

export const RecordingStatus = {
  PROCESSING_AUDIO: 0,
  PROCESSING_FAILED: 1,
  AUDIO_PROCESSED: 2,
  UPLOADING_AUDIO: 3,
  AUDIO_UPLOADED: 4,
  UPLOADED_FAILED: 5,
  TRANSCRIPT_GENERATION_STARTED: 6,
  TRANSCRIPT_GENERATED: 7,
  GENERATE_TRANSCRIPT_FAILED: 8,
  RELATED_NOTES_FETCHED: 9,
  TITLE_GENERATED: 10,
  GENERATE_TITLE_FAILED: 11,
  FORMAT_TRANSCRIPT_STARTED: 12,
  TRANSCRIPT_FORMATTED: 13,
  FORMAT_TRANSCRIPT_FAILED: 14,
  PROCESS_COMPLETED: 15,
};

export const RecordingStatusString = Object.fromEntries(
  Object.entries(RecordingStatus).map(([key, value]) => [value, key])
);

export default async ({ id = null, getCreation = async (v: any) => {} }) => {
  try {
    const firebasePath = "processStatuses/recording/";
    const statusRef = ref(db, firebasePath + id);
    onValue(statusRef, async (snapshot) => {
      if (snapshot.exists()) {
        const status = snapshot.val();

        if (status == RecordingStatus.TRANSCRIPT_GENERATED) {
          //   let data = await request.fetchSingleRecording(recordingId);
          //   afterTranscriptGenerated(data,recordingId)
        } else if (status == RecordingStatus.TITLE_GENERATED) {
          //   let data = await request.fetchSingleRecording(recordingId);
          //   afterTitleGenerated(data,recordingId);

          remove(statusRef)
            .then(() => {
              console.log("Process completed.");
            })
            .catch((error) => {
              console.log("Remove failed: " + error.message);
            });

          console.log("status:  title generated");
        }
      } else {
        console.log("No data available at this path.");
      }
    });
  } catch (error) {
    console.error("Error accessing Firebase Database:", error);
  }
};
