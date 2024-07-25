import { notePreviewSVG } from "assets/svg/notePreviewSVG";
import { Text, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { capitalizeFirstLetter } from "utils/common";

const StatusIndicator = ({ status }:{status:string}) => {

    if(status === 'processed') return null

    const getStatusIcon = () => {
      switch (status.toLowerCase().trim()) {
        case 'processing':
        case 'uploading':
          return <SvgXml style={{ marginLeft: 4 }} xml={notePreviewSVG.progress} />;
        case 'failed':
          return <SvgXml style={{ marginLeft: 4 }} xml={notePreviewSVG.failedWarning} />;
        default:
          return null;
      }
    };
  
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {getStatusIcon()}
        {status && (
          <Text style={{ marginLeft: 4 }}>
            {capitalizeFirstLetter(status)}...
          </Text>
        )}
      </View>
    );
  };
  

export default StatusIndicator