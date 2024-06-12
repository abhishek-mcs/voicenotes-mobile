import { ref, onValue, Database, remove } from "firebase/database";
import { db } from "../../../firebaseConfig";
export default async({ id = null, getCreation = async(v: any) => {} }) => {
  const statusRef = ref(db, "processStatuses/aicreate/" + id);
  console.log("AI CREATE STATUS REF", statusRef);
  onValue(statusRef, async (snapshot) => {
    console.log("AI CREATE STATUS", id,snapshot.exists());
    if (snapshot.exists()) {
      const status = snapshot.val();
      console.log("AI CREATE STATUS", status);
      if (status === 1) {
        await getCreation(id);
        console.log("AI CREATE DONE");
        remove(statusRef);
      }
    }
  });
};
