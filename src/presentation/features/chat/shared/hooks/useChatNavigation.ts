/** @format */

import { useRouter } from "expo-router";
import { useCallback } from "react";

export interface ChatNavigation {
  readonly navigateBack: () => void;
  readonly navigateToRooms: () => void;
  readonly navigateToChat: (conversationId: string) => void;
  readonly navigateToRoulette: () => void;
}

export function useChatNavigation(): ChatNavigation {
  const router = useRouter();

  const navigateBack = useCallback(() => {
    router.back();
  }, [router]);

  const navigateToRooms = useCallback(() => {
    router.replace("/rooms" as const);
  }, [router]);

  const navigateToChat = useCallback(
    (conversationId: string) => {
      router.push(`/rooms/${conversationId}` as const);
    },
    [router]
  );

  const navigateToRoulette = useCallback(() => {
    router.push("/rooms/roulette" as const);
  }, [router]);

  return {
    navigateBack,
    navigateToRooms,
    navigateToChat,
    navigateToRoulette,
  };
}
