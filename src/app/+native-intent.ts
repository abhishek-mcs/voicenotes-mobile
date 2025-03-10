import AsyncStorage from "@react-native-async-storage/async-storage";

export async function redirectSystemPath({
    path,
    initial,
  }: {
    path: string;
    initial: boolean;
  }) {
    const t = await AsyncStorage.getItem('authToken')??''
    console.warn("redirectSystemPath", path, initial,t);
    if (path.includes("file://")&&t?.length>1) {
      console.warn("remapping file:// to home/ query param", path, initial,t);
      // Remap `file://` to be a query param and send to the route which can handle it.
      return "/home?file=" + encodeURIComponent(path);
    }else return "/";
  }