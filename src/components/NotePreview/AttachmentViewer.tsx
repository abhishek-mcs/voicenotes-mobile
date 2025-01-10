import { useState, useCallback, useRef, useEffect, useMemo, memo } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Linking,
  Dimensions,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur"; 
import axiosApi from "services/api/axios-api";
import { Image, ImageBackground } from 'expo-image'; 
import { Menu, MenuItem } from "react-native-material-menu";
import { SvgXml } from "react-native-svg";
import { notePreviewSVG } from "assets/svg/notePreviewSVG";
import CircularLoader from "components/common/loaders/circular-loader";
import { ATTACHMENT_TYPE } from "types";
import { Portal } from "@gorhom/portal";
import BottomSheet, { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { isAndroid, isIOS, screenHeight } from "utils/common";
import { useTheme } from "context";
import { useQueryClient } from "react-query";
import MoreOptions from "components/common/more-options";
import { useDialog } from "context/DialogContext";
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const blurhash = 'LaC*Ibx]xvtRu6W@f+S2NGX8RiWA';

interface AttachmentViewerProps {
  attachments: any;
  onAttachmentUpdate: () => void;
  onEditLink: (linkData: any) => void;
  isShared: boolean;
}

const AttachmentViewer = ({ 
  attachments = [], 
  onAttachmentUpdate, 
  onEditLink ,
  isShared=false
}: AttachmentViewerProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [visibleMenu, setVisibleMenu] = useState(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { Colors,isLightMode } = useTheme()
  const styles = useStyles()
  const {showDialog} = useDialog()

  const fullScreenListRef = useRef(null);
  const thumbnailListRef = useRef<FlatList>(null);
  const queryClient = useQueryClient()

  // Memoize filtered attachments
  const imageAttachments = useMemo(() => 
    attachments.filter((a:any) => a.type === ATTACHMENT_TYPE.IMAGE),
    [attachments]
  );
  
  const linkAttachments = useMemo(() => 
    attachments.filter((a:any)=> a.type === ATTACHMENT_TYPE.LINK),
    [attachments]
  );

  useEffect(() => {
    if (imageAttachments.some((img:any) => img?.is_uploading) && thumbnailListRef.current) {
      thumbnailListRef?.current?.scrollToEnd({ animated: true });
    }
  }, [imageAttachments]);

  const openLink = useCallback((url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("An error occurred", err)
    );
  }, []);

  const deleteAttachment = useCallback(async (attachmentId: string) => {
    try {
      await axiosApi.delete(`/attachment/${attachmentId}`);
      setSelectedImageIndex(null);
      queryClient.invalidateQueries('single-recording')
      onClose()
    } catch (error) {
      console.error("Error deleting attachment:", error);
      showDialog("Error", "Failed to delete the attachment. Please try again.",[],{userInterfaceStyle:isLightMode?"light":"dark"});
    } finally {
      onAttachmentUpdate();
    }
  }, []);

  const handleDeletePress = useCallback((attachmentId: string, type: string) => {
    // console.log(attachmentId,type)
    showDialog(
      "Delete Attachment",
      `Are you sure you want to delete this ${type}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => deleteAttachment(attachmentId), style: "destructive" }
      ],{userInterfaceStyle:isLightMode?"light":"dark"}
    );
  }, []);

  // Memoize render functions


  const renderLinkItem = useCallback(({ item, index }: any) => (
    <View style={styles.linkContainer} key={`${item.id}-${index}`}>
      <Pressable
        style={styles.linkContent}
        onPress={() => openLink(item.url)}
      >
        <SvgXml xml={notePreviewSVG.link} />
        <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="tail">
          {item.description}
        </Text>
      </Pressable>
      {!isShared&&
      <MoreOptions options={[
        {
          title:'Edit',
          systemIcon:'square.and.pencil',
          onPress:() => {
          onEditLink(item);
          setVisibleMenu(null);
        }},
        {
          title:'Delete',
          destructive:true,
          systemIcon:'trash',
          onPress:() => {
            handleDeletePress(item.id, 'link');
            setVisibleMenu(null);
          }}
        ]}>
          <SvgXml xml={notePreviewSVG.more} style={{paddingVertical:6, paddingHorizontal: 16}} />
      </MoreOptions>}
    </View>
  ), []);

  const renderFullScreenImage = useCallback(
    ({ item }:any) => (
      <View style={styles.fullScreenImageContainer}>
        <Image
          source={{ uri: item.url }}
          style={styles.fullScreenImage}
          contentFit="contain"
          transition={300}
          cachePolicy="memory-disk"
        />
        {item.is_uploading && (
          <BlurView intensity={80} style={styles.fullScreenBlurOverlay}>
            <CircularLoader />
          </BlurView>
        )}
      </View>
    ),
    []
  );

  const handleFullScreenScroll = useCallback((event:any) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH
    );
    // setSelectedImageIndex(slideIndex);
  }, []);

  const onClose=() =>{ setSelectedImageIndex(null);bottomSheetRef?.current?.close()}

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setSelectedImageIndex(null);
    } else if (index === 0) {
    }
  }, []);

  // In the AttachmentViewer component, update the FlatList renderItem
  // ... inside AttachmentViewer component ...
  const renderImageThumbnail = ({item, index}:any) => 
    <ImageThumbnail 
      item={item} 
      index={index} 
      setSelectedImageIndex={setSelectedImageIndex}
    />

  return (
    <ScrollView contentContainerStyle={styles.container} contentInsetAdjustmentBehavior="never">
      {imageAttachments.length > 0 && (
        <View>
          <FlatList
            ref={thumbnailListRef}
            data={imageAttachments}
            renderItem={renderImageThumbnail}
            keyExtractor={useCallback((item:any) => item.id.toString(), [])}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {linkAttachments.length > 0 && (
        <View style={styles.linkSection}>
          {linkAttachments.map((item:any, index:number) => renderLinkItem({ item, index }))}
        </View>
      )}

      <Portal>
      <BottomSheet
        style={styles.bottomSheet}
        ref={bottomSheetRef}
        handleComponent={null}
        backgroundComponent={(props: BottomSheetBackdropProps) => <View/>}
        index={selectedImageIndex !== null ? 0:-1}
        snapPoints={isAndroid?[screenHeight+40]:[screenHeight]}
        onChange={handleSheetChanges}
        enablePanDownToClose
        onClose={()=>setSelectedImageIndex(null)}
      >
        <View style={styles.modalContainer}>
          <FlatList
            ref={fullScreenListRef}
            data={imageAttachments}
            renderItem={renderFullScreenImage}
            keyExtractor={(item:any) => item?.id.toString()}
            horizontal
            pagingEnabled
            initialScrollIndex={selectedImageIndex}
            getItemLayout={(data, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onScroll={handleFullScreenScroll}
            onMomentumScrollEnd={handleFullScreenScroll}
          />
          <View style={styles.modalHeader}>
            <Text style={styles.imageCounter}>
              {`${selectedImageIndex !== null ? selectedImageIndex + 1 : 1} / ${
                imageAttachments.length
              }`}
            </Text>
            <View style={styles.headerButtons}>
              {!isShared&&
              <Pressable
                style={styles.deleteButton}
                onPress={() => selectedImageIndex !== null&&handleDeletePress(imageAttachments[selectedImageIndex]?.id, 'image')}
              >
                <SvgXml xml={notePreviewSVG.delete}/>
              </Pressable>}
              <Pressable
                style={styles.closeButton}
                onPress={onClose}
              >
                <SvgXml xml={notePreviewSVG.close}/>
              </Pressable>
            </View>
          </View>
        </View>
      </BottomSheet>
      </Portal>
    </ScrollView>
  );
};


  // Memoize ImageThumbnail component
  const ImageThumbnail = ({ item, index, setSelectedImageIndex }:any) => {
    const [imageLoading, setImageLoading] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);
    const styles = useStyles();
    const { Colors } = useTheme()

    // Memoize getCombinedProgress
    const getCombinedProgress = useCallback(() => {
      if (item.is_uploading|| imageLoading) {
        return loadProgress * 95;
      } 
      return 100;
    }, [item.is_uploading, imageLoading, loadProgress]);

    // Memoize onPress handler
    const handlePress = useCallback(() => {
      setSelectedImageIndex(index);
    }, [index, setSelectedImageIndex]);

    return (
      <Pressable onPress={handlePress}>
        <View style={styles.thumbnailContainer}>
          <ImageBackground
            source={{ uri: item.url }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={0}
            cachePolicy={"disk"}
            placeholder={blurhash}
            onLoadStart={() => {
              setImageLoading(true);
              setLoadProgress(0);
            }}
            onProgress={({ loaded, total }) => {
              setLoadProgress(loaded / total);
            }}
            onLoadEnd={() => {
              setImageLoading(false);
              setLoadProgress(1);
            }}
          />
          {(item.is_uploading ) && (
            <BlurView intensity={50} style={styles.blurOverlay}>
              <AnimatedCircularProgress
                size={25}
                width={2.5}
                fill={getCombinedProgress()}
                tintColor={Colors.whiteWithOpacity(1)}
                backgroundColor={Colors.whiteWithOpacity(0.3)}
                rotation={0}
              />
            </BlurView>
          )}
        </View>
      </Pressable>
    );
  };

const useStyles = () => {
  const { Colors, isLightMode } = useTheme();
  return useMemo(() => StyleSheet.create({
  bottomSheet: {
    flex:1,
    // height:screenHeight,
    backgroundColor:Colors.bgColor10(0.7)
  },
  container: {
    flex:1,
    marginVertical:10,
    gap:10
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 10,
  },
  linkSection: {
    gap: 5
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: 2.5  ,
    width: 100,
    height: 100,
    borderRadius: 4,
    overflow:'hidden'
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 2,
    backgroundColor:Colors.inputBg2
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.bgColor10(0.9),
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImageWrapper: {
    position: 'relative',
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_HEIGHT * 0.75,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden'
  },
  fullScreenBlurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  modalHeader: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  imageCounter: {
    color: "white",
    fontSize: 18,
  },
  closeButton: {
    padding: 14,
    backgroundColor:Colors.darkWithOpacity(1),
    borderRadius: 50
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "white",
    fontSize: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop:20
  },
  deleteButton: {
    padding: 13,
    marginRight: 10,
    backgroundColor:Colors.darkWithOpacity(1),
    borderRadius: 50
  },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.lightBlueWithOpacity(isLightMode?0.05:0.15),
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  linkContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingVertical: 4,
    paddingLeft: 8
  },
  linkText: {
    marginLeft: 10,
    color: Colors.lightBlueWithOpacity(0.8),
    flex: 1,
  },
}), [Colors]); // Recreate styles when Colors change
};

export default AttachmentViewer;