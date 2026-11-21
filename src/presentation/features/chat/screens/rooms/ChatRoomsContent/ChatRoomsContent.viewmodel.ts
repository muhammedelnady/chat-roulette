/** @format */

import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";

import { useUseCases } from "@/src/di/UseCasesProvider";
import { isErr } from "@/src/domain/Result";
import { log } from "@/src/infrastructure/logging/logger";
import { useUI } from "@/src/presentation/hooks";
import {
  selectConversations,
  useChatStore,
  useConnectivityStore,
  useIsOnline,
  useLanguageStore,
} from "@/src/presentation/stores";

import { useChatNavigation } from "../../../shared/hooks";
import type { ChatRoomCategory } from "../../../shared/types";
import { isRecord, parseIncomingMessage } from "../../../shared/utils/messageParser";

import type { ChatRoomsViewModel } from "./ChatRoomsContent.types";

export function useChatRoomsViewModel(): ChatRoomsViewModel {
  const { getGetConversationsUseCase, getChatSocketService } = useUseCases();
  const { navigateToChat, navigateToRoulette } = useChatNavigation();
  const { isDark, toggleTheme, isRTL, t } = useUI();
  const isOnline = useIsOnline();
  const demoOfflineOverride = useConnectivityStore((s) => s.demoOfflineOverride);
  const setDemoOfflineOverride = useConnectivityStore((s) => s.setDemoOfflineOverride);
  const toggleLanguage = useLanguageStore((s) => s.toggleLanguage);

  const conversations = useChatStore(selectConversations);
  const {
    isLoadingConversations,
    outboundQueueCount,
    setConversations,
    setIsLoadingConversations,
    setOutboundQueueCount,
    upsertMessage,
  } = useChatStore(
    useShallow((state) => ({
      isLoadingConversations: state.isLoadingConversations,
      outboundQueueCount: state.outboundQueueCount,
      setConversations: state.setConversations,
      setIsLoadingConversations: state.setIsLoadingConversations,
      setOutboundQueueCount: state.setOutboundQueueCount,
      upsertMessage: state.upsertMessage,
    }))
  );

  const [selectedCategory, setSelectedCategory] = useState<ChatRoomCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  const hasLoadedRef = useRef(false);
  const refreshRequestIdRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      refreshRequestIdRef.current += 1;
    };
  }, []);

  const refresh = useCallback(async () => {
    const requestId = ++refreshRequestIdRef.current;
    const isInitialLoad = !hasLoadedRef.current;
    setError(null);
    if (isInitialLoad) {
      setIsLoadingConversations(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const result = await getGetConversationsUseCase.execute();
      if (!isMountedRef.current || requestId !== refreshRequestIdRef.current) return;

      if (isErr(result)) {
        log.error("Failed to fetch rooms:", result.error);
        setError(t("rooms.loadFailed"));
      } else {
        setConversations(result.value.data);
        hasLoadedRef.current = true;
      }
      setOutboundQueueCount(getChatSocketService.getPendingQueueCount?.() ?? 0);
    } catch (err: unknown) {
      if (!isMountedRef.current || requestId !== refreshRequestIdRef.current) return;
      log.error("Unexpected rooms fetch failure:", err);
      setError(t("rooms.loadFailed"));
    } finally {
      if (isMountedRef.current && requestId === refreshRequestIdRef.current) {
        setIsLoadingConversations(false);
        setIsRefreshing(false);
      }
    }
  }, [
    getChatSocketService,
    getGetConversationsUseCase,
    setConversations,
    setIsLoadingConversations,
    setOutboundQueueCount,
    t,
  ]);

  useEffect(() => {
    if (isOnline && !getChatSocketService.isConnected()) {
      void Promise.resolve(getChatSocketService.connect()).catch((err: unknown) => {
        log.warn("Rooms socket connect failed:", err);
      });
    }
  }, [getChatSocketService, isOnline]);

  useEffect(() => {
    const handleQueueUpdated = (payload: unknown) => {
      if (!isRecord(payload)) return;
      const count = payload["count"];
      if (typeof count === "number") {
        setOutboundQueueCount(count);
      }
    };
    const handleReconnect = () => {
      void refresh();
    };
    const handleNewMessage = (payload: unknown) => {
      if (!isRecord(payload)) return;
      const parsed = parseIncomingMessage(payload);
      if (parsed) {
        upsertMessage(parsed.conversationId, parsed);
      }
    };

    getChatSocketService.onEvent("queue:updated", handleQueueUpdated);
    getChatSocketService.onEvent("reconnect", handleReconnect);
    getChatSocketService.onEvent("message:new", handleNewMessage);

    return () => {
      getChatSocketService.offEvent("queue:updated", handleQueueUpdated);
      getChatSocketService.offEvent("reconnect", handleReconnect);
      getChatSocketService.offEvent("message:new", handleNewMessage);
    };
  }, [getChatSocketService, refresh, setOutboundQueueCount, upsertMessage]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const filteredRooms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return [...conversations]
      .filter((room) => {
        if (selectedCategory !== "ALL" && room.category !== selectedCategory) {
          return false;
        }
        if (!query) return true;
        const subjectMatch = (room.subject ?? "").toLowerCase().includes(query);
        const topicMatch = (room.topic ?? "").toLowerCase().includes(query);
        const lastMsgMatch = (room.lastMessage?.content ?? "").toLowerCase().includes(query);
        const participantMatch = (room.participants[0]?.user?.fullName ?? "")
          .toLowerCase()
          .includes(query);
        const partnerRoleMatch = (room.partnerRole ?? "").toLowerCase().includes(query);
        const icebreakerMatch = (room.icebreaker ?? "").toLowerCase().includes(query);
        return (
          subjectMatch ||
          topicMatch ||
          lastMsgMatch ||
          participantMatch ||
          partnerRoleMatch ||
          icebreakerMatch
        );
      })
      .sort((a, b) => (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0));
  }, [conversations, searchQuery, selectedCategory]);

  const totalOnlineMembers = useMemo(
    () => conversations.reduce((sum, room) => sum + (room.participantCount ?? 2), 0),
    [conversations]
  );

  const toggleOfflineMode = useCallback(() => {
    setDemoOfflineOverride(!demoOfflineOverride);
  }, [demoOfflineOverride, setDemoOfflineOverride]);

  return {
    rooms: filteredRooms,
    selectedCategory,
    searchQuery,
    isLoading: isLoadingConversations,
    isRefreshing,
    error,
    isOnline,
    isDark,
    isRTL,
    totalOnlineMembers,
    outboundQueueCount,
    setSelectedCategory,
    setSearchQuery,
    openRoom: navigateToChat,
    openRoulette: navigateToRoulette,
    toggleOfflineMode,
    toggleTheme,
    toggleLanguage,
    refresh,
  };
}
