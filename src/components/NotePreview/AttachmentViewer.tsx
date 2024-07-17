import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Linking,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { Entypo, Foundation } from "@expo/vector-icons";
import { ATTACHMENT_TYPE } from "types";
import { BlurView } from "expo-blur"; 
import axiosApi from "services/api/axios-api";
import { Image } from 'expo-image'; 
import { Menu, MenuItem } from "react-native-material-menu";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';


const AttachmentViewer = ({ attachments = [], onAttachmentUpdate = ()=>{}, onEditLink=()=>{}}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [visibleMenu, setVisibleMenu] = useState(null);

  const fullScreenListRef = useRef(null);

  const imageAttachments = attachments.filter(
    (a) => a.type === ATTACHMENT_TYPE.IMAGE
  );
  const linkAttachments = attachments.filter(
    (a) => a.type === ATTACHMENT_TYPE.LINK
  );

  const openLink = useCallback((url) => {
    Linking.openURL(url).catch((err) =>
      console.error("An error occurred", err)
    );
  }, []);

  const deleteAttachment = useCallback(async (attachmentId) => {
    try {
      await axiosApi.delete(`/attachment/${attachmentId}`);
      setSelectedImageIndex(null);
    } catch (error) {
      console.error("Error deleting attachment:", error);
      Alert.alert("Error", "Failed to delete the attachment. Please try again.");
    }finally{
      onAttachmentUpdate();
    }
  }, [onAttachmentUpdate]);

  const handleDeletePress = useCallback((attachmentId, type) => {
    Alert.alert(
      "Delete Attachment",
      `Are you sure you want to delete this ${type}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => deleteAttachment(attachmentId), style: "destructive" }
      ]
    );
  }, [deleteAttachment]);

const renderImageThumbnail = useCallback(
  ({ item, index }) => (
    <TouchableOpacity onPress={() => setSelectedImageIndex(index)}>
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: item.url }}
          style={styles.thumbnail}
          contentFit="cover"
          transition={300}
          placeholder={item.placeholderColor || blurhash}
          cachePolicy="memory-disk"
        />
        {item.is_uploading && (
          <BlurView intensity={50} style={styles.blurOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
          </BlurView>
        )}
      </View>
    </TouchableOpacity>
  ),
  []
);

const renderLinkItem = useCallback(
  ({ item }) => (
    <View style={styles.linkContainer} key={item.id?.toString()}>
      <TouchableOpacity
        style={styles.linkContent}
        onPress={() => openLink(item.url)}
      >
        <Foundation name="link" size={18} color="#0071b0" />
        <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="tail">
          {item.description}
        </Text>
      </TouchableOpacity>
      <Menu
        visible={visibleMenu === item.id}
        anchor={
          <TouchableOpacity onPress={() => setVisibleMenu(item.id)}>
            <Entypo name="dots-three-vertical" size={18} color="#0071b0" />
          </TouchableOpacity>
        }
        onRequestClose={() => setVisibleMenu(null)}
      >
        <MenuItem onPress={() => {
          console.log('editing');
          setVisibleMenu(null);
          onEditLink(item);
        }}>Edit</MenuItem>
        <MenuItem onPress={() => {
          setVisibleMenu(null);
          handleDeletePress(item.id, 'link');
        }}>Delete</MenuItem>
      </Menu>
    </View>
  ),
  [openLink, visibleMenu, handleDeletePress ]
);

  const renderFullScreenImage = useCallback(
    ({ item }) => (
      <View style={styles.fullScreenImageContainer}>
        {imageLoading && (
          <ActivityIndicator
            size="large"
            color="#ffffff"
            style={styles.loader}
          />
        )}
        {imageError ? (
          <Text style={styles.errorText}>Failed to load image</Text>
        ) : (
          <View style={styles.fullScreenImageWrapper}>
            <Image
              source={{ uri: item.url }}
              style={styles.fullScreenImage}
              contentFit="contain"
              onLoadStart={() => {
                setImageLoading(true);
                setImageError(false);
              }}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
                console.log("Error loading full-screen image:", item.url);
              }}
            />
            {item.is_uploading && (
              <BlurView intensity={80} style={styles.fullScreenBlurOverlay}>
                <ActivityIndicator size="large" color="#ffffff" />
              </BlurView>
            )}
          </View>
        )}
      </View>
    ),
    [imageLoading, imageError]
  );

  const handleFullScreenScroll = useCallback((event) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH
    );
    setSelectedImageIndex(slideIndex);
  }, []);

  return (
    <ScrollView style={styles.container}>
      {imageAttachments.length > 0 && (
        <View>
          <FlatList
            data={imageAttachments}
            renderItem={renderImageThumbnail}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {linkAttachments.length > 0 && (
        <View style={styles.linkSection}>
          {linkAttachments.map((item) => renderLinkItem({ item }))}
        </View>
      )}

      <Modal
        visible={selectedImageIndex !== null}
        transparent={true}
        onRequestClose={() => setSelectedImageIndex(null)}
      >
        <View style={styles.modalContainer}>
          <FlatList
            ref={fullScreenListRef}
            data={imageAttachments}
            renderItem={renderFullScreenImage}
            keyExtractor={(item) => item.id.toString()}
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
              {`${selectedImageIndex !== null ? selectedImageIndex + 1 : 0} / ${
                imageAttachments.length
              }`}
            </Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeletePress(imageAttachments[selectedImageIndex].id, 'image')}
              >
                <Foundation name="trash" size={24} color="#ff4538" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedImageIndex(null)}
              >
                <Foundation name="x" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = {
  container: {
    flex: 1,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 10,
  },
  linkSection: {
    marginTop: 20,
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: 10,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
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
  },
  fullScreenBlurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 10,
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
  },
  deleteButton: {
    padding: 10,
    marginRight: 10,
  },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f8fb",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  linkContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  linkText: {
    marginLeft: 10,
    color: "#0071b0",
    flex: 1,
  },
};

export default AttachmentViewer;