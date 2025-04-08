import { home } from "assets/svg/home";
import CircularLoader from "components/common/loaders/circular-loader";
import { useTheme } from "context";
import { useEffect, useMemo, useState } from "react";
import * as Haptics from "expo-haptics";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { SvgXml } from "react-native-svg";
import { useInviteAction } from "queries/home";
import { useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { setInvitePending } from "redux/reducers/hashSlice";

const SharedInvites = ({list}: any) => {
    const styles = useStyles()
    const { Colors } = useTheme()
    const dispatch = useDispatch()
    const [declineLoading, setDeclineLoading] = useState(-1)
    const [acceptLoading, setAcceptLoading] = useState(-1)
    const inviteAction = useInviteAction()
    const queryClient = useQueryClient();

    useEffect(() => {
      const refetchUserDetails = async () => {
        try {
          await queryClient.invalidateQueries("user-data");
        } catch (e) {
          console.log("error in refetching shared invites", e);
        }
      };
      console.log('Shared Invite useEffect called');
      refetchUserDetails();
      dispatch(setInvitePending(false))
    },[])

    const onAccept = async(id: string,index:any) => {
        setAcceptLoading(index)
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{})
        inviteAction.mutate(
            { id: id, status: "accept" },
            {
              onSuccess: async (data: any) => {
                try {
                  await queryClient.invalidateQueries("shared-invites");
                  await queryClient.invalidateQueries("published-recordings");
                  await queryClient.refetchQueries(['all-recording', 'shared']);
                  setAcceptLoading(-1)
                } catch (e) {
                  console.log("error in accept invite", e);
                } finally {
                  setAcceptLoading(-1)
                }
              }
            }
        )
    }

    const onDecline = async(id: string,index:any) => {
        setDeclineLoading(index)
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{})
        inviteAction.mutate(
            { id: id, status: "decline" },
            {
              onSuccess: async (data: any) => {
                try {
                  await queryClient.invalidateQueries("shared-invites");
                  await queryClient.invalidateQueries("published-recordings");
                  setDeclineLoading(-1)
                } catch (e) {
                  console.log("error in decline invite", e);
                } finally {
                  setDeclineLoading(-1)
                }
              }
            }
        )
    }

    const NoteRequestCard = ({ item, index, lastItem }: any) => (
        <View style={index !== lastItem && styles.bottomLine}>
            <View style={styles.card}>
                <View style={styles.iconContainer}>
                    <SvgXml xml={home.mail.replace('black', Colors.black2)} />
                </View>
                <View style={styles.contentContainer}>
                  <View><Text style={styles.name}>{item.name}</Text></View>
                  <View><Text style={styles.email}>({item.email}) has shared <Text style={styles.message}>{item.recording && item.recording.title || 'a voicenote'}</Text> with you</Text></View>
                </View>
            </View>
          
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => onDecline(item.id,index)} style={styles.declineButton}>
                    {declineLoading == index ? <CircularLoader color={Colors.black2} /> : <Text style={styles.declineButtonText}>Decline</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onAccept(item.id,index)} style={styles.acceptButton}>
                    {acceptLoading == index ? <CircularLoader color={Colors.whiteWithOpacity(1)} /> : <Text style={styles.acceptButtonText}>Accept</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
    
    return (
    <View style={styles.container}>
        <View style={styles.headerContainer}>
            <SvgXml xml={home.mailWithDot?.replace('black', Colors.black2)} />
            <Text style={styles.header}>Accept notes from people you know</Text>
        </View>
      
      <FlatList
        data={list||[]}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <NoteRequestCard item={item} index={index} lastItem={list.length - 1} />}
      />
    </View>
  );
};

const useStyles = () => {
  const { Colors, isLightMode } = useTheme();
  return useMemo(() => StyleSheet.create({
  container: {
    margin: 16,
    paddingTop: 16,
    backgroundColor: Colors.bottomBarButtonBg1,
    borderRadius: 16,
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  header: {
    fontFamily: "Primary-Medium",
    fontSize: 16,
    color: Colors.blackWithOpacity(1),
    lineHeight: 24
  },
  text: {
    fontFamily: "Primary",
    fontSize: 15,
    color: Colors.grey2WithOpacity(0.5),
    lineHeight: 21,
    marginTop: 4,
  },
  bottomLine: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey2WithOpacity(0.1),
  },
  card: {
    flex: 1,
    paddingTop: 18,
    marginHorizontal: 16,
    justifyContent: "space-between",
    flexDirection: "row",
    gap: 12
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 17,
    margin: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.grey2WithOpacity(0.1),
  },
  contentContainer: {
    flex: 1,
    flexShrink: 1,
    flexGrow: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontFamily: "Primary-Semibold",
    color: Colors.blackWithOpacity(1),
    lineHeight: 24,
  },
  email: {
    // width: "41%",
    fontSize: 14,
    fontFamily: "Primary",
    color: Colors.blackWithOpacity(1),
    lineHeight: 20,
    // flexWrap: "wrap",
    // overflow: "hidden",
  },
  message: {
    fontSize: 14,
    fontFamily: "Primary-Semibold",
    color: Colors.blackWithOpacity(1),
    lineHeight: 20,
  },
  declineButton: {
    minWidth: 80,
    flexDirection: 'row',
    backgroundColor: Colors.blackWithOpacity(0.1), 
    paddingHorizontal: 19,
    borderRadius: 12,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8 
  },
  acceptButton: {
    minWidth: 80,
    flexDirection: 'row',
    backgroundColor: Colors.blackWithOpacity(1), 
    paddingHorizontal: 19,
    borderRadius: 12,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8 
  },
  declineButtonText: {
    fontSize: 14, 
    color: Colors.black2, 
    fontFamily: "Primary-Semibold", 
  },
  acceptButtonText: {
    fontSize: 14, 
    color: Colors.whiteWithOpacity(1), 
    fontFamily: "Primary-Semibold", 
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 18,
    gap: 10
  },
}), [Colors]); 
}

export default SharedInvites;
