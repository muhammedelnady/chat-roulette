/** @format */

import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useMemo, useRef } from "react";
import { ActivityIndicator, FlatList, type ListRenderItemInfo, View } from "react-native";
import Animated from "react-native-reanimated";

import { Button, Text } from "@/src/presentation/components/atoms";
import { PageLayout } from "@/src/presentation/components/templates";
import { useUI } from "@/src/presentation/hooks";
import { FADE_ENTER } from "@/src/presentation/theme";

import type { ChatConversationEntity } from "../../../shared/types";
import { RoomListItem } from "../components";

import { CHAT_ROOMS_TEST_IDS } from "./ChatRoomsContent.constants";
import { styles } from "./ChatRoomsContent.styles";
import type { ChatRoomsContentProps, ChatRoomsViewModel } from "./ChatRoomsContent.types";
import { useChatRoomsViewModel } from "./ChatRoomsContent.viewmodel";
import { ChatRoomsListHeader } from "./ChatRoomsListHeader";

const ChatRoomsContentView = memo<{
  readonly viewModel: ChatRoomsViewModel;
  readonly testID?: string;
}>(({ viewModel, testID = CHAT_ROOMS_TEST_IDS.ROOT }) => {
  const { colors, t } = useUI();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ChatConversationEntity>) => (
      <RoomListItem room={item} onPress={viewModel.openRoom} />
    ),
    [viewModel.openRoom]
  );

  const keyExtractor = useCallback((item: ChatConversationEntity) => item.id, []);

  const handleRefresh = useCallback(() => {
    void viewModel.refresh();
  }, [viewModel]);

  const flatListRef = useRef<FlatList<ChatConversationEntity>>(null);

  const handleSearchFocus = useCallback((y: number) => {
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({
        offset: Math.max(0, y - 10),
        animated: true,
      });
    }, 100);
  }, []);

  const listHeaderComponent = useMemo(
    () => <ChatRoomsListHeader viewModel={viewModel} onSearchFocus={handleSearchFocus} />,
    [viewModel, handleSearchFocus]
  );

  const listEmptyComponent = useMemo(() => {
    if (viewModel.isLoading) {
      return (
        <View testID={CHAT_ROOMS_TEST_IDS.LOADING_SPINNER} style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (viewModel.error) {
      return (
        <Animated.View
          entering={FADE_ENTER}
          testID={CHAT_ROOMS_TEST_IDS.ERROR_STATE}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          style={[
            styles.emptyContainer,
            { backgroundColor: colors.surface, borderColor: colors.errorBorder },
          ]}
        >
          <View style={[styles.emptyHalo, { backgroundColor: colors.errorTint }]}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: colors.errorTint, borderColor: colors.errorBorder },
              ]}
            >
              <Ionicons name="cloud-offline-outline" size={28} color={colors.error} />
            </View>
          </View>
          <Text variant="md" weight="bold" color={colors.error} centered style={styles.emptyTitle}>
            {viewModel.error}
          </Text>
          <View style={styles.retryWrapper}>
            <Button
              testID={CHAT_ROOMS_TEST_IDS.RETRY_BUTTON}
              label={t("common.retry")}
              variant="outline"
              size="sm"
              onPress={handleRefresh}
            />
          </View>
        </Animated.View>
      );
    }

    return (
      <Animated.View
        entering={FADE_ENTER}
        testID={CHAT_ROOMS_TEST_IDS.EMPTY_STATE}
        style={[
          styles.emptyContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={[styles.emptyHalo, { backgroundColor: colors.primaryTint2 }]}>
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: colors.primaryTint, borderColor: colors.borderGlow },
            ]}
          >
            <Ionicons name="planet-outline" size={30} color={colors.accent} />
          </View>
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
      </Animated.View>
    );
  }, [
    colors.accent,
    colors.border,
    colors.borderGlow,
    colors.error,
    colors.errorBorder,
    colors.errorTint,
    colors.primary,
    colors.primaryTint,
    colors.primaryTint2,
    colors.surface,
    colors.textPrimary,
    colors.textSecondary,
    handleRefresh,
    t,
    viewModel.error,
    viewModel.isLoading,
  ]);

  return (
    <PageLayout testID={testID}>
      <FlatList
        ref={flatListRef}
        testID={CHAT_ROOMS_TEST_IDS.LIST}
        data={viewModel.rooms}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeaderComponent}
        ListEmptyComponent={listEmptyComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        refreshing={viewModel.isRefreshing}
        onRefresh={handleRefresh}
        windowSize={5}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
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
