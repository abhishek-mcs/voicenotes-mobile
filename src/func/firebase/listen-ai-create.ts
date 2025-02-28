import database from "@react-native-firebase/database";
import { sleep } from "utils/common";

export default async ({ id = "", getCreation = async (v: any) => {} }) => {
  const firebasePath = "processStatuses/aicreate/" + id;
  const dbRef = database().ref(firebasePath);
  let isListenerTriggered = false;
  let retry = 0;
  let pathExistsListener: any = null;

  async function statusCheck(status: number, listener: any) {
    if (status === 1) {
      await getCreation(id);
      // Clean up listeners
      if (!!dbRef && !!listener) dbRef?.off("value", listener);
      if (!!pathExistsListener) database().ref("processStatuses/aicreate").off("child_added", pathExistsListener);
      if (!!dbRef) dbRef?.remove();
    }
  }

  async function setupValueListener() {
    console.log('Setting up creation value listener');
    const listener = dbRef.on("value", async (snapshot) => {
      isListenerTriggered = true;
      if (snapshot.exists()) {
        const status = snapshot.val();
        console.log("Creation status:", status);
        await statusCheck(status, listener);
      }
    });

    // Add timeout to check if listener was triggered
    await sleep(4000);
    if (!isListenerTriggered && retry < 5) {
      retry++;
      console.log(`Retry attempt ${retry} for creation status`);
      const retrySnap = await dbRef.once('value');
      if (retrySnap.exists()) {
        await statusCheck(retrySnap.val(), listener);
      }
      if (retry < 5) {
        await sleep(2000);
        await setupValueListener();
      }
    }
  }

  // Initial path check
  const onceSnap = await dbRef.once("value");
  if (!onceSnap.exists()) {
    console.log("AI Creation path doesn't exist, setting up child_added listener");
    
    // Listen at the parent level for new children
    pathExistsListener = database()
      .ref("processStatuses/aicreate")
      .on("child_added", async (snapshot) => {
        if (snapshot.key === id) {
          console.log("AI Creation path now exists, setting up value listener");
          // Remove child_added listener before setting up value listener
          database().ref("processStatuses/aicreate").off("child_added", pathExistsListener);
          await setupValueListener();
        }
      });

    // Add a timeout to check path again in case we missed the child_added event
    setTimeout(async () => {
      const recheckSnap = await dbRef.once("value");
      if (recheckSnap.exists() && !isListenerTriggered) {
        console.log("Path found on recheck, setting up value listener");
        await setupValueListener();
      }
    }, 2000);
  } else {
    console.log("AI Creation path exists, setting up value listener directly");
    await setupValueListener();
  }
};