import Colors from "assets/Colors";
import { home } from "assets/svg/home";
import Recording from "components/common/recording";
import RecButton from "components/common/recording/rec-button";
import { useEffect, useState } from "react";
import { StyleSheet,  useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "redux/store/store";
import { isIOS } from "utils/common";

interface Props {
  onRecord: () => void;
  onStopRecord: (d:number,r?:boolean) => void;
  onAsk: () => void;
  onCreate: () => void;
  recEnabled: boolean;
  onCancel: ()=> void;
}

export default ({ onRecord, onAsk, onCreate, recEnabled = false,onStopRecord,onCancel }: Props) => {
    const [duration, setDuration] = useState(0);
    const {token,userDetails}:any = useSelector((state: RootState) => state.userDetails);
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 375; // Threshold for small screens like iPhone 13 mini
    useEffect(() => {
        if (recEnabled) {
          const timerId = setInterval(async() => {
            setDuration(prevDuration => {
              const newDuration = prevDuration + 1000;
              if (newDuration >= 60000&&(!token||!userDetails?.subscription_status)) {
                onStopRecord(newDuration);
                return 0;
              }else if(newDuration>=600000&&!!token){
                onStopRecord(newDuration,true);
                return 0
              }
              return newDuration;
            }); // Update duration every second
          }, 1000);

          return () => {
            clearInterval(timerId);
            setDuration(0);
          }; // Cleanup the interval on component unmount
        }
      }, [recEnabled]);

  return (
    <View style={styles.tab}>
      {!recEnabled ? (
        <>
          <RecButton
            onPress={onRecord}
            title='Record'
            icon={home.record}
            underlayColor={Colors.blackWithOpacity(0.7)}
            bgColor={'#000'}
            color="#fff"
            style={styles.recordButton}
          />
          <RecButton
            onPress={onAsk}
            title={isSmallScreen ? 'Ask AI' : 'Ask my AI'}
            icon={home.ask}
            style={styles.askButton}
          />
          <RecButton
            onPress={onCreate}
            title='Create'
            icon={home.create}
            style={styles.createButton}
          />
        </>
      ) : (
        <Recording
          totalDuration={!!token && userDetails?.subscription_status ? '' : '/01:00'}
          duration={duration}
          onCancel={onCancel}
          onStopRecord={onStopRecord}
        />
      )}
    </View>
);
};


const styles = StyleSheet.create({
  tab: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 30,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: isIOS ? '#00000026' : 'rgba(0,0,0,0.7)',
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 0.5 },
    shadowRadius: 1.5,
    elevation: 3,
    paddingHorizontal: '3%',
    paddingVertical: '2%',
  },
  recordButton: {
    flex: 1,
  },
  askButton: {
    flex: 1,
    marginHorizontal: '2%',
  },
  createButton: {
    flex: 1,
  },
});