import { notePreviewSVG } from "assets/svg/notePreviewSVG";
import Touchable from "components/common/Touchable";
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

  return (
    <Touchable
      style={{ flexDirection: "row", alignItems: "center",alignSelf:'flex-start', padding: 2 }}
      disabled={!canRetry}
      onPress={onRetry}
    >
      {getStatusIcon(status)}
      {status && (
        <Text style={{ marginLeft: 4 }}>{formatStatus(status)}</Text>
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
  return capitalized_word=="Upload Failed"?"Waiting for network":capitalized_word;
};

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()?.trim()) {
    case "processing":
    case "uploading":
      return <SvgXml style={{ marginLeft: 4 }} xml={notePreviewSVG.progress} />;
    case "failed":
      return (
        <SvgXml style={{ marginLeft: 4 }} xml={notePreviewSVG.failedWarning} />
      );
    default:
      return null;
  }
};
