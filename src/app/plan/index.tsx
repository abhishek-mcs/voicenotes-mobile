import { settingsSvg } from "assets/svg/settingsSvg"
import { useRouter } from "expo-router"
import { SafeAreaView, StyleSheet, View, Text, Pressable } from "react-native"
import { SvgXml } from "react-native-svg"
import { isIOS } from "utils/common"
import { iapSvg } from "assets/svg/iapSvg"
import { commonSvg } from "assets/svg/commonSvg"
import Touchable from "components/common/Touchable";
import { useSelector } from "react-redux"
import { RootState } from "redux/store/store"
import { useMemo } from "react"
import { useTheme } from "context"

export default () => {
    const router = useRouter()
    const { Colors } = useTheme()
    const styles = useStyles()
    const { userDetails }:any = useSelector((state: RootState) => state.userDetails);
    
    return <SafeAreaView style={styles.root}>
        <View style={styles.close}>
            <Touchable onPress={() => router.back()} style={{padding:12, alignSelf:'flex-end', marginRight: 2}} activeOpacity={0.6}>
                <SvgXml xml={settingsSvg.close?.replace("#0D0D0D",Colors.black2)} width={30} height={30} />
            </Touchable>
        </View>
        <View style={styles.header}>
            <Text style={styles.heading}>Your plan</Text>
        </View>
        <View style={styles.content}>
            <View style={styles.chip}>
                <View style={styles.chipLabel}>
                    <Text style={styles.plan}>{userDetails.subscription_status ? userDetails.subscription_plan : "Free"}</Text>
                </View>
                {userDetails.subscription_status && <View style={[styles.chipLabel, { justifyContent: 'flex-end' }]}>
                    <SvgXml xml={commonSvg.activeTick} />
                    <Text style={{ color:Colors.green2, fontFamily: 'Primary-Medium' }}>Active</Text>
                </View>}
            </View>
            {userDetails.subscription_plan !== "Believer" && <Pressable onPress={() => router.push('/premium/')} style={styles.action}>
                <SvgXml xml={iapSvg.lightning} />
                <Text style={{ color: Colors.blue, fontFamily: 'Primary-Bold' }} >Upgrade for lifetime</Text>
            </Pressable>}
        </View>
    </SafeAreaView>
}

const useStyles = () => {
    const { Colors } = useTheme();
    return useMemo(() =>  StyleSheet.create({
    root: { 
        flex: 1,
        backgroundColor: Colors.bgColor1,
        paddingTop: isIOS ? 0 : 40 
    },
    close: {
        flex: 1,
        justifyContent: 'flex-end',
        width: '100%'
    },
    header: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    heading: {
        fontFamily: 'Primary-Bold',
        fontSize: 20,
        color:Colors.blackWithOpacity(1)
    },
    content: {
        flex: 11,
        alignItems: 'center',
        paddingHorizontal: 25
    },
    chip: {
        width: '100%',
        height: 60,
        borderRadius: 10,
        backgroundColor:Colors.bgColor2,
        flexDirection: 'row',
        marginBottom: 10
    },
    chipLabel: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 5
    },
    plan: {
        fontFamily: "Primary-Medium",
        fontSize: 15,
        color:Colors.blackWithOpacity(1)
    },
    action: {
        width: '100%',
        flexDirection: 'row',
        gap: 5
    }
}), [Colors]); // Recreate styles when Colors change
};