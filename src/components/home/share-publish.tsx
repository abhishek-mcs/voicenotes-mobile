import { commonSvg } from 'assets/svg/commonSvg'
import { home } from 'assets/svg/home'
import { setStringAsync } from "expo-clipboard";
import { TextField } from 'components/common/text-field'
import Touchable from 'components/common/Touchable'
import { useTheme } from 'context'
import { router, useLocalSearchParams } from 'expo-router'
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native'
import { SvgXml } from 'react-native-svg'
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { isIOS } from 'utils/common'
import Publish from './publish'
import { Menu, MenuItem } from 'react-native-material-menu';
import { useGetSharedList, useRevokeShare, useShareRecording } from 'queries/home/share'
import { useQueryClient } from 'react-query'
import { MAIN_URL } from 'services/api/api-constants';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store/store';

interface PublishModalProps {
  isPublished?: any;
  sharedList?: any;
}

const SharePublish = ({
  isPublished,
  sharedList = [],
} : PublishModalProps) => {
  const styles = useStyles()
  const menuRefs = useRef<any[]>([]);
  const queryClient = useQueryClient();
  const { Colors, isLightMode } = useTheme()
  const [isSelected, setSelected] = useState('share');
  const {noteId} = useSelector((state:RootState)=>state.editStates)
  const {is_published} = useLocalSearchParams()
  const getShareList = useGetSharedList(noteId)
  const shareList = getShareList.data?.data
  const shareRecording = useShareRecording();
  const revokeShared = useRevokeShare();
  const [copy, setCopy] = useState(false);
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("");
  const [sharedUsers, setSharedUsers] = useState(shareList?.users ? shareList.users : []);
  const [recent, setRecent] = useState(shareList.recent ? shareList.recent : []);
  const [visible, setVisible] = useState(false);

  // const hideMenu = () => setVisible(false);

  // const showMenu = () => setVisible(true);

  const showMenu = (index: number) => menuRefs.current[index]?.show();
  const hideMenu = (index: number) => menuRefs.current[index]?.hide();

  const onClose = () => { router.back() }

  const onCopy = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => {}
    );
    setCopy(true);
    await setStringAsync(MAIN_URL + "/s/" + noteId);
    setTimeout(() => {
      setCopy(false);
    }, 700);
  };

  const onShareNewEmail = (emailId: string) => {
    onShareRecording(emailId)
    setEmail('')
  }

  const onRevoke = (emailId: string, index: any) => {
    revokeShared.mutate(
      { id: noteId, email: emailId },
      {
        onSuccess: async () => {
          try {
            setLoading(true)
            await queryClient.invalidateQueries("share-list");
          } catch (e) {
            console.log("error in share recording", e);
          } finally {
            setLoading(false)
          }
        }
      }
    )
    hideMenu(index)
  }

  useEffect(() => {
    console.log('params',is_published);
    
  },[is_published])

  useEffect(() => {
    if (shareList) {
      setSharedUsers(shareList?.users ? shareList.users : []);
      setRecent(shareList.recent ? shareList.recent : []);
    }
  },[shareList])

  const onShareRecording = ( emailId: string ) => {
    shareRecording.mutate(
      { id: noteId, emails: emailId },
      {
        onSuccess: async () => {
          try {
            setLoading(true)
            await queryClient.invalidateQueries("share-list");
          } catch (e) {
            console.log("error in share recording", e);
          } finally {
            setLoading(false)
          }
        }
      }
    )
  }

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
    <SafeAreaView style={styles.container}>
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
            {isLightMode ? 
            <SvgXml xml={commonSvg.close?.replace("#717171",Colors.askClose)} /> :
            <SvgXml xml={commonSvg.close?.replace("#717171",'#fff')} />
            }
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
          <TouchableOpacity onPress={() => onShareNewEmail(email)} style={styles.shareButton}>
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
          {sharedUsers.length > 0 && <Text style={styles.invitedTitle}>Shared</Text>}
          {sharedUsers.length > 0 && sharedUsers.map((user: any, index: number) => (
            <View key={index} style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
              {user.photo_url ? <Image source={{ uri: user.photo_url }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10 }} /> :
                <View style={{ width: 32, height: 32, backgroundColor: isLightMode ? Colors.darkWithOpacity(0.1) : Colors.darkWithOpacity(0.8) , borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                  <SvgXml xml={commonSvg.unknown?.replace("white",Colors.lightGrey)} />
                </View> 
              }
              <View style={{ flex: 1 }}>
                {user.name && <Text style={{ fontSize: 13, fontFamily: 'Primary-Semibold', color: Colors.black2, lineHeight: 15, marginBottom: 2 }}>{user.name}</Text>}
                <Text style={{ fontSize: 12, fontFamily: 'Primary', color: Colors.grey3, lineHeight: 15  }}>{user.email}</Text>
              </View>
              <Menu
                ref={(ref) => (menuRefs.current[index] = ref)}
                visible={visible}
                anchor={<TouchableOpacity hitSlop={{ right: 10, left: 10, top: 10, bottom: 10 }} onPress={() => showMenu(index)}><SvgXml xml={home.moreNew?.replace('#0D0D0D',Colors.more)}/></TouchableOpacity>}
                onRequestClose={() => hideMenu(index)}
              >
                <MenuItem onPress={() => onRevoke(user.email, index)}>
                  <Text style={{ color: 'red' }}>Revoke</Text>
                </MenuItem>
              </Menu>
            </View>
          ))}

          {/* Not Invited Users */}
          <Text style={styles.invitedTitle}>Recent</Text>
          {recent.map((user: any, index: number) => (
            <View key={index} style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
              {user.photo_url ? <Image source={{ uri: user.photo_url }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10 }} /> :
                <View style={{ width: 32, height: 32, backgroundColor: isLightMode ? Colors.darkWithOpacity(0.1) : Colors.darkWithOpacity(0.8) , borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                  <SvgXml xml={commonSvg.unknown?.replace("white",Colors.lightGrey)} />
                </View> 
              }
              <View style={{ flex: 1 }}>
                {user.name && <Text style={{ fontSize: 13, fontFamily: 'Primary-Semibold', color: Colors.black2, lineHeight: 15, marginBottom: 2 }}>{user.name}</Text>}
                <Text style={{ fontSize: 12, fontFamily: 'Primary', color: Colors.grey3, lineHeight: 15  }}>{user.email}</Text>
              </View>
              <TouchableOpacity onPress={() => onShareRecording(user.email)}>
                <Text style={{ color: Colors.blue, fontSize: 14, fontFamily: 'Primary-Medium' }}>Share</Text>
              </TouchableOpacity>
            </View>
          ))}
        </KeyboardAwareScrollView>
        {/* Copy Link Button */}
        <View style={styles.footerContainer}>
          <TouchableOpacity onPress={onCopy} style={styles.copyLinkButton}>
            {/* <Ionicons name="link" size={20} color="black" /> */}
            <Text style={styles.copyLinkText}>Copy link</Text>
          </TouchableOpacity>
          </View>
      </View> : 
      <Publish 
        slug={noteId} 
        isPublished={is_published}  
      />
      }
    </SafeAreaView>
  )
}

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
  container: {
    // maxHeight: screenHeight * 0.8,
    flex: 1,
    backgroundColor: Colors.bgColor8,
    paddingTop: isIOS ? 0 : 40
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
    backgroundColor: Colors.blackWithOpacity(1), 
    paddingHorizontal: 19,
    borderRadius: 10,
    height: 36,
    alignItems: 'center',
    marginTop: 8 
  },
  shareButtonText: {
    fontSize: 14, 
    color: Colors.whiteWithOpacity(1), 
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