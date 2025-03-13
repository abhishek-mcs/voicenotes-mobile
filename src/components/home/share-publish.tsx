import { commonSvg } from 'assets/svg/commonSvg'
import { home } from 'assets/svg/home'
import { TextField } from 'components/common/text-field'
import Touchable from 'components/common/Touchable'
import { useTheme } from 'context'
import { router } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import { SvgXml } from 'react-native-svg'
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { isIOS } from 'utils/common'
import Publish from './publish'

const SharePublish = () => {
  const styles = useStyles()
  const { Colors, isLightMode } = useTheme()
  const [isSelected, setSelected] = useState('share');
  const [email, setEmail] = useState("");

  const invitedUsers = [
    { id: "1", name: "Aleesha John", email: "aleesha@buymeacoffee.com", image: "https://via.placeholder.com/50" },
    { id: "2", name: "Joseph Sunny", email: "joseph@buymeacoffee.com", image: "https://via.placeholder.com/50" },
    { id: "2", name: "Joseph Sunny", email: "joseph@buymeacoffee.com", image: "https://via.placeholder.com/50" },
    { id: "2", name: "Joseph Sunny", email: "joseph@buymeacoffee.com", image: "https://via.placeholder.com/50" },
  ];
  
  const notInvitedUsers = [
    { id: "2", name: "Joseph Sunny", email: "joseph@buymeacoffee.com", image: "https://via.placeholder.com/50" },
    { id: "2", name: "Joseph Sunny", email: "joseph@buymeacoffee.com", image: "https://via.placeholder.com/50" },
    { id: "2", name: "Joseph Sunny", email: "joseph@buymeacoffee.com", image: "https://via.placeholder.com/50" },
  ];

  const onClose = () => { router.back() }

  const KeyboardWrapper = useCallback(({children}:any) => isIOS ?
    children:(
      <KeyboardAwareScrollView
      automaticallyAdjustKeyboardInsets
      bottomOffset={0}
      >
        {children}
      </KeyboardAwareScrollView>
    ),[])

  return (
    <View style={styles.container}>
      <View
        style={styles.headerContainer}
      >
        <View style={styles.tabContainer}>
          <Touchable
            onPress={() => setSelected('share')}
            style={[{ paddingVertical: 12, alignSelf: "flex-end" }, isSelected =='share' && styles.activeTab]}
            activeOpacity={0.6}
          >
            <Text
              style={isSelected=='share'?styles.activeTitle:styles.inactiveTitle}
            >
              Share
            </Text>
          </Touchable>
          <Touchable
            onPress={() => setSelected('publish')}
            style={[{ paddingVertical: 12, alignSelf: "flex-end" }, isSelected =='publish' && styles.activeTab]}
            activeOpacity={0.6}
          >
            <Text
              style={[isSelected=='publish'?styles.activeTitle:styles.inactiveTitle]}
            >
              Publish
            </Text>
          </Touchable>
        </View>
        <View>
          <Touchable onPress={onClose} style={styles.closeContainer}>
            <SvgXml xml={commonSvg.close?.replace("#717171",Colors.askClose)} />
          </Touchable>
        </View>
      </View>
      {isSelected == 'share' ? <View style={styles.contentContainer}>
        <View style={styles.inputContainer}>
          <KeyboardWrapper>
            <TextField
              style={{ flex: 1 }}
              inputStyle={{ height: 36, color:Colors.text, borderRadius: 10, borderWidth: 1.5, backgroundColor:Colors.inputBg3 }}
              value={email}
              labelStyle={{color:Colors.text5,fontFamily:'Primary-Semibold',fontSize:16,marginBottom:13}}
              onChangeText={(t:string)=>setEmail(t)}
              placeholder="Enter email"
              placeholderTextColor={Colors.grey}
              autoCapitalize="none"
            />
          </KeyboardWrapper>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAwareScrollView 
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
          bottomOffset={20}
        >
          {/* Invited Users */}
          <Text style={styles.invitedTitle}>Invited</Text>
          {invitedUsers.map((user) => (
            <View key={user.id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
            {/* <Image source={{ uri: user.image }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} /> */}
            <View style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10, backgroundColor: Colors.grey7 }}></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontFamily: 'Primary-Semibold', color: Colors.black2, lineHeight: 15, marginBottom: 2 }}>{user.name}</Text>
              <Text style={{ fontSize: 12, fontFamily: 'Primary', color: Colors.grey3, lineHeight: 15  }}>{user.email}</Text>
            </View>
            <TouchableOpacity style={{padding: 4}}>
              <SvgXml xml={home.moreNew?.replace('#0D0D0D',Colors.more)}/>
            </TouchableOpacity>
          </View>
          ))}

          {/* Not Invited Users */}
          <Text style={styles.invitedTitle}>Not invited</Text>
          {notInvitedUsers.map((user) => (
            <View key={user.id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
              {/* <Image source={{ uri: user.image }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} /> */}
              <View style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10, backgroundColor: Colors.grey7 }}></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontFamily: 'Primary-Semibold', color: Colors.black2, lineHeight: 15, marginBottom: 2 }}>{user.name}</Text>
                <Text style={{ fontSize: 12, fontFamily: 'Primary', color: Colors.grey3, lineHeight: 15  }}>{user.email}</Text>
              </View>
              <TouchableOpacity>
                <Text style={{ color: Colors.blue, fontSize: 14, fontFamily: 'Primary-Medium' }}>Share</Text>
              </TouchableOpacity>
            </View>
          ))}
        </KeyboardAwareScrollView>
        {/* Copy Link Button */}
        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.copyLinkButton}>
            {/* <Ionicons name="link" size={20} color="black" /> */}
            <Text style={styles.copyLinkText}>Copy link</Text>
          </TouchableOpacity>
          </View>
      </View> : 
      <Publish />
      }
    </View>
  )
}

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
  container: {
    // maxHeight: screenHeight * 0.8,
    flex: 1,
    backgroundColor: Colors.bgColor8
  },
  headerContainer: {
    flexDirection: "row",
    gap: 20,
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: isIOS ? 0 : 16,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    height: isIOS? 50 : 60,
  },
  tabContainer: {
    flex: 1, 
    flexDirection: "row", 
    gap: 16, 
    justifyContent: "flex-start" 
  },
  title: {
    fontSize:14,
    fontFamily:"Primary-Semibold",
    color: Colors.black2,
  },
  activeTab: { 
    borderBottomColor: Colors.black2, 
    borderBottomWidth: 1,
  },
  activeTitle: { 
    fontSize: 16,
    color: Colors.black2,
    fontFamily: "Primary-Semibold",
  },
  inactiveTitle: { 
    fontSize: 16,
    color:Colors.grey3,
    fontFamily: "Primary-Semibold", 
  },
  closeContainer: {
    paddingVertical: 19, 
    paddingRight: 12, 
    alignSelf: 'flex-end' 
  },
  contentContainer: {
    padding: 18,
  },
  inputContainer: {
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 20,
    gap: 14
  },
  inputField: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: "black", 
    paddingHorizontal: 19,
    borderRadius: 10,
    height: 36,
    alignItems: 'center',
    marginTop: 8 
  },
  shareButtonText: {
    color: "white", 
    fontFamily: "Primary-Semibold", 
  },
  invitedTitle: {
    color: Colors.grey3,
    fontSize: 14, 
    lineHeight: 18,
    fontFamily: "Primary", 
    marginBottom: 10
  },
  scrollView: {
    // flex: 1,
    width: '100%'
  },
  scrollViewContent: {
      flexGrow: 1,
      paddingBottom: 180 
  },
  footerContainer: {
    position: 'absolute',
    bottom: 100,
    height: 100,
    left: 0,
    right: 0,
    backgroundColor: Colors.bgColor8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  copyLinkButton: {
    backgroundColor: Colors.blackWithOpacity(0.05),
    alignItems: "center",
    borderRadius: 10
  },
  copyLinkText: {
    fontSize: 14,
    fontFamily: 'Primary-Semibold',
    paddingVertical: 12,
    color: Colors.askLogo
  }
}), [Colors]); 
}

export default SharePublish