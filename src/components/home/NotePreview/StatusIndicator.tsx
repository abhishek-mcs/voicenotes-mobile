import { notePreviewSVG } from "assets/svg/notePreviewSVG";
import Touchable from "components/common/Touchable";
import { useTheme } from "context";
import { Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { capitalizeFirstLetter } from "utils/common";

const StatusIndicator = ({
  status,
  onRetry = () => {},
}: {
  status: string;
  onRetry: () => void;
}) => {
  if (!status || status === "processed") return null;

  const canRetry = status?.toLowerCase()?.trim()?.includes("failed");
  const {Colors} = useTheme()

  return (
    <Touchable
      style={{ flexDirection: "row", alignItems: "center",alignSelf:'flex-start', padding: 2 }}
      disabled={!canRetry}
      onPress={onRetry}
    >
      {getStatusIcon(status,Colors)}
      {status && (
        <Text style={{ marginLeft: 4,color:Colors.text }}>{formatStatus(status)}</Text>
      )}
    </Touchable>
  );
};

export default StatusIndicator;

const formatStatus = (word_with_underscores = "") => {
  const multi_word = word_with_underscores.split("_").join(" ");
  const capitalized_word = multi_word
    .split(" ")
    .map((word,index) =>index==0? capitalizeFirstLetter(word):word)
    .join(" ");
  return capitalized_word?.toLowerCase()=="upload failed"?"Waiting for network":capitalized_word;
};

const getStatusIcon = (status: string,Colors:any) => {
  let s=status?.toLowerCase()?.trim()
  if(s?.includes('failed')) s = 'failed'
  switch (s) {
    case "processing":
    case "uploading":
    case "saving":
      return <SvgXml style={{ marginLeft: 4 }} xml={notePreviewSVG.progress?.replace('black',Colors?.text)} />;
    case "failed":
      return (
        <SvgXml style={{ marginLeft: 4 }} xml={notePreviewSVG.failedWarning?.replace('#D6A243',Colors.text)} />
      );
    default:
      return null;
  }
};
