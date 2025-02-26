import CircularLoader from 'components/common/loaders/circular-loader';
import Touchable from 'components/common/Touchable';
import { useTheme } from 'context';
import { View, Text } from 'react-native';
import { useDispatch } from 'react-redux';
import { setRelatedNoteId } from 'redux/reducers/relatedNoteStates';
import { Note } from 'types';
import { screenWidth } from 'utils/common';
import { formatDate } from 'utils/format-date';
import { sleep } from 'utils/Timer';

const RelatedNotesList = ({note,onPress=(id:any)=>{}}:{note: Note,onPress:(id:any)=>void}) => {
      if (!note?.related_notes?.length) return null;
      const { Colors } = useTheme()
      const dispatch = useDispatch()
      return (
        note?.transcript && (
          <View style={{ marginTop: 12 }}>
            <Text
              style={{
                fontFamily: "Primary-Semibold",
                fontSize: 12,
                color:Colors.black2,
              }}
            >
              {note?.recording_type === 5 ? 'Parent Note' : 'Related Notes'}
            </Text>
            <View
              style={{
                marginTop:
                  note?.related_notes?.length == 0 
                    ? 8
                    : 3,
              }}
            >
              {note?.related_notes?.length == 0  ? (
                <CircularLoader width={16} height={16} />
              ) : (
                note?.related_notes?.map((item: any,v:number) => {
                  return (
                    <Touchable
                      onPress={async() => {
                        dispatch(setRelatedNoteId(null))
                        await sleep(400)
                        dispatch(setRelatedNoteId(item?.id))
                        // onPress(item?.id);
                        // router.push({
                        //   pathname: "/RelatedNotes/",
                        //   params: { id: item?.id },
                        // });
                      }}
                      activeOpacity={0.6}
                      key={item?.id+v}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: Colors.grey3,
                          fontFamily: "Primary-Medium",
                          fontSize: 12,
                          width: screenWidth / 8,
                        }}
                      >
                        {formatDate(item?.recorded_at, false, true)}
                      </Text>
                      <Text
                        style={{
                          color: Colors.black2,
                          fontFamily: "Primary-Medium",
                          fontSize: 12,
                          width: screenWidth / 1.6,
                        }}
                        numberOfLines={1}
                      >
                        {item?.title}
                      </Text>
                    </Touchable>
                  );
                })
              )}
            </View>
          </View>
        )
      );
}

export default RelatedNotesList