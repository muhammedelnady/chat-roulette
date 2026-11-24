/** @format */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useCallback, useMemo, useState } from "react";
import { type LayoutChangeEvent, ScrollView, TextInput, View } from "react-native";
import Animated from "react-native-reanimated";

import { HapticFeedbackType } from "@/src/domain/services/HapticFeedbackType";
import { isProduction, isSimulatedChatMode } from "@/src/infrastructure/system/env";
import { AnimatedPressable, PulseDot, Text } from "@/src/presentation/components/atoms";
import { useHaptics, useScreenFocused, useUI } from "@/src/presentation/hooks";
import {
  CSS_EASE_OUT,
  gradients,
  MOTION_DURATION,
  SOFT_POP_ENTER,
  SOFT_POP_EXIT,
} from "@/src/presentation/theme";

import { RecruiterControlBar, RouletteHeroCard } from "../components";

import { CHAT_ROOMS_TEST_IDS, ROOM_CATEGORY_FILTERS } from "./ChatRoomsContent.constants";
import { styles } from "./ChatRoomsContent.styles";
import type { ChatRoomsViewModel } from "./ChatRoomsContent.types";

export interface ChatRoomsListHeaderProps {
  readonly viewModel: ChatRoomsViewModel;
  readonly onSearchFocus?: (y: number) => void;
}

const CHIP_TRANSITION_PROPERTIES = [
  "transform",
  "opacity",
  "backgroundColor",
  "borderColor",
] as const;

