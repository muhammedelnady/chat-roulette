/** @format */

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated from "react-native-reanimated";

import { Text } from "@/src/presentation/components/atoms";
import { PageLayout } from "@/src/presentation/components/templates";
import { useUI } from "@/src/presentation/hooks";
import { FADE_DOWN_ENTER, FADE_DOWN_EXIT } from "@/src/presentation/theme";

import type { ChatMessageEntity } from "../../../shared/types";
import {
  ChatFaqOptionsBar,
  ChatHeader,
  ChatInputBar,
  ChatMessageBubble,
  ChatRoomContextCard,
  ChatTypingIndicator,
  QueueStatusBanner,
} from "../components";
import { MessageImageLightbox } from "../components/ChatMessageBubble/MessageImageLightbox";

import { CHAT_CONTENT_TEST_IDS } from "./ChatContent.constants";
import { styles } from "./ChatContent.styles";
import type { ChatContentProps, ChatViewModel } from "./ChatContent.types";
import { useChatViewModel } from "./ChatContent.viewmodel";
import { ChatListEmpty, getSenderGroupKey, type GroupedMessageRow } from "./ChatListEmpty";

export const ChatContentView = memo<{
  readonly viewModel: ChatViewModel;
  readonly testID?: string;
}>(({ viewModel, testID = CHAT_CONTENT_TEST_IDS.ROOT }) => {
  const { colors, t } = useUI();
  const listRef = useRef<FlatList<GroupedMessageRow>>(null);
  const isNearBottomRef = useRef(true);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const {
    conversation,
    messages,
    inputText,
    stagedAttachments,
    typingUsers,
    isLoading,
    isSending,
    isError,
    error,
    isClosed,
    queueStatus,
    headerSubtitle,
    isNetworkOnline,
    outboundQueueCount,
    deleteAttachment,
    sendMessage,
    handleRetryMessage,
    toggleReaction,
    pickAttachment,
    refresh,
  } = viewModel;

  const newestMessageKey = messages[0] ? messages[0].clientId || messages[0].id : null;

  useEffect(() => {
    if (newestMessageKey && isNearBottomRef.current) {
      const timer = setTimeout(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 80);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [newestMessageKey]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    isNearBottomRef.current = event.nativeEvent.contentOffset.y < 120;
  }, []);

  const handleDeleteAttachment = useCallback(
    (attId: string, msgId: string) => void deleteAttachment(attId, msgId),
    [deleteAttachment]
  );

  const handleSelectFaqOption = useCallback(
    (query: string) => void sendMessage(query, { includeStagedAttachments: false }),
    [sendMessage]
  );

  const handleSendText = useCallback((text: string) => void sendMessage(text), [sendMessage]);

  const handlePickAttachment = useCallback(() => void pickAttachment(), [pickAttachment]);

  const handleRetry = useCallback(
    (message: ChatMessageEntity) => void handleRetryMessage(message),
    [handleRetryMessage]
  );

  const handleToggleReaction = useCallback(
    (msgId: string, emoji: string) => void toggleReaction(msgId, emoji),
    [toggleReaction]
  );

  const handlePreviewImage = useCallback((url: string) => {
    setPreviewImageUrl(url);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setPreviewImageUrl(null);
  }, []);

  const handleRefresh = useCallback(() => {
    void refresh();
  }, [refresh]);

  const groupedRows = useMemo<readonly GroupedMessageRow[]>(
    () =>
      messages.map((item, idx) => {
        const currentKey = getSenderGroupKey(item);
        const newerKey = getSenderGroupKey(messages[idx - 1]);
        const olderKey = getSenderGroupKey(messages[idx + 1]);
        return {
          message: item,
          isFirstInGroup: olderKey !== currentKey,
          isLastInGroup: newerKey !== currentKey,
        };
      }),
    [messages]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<GroupedMessageRow>) => (
      <ChatMessageBubble
        message={item.message}
        isOwn={item.message.senderType === "USER"}
        isFirstInGroup={item.isFirstInGroup}
        isLastInGroup={item.isLastInGroup}
        onDeleteAttachment={handleDeleteAttachment}
        onSelectFaqOption={handleSelectFaqOption}
        onRetryMessage={handleRetry}
        onToggleReaction={handleToggleReaction}
        onPreviewImage={handlePreviewImage}
      />
    ),
    [
      handleDeleteAttachment,
      handlePreviewImage,
      handleRetry,
      handleSelectFaqOption,
      handleToggleReaction,
    ]
  );

  const keyExtractor = useCallback(
    (row: GroupedMessageRow) => row.message.clientId || row.message.id,
    []
  );

  const listEmptyComponent = useMemo(
    () => (
      <ChatListEmpty
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={handleRefresh}
      />
    ),
    [error, handleRefresh, isError, isLoading]
  );

  const headerTitle =
    conversation?.subject ?? conversation?.participants[0]?.user?.fullName ?? t("chat.title");

  return (
    <PageLayout fullBleed dismissKeyboardOnDrag={false} testID={testID}>
      <ChatHeader
        title={headerTitle}
        onBackPress={viewModel.navigateBack}
        isOnline={isNetworkOnline}
        isRouletteMatch={Boolean(conversation?.isRouletteMatch)}
        subtitle={!isClosed ? headerSubtitle : undefined}
        onToggleOffline={isClosed ? undefined : viewModel.toggleOfflineMode}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        {conversation ? (
          <ChatRoomContextCard conversation={conversation} onSpinNext={viewModel.spinNextMatch} />
        ) : null}

        <View style={styles.listContainer}>
          <FlatList
            ref={listRef}
            testID={CHAT_CONTENT_TEST_IDS.FLASH_LIST}
            data={groupedRows}
            inverted={groupedRows.length > 0}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={
              groupedRows.length === 0 ? styles.emptyListContent : styles.listContent
            }
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            onScroll={handleScroll}
            scrollEventThrottle={100}
            onEndReached={viewModel.loadMore}
            onEndReachedThreshold={0.5}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            ListEmptyComponent={listEmptyComponent}
          />
        </View>

        <ChatTypingIndicator typingUsers={typingUsers} />

        {!isClosed && (!isNetworkOnline || outboundQueueCount > 0 || queueStatus) ? (
          <QueueStatusBanner
            queueStatus={queueStatus}
            isOffline={!isNetworkOnline}
            pendingCount={outboundQueueCount}
          />
        ) : null}

        {!isClosed ? (
          <ChatFaqOptionsBar onSelectOption={handleSelectFaqOption} disabled={isSending} />
        ) : null}

        {isClosed ? (
          <Animated.View
            testID={CHAT_CONTENT_TEST_IDS.CLOSED_BAR}
            entering={FADE_DOWN_ENTER}
            exiting={FADE_DOWN_EXIT}
            style={[
              styles.closedNotice,
              {
                backgroundColor: colors.cardBackground,
                borderTopColor: colors.border,
              },
            ]}
          >
            <Text variant="sm" color={colors.textSecondary} centered>
              {conversation?.status === "RESOLVED"
                ? t("chat.resolvedConversation")
                : t("chat.closedConversation")}
            </Text>
          </Animated.View>
        ) : null}

        <ChatInputBar
          inputText={inputText}
          onChangeText={viewModel.setInputText}
          onSend={handleSendText}
          onSendAudioNote={viewModel.sendAudioNote}
          onPickAttachment={handlePickAttachment}
          onRemoveStagedAttachment={viewModel.removeStagedAttachment}
          stagedAttachments={stagedAttachments}
          isSending={isSending}
          disabled={isClosed}
        />
      </KeyboardAvoidingView>

      <MessageImageLightbox imageUrl={previewImageUrl} onClose={handleCloseLightbox} />
    </PageLayout>
  );
});

ChatContentView.displayName = "ChatContentView";

const ChatContentContainer = memo<{ readonly conversationId?: string; readonly testID?: string }>(
  ({ conversationId, testID }) => (
    <ChatContentView viewModel={useChatViewModel(conversationId)} testID={testID} />
  )
);

ChatContentContainer.displayName = "ChatContentContainer";

export const ChatContent = memo<ChatContentProps>(
  ({ conversationId, testID = CHAT_CONTENT_TEST_IDS.ROOT, viewModel }) =>
    viewModel ? (
      <ChatContentView viewModel={viewModel} testID={testID} />
    ) : (
      <ChatContentContainer conversationId={conversationId} testID={testID} />
    )
);

ChatContent.displayName = "ChatContent";
