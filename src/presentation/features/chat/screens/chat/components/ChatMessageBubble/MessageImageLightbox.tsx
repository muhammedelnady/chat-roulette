/** @format */

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { memo } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

import { useUI } from "@/src/presentation/hooks";

import { CHAT_MESSAGE_BUBBLE_TEST_IDS } from "./ChatMessageBubble.constants";
import { styles } from "./ChatMessageBubble.styles";

export interface MessageImageLightboxProps {
  readonly imageUrl: string | null;
  readonly onClose: () => void;
}

export const MessageImageLightbox = memo<MessageImageLightboxProps>(({ imageUrl, onClose }) => {
  const { colors } = useUI();
  return (
    <Modal
      testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.LIGHTBOX_MODAL}
      visible={Boolean(imageUrl)}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.lightboxContainer, { backgroundColor: colors.scrim }]}>
        <Pressable
          testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.LIGHTBOX_CLOSE}
          onPress={onClose}
          style={({ pressed }) => [styles.lightboxCloseBtn, pressed && { opacity: 0.8 }]}
        >
          <Ionicons name="close" size={26} color={colors.textOnPrimary} />
        </Pressable>
        {imageUrl ? (
          <ScrollView
            style={styles.lightboxScroll}
            contentContainerStyle={styles.lightboxScrollContent}
            maximumZoomScale={3}
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            centerContent
          >
            <Image source={{ uri: imageUrl }} style={styles.lightboxImage} contentFit="contain" />
          </ScrollView>
        ) : null}
      </View>
    </Modal>
  );
});

MessageImageLightbox.displayName = "MessageImageLightbox";
