import { commonSvg } from 'assets/svg/commonSvg'
import { home } from 'assets/svg/home'
import { setStringAsync } from "expo-clipboard";
import { TextField } from 'components/common/text-field'
import Touchable from 'components/common/Touchable'
import { useTheme } from 'context'
import { router, useLocalSearchParams } from 'expo-router'
import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, KeyboardAvoidingView, Pressable, ActivityIndicator } from 'react-native'
import { SvgXml } from 'react-native-svg'
import { isIOS } from 'utils/common'
import Publish from './publish'
import { Menu, MenuItem } from 'react-native-material-menu';
import { useGetSharedList, useRevokeShare, useShareRecording } from 'queries/home/share'
import { useQueryClient } from 'react-query'
import { MAIN_URL } from 'services/api/api-constants';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'redux/store/store';
import CircularLoader from 'components/common/loaders/circular-loader';
import ThreeDotLoader from 'components/common/loaders/three-dot-loader';
import { validateEmail } from 'utils/api-queries/auth/signin-mutations';
import { useKeyboardController } from 'react-native-keyboard-controller'
import { ScrollView } from 'react-native';
import { shareSvg } from 'assets/svg/shareSvg';
import { publishPublicly } from 'queries/share';
import { updateRecordingDetails } from 'redux/reducers/recordingStates';

