/** @format */

import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";

import { AppRoutes } from "@/src/presentation/constants/routes";

export interface ChatNavigation {
  readonly navigateBack: () => void;
  readonly navigateToRooms: () => void;
  readonly navigateToChat: (conversationId: string) => void;
  readonly replaceWithChat: (conversationId: string) => void;
  readonly navigateToRoulette: () => void;
}

export function useChatNavigation(): ChatNavigation {
  const router = useRouter();

  const navigateBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(AppRoutes.ROOMS);
    }
  }, [router]);

  const navigateToRooms = useCallback(() => {
    router.replace(AppRoutes.ROOMS);
  }, [router]);

  const navigateToChat = useCallback(
    (conversationId: string) => {
      router.push(`${AppRoutes.ROOMS}/${encodeURIComponent(conversationId)}`);
    },
    [router]
  );

  const replaceWithChat = useCallback(
    (conversationId: string) => {
      router.replace(`${AppRoutes.ROOMS}/${encodeURIComponent(conversationId)}`);
    },
    [router]
  );

  const navigateToRoulette = useCallback(() => {
    router.push(AppRoutes.ROULETTE);
  }, [router]);

  return useMemo(
    () => ({
      navigateBack,
      navigateToRooms,
      navigateToChat,
      replaceWithChat,
      navigateToRoulette,
    }),
    [navigateBack, navigateToRooms, navigateToChat, replaceWithChat, navigateToRoulette]
  );
}
