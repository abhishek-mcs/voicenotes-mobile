import Colors from 'assets/Colors';
import CircularLoader from 'components/common/loaders/circular-loader';
import Touchable from 'components/common/Touchable';
import { router } from 'expo-router';
import React from 'react'
import { View, Text } from 'react-native';
import { Note } from 'types';
import { screenWidth } from 'utils/common';
import { formatDate } from 'utils/format-date';

const RelatedNotesList = ({note,onPress=(id:any)=>{}}:{note: Note,onPress:(id:any)=>void}) => {
      if (!note?.related_notes?.length) return null;
      return (
        note?.transcript && (
          <View style={{ marginTop: 12 }}>
            <Text
              style={{
                fontFamily: "Primary-Semibold",
                fontSize: 12,
                color: "#0D0D0D",
              }}
            >
              Related Notes
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
                      onPress={() => {
                        onPress(item?.id);
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