const SharePublish = () => {
  const styles = useStyles()
  const menuRefs = useRef<any[]>([]);
  const channelMenuRefs = useRef<any[]>([]);
  const queryClient = useQueryClient();
  const { Colors, isLightMode } = useTheme()
  const [isSelected, setSelected] = useState('share');
  const {noteId} = useSelector((state:RootState)=>state.editStates)
  const { recordingList } = useSelector((state: RootState) => state.recordingStates);
  const { note_id } = useLocalSearchParams()
  const getShareList = useGetSharedList(noteId)
  const shareList = getShareList.data?.data
  const shareRecording = useShareRecording();
  const revokeShared = useRevokeShare();
  const [loading, setLoading] = useState(false)
  const [channelLoading, setChannelLoading] = useState(-1)
  const [revokeLoading, setRevokeLoading] = useState(-1)
  const [shareLoading, setShareLoading] = useState(-1)
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState('');
  const [sharedUsers, setSharedUsers] = useState(shareList?.users ? shareList.users : []);
  const sharedUserEmails = sharedUsers.map((user: any) => user.email);
  const [recent, setRecent] = useState(shareList.recent ? shareList.recent : []);
  const { userDetails }: any = useSelector((state: RootState) => state.userDetails);
  const currentChannels = userDetails?.team?.channels || [];
  const [channels, setChannels] = useState(shareList.channels ? shareList.channels : []);
  const [copy, setCopy] = useState(false)
  const { keyboardHeight }:any = useKeyboardController()
  const dispatch = useDispatch()

  // these are data & hooks for the public sharing feature
  const note = recordingList.find(item => item.id === note_id)
  const [isPublic, setPublic] = useState<boolean>(note?.is_published)
  const [publicing, setPublicing] = useState<boolean>(false)
  const [copyStatus, setCopyStatus] = useState<string>("Copy shareable link")

  const showMenu = (index: number) => menuRefs.current[index]?.show();
  const hideMenu = (index: number) => menuRefs.current[index]?.hide();

  const showChannelMenu = (index: number) => channelMenuRefs.current[index]?.show();
  const hideChannelMenu = (index: number) => channelMenuRefs.current[index]?.hide();

  const onClose = () => { router.back() }

  const togglePublic = async () => {
      setPublicing(true)
      try {
          await publishPublicly(note?.id);
          dispatch(updateRecordingDetails({
              recordingId: note?.id,
              data: {
                  is_published: !isPublic
              }
          }))
          setPublic(prev => !prev)
      } catch(error) {
          console.error(error)
      } finally { setPublicing(false) }
  }

  const onCopy = async () => {
    setCopy(true)
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => {}
    );
    await setStringAsync(MAIN_URL + "/s/" + noteId);
    setTimeout(() => {
      setCopy(false)
    }
    , 1000)
  };

  const onShareNewEmail = (emailId: string) => {
    if (!validateEmail(emailId) || emailId === "") {
      setEmailError('Please enter a valid email address.')
    } else if (sharedUserEmails.includes(emailId)) {
      setEmailError('User already invited. Try a different email.')
    } else if (emailId === userDetails?.email) {
      setEmailError('You cannot share a recording with yourself.')
    } else {
      setLoading(true)
      onShareRecording(emailId, -1)
    }
  }

  const onRevoke = async (emailId: string, index: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{})
    setRevokeLoading(index)
    revokeShared.mutate(
      { id: noteId, email: emailId, isChannel: false },
      {
        onSuccess: async () => {
          try {
            await queryClient.invalidateQueries("share-list");
          } catch (e) {
            console.log("error in share recording", e);
          } finally {
            setRevokeLoading(-1)
          }
        }
      }
    )
    hideMenu(index)
  }

  useEffect(() => {
    if (shareList) {
      setSharedUsers(shareList?.users ? shareList.users : []);
      setRecent(shareList.recent ? shareList.recent : []);
      setChannels(shareList.channels ? shareList.channels : []);
    }
  },[shareList])

  const onShareRecording = async( emailId: string, index: number ) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{})
    setShareLoading(index)
    shareRecording.mutate(
      { id: noteId, emails: emailId, channel: false },
      {
        onSuccess: async () => {
          try {
            await queryClient.invalidateQueries("share-list");
          } catch (e) {
            console.log("error in share recording", e);
          } finally {
            setEmail('')
            setLoading(false)
            setShareLoading(-1)
          }
        }
      }
    )
  }

  const onShareChannel = async( channelId: string, index: number ) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{})
    setChannelLoading(index)
    shareRecording.mutate(
      { id: note_id, channel: true, channels: [channelId] },
      {
        onSuccess: async () => {
          try {
            await queryClient.invalidateQueries("share-list");
          } catch (e) {
            console.log("error in share recording", e);
          } finally {
            setChannelLoading(-1)
          }
        }
      }
    )
  }

  const onRevokeChannel = async(channelId: string, index: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{})
    setChannelLoading(index)
    revokeShared.mutate(
      { id: note_id, isChannel: true, channel: channelId },
      {
        onSuccess: async () => {
          try {
            await queryClient.invalidateQueries("share-list");
          } catch (e) {
            console.log("error in share recording", e);
          } finally {
            setChannelLoading(-1)
          }
        }
      }
    )
    hideMenu(index)
  }

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
          {note?.recording_type !== 3 && <Touchable
            onPress={() => setSelected('publish')}
            style={[{ paddingVertical: 12, gap: 5, alignItems: 'center', flexDirection: 'row', alignSelf: "flex-end" }, isSelected =='publish' && styles.activeTab]}
            activeOpacity={0.6}
          >
            <Text
              style={[isSelected=='publish'?styles.activeTitle:styles.inactiveTitle]}
            >
              Publish to pages
            </Text>
            <View 
              style={{ 
                borderRadius: 20,
                ...(isIOS ? {
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 0 }, // Center the shadow (0,0) to spread it evenly
                  shadowOpacity: 0.20, // Increase opacity for better visibility
                  shadowRadius: 5, // Slightly reduced but still substantial
                  marginHorizontal: 5, // Add a small margin to ensure shadow is visible on all sides
                } : {
                  // Android shadow - increase elevation for better visibility
                  elevation: 8,
                }),
              }}
            >
              <SvgXml xml={shareSvg.new.replace("#1E5A34", Colors.newChip)} />
            </View>
          </Touchable>}
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
      {isSelected == 'share' ? 
      
      <View style={styles.contentContainer}>
        <View style={styles.inputContainer}>
            <TextField
              style={{ flex: 1 }}
              inputStyle={{ height: 36, color:Colors.text, borderRadius: 10, borderWidth: 1.5, backgroundColor:Colors.inputBg3 }}
              value={email}
              labelStyle={{color:Colors.text5,fontFamily:'Primary-Semibold',fontSize:16,marginBottom:13}}
              onChangeText={(t:string)=>{
                setEmailError('')
                setEmail(t)
              }}
              placeholder="Enter email"
              placeholderTextColor={Colors.grey}
              autoCapitalize="none"
            />
          <TouchableOpacity onPress={() => onShareNewEmail(email)} style={styles.shareButton}>
            {loading ? <CircularLoader color={Colors.whiteWithOpacity(1)} /> : <Text style={styles.shareButtonText}>Share</Text>}
          </TouchableOpacity>
        </View>
        {emailError.length>0 ? 
            <Text style={{color:Colors.redWithOpacity(1),fontFamily:'Primary',fontSize:14,marginBottom:18}}>{emailError}</Text> : <View style={{marginBottom:8}}></View>
        }
        <View style={styles.publicContainer}>
          {isPublic ? <View style={{ width: '100%', flexDirection: 'row', gap: 5, alignItems: 'center', paddingHorizontal: 10, marginBottom: 10 }}>
            <Pressable
              style={[styles.publicButton, { backgroundColor: Colors.bottomBarButtonBg1}]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                  () => {}
                );
                await setStringAsync(MAIN_URL + "/s/" + note?.id);
                setCopyStatus("Copied!")
                setTimeout(() => setCopyStatus("Copy shareable link"), 1000)
              }}
            >
              <Text style={{ color: Colors.askLogo, fontFamily: 'Primary-Medium' }}>{copyStatus}</Text>
            </Pressable>
            <Pressable onPress={publicing ? null : togglePublic} style={[styles.publicButton, { backgroundColor: "rgba(255, 69, 56, 0.05)" }]}>
              {publicing ? <ActivityIndicator color={"rgba(255, 69, 56, 1)"} /> : <Text style={{ fontFamily: 'Primary-Medium', color: "rgba(255, 69, 56, 1)" }}>Turn off link sharing</Text>}
            </Pressable>
          </View> :
          <Pressable onPress={publicing ? null : togglePublic} style={{ width: '98%', backgroundColor: Colors.askLogo, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }} >
            {publicing ? <ActivityIndicator color={!isIOS ? Colors.whiteWithOpacity(1) : undefined} /> : <Text style={{ fontFamily: 'Primary-Bold', color: Colors.whiteWithOpacity(1), fontSize: 14 }}>Get shareable link</Text>}
          </Pressable>}
          <View style={{ width: '100%', flexDirection: 'row', gap: 5, alignItems: 'center', paddingHorizontal: 10 }}>
            <SvgXml xml={shareSvg.info} />
            <Text style={{ fontFamily: 'Primary', color: Colors.greyWithOpacity(1), fontSize: 11 }}>Anyone with the link will have access to this voice note.</Text>
          </View>
        </View>
        <KeyboardAvoidingView
          behavior={isIOS ? 'padding' : undefined}
          keyboardVerticalOffset={80}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
          {/* Channels */}
          {currentChannels.length > 0 && <Text style={styles.invitedTitle}>Channels</Text>}
          {currentChannels.length > 0 && currentChannels.map((user: any, index: number) => (
            <View key={index} style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
              {user.photo_url ? <Image source={{ uri: user.photo_url }} style={{ width: 32, height: 32, borderRadius: 10, marginRight: 10 }} /> :
                <View style={{ width: 32, height: 32, backgroundColor: isLightMode ? Colors.darkWithOpacity(0.1) : Colors.darkWithOpacity(1) , borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                  <Text style={{ fontSize: 16, color: Colors.black2 }} >{user.name.charAt(0)}</Text>
                </View> 
              }
              <View style={{ flex: 1 }}>
                {user.name && <Text style={{ fontSize: 13, fontFamily: 'Primary-Semibold', color: Colors.black2, lineHeight: 15, marginBottom: 2 }}>{user.name}</Text>}
                <Text style={{ fontSize: 12, fontFamily: 'Primary', color: Colors.grey3, lineHeight: 15  }}>{user.members.length} members</Text>
              </View>
              <TouchableOpacity onPress={() => onShareChannel(user.ulid, index)}>
              {channelLoading == index ? <CircularLoader color={Colors.text12} /> 
                : <View>
                    {channels.includes(user.ulid) ? 
                    <Menu
                      ref={(ref) => (channelMenuRefs.current[index] = ref)}
                      anchor={
                        <TouchableOpacity
                          hitSlop={{ right: 10, left: 10, top: 10, bottom: 10 }}
                          onPress={() => showChannelMenu(index)}
                        >
                          <SvgXml xml={home.moreNew?.replace("#0D0D0D", Colors.more)} />
                        </TouchableOpacity>
                      }
                      onRequestClose={() => hideChannelMenu(index)}
                      style={{ 
                        borderRadius: 14, 
                        borderWidth: 0,
                        elevation: 0,
                        backgroundColor: isLightMode ? Colors.white1 : Colors.darkWithOpacity(1), 
                        shadowColor: 'transparent',
                      }}
                    >
                      <MenuItem
                        style={{
                          height: 40,
                          minWidth: 100,
                          borderRadius: 14,
                          borderWidth: 0,
                          // borderColor: isLightMode ? Colors.grey3 : Colors.darkWithOpacity(1),
                          backgroundColor: isLightMode ? Colors.white1 : Colors.darkWithOpacity(1),
                        }}
                        onPress={() => onRevokeChannel(user.ulid, index)}
                        pressColor="transparent" // Prevents background color change
                      >
                        <Text style={{ color: "red" }}>Revoke</Text>
                      </MenuItem>
                    </Menu>
                    : <Text style={{ color: Colors.blue, fontSize: 14, fontFamily: 'Primary-Medium' }}>Share</Text>}
                  </View>
              }
              </TouchableOpacity>
            </View>
          ))}

          {/* Shared Users */}
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
              {revokeLoading == index ?  
                <View style={{ marginRight: -10 }}>
                  <ThreeDotLoader
                    size={20}
                      colorFilters={[
                        {keypath:'Left',color:Colors.text},
                        {keypath:'Mid',color:Colors.text},
                        {keypath:'Right',color:Colors.text}
                      ]}/>
                </View>
              : 
                <Menu
                  ref={(ref) => (menuRefs.current[index] = ref)}
                  anchor={
                    <TouchableOpacity
                      hitSlop={{ right: 10, left: 10, top: 10, bottom: 10 }}
                      onPress={() => showMenu(index)}
                    >
                      <SvgXml xml={home.moreNew?.replace("#0D0D0D", Colors.more)} />
                    </TouchableOpacity>
                  }
                  onRequestClose={() => hideMenu(index)}
                  style={{ 
                    borderRadius: 14, 
                    borderWidth: 0,
                    elevation: 0,
                    backgroundColor: isLightMode ? Colors.white1 : Colors.darkWithOpacity(1), 
                    shadowColor: 'transparent',
                  }}
                >
                  <MenuItem
                    style={{
                      height: 40,
                      minWidth: 100,
                      borderRadius: 14,
                      borderWidth: 0,
                      // borderColor: isLightMode ? Colors.grey3 : Colors.darkWithOpacity(1),
                      backgroundColor: isLightMode ? Colors.white1 : Colors.darkWithOpacity(1),
                    }}
                    onPress={() => onRevoke(user.email, index)}
                    pressColor="transparent" // Prevents background color change
                  >
                    <Text style={{ color: "red" }}>Revoke</Text>
                  </MenuItem>
                </Menu>
              }
            </View>
          ))}

          {/* Recently shared Users */}
          {recent.length > 0 && <Text style={styles.invitedTitle}>Recent</Text>}
          {recent.length > 0 && recent.map((user: any, index: number) => (
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
              <TouchableOpacity onPress={() => onShareRecording(user.email, index)}>
                {shareLoading == index ? <CircularLoader color={Colors.text12} /> : <Text style={{ color: Colors.blue, fontSize: 14, fontFamily: 'Primary-Medium' }}>Share</Text>}
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        </KeyboardAvoidingView>
        {/* Copy Link Button */}
        <View style={styles.footerContainer}>
          <View style={{ height: 80 }}>
            <TouchableOpacity onPress={onCopy} activeOpacity={0.6}>
              <View style={styles.copyLinkButton}>
                <SvgXml xml={commonSvg.link?.replace("black", Colors.askLogo)} />
                <Text style={styles.copyLinkText}>{copy ? 'Copied' : 'Copy link'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View> : 
      <Publish />
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
    flex:1,
    padding: 18,
  },
  inputContainer: {
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 12,
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
    backgroundColor: Colors.askLogo, 
    paddingHorizontal: 19,
    borderRadius: 20,
    height: 36,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
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
    // flexGrow: 1,
    width: '100%',
    
  },
  scrollViewContent: {
      // flex: 1,
      flexGrow: 1,
  },
  footerContainer: {
    // height:10,
    position: 'absolute',
    bottom: isIOS?0:10,
    left: 0,
    right: 0,
    backgroundColor: Colors.bgColor8,
    paddingHorizontal: 16,
  },
  copyLinkButton: {
    height: 45,
    marginTop:16,
    // marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.bottomBarButtonBg1,
    alignItems: "center",
    borderRadius: 10,
    gap:8
  },
  copyLinkText: {
    fontSize: 14,
    fontFamily: 'Primary-Semibold',
    paddingVertical: 12,
    color: Colors.askLogo
  },
  publicContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15
  },
  publicButton: {
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 50,
  }
}), [Colors]); 
}

export default SharePublish