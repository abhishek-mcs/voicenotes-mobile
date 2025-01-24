import database from "@react-native-firebase/database";
import { sleep } from "utils/common";

export default async ({ id = "", getCreation = async (v: any) => {} }) => {
  const firebasePath = "processStatuses/aicreate/" + id;
  const dbRef = database().ref(firebasePath);
  let isListenerTriggered = false;

  async function statusCheck(status: number, listener: any) {
    if (status == 1) {
      await getCreation(id);
      if(!!dbRef&&!!listener) dbRef?.off("value", listener);
      if(!!dbRef) dbRef?.remove();
    }
  }

  // First check if the path exists
  const onceSnap = await dbRef.once("value");
  if (!onceSnap.exists()) {
    console.log("Path doesn't exist yet, waiting...");
    // Set up a listener for child added
    const pathExistsListener = database()
      .ref(firebasePath)
      .on("child_added", (snapshot) => {
        if (snapshot.key === id?.toString()) {
          // Path now exists, set up the value listener
          console.log("Path now exists, set up the value listener");
          setupValueListener();
          // Remove the child_added listener
          database().ref(firebasePath).off("child_added", pathExistsListener);
        }
      });
  } else {
    // Path exists, set up the value listener directly
    console.log(
      "Path exists, set up the value listener directly",
      onceSnap.val()
    );
    setupValueListener();
  }

  async function setupValueListener() {
    console.log('creation firebase listening')
    const listener = dbRef.on("value", async (snapshot) => {
      isListenerTriggered = true;
      if (snapshot.exists()) {
        const status = snapshot.val();
        console.log("creation status", status);
        statusCheck(status, listener);
      }
    });
    if (!isListenerTriggered && !isNaN(onceSnap.val())) {
      await sleep(5000);
      const onceSnap2 = await dbRef.once('value');
          console.log("creation status", onceSnap2.val());
          statusCheck(onceSnap2.val(), listener);
      }
  }
};
