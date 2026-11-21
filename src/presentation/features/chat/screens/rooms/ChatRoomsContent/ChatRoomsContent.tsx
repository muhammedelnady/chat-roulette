/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItemInfo,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import { Text } from "@/src/presentation/components/atoms";
import { PageLayout } from "@/src/presentation/components/templates";
import { useUI } from "@/src/presentation/hooks";

import type { ChatConversationEntity } from "../../../shared/types";
import { RecruiterControlBar, RoomListItem, RouletteHeroCard } from "../components";

import { CHAT_ROOMS_TEST_IDS, ROOM_CATEGORY_FILTERS } from "./ChatRoomsContent.constants";
import { styles } from "./ChatRoomsContent.styles";
import type { ChatRoomsContentProps, ChatRoomsViewModel } from "./ChatRoomsContent.types";
import { useChatRoomsViewModel } from "./ChatRoomsContent.viewmodel";

const ChatRoomsContentView = memo<{
  readonly viewModel: ChatRoomsViewModel;
  readonly testID?: string;
}>(({ viewModel, testID = CHAT_ROOMS_TEST_IDS.ROOT }) => {
  const { colors, t, isRTL } = useUI();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ChatConversationEntity>) => (
      <RoomListItem room={item} onPress={viewModel.openRoom} />
    ),
    [viewModel.openRoom]
  );

  const keyExtractor = useCallback((item: ChatConversationEntity) => item.id, []);

  const listHeader = (
    <>
      <View style={styles.header}>
        <View style={[styles.titleRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Text variant="2xl" weight="bold" color={colors.textPrimary}>
            {t("rooms.title")}
          </Text>
          <View style={[styles.titleBadge, { backgroundColor: colors.primaryTint }]}>
            <Ionicons name="pulse" size={14} color={colors.accent} />
            <Text variant="xs" weight="bold" color={colors.accent}>
              {t("rooms.liveNow")}
            </Text>
          </View>
        </View>
        <Text variant="sm" color={colors.textSecondary}>
          {t("rooms.subtitle")}
        </Text>
      </View>

      <RecruiterControlBar
        isOnline={viewModel.isOnline}
        isDark={viewModel.isDark}
        isRTL={viewModel.isRTL}
        outboundQueueCount={viewModel.outboundQueueCount}
        onToggleOffline={viewModel.toggleOfflineMode}
        onToggleTheme={viewModel.toggleTheme}
        onToggleLanguage={viewModel.toggleLanguage}
      />

      <RouletteHeroCard
        onlineCount={viewModel.totalOnlineMembers}
        onSpinPress={viewModel.openRoulette}
      />

      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: colors.searchInputBackground,
            borderColor: colors.searchBorder,
            flexDirection: isRTL ? "row-reverse" : "row",
          },
        ]}
      >
        <Ionicons name="search-outline" size={18} color={colors.textPlaceholder} />
        <TextInput
          testID={CHAT_ROOMS_TEST_IDS.SEARCH_INPUT}
          value={viewModel.searchQuery}
          onChangeText={viewModel.setSearchQuery}
          placeholder={t("rooms.searchPlaceholder")}
          placeholderTextColor={colors.textPlaceholder}
          style={[
            styles.searchInput,
            {
              color: colors.textPrimary,
              textAlign: isRTL ? "right" : "left",
            },
          ]}
        />
        {viewModel.searchQuery.length > 0 ? (
          <Pressable onPress={() => viewModel.setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {ROOM_CATEGORY_FILTERS.map((cat) => {
          const isSelected = viewModel.selectedCategory === cat.key;
          return (
            <Pressable
              key={cat.key}
              testID={CHAT_ROOMS_TEST_IDS.CATEGORY_CHIP(cat.key)}
              onPress={() => viewModel.setSelectedCategory(cat.key)}
              style={({ pressed }) => [
                styles.categoryChip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.borderStrong,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text
                variant="xs"
                weight="bold"
                color={isSelected ? colors.textOnPrimary : colors.textSecondary}
              >
                {t(cat.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </>
  );

  return (
    <PageLayout testID={testID}>
      <FlatList
        testID={CHAT_ROOMS_TEST_IDS.LIST}
        data={[...viewModel.rooms]}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        windowSize={5}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        removeClippedSubviews
        ListEmptyComponent={
          viewModel.isLoading ? (
            <View testID={CHAT_ROOMS_TEST_IDS.LOADING_SPINNER} style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View testID={CHAT_ROOMS_TEST_IDS.EMPTY_STATE} style={styles.emptyContainer}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.primaryTint }]}>
                <Ionicons name="planet-outline" size={30} color={colors.accent} />
              </View>
              <Text
                variant="md"
                weight="bold"
                color={colors.textPrimary}
                centered
                style={styles.emptyTitle}
              >
                {t("rooms.emptyRoomsTitle")}
              </Text>
              <Text variant="sm" color={colors.textSecondary} centered>
                {t("rooms.emptyRoomsSubtitle")}
              </Text>
            </View>
          )
        }
      />
    </PageLayout>
  );
});

ChatRoomsContentView.displayName = "ChatRoomsContentView";

const ChatRoomsContentContainer = memo<{ readonly testID?: string }>(({ testID }) => (
  <ChatRoomsContentView viewModel={useChatRoomsViewModel()} testID={testID} />
));

ChatRoomsContentContainer.displayName = "ChatRoomsContentContainer";

export const ChatRoomsContent = memo<ChatRoomsContentProps>(
  ({ testID = CHAT_ROOMS_TEST_IDS.ROOT, viewModel }) =>
    viewModel ? (
      <ChatRoomsContentView viewModel={viewModel} testID={testID} />
    ) : (
      <ChatRoomsContentContainer testID={testID} />
    )
);

ChatRoomsContent.displayName = "ChatRoomsContent";
