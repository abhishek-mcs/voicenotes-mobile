import { deleteRecordingsFromState } from "redux/reducers/recordingStates";
import { Note, Subnote } from "types";
import * as FileSystem from "expo-file-system";
import { MAX_NOTES_STORAGE_LIMIT_IN_DEVICE } from "services/api/api-constants";


export const combineRecordings = (existing: Note[], newOnes: Note[]) => {
  let finalList: Note[] = [];
  const existingIds = new Set(existing.map((note) => note.id));
  const offlineList:any = existing.filter((note) => note.status?.includes("failed")||note.status=="uploading");
  for (let newOne of newOnes) {
    if (existingIds.has(newOne.id)) {
      const existingNote = existing.find((note) => note.id === newOne.id);
      //for subnotes
      const offlineSubnoteList:any = existingNote?.subnotes?.filter((note) => note.status?.includes("failed")||note.status=="uploading")??[];
      const newSubnoteIds = new Set(newOne.subnotes.map(subnote => subnote.id));// Only add offline subnotes that aren't already in newOne.subnotes
      const uniqueOfflineSubnotes = offlineSubnoteList.filter(
        (subnote:any) => !newSubnoteIds.has(subnote.id)
      );
      newOne.subnotes=[...newOne.subnotes,...uniqueOfflineSubnotes].sort(
        (a:any, b:any) =>a.recorded_at - b.recorded_at 
      );
      finalList.push({ ...existingNote, ...newOne });
    } else {
      finalList.push(newOne);
    }
  }
  let modifiedRecords = finalList.map((rec) => ({
    ...rec,
    status: rec.status ?? "processed",
    recorded_at: rec.recorded_at ?? rec.created_at,
    subnotes: rec.subnotes.map((subnote: Subnote) => ({
      ...subnote,
      status: subnote.status ?? "processed",
      recorded_at: rec.recorded_at ?? rec.created_at,
    })),
  }));

  let sortedList = modifiedRecords.sort(
    (a, b) => b.recorded_at - a.recorded_at
  );
  if(offlineList.length>0)
    sortedList=[...offlineList,...sortedList];
  return sortedList;
};

export const removeExtraOldAudios = async (recordingList: Note[], dispatch: any) => {
  if (recordingList.length > MAX_NOTES_STORAGE_LIMIT_IN_DEVICE) {
    let recordsToRemoveFromCache = [];
    for (
      let i = recordingList.length - 1;
      i >= MAX_NOTES_STORAGE_LIMIT_IN_DEVICE;
      i--
    ) {
      if (!recordingList[i].status.includes("failed")) {
        recordsToRemoveFromCache.push(recordingList[i]);
      }
    }
    console.log(
      "recordstoremovefromcache = ",
      recordingList.map((r) => r.id)
    );

    const removeAudioFileFromCache = async (rec: Note) => {
      let path = rec.internalUrl ?? rec.audio?.data?.url;
      if (!path) path = rec.audio?.data?.url;

      if (!path) return;
      try {
        await FileSystem.deleteAsync(path, { idempotent: false });
        console.log(`Deleted file at ${path}`);
      } catch (error) {
        console.info(`Error deleting file at ${path}:`, error);
      }
    };

    // Remove files and update state immediately
    await Promise.all(
      recordsToRemoveFromCache.map((rec) => removeAudioFileFromCache(rec))
    );
    dispatch(deleteRecordingsFromState(recordsToRemoveFromCache));

    console.log(
      `Removed ${recordsToRemoveFromCache.length} old recordings from cache`
    );
  }
};

export function generateVoiceNoteFilename(note:Note) {
    const timeToUse = note.recorded_at ?? note.created_at
    const date = new Date(timeToUse);
    
    // Format: YYYY-MM-DD_HH-mm-ss
    const formattedDate = date.toISOString()
      .replace(/[-:]/g, '-')
      .replace('T', '_')
      .split('.')[0];
  
    // Use note id (if available) to ensure uniqueness
    const uniqueId = note.id ? `_${note.id}` : '';
  
    return `Voicenotes_${formattedDate}${uniqueId}.mp3`;
  }
  
  
