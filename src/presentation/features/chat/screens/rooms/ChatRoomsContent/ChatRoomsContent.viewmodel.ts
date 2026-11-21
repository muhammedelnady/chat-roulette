/** @format */

import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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

import type { ChatRoomsViewModel } from "./ChatRoomsContent.types";

export function useChatRoomsViewModel(): ChatRoomsViewModel {
  const { getGetConversationsUseCase, getChatSocketService } = useUseCases();
  const { navigateToChat, navigateToRoulette } = useChatNavigation();
  const { isDark, toggleTheme, isRTL } = useUI();
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
  } = useChatStore(
    useShallow((state) => ({
      isLoadingConversations: state.isLoadingConversations,
      outboundQueueCount: state.outboundQueueCount,
      setConversations: state.setConversations,
      setIsLoadingConversations: state.setIsLoadingConversations,
      setOutboundQueueCount: state.setOutboundQueueCount,
    }))
  );

  const [selectedCategory, setSelectedCategory] = useState<ChatRoomCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const refresh = useCallback(async () => {
    setIsLoadingConversations(true);
    const result = await getGetConversationsUseCase.execute();
    if (isErr(result)) {
      log.error("Failed to fetch rooms:", result.error);
    } else {
      setConversations(result.value.data);
    }
    setOutboundQueueCount(getChatSocketService.getPendingQueueCount?.() ?? 0);
    setIsLoadingConversations(false);
  }, [
    getChatSocketService,
    getGetConversationsUseCase,
    setConversations,
    setIsLoadingConversations,
    setOutboundQueueCount,
  ]);

  useEffect(() => {
    if (!getChatSocketService.isConnected()) {
      void getChatSocketService.connect();
    }
    const handleQueueUpdated = (payload: unknown) => {
      const data = payload as { count?: number };
      if (typeof data.count === "number") {
        setOutboundQueueCount(data.count);
      }
    };
    getChatSocketService.onEvent("queue:updated", handleQueueUpdated);
    return () => {
      getChatSocketService.offEvent("queue:updated", handleQueueUpdated);
    };
  }, [getChatSocketService, setOutboundQueueCount]);

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
        return subjectMatch || topicMatch || lastMsgMatch;
      })
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
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
