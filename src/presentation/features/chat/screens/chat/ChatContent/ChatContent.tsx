/** @format */

import { memo, useCallback, useEffect, useRef } from "react";
import { ActivityIndicator, FlatList, type ListRenderItemInfo, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

import { Text } from "@/src/presentation/components/atoms";
import { PageLayout } from "@/src/presentation/components/templates";
import { useUI } from "@/src/presentation/hooks";

import type { ChatMessageEntity } from "../../../shared/types";
import {
  ChatEmptyState,
  ChatFaqOptionsBar,
  ChatHeader,
  ChatInputBar,
  ChatMessageBubble,
  ChatRoomContextCard,
  ChatTypingIndicator,
  QueueStatusBanner,
} from "../components";

import { CHAT_CONTENT_TEST_IDS } from "./ChatContent.constants";
import { styles } from "./ChatContent.styles";
import type { ChatContentProps, ChatViewModel } from "./ChatContent.types";
import { useChatViewModel } from "./ChatContent.viewmodel";

export const ChatContentView = memo<{
  readonly viewModel: ChatViewModel;
  readonly testID?: string;
}>(({ viewModel, testID = CHAT_CONTENT_TEST_IDS.ROOT }) => {
  const { colors, t } = useUI();
  const listRef = useRef<FlatList<ChatMessageEntity>>(null);

  const vm = viewModel;
  const {
    conversation,
    messages,
    inputText,
    stagedAttachments,
    typingUsers,
    isLoading,
    isSending,
    isClosed,
    queueStatus,
    headerSubtitle,
    isNetworkOnline,
    outboundQueueCount,
  } = vm;

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 80);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [messages.length]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<ChatMessageEntity>) => {
      const newerMsg = index > 0 ? messages[index - 1] : undefined;
      const olderMsg = index < messages.length - 1 ? messages[index + 1] : undefined;

      return (
        <ChatMessageBubble
          message={item}
          isOwn={item.senderType === "USER"}
          isFirstInGroup={olderMsg?.senderType !== item.senderType}
          isLastInGroup={newerMsg?.senderType !== item.senderType}
          onDeleteAttachment={(attId, msgId) => void vm.deleteAttachment(attId, msgId)}
          onSelectFaqOption={(query) => void vm.sendMessage(query)}
          onRetryMessage={(message) => void vm.handleRetryMessage(message)}
          onToggleReaction={(msgId, emoji) => void vm.toggleReaction(msgId, emoji)}
        />
      );
    },
    [messages, vm]
  );

  const keyExtractor = useCallback((item: ChatMessageEntity) => item.id || item.clientId, []);
  const headerTitle =
    conversation?.subject ?? conversation?.participants[0]?.user?.fullName ?? t("chat.title");

  return (
    <PageLayout testID={testID}>
      <ChatHeader
        title={headerTitle}
        onBackPress={vm.navigateBack}
        isOnline={!isClosed && isNetworkOnline}
        isRouletteMatch={Boolean(conversation?.isRouletteMatch)}
        subtitle={!isClosed ? headerSubtitle : undefined}
        onToggleOffline={vm.toggleOfflineMode}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        {conversation ? (
          <ChatRoomContextCard conversation={conversation} onSpinNext={vm.spinNextMatch} />
        ) : null}

        <View style={styles.listContainer}>
          <FlatList
            ref={listRef}
            testID={CHAT_CONTENT_TEST_IDS.FLASH_LIST}
            data={messages}
            inverted={messages.length > 0}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={
              messages.length === 0 ? styles.emptyListContent : styles.listContent
            }
            showsVerticalScrollIndicator={false}
            onEndReached={vm.loadMore}
            onEndReachedThreshold={0.5}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews
            ListEmptyComponent={
              isLoading ? (
                <View
                  testID={CHAT_CONTENT_TEST_IDS.LOADING_SPINNER}
                  style={styles.loadingContainer}
                >
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <ChatEmptyState testID={CHAT_CONTENT_TEST_IDS.EMPTY_STATE} />
                </View>
              )
            }
          />
        </View>

        <ChatTypingIndicator typingUsers={typingUsers} />

        {!isClosed && (!isNetworkOnline || outboundQueueCount > 0 || queueStatus) ? (
          <QueueStatusBanner
            queueStatus={queueStatus}
            isOffline={!isNetworkOnline || outboundQueueCount > 0}
            pendingCount={outboundQueueCount}
          />
        ) : null}

        {!isClosed ? (
          <ChatFaqOptionsBar
            onSelectOption={(query) => void vm.sendMessage(query)}
            disabled={isSending}
          />
        ) : null}

        {isClosed ? (
          <View
            testID={CHAT_CONTENT_TEST_IDS.CLOSED_BAR}
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
          </View>
        ) : null}

        <ChatInputBar
          inputText={inputText}
          onChangeText={vm.setInputText}
          onSend={(content) => void vm.sendMessage(content)}
          onSendAudioNote={vm.sendAudioNote}
          onPickAttachment={() => void vm.pickAttachment()}
          onRemoveStagedAttachment={vm.removeStagedAttachment}
          stagedAttachments={stagedAttachments}
          isSending={isSending}
        />
      </KeyboardAvoidingView>
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
