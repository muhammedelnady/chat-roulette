/** @format */

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { memo, useCallback, useEffect } from "react";
import { Modal, Pressable, ScrollView, useWindowDimensions } from "react-native";
import {
  GestureDetector,
  GestureHandlerRootView,
  usePanGesture,
} from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";

import { AnimatedPressable } from "@/src/presentation/components/atoms";
import { useHaptics, useUI } from "@/src/presentation/hooks";
import { MOTION_SPRING, projectVelocity, rubberband } from "@/src/presentation/theme";

import { CHAT_MESSAGE_BUBBLE_TEST_IDS } from "./ChatMessageBubble.constants";
import { styles } from "./ChatMessageBubble.styles";

export interface MessageImageLightboxProps {
  readonly imageUrl: string | null;
  readonly onClose: () => void;
}

const DISMISS_THRESHOLD = 140;

export const MessageImageLightbox = memo<MessageImageLightboxProps>(({ imageUrl, onClose }) => {
  const { colors, t } = useUI();
  const haptics = useHaptics();
  const { width: winWidth, height: winHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const translateY = useSharedValue(0);
  const startY = useSharedValue(0);

  const triggerLightHaptic = useCallback(() => {
    void haptics.light();
  }, [haptics]);

  useEffect(() => {
    cancelAnimation(translateY);
    translateY.set(0);
    return () => {
      cancelAnimation(translateY);
    };
  }, [imageUrl, translateY]);

  const dismissHeight = winHeight > 0 ? winHeight : 800;

  const pan = usePanGesture({
    activeOffsetY: [-12, 12],
    enabled: Boolean(imageUrl),
    onActivate: () => {
      startY.set(translateY.get());
    },
    onUpdate: (e) => {
      const next = startY.get() + e.translationY;
      translateY.set(next >= 0 ? next : rubberband(next, dismissHeight));
    },
    onDeactivate: (e) => {
      const projected = translateY.get() + projectVelocity(e.velocityY);
      if (projected > DISMISS_THRESHOLD) {
        translateY.set(
          withSpring(
            dismissHeight,
            { ...MOTION_SPRING.dismiss, velocity: e.velocityY },
            (finished) => {
              if (finished) {
                scheduleOnRN(onClose);
              }
            }
          )
        );
      } else {
        translateY.set(withSpring(0, { ...MOTION_SPRING.sheet, velocity: e.velocityY }));
        scheduleOnRN(triggerLightHaptic);
      }
    },
  });

  const backdropStyle = useAnimatedStyle(
    () => ({
      opacity: interpolate(
        Math.abs(translateY.get()),
        [0, dismissHeight * 0.7],
        [1, 0],
        Extrapolation.CLAMP
      ),
    }),
    [dismissHeight]
  );

  const imageMotionStyle = useAnimatedStyle(() => {
    const offset = translateY.get();
    if (reducedMotion) {
      return {
        opacity: interpolate(
          Math.abs(offset),
          [0, dismissHeight * 0.6],
          [1, 0],
          Extrapolation.CLAMP
        ),
      };
    }
    return {
      transform: [
        { translateY: offset },
        {
          scale: interpolate(Math.abs(offset), [0, dismissHeight], [1, 0.9], Extrapolation.CLAMP),
        },
      ],
    };
  }, [dismissHeight, reducedMotion]);

  if (!imageUrl) {
    return null;
  }

  return (
    <Modal
      testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.LIGHTBOX_MODAL}
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.lightboxRoot}>
        <Animated.View style={styles.lightboxContainer}>
          <Animated.View
            style={[styles.lightboxBackdrop, { backgroundColor: colors.scrim }, backdropStyle]}
          >
            <Pressable style={styles.lightboxRoot} onPress={onClose} />
          </Animated.View>
          <AnimatedPressable
            testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.LIGHTBOX_CLOSE}
            accessibilityRole="button"
            accessibilityLabel={t("chat.closeLightbox")}
            scaleTo={0.94}
            hitSlop={10}
            onPress={onClose}
            style={[
              styles.lightboxCloseBtn,
              {
                top: Math.max(24, insets.top + 12),
                backgroundColor: colors.surfaceGlass,
                borderColor: colors.borderStrong,
              },
            ]}
          >
            <Ionicons name="close" size={22} color={colors.textPrimary} />
          </AnimatedPressable>
          <GestureDetector gesture={pan}>
            <Animated.View style={[styles.lightboxRoot, styles.lightboxScroll, imageMotionStyle]}>
              <ScrollView
                style={styles.lightboxScroll}
                contentContainerStyle={styles.lightboxScrollContent}
                maximumZoomScale={3}
                minimumZoomScale={1}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                centerContent
              >
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: winWidth * 0.92, height: winHeight * 0.68 }}
                  contentFit="contain"
                />
              </ScrollView>
            </Animated.View>
          </GestureDetector>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
});

MessageImageLightbox.displayName = "MessageImageLightbox";
