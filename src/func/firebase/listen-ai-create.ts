import database from '@react-native-firebase/database';

export default async({ id = null, getCreation = async(v: any) => {} }) => {
  // const statusRef = ref(db, "processStatuses/aicreate/" + id);

  const listener = database()
  .ref("processStatuses/aicreate/" + id)
  .on('value', async (snapshot) => {
  // onValue(statusRef, async (snapshot) => {
    if (snapshot.exists()) {
      const status = snapshot.val();
      if (status == 1) {
        await getCreation(id);
        database().ref("processStatuses/aicreate/" + id).remove()
        database().ref("processStatuses/aicreate/" + id).off('value',listener)
      }
    }
  });
};
