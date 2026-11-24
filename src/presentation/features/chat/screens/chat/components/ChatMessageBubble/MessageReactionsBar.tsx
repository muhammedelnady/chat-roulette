/** @format */

import { memo } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";

import { AnimatedPressable, Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";
import {
  LIST_ITEM_REFLOW,
  MOTION_DURATION,
  REACTION_CAPSULE_ENTER,
  REACTION_CAPSULE_EXIT,
  SOFT_POP_ENTER,
  SOFT_POP_EXIT,
} from "@/src/presentation/theme";

import { CHAT_CONSTANTS } from "../../../../shared/constants";

import { CHAT_MESSAGE_BUBBLE_TEST_IDS } from "./ChatMessageBubble.constants";
import { styles } from "./ChatMessageBubble.styles";

export interface MessageReactionsBarProps {
  readonly reactionEntries: readonly (readonly [string, readonly string[]])[];
  readonly showPicker: boolean;
  readonly isOwn: boolean;
  readonly currentUserId?: string;
  readonly onReactionPress: (emoji: string) => void;
}

const REACTION_PILL_TRANSITION = [
  "transform",
  "opacity",
  "backgroundColor",
  "borderColor",
] as const;

export const MessageReactionsBar = memo<MessageReactionsBarProps>(
  ({ reactionEntries, showPicker, isOwn, currentUserId = "you", onReactionPress }) => {
    const { colors, shadows, t } = useUI();

    if (reactionEntries.length === 0 && !showPicker) {
      return null;
    }

    return (
      <View style={[styles.reactionsWrapper, { alignItems: isOwn ? "flex-end" : "flex-start" }]}>
        {reactionEntries.length > 0 ? (
          <View style={styles.reactionsRow}>
            {reactionEntries.map(([emoji, users]) => {
              const isMine = users.includes(currentUserId);
              return (
                <Animated.View
                  key={emoji}
                  entering={SOFT_POP_ENTER}
                  exiting={SOFT_POP_EXIT}
                  layout={LIST_ITEM_REFLOW}
                >
                  <AnimatedPressable
                    testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.REACTION_PILL(emoji)}
                    accessibilityRole="button"
                    accessibilityLabel={`${t("chat.reactionOption", { emoji })} (${users.length})`}
                    accessibilityState={{ selected: isMine }}
                    hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                    scaleTo={0.95}
                    transitionProperties={REACTION_PILL_TRANSITION}
                    transitionDurationMs={MOTION_DURATION.micro}
                    onPress={() => onReactionPress(emoji)}
                    style={[
                      styles.reactionPill,
                      shadows.sm,
                      {
                        backgroundColor: isMine ? colors.primaryTint : colors.surface,
                        borderColor: isMine ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text variant="xs" weight="medium" style={styles.reactionCountText}>
                      {emoji} {users.length}
                    </Text>
                  </AnimatedPressable>
                </Animated.View>
              );
            })}
          </View>
        ) : null}

        {showPicker ? (
          <Animated.View
            testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.REACTION_PICKER}
            entering={REACTION_CAPSULE_ENTER}
            exiting={REACTION_CAPSULE_EXIT}
            style={[
              styles.quickReactCapsule,
              shadows.md,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.borderStrong,
              },
            ]}
          >
            {CHAT_CONSTANTS.REACTION_EMOJIS.map((emoji) => (
              <AnimatedPressable
                key={emoji}
                testID={CHAT_MESSAGE_BUBBLE_TEST_IDS.QUICK_REACT_OPTION(emoji)}
                accessibilityRole="button"
                accessibilityLabel={t("chat.reactionOption", { emoji })}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                scaleTo={0.92}
                onPress={() => onReactionPress(emoji)}
                style={[styles.quickReactBtn, { backgroundColor: colors.surface }]}
              >
                <Text variant="sm">{emoji}</Text>
              </AnimatedPressable>
            ))}
          </Animated.View>
        ) : null}
      </View>
    );
  }
);

MessageReactionsBar.displayName = "MessageReactionsBar";
