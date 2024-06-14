import { ref, onValue, Database, remove } from "firebase/database";
import { db } from "../../../firebaseConfig";
export default async({ id = null, getCreation = async(v: any) => {} }) => {
  const statusRef = ref(db, "processStatuses/aicreate/" + id);
  onValue(statusRef, async (snapshot) => {
    if (snapshot.exists()) {
      const status = snapshot.val();
      if (status == 1) {
        await getCreation(id);
        remove(statusRef);
      }
    }
  });
};