export const ChatRoomsListHeader = memo<ChatRoomsListHeaderProps>(
  ({ viewModel, onSearchFocus }) => {
    const { colors, shadows, t, isRTL, isDark } = useUI();
    const haptics = useHaptics();
    const isScreenFocused = useScreenFocused();
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchBoxY, setSearchBoxY] = useState(0);

    const handleSearchLayout = useCallback((e: LayoutChangeEvent) => {
      setSearchBoxY(e.nativeEvent.layout.y);
    }, []);

    const handleFocus = useCallback(() => {
      setIsSearchFocused(true);
      onSearchFocus?.(searchBoxY);
    }, [onSearchFocus, searchBoxY]);

    const handleHaptics = useCallback(
      (type: HapticFeedbackType) => haptics.trigger(type),
      [haptics]
    );

    const activeFilterLabel = useMemo(() => {
      const match = ROOM_CATEGORY_FILTERS.find((cat) => cat.key === viewModel.selectedCategory);
      return match ? t(match.labelKey) : t("rooms.categoryAll");
    }, [viewModel.selectedCategory, t]);

    return (
      <>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.brandCluster}>
              <LinearGradient
                colors={gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.brandEmblem, shadows.glowPrimary]}
              >
                <Ionicons name="radio" size={18} color={colors.textOnPrimary} />
              </LinearGradient>
              <View style={styles.brandTextGroup}>
                <Text
                  variant="2xl"
                  weight="bold"
                  color={colors.textPrimary}
                  style={styles.brandTitle}
                >
                  {t("rooms.title")}
                </Text>
                <Text variant="xs" color={colors.textSecondary} numberOfLines={1}>
                  {t("rooms.subtitle")}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.titleBadge,
                {
                  backgroundColor: colors.accentTint,
                  borderColor: colors.accentBorder,
                },
              ]}
            >
              <PulseDot
                color={colors.success}
                haloColor={colors.successTint}
                size={6}
                haloSize={12}
                active={isScreenFocused}
              />
              <Text variant="xs" weight="bold" color={colors.accent}>
                {t("rooms.liveNow")}
              </Text>
            </View>
          </View>
        </View>

        <RecruiterControlBar
          isOnline={viewModel.isOnline}
          isDark={viewModel.isDark}
          isActive={isScreenFocused}
          showOfflineSim={isSimulatedChatMode || !isProduction}
          outboundQueueCount={viewModel.outboundQueueCount}
          onToggleOffline={viewModel.toggleOfflineMode}
          onToggleTheme={viewModel.toggleTheme}
          onToggleLanguage={viewModel.toggleLanguage}
        />

        <RouletteHeroCard
          onlineCount={viewModel.totalOnlineMembers}
          isActive={isScreenFocused}
          onSpinPress={viewModel.openRoulette}
        />

        <Animated.View
          onLayout={handleSearchLayout}
          style={[
            styles.searchBox,
            shadows.sm,
            {
              backgroundColor: colors.searchInputBackground,
              borderColor: isSearchFocused ? colors.borderFocused : colors.searchBorder,
              transitionProperty: "borderColor",
              transitionDuration: MOTION_DURATION.micro,
              transitionTimingFunction: CSS_EASE_OUT,
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={isSearchFocused ? colors.accent : colors.textPlaceholder}
          />
          <TextInput
            testID={CHAT_ROOMS_TEST_IDS.SEARCH_INPUT}
            accessibilityLabel={t("common.search")}
            returnKeyType="search"
            keyboardAppearance={isDark ? "dark" : "light"}
            value={viewModel.searchQuery}
            onChangeText={viewModel.setSearchQuery}
            onFocus={handleFocus}
            onBlur={() => setIsSearchFocused(false)}
            placeholder={t("rooms.searchPlaceholder")}
            placeholderTextColor={colors.textPlaceholder}
            style={[
              styles.searchInput,
              {
                color: colors.textPrimary,
                textAlign: isRTL ? "right" : "left",
                writingDirection: isRTL ? "rtl" : "ltr",
              },
            ]}
          />
          {viewModel.searchQuery.length > 0 ? (
            <Animated.View entering={SOFT_POP_ENTER} exiting={SOFT_POP_EXIT}>
              <AnimatedPressable
                testID={CHAT_ROOMS_TEST_IDS.CLEAR_SEARCH_BUTTON}
                accessibilityRole="button"
                accessibilityLabel={t("rooms.clearSearch")}
                scaleTo={0.95}
                hitSlop={10}
                onPress={() => viewModel.setSearchQuery("")}
                style={[styles.clearBtn, { backgroundColor: colors.surfaceElevated }]}
              >
                <Ionicons name="close" size={14} color={colors.textSecondary} />
              </AnimatedPressable>
            </Animated.View>
          ) : null}
        </Animated.View>

        <ScrollView
          testID={CHAT_ROOMS_TEST_IDS.CATEGORIES_SCROLL}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {ROOM_CATEGORY_FILTERS.map((cat) => {
            const isSelected = viewModel.selectedCategory === cat.key;
            return (
              <AnimatedPressable
                key={cat.key}
                testID={CHAT_ROOMS_TEST_IDS.CATEGORY_CHIP(cat.key)}
                accessibilityRole="button"
                accessibilityLabel={t(cat.labelKey)}
                accessibilityState={{ selected: isSelected }}
                scaleTo={0.96}
                hitSlop={4}
                transitionProperties={CHIP_TRANSITION_PROPERTIES}
                transitionDurationMs={MOTION_DURATION.fast}
                hapticType={HapticFeedbackType.Light}
                onHaptic={handleHaptics}
                onPress={() => {
                  viewModel.setSelectedCategory(cat.key);
                }}
                style={[
                  styles.categoryChip,
                  isSelected ? shadows.sm : null,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={cat.icon}
                  size={13}
                  color={isSelected ? colors.textOnPrimary : colors.textSecondary}
                />
                <Text
                  variant="xs"
                  weight="bold"
                  color={isSelected ? colors.textOnPrimary : colors.textSecondary}
                >
                  {t(cat.labelKey)}
                </Text>
              </AnimatedPressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionMetaRow}>
          <Text variant="xs" weight="bold" color={colors.textSecondary} style={styles.sectionLabel}>
            {viewModel.selectedCategory === "ALL"
              ? t("rooms.activeChannels", { count: viewModel.rooms.length })
              : activeFilterLabel}
          </Text>
          <View
            style={[
              styles.countPill,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle },
            ]}
          >
            <Text variant="xs" weight="bold" color={colors.textMuted} style={styles.tabular}>
              {t("rooms.resultsCount", { count: viewModel.rooms.length })}
            </Text>
          </View>
        </View>
      </>
    );
  }
);

ChatRoomsListHeader.displayName = "ChatRoomsListHeader";
