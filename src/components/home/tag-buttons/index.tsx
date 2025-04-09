import { home } from "assets/svg/home";
import MoreOptions from "components/common/more-options";
import Touchable from "components/common/Touchable";
import { usePinTag, usePinTagDelete } from "queries/home";
import { useMemo, useCallback, useEffect } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { Text, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { useQueryClient } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { setTagsFilter } from "redux/reducers/hashSlice";
import { RootState } from "redux/store/store";
import { capitalizeFirstLetter, screenWidth } from "utils/common";
import * as Haptics from "expo-haptics";
import { useTheme } from "context";
import { useDialog } from "context/DialogContext";

export const TagButton = ({
  title = "",
  style = {},
  onPress = () => {},
  icon = "",
  from = "",
  activeInvites=false,
}) => {
  const dispatch = useDispatch();
  const { hashFilter } = useSelector((state: RootState) => state.hash);
  const styles = useStyles()

  const setTag = (tag: string) => {
    dispatch(setTagsFilter(tag));
  };

  const onClickTag = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
      () => {}
    );
    if (!!icon) {
      onPress();
    } else {
      setTag(title);
      onPress();
    }
  };
  const selected = hashFilter === title && from == "";
  return (
    <Touchable
      style={[styles.tagButton, selected ? styles.activeTagContainer : {}]}
      onPress={onClickTag}
      activeOpacity={1}
    > 
      <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
      {activeInvites && <View style={{height:8,width:8,borderRadius:5,backgroundColor:'red',alignSelf:'center'}}></View>}
        <Text
          style={[styles.tagButtonText, style, selected ? styles.activeTag : {}]}
        > 
          {title == "" ? "All" : capitalizeFirstLetter(title)}
        </Text>
        {!!icon && <SvgXml xml={icon} />}
      </View>
    </Touchable>
  );
};

export const ShowMoreTagsButton = ({
  title = "Show More",
  onPress = () => {},
}) => {
  const { Colors } = useTheme()
  const styles = useStyles()
  return (
    <Touchable style={styles.tagButton} onPress={onPress} activeOpacity={1}>
      <Text style={[styles.tagButtonText, { color: Colors.grey3 }]}>
        {title}
      </Text>
    </Touchable>
  );
};

export default function TagButtons({
  hashFilter = "",
  pinnedTags = [],
  pinnedTagsData = [],
  isDefaultHash = true,
  tagsData=[],
  pendingInvites=false,
}: {
  hashFilter: any;
  pinnedTags: any;
  pinnedTagsData: any;
  isDefaultHash: boolean;
  tagsData:any;
  pendingInvites?:boolean
}) {
  const isPinned = pinnedTags?.length > 0;
  const id =
  (isDefaultHash ? pinnedTagsData : tagsData)?.find((v: any) => v?.name === hashFilter)?.id || null;
  const pinTagMutation = usePinTag(id);
  const pinTagDelete = usePinTagDelete(id);
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { Colors, isLightMode } = useTheme()
  const styles = useStyles()
  const {showDialog} = useDialog()
  const count =
  (isDefaultHash ? pinnedTagsData : tagsData)?.find((v: any) => v?.name === hashFilter)?.recordings_count || null;

  const options = [
    {
      title: !isDefaultHash?"Pin":"Unpin",
      systemIcon: !isDefaultHash?"mappin":"mappin.slash",
      androidIcon: !isDefaultHash?"pin-outline":"pin-off-outline",
      onPress: () =>
        pinTagMutation.mutate(
          { is_pinned: !isDefaultHash },
          {
            onSuccess: async () => await queryClient.resetQueries("all-tags"),
          }
        ),
    },
    {
      title: "Delete",
      destructive: true,
      systemIcon: "trash",
      androidIcon:"delete-outline",
      onPress: () =>
        showDialog("", "Are you sure you want to delete?", [
          {
            text: "No",
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: async () => {
              pinTagDelete.mutate("", {
                onSuccess: async () => {
                  dispatch(setTagsFilter(""));
                  await queryClient.resetQueries("all-tags");
                },
              });
            },
          },
        ],{userInterfaceStyle:isLightMode?"light":"dark"}),
    },
  ];
  const RenderButton=useCallback(()=>{
    if (isDefaultHash)
    return (
      <View style={styles.tagButtonsContainer}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 17 }}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <TagButton title="" style={{ color: Colors.grey3 }} />
          <TagButton title="shared" style={{ color: Colors.grey3 }} activeInvites={pendingInvites} />
          <TagButton title="starred" style={{ color: Colors.grey3 }} />
          {isPinned &&
            pinnedTags?.map((v: any) => (
              <TagButton key={v} title={v} style={{ color: Colors.grey3 }} />
            ))}
        </ScrollView>
      </View>
    )
  else
    return (
      <View style={{paddingHorizontal:17,marginTop:8}}>
        <TagButton
          title={hashFilter}
          activeInvites={hashFilter == 'shared'?pendingInvites:false}
          onPress={() => dispatch(setTagsFilter(""))}
          icon={home.smallClose}
          from="single"
        />
      </View>
    );
  },[isDefaultHash,isPinned,pinnedTags,pendingInvites]);
    return (
      <View>
        <RenderButton/>
        {(isPinned && pinnedTags?.includes(hashFilter)||!isDefaultHash) && (
          <View style={styles.tagPreview}>
            <View>
              <Text style={styles.tagName} numberOfLines={1}>{capitalizeFirstLetter(hashFilter)}</Text>
              <Text style={styles.tagNoteCount} numberOfLines={1}>{`${count ? count : '0'} ${count > 1 || !count ? 'notes' : 'note'}`}.</Text>
            </View>
            <MoreOptions options={options}>
              <SvgXml xml={home.moreRounded?.replace(/black/g,Colors.blackWithOpacity(1))} />
            </MoreOptions>
          </View>
        )}
      </View>
    )
}

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
  tagButtonsContainer: {
    marginTop: 8,
  },
  tagButtonsContainer2: {
    marginTop: 8,
    justifyContent: "space-between",
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
  },
  tagButton: {
    height: 33,
    paddingHorizontal: 12,
    backgroundColor: Colors.bgColor3(0.05),
    borderRadius: 56,
    marginRight: 5,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    alignSelf: "flex-start",
    gap: 7,
  },
  tagButtonText: {
    fontSize: 14,
    fontFamily: "Primary-Medium",
    color: Colors.black2,
  },
  tagPreview: {
    borderBottomWidth: 0.5,
    borderColor: Colors.grey4WithOpacity(86.67),
    paddingHorizontal: 17,
    paddingBottom: 11,
    paddingTop: 21,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tagName: {
    fontFamily: "Primary-Bold",
    fontSize: 16,
    color: Colors.blackWithOpacity(1),
    lineHeight: 20,
    width:screenWidth/1.4
  },
  tagNoteCount: {
    fontFamily: "Primary-Semibold",
    fontSize: 12,
    color: Colors.grey,
    lineHeight: 20,
    width:screenWidth/1.4
  },
  activeTag: {
    color: Colors.text,
    // fontFamily:'Primary-Bold'
  },
  activeTagContainer: {  },
}), [Colors]); // Recreate styles when Colors change
};
