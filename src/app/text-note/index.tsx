import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Pressable,
  SafeAreaView,
  InteractionManager,
} from "react-native";
import { useRouter } from "expo-router";
import { SvgXml } from "react-native-svg";
import { home } from "assets/svg/home";
import { useTheme } from "context";
import { isIOS } from "utils/common";
import ThreeDotLoader from "components/common/loaders/three-dot-loader";
import { KeyboardAwareScrollView, KeyboardStickyView } from "react-native-keyboard-controller";

const TextNote = () => {
  const router = useRouter();
  const { Colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [textnote, setTextnote] = useState('');
  const inputRef:any = useRef<TextInput>()

  useEffect(()=>{
    InteractionManager.runAfterInteractions(()=>{
        inputRef.current?.focus()
    })
  },[])

  const onCancel = () => router?.back();

  const onDone = () => {
    router.back();
  };

  const onWrite = (note:any) => {
    setTextnote(note)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor:Colors.bgColor8 }}>
      {/* Header */}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          height:60,
          paddingTop: isIOS ? 0 : 16,
          borderBottomColor: Colors.border,
          borderBottomWidth: 1,
          paddingHorizontal:8
        }}
      >
        <Pressable
          onPress={onCancel}
          style={{ padding: 12,width:'20%' }}
        >
          <Text
            style={{ fontFamily: "Primary", fontSize: 16, color: Colors.grey }}
          >
            Cancel
          </Text>
        </Pressable>

        <Text
          style={{
            fontFamily: "Primary-Semibold",
            fontSize: 16,
            color: Colors.text,width:'20%',
            textAlign:'center'
          }}
        >
          Write
        </Text>
        {isLoading ? (
          <View style={{width:'20%'}}>
            <ThreeDotLoader
              colorFilters={[
                { keypath: "Left", color: Colors.text },
                { keypath: "Mid", color: Colors.text },
                { keypath: "Right", color: Colors.text },
              ]}
            />
          </View>
        ) : (
          <Pressable
            onPress={onDone}
            style={{ padding: 12, width:'20%',alignItems:'flex-end'}}
          >
            <Text
              style={{
                fontFamily: "Primary-Semibold",
                fontSize: 16,
                color: Colors.blue,
              }}
            >
              Save
            </Text>
          </Pressable>
        )}
      </View>

      {/* Text Input Area */}
      <KeyboardAwareScrollView>
      <TextInput
        ref={inputRef}
        style={{ flex: 1, borderColor: "gray", margin: 16, padding: 8, color: '#fff' }}
        multiline
        placeholder="Write your note here..."
        placeholderTextColor={Colors.grey3}
        onChange={onWrite}
        value={textnote}
        onSubmitEditing={onDone}
        returnKeyType="done"
        scrollEnabled={false}
        selectTextOnFocus={false}
      />
      </KeyboardAwareScrollView>

<KeyboardStickyView style={{height:60,justifyContent:'center',backgroundColor:Colors.bgColor8}} offset={{opened:34}}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          paddingRight: 24,
        }}
      >
        <Pressable>
          <SvgXml xml={home.img?.replace(/#0D0D0D/g, Colors.black2)} />
        </Pressable>
      </View>
      </KeyboardStickyView>
    </SafeAreaView>
  );
};

export default TextNote;
