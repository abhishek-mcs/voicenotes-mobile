import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Pressable, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { home } from 'assets/svg/home';
import { useTheme } from 'context';
import { isIOS } from 'utils/common';
import ThreeDotLoader from 'components/common/loaders/three-dot-loader';
// ... existing imports ...

const TextNote = () => {
    const router = useRouter();
    const {Colors} = useTheme();
    const [isLoading, setIsLoading] = useState(false)

    const handleDone = () => {
        router.back();
    };

    const onCancel = () => router?.back()

    const onDone = () => {
        router.back()
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {/* Header */}
            
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems:'center',
          marginTop: 16,
          paddingTop: isIOS ? 0 : 16,
          borderBottomColor:Colors.border,
          borderBottomWidth:1
        }}
      >
        <Pressable
          onPress={onCancel}
          style={{ padding: 12, alignSelf: "flex-end" }}
        >
          <Text
            style={{ fontFamily: "Primary", fontSize: 16, color: Colors.grey }}
          >
            Cancel
          </Text>
        </Pressable>
        
        <Text
            style={{ fontFamily: "Primary-Semibold", fontSize: 16, color: Colors.text, textAlignVertical:'center' }}
          >
            Write
          </Text>
        {isLoading ? (
          <View style={{ alignSelf: "flex-end" }}>
            <ThreeDotLoader
                colorFilters={[
                  {keypath:'Left',color:Colors.text},
                  {keypath:'Mid',color:Colors.text},
                  {keypath:'Right',color:Colors.text}
                ]}/>
          </View>
        ) : (
          <Pressable
            onPress={onDone}
            style={{ padding: 12, alignSelf: "flex-end" }}
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
            <TextInput
                style={{ flex: 1, borderColor: 'gray', margin: 16, padding: 8 }}
                multiline
                placeholder="Write your note here..."
                placeholderTextColor={Colors.grey3}
            />

            {/* Footer with Image Uploader */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 32 }}>
                <TouchableOpacity>
                    <SvgXml xml={home.img?.replace(/#0D0D0D/g,Colors.black2)} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default TextNote;
