import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  Linking,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Foundation } from "@expo/vector-icons";
import { ATTACHMENT_TYPE } from "types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const AttachmentViewer = ({ attachments = [] }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
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

  const renderImageThumbnail = useCallback(
    ({ item, index }) => (
      <TouchableOpacity onPress={() => setSelectedImageIndex(index)}>
        <Image
          source={{ uri: item.url }}
          style={styles.thumbnail}
          resizeMode="cover"
          onError={() => console.log("Error loading thumbnail:", item.url)}
        />
      </TouchableOpacity>
    ),
    []
  );

  const renderLinkItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => openLink(item.url)}
      >
        <Foundation name="link" size={18} color="#0071b0" />
        <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="tail">
          {item.description}
        </Text>
      </TouchableOpacity>
    ),
    [openLink]
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
          <Image
            source={{ uri: item.url }}
            style={styles.fullScreenImage}
            resizeMode="contain"
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
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedImageIndex(null)}
            >
              <Foundation name="x" size={24} color="#ffffff" />
            </TouchableOpacity>
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
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f8fb",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  linkText: {
    marginLeft: 10,
    color: "#0071b0",
    flex: 1,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
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
  fullScreenImage: {
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_HEIGHT * 0.75,
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
};

export default AttachmentViewer;