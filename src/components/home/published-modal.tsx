import { CreateModalSvg } from "assets/svg/CreateModal";
import CircularLoader from "components/common/loaders/circular-loader";
import { setStringAsync } from "expo-clipboard";
import { useState } from "react";
import { TouchableHighlight } from "react-native";
import Touchable from "components/common/Touchable";
import { Text } from "react-native";
import { View } from "react-native";
import ReactNativeModal from "react-native-modal";
import { SvgXml } from "react-native-svg";
import { MAIN_URL } from "services/api/api-constants";
import { screenWidth } from "utils/common";
import LottieView from "lottie-react-native";
import threeDotLoader from "assets/lottie/threeDotLoader.json";
import threeDotLoader2 from "assets/lottie/threeDotLoader2.json";
import { useTheme } from "context";

export default ({
  visible,
  hideModal = () => {},
  isLoading = false,
  slug = "",
  onPressDone = () => {},
  onPressCancel = () => {},
  isNoteJustMadePrivate = false,
  setIsNoteJustMadePrivte = () => {},
}: PublishModalProps) => {

  const [copy, setCopy] = useState(false);
  const { Colors } = useTheme()

  const onCopy = async () => {
    setCopy(true);
    await setStringAsync(MAIN_URL + "/s/" + slug);
    setTimeout(() => {
      setCopy(false);
    }, 700);
  };

  if (!visible) return null;
  return (
    <ReactNativeModal
      isVisible={visible}
      backdropColor="rgba(0,0,0,0.3)"
      onBackdropPress={hideModal}
      animationIn={"fadeIn"}
      animationOut={"fadeOut"}
      hideModalContentWhileAnimating
      useNativeDriverForBackdrop
      backdropTransitionInTiming={500}
      backdropTransitionOutTiming={500}
      statusBarTranslucent
      backdropOpacity={0.3}
    >
      <View
        style={{
          padding: 16,
          backgroundColor: Colors.whiteWithOpacity(1),
          borderRadius: 12,
          shadowColor: Colors.blackWithOpacity(0.5),
        }}
      >
        {isNoteJustMadePrivate ? (
          <View style={{ width: screenWidth / 1.2 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <SvgXml xml={CreateModalSvg.unlock} />
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Primary-Semibold",
                  color: Colors.darkWithOpacity(1),
                  lineHeight: 19.2,
                  marginLeft: 8,
                  width: screenWidth / 1.2,
                }}
              >
                Your note is now private
              </Text>
            </View>
            <View
              style={{
                marginTop: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Touchable
                activeOpacity={0.5}
                onPress={() => {
                  hideModal();
                  setIsNoteJustMadePrivte(false);
                }}
                style={{
                  backgroundColor: Colors.darkWithOpacity(1),
                  alignSelf: "flex-start",
                  borderRadius: 12,
                  padding: 12,
                  paddingHorizontal: 16,
                }}
              >
                <Text
                  style={{
                    color: Colors.whiteWithOpacity(1),
                    fontFamily: "Primary-Semibold",
                    fontSize: 12,
                    marginLeft: 4,
                  }}
                >
                  Ok
                </Text>
              </Touchable>
            </View>
          </View>
        ) : slug?.length ? (
          <View style={{ width: screenWidth / 1.2 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <SvgXml xml={CreateModalSvg.unlock} />
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Primary-Semibold",
                  color: Colors.darkWithOpacity(1),
                  lineHeight: 19.2,
                  marginLeft: 8,
                }}
              >
                Your shareable link is ready
              </Text>
            </View>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Primary",
                color: Colors.primary,
                textDecorationLine: "underline",
                marginTop: 4,
              }}
            >
              {MAIN_URL + "/s/" + slug}
            </Text>
            <View
              style={{
                marginTop: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TouchableHighlight
                onPress={onCopy}
                style={{
                  backgroundColor: Colors.darkWithOpacity(1),
                  alignSelf: "flex-start",
                  borderRadius: 12,
                  padding: 12,
                  paddingHorizontal: 16,
                }}
                underlayColor={Colors.darkWithOpacity(0.8)}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <SvgXml xml={CreateModalSvg.publishCopy} />
                  <Text
                    style={{
                      color: Colors.whiteWithOpacity(1),
                      fontFamily: "Primary-Semibold",
                      fontSize: 12,
                      marginLeft: 4,
                    }}
                  >
                    {copy ? "Copied" : "Copy link"}
                  </Text>
                </View>
              </TouchableHighlight>
              <TouchableHighlight
                onPress={onPressDone}
                style={{
                  backgroundColor: Colors.darkWithOpacity(0.05),
                  alignSelf: "flex-start",
                  borderRadius: 12,
                  padding: 12,
                  paddingHorizontal: 16,
                  marginLeft: 12,
                }}
                underlayColor={Colors.darkWithOpacity(0.1)}
              >
                {isLoading ? (
                  <LottieView
                    source={threeDotLoader}
                    autoPlay
                    loop
                    style={{ width: 30, height: 15 }}
                  />
                ) : (
                  <Text
                    style={{
                      color: Colors.darkWithOpacity(1),
                      fontFamily: "Primary-Semibold",
                      fontSize: 12,
                    }}
                  >
                    Unpublish
                  </Text>
                )}
              </TouchableHighlight>
            </View>
          </View>
        ) : (
          <View>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Primary-Semibold",
                color: Colors.darkWithOpacity(1),
                lineHeight: 19.2,
              }}
            >
              Are you sure you want to share this note?
            </Text>
            <View
              style={{
                marginVertical: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TouchableHighlight
                onPress={onPressDone}
                style={{
                  backgroundColor: Colors.darkWithOpacity(1),
                  alignSelf: "flex-start",
                  borderRadius: 12,
                  padding: 12,
                  paddingHorizontal: 16,
                }}
                underlayColor={Colors.darkWithOpacity(0.8)}
              >
                {isLoading ? (
                  <LottieView
                    source={threeDotLoader2}
                    autoPlay
                    loop
                    style={{ width: 30, height: 15 }}
                  />
                ) : (
                  <Text
                    style={{
                      color: Colors.whiteWithOpacity(1),
                      fontFamily: "Primary-Semibold",
                      fontSize: 12,
                    }}
                  >
                    Yes
                  </Text>
                )}
              </TouchableHighlight>
              <TouchableHighlight
                onPress={onPressCancel}
                style={{
                  backgroundColor: Colors.darkWithOpacity(0.05),
                  alignSelf: "flex-start",
                  borderRadius: 12,
                  padding: 12,
                  paddingHorizontal: 16,
                  marginLeft: 12,
                }}
                underlayColor={Colors.darkWithOpacity(0.1)}
              >
                <Text
                  style={{
                    color: Colors.darkWithOpacity(1),
                    fontFamily: "Primary-Semibold",
                    fontSize: 12,
                  }}
                >
                  No
                </Text>
              </TouchableHighlight>
            </View>
            <View style={[{ flexDirection: "row", alignItems: "flex-start" }]}>
              <SvgXml xml={CreateModalSvg.info} style={{ marginTop: 1 }} />
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Primary",
                  color: Colors.grey,
                  lineHeight: 16,
                }}
              >
                {` Anyone with the link will have access to this voice note.`}
              </Text>
            </View>
          </View>
        )}
      </View>
    </ReactNativeModal>
  );
};

interface PublishModalProps {
  visible: boolean;
  hideModal: () => void;
  isPublished: boolean;
  isLoading: boolean;
  slug: string | any;
  onPressDone: () => void;
  onPressCancel: () => void;
  isNoteJustMadePrivate: boolean;
  setIsNoteJustMadePrivte: (x: boolean) => void;
}
