/** @format */

import { NetInfoStateType } from "@react-native-community/netinfo";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { UseCasesProvider } from "@/src/di/UseCasesProvider";
import { AnimatedPressable, Button, Text } from "@/src/presentation/components/atoms";
import { ErrorBoundary, ListErrorBoundary } from "@/src/presentation/components/error-boundary";
import { ChatEmptyState } from "@/src/presentation/features/chat/screens/chat/components/ChatEmptyState";
import { ChatFaqOptionsBar } from "@/src/presentation/features/chat/screens/chat/components/ChatFaqOptionsBar";
import { ChatMessageBubble } from "@/src/presentation/features/chat/screens/chat/components/ChatMessageBubble";
import { ChatTypingIndicator } from "@/src/presentation/features/chat/screens/chat/components/ChatTypingIndicator";
import { QueueStatusBanner } from "@/src/presentation/features/chat/screens/chat/components/QueueStatusBanner";
import { RadarPulse } from "@/src/presentation/features/chat/screens/roulette/components/RadarPulse";
import { useChatNavigation } from "@/src/presentation/features/chat/shared/hooks";
import {
  formatDuration,
  useI18n,
  useRTL,
  useT,
  useUI,
  useVoiceRecording,
} from "@/src/presentation/hooks";
import {
  useConnectivityStore,
  useDirectionStore,
  useLanguageStore,
  useThemeStore,
} from "@/src/presentation/stores";
import { readPersistedField } from "@/src/presentation/stores/utils/persistedState";
import {
  createButtonAccessibilityProps,
  createHitSlop,
} from "@/src/presentation/theme/style-utils";

function Thrower({ shouldThrow }: { readonly shouldThrow: boolean }): ReactNode {
  if (shouldThrow) {
    throw new Error("boom in child");
  }
  return <Text>Recovered child</Text>;
}

describe("Presentation Core", () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: "dark", isInitialized: false });
    useDirectionStore.setState({ direction: "ltr", isInitialized: false });
    useLanguageStore.setState({ languageTag: "en", isInitialized: false });
    useConnectivityStore.setState({
      isConnected: true,
      isInternetReachable: true,
      demoOfflineOverride: false,
    });
  });

  it("manages theme, direction, language, and connectivity stores", async () => {
    useThemeStore.getState().setTheme("light");
    expect(useThemeStore.getState().theme).toBe("light");
    expect(await readPersistedField("chat_roulette_theme_preference_v1", "theme")).toBe("light");

    await useThemeStore.getState().loadTheme();
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe("dark");
    useThemeStore.getState().clearTheme();

    await useDirectionStore.getState().setDirection("rtl");
    expect(useDirectionStore.getState().direction).toBe("rtl");
    await useDirectionStore.getState().loadDirection();
    useDirectionStore.getState().toggleDirection();
    expect(useDirectionStore.getState().direction).toBe("ltr");
    useDirectionStore.getState().clearDirection();

    await useLanguageStore.getState().setLanguageTag("ar");
    expect(useLanguageStore.getState().languageTag).toBe("ar");
    await useLanguageStore.getState().loadLanguage();
    useLanguageStore.getState().toggleLanguage();
    expect(useLanguageStore.getState().languageTag).toBe("en");
    useLanguageStore.getState().clearLanguage();

    useConnectivityStore.getState().updateConnectivity({
      isConnected: false,
      isInternetReachable: false,
      type: NetInfoStateType.none,
      details: null,
    });
    expect(useConnectivityStore.getState().isConnected).toBe(false);
    useConnectivityStore.getState().setDemoOfflineOverride(true);
    expect(useConnectivityStore.getState().demoOfflineOverride).toBe(true);
    const unsub = useConnectivityStore.getState().subscribe();
    unsub();
  });

  it("exposes hooks and style utilities cleanly", async () => {
    expect(formatDuration(65_000)).toBe("1:05");
    expect(createHitSlop(10)).toEqual({ top: 10, right: 10, bottom: 10, left: 10 });
    expect(
      createButtonAccessibilityProps({ label: "Go", disabled: true }).accessibilityState.disabled
    ).toBe(true);

    const { result: uiResult } = await renderHook(() => {
      const ui = useUI();
      const t = useT();
      const rtl = useRTL();
      const i18n = useI18n();
      const nav = useChatNavigation();
      return { ui, t, rtl, i18n, nav };
    });

    expect(uiResult.current.ui.isDark).toBe(true);
    expect(uiResult.current.ui.getColor("primary")).toBeDefined();
    expect(uiResult.current.t("rooms.title")).toBe(uiResult.current.i18n.t("rooms.title"));
    expect(uiResult.current.rtl.isRTL).toBe(false);
    uiResult.current.nav.navigateToRooms();
    uiResult.current.nav.navigateToChat("room-1");
    uiResult.current.nav.navigateToRoulette();
    uiResult.current.nav.navigateBack();

    const { result: voiceResult } = await renderHook(() => useVoiceRecording(), {
      wrapper: UseCasesProvider,
    });

    await act(async () => {
      await voiceResult.current.cancelRecording();
    });
    expect(voiceResult.current.isRecording).toBe(false);
  });

  it("renders UI components, banners, FAQ chips, typing indicator, and error boundaries", async () => {
    const onPress = jest.fn();
    await render(
      <Button
        label="Launch"
        gradient
        variant="primary"
        size="lg"
        onPress={onPress}
        testID="core-btn"
      />
    );
    await fireEvent.press(screen.getByTestId("core-btn"));
    expect(onPress).toHaveBeenCalledTimes(1);

    await render(<Button label="Disabled" variant="outline" disabled testID="disabled-btn" />);
    await fireEvent.press(screen.getByTestId("disabled-btn"));

    const pressableSpy = jest.fn();
    await render(
      <AnimatedPressable onPress={pressableSpy} testID="anim-pressable">
        <Text variant="xl" weight="bold" centered>
          Card
        </Text>
      </AnimatedPressable>
    );
    await fireEvent(screen.getByTestId("anim-pressable"), "pressIn");
    await fireEvent(screen.getByTestId("anim-pressable"), "pressOut");
    await fireEvent.press(screen.getByTestId("anim-pressable"));
    expect(pressableSpy).toHaveBeenCalledTimes(1);

    const onFaq = jest.fn();
    await render(<ChatFaqOptionsBar onSelectOption={onFaq} />);
    await fireEvent.press(screen.getByTestId("faq-chip-architecture"));
    expect(onFaq).toHaveBeenCalledTimes(1);

    await render(<ChatTypingIndicator typingUsers={["Sarah"]} />);
    expect(screen.getByTestId("chat-typing-indicator")).toBeTruthy();

    await render(<ChatEmptyState />);
    expect(screen.getByTestId("chat-empty-state")).toBeTruthy();

    await render(
      <QueueStatusBanner
        queueStatus={{
          conversationId: "room-1",
          status: "WAITING",
          queuePosition: 3,
          estimatedWaitMinutes: 2,
        }}
      />
    );
    expect(screen.getByTestId("queue-status-position")).toBeTruthy();

    await render(
      <QueueStatusBanner
        queueStatus={{
          conversationId: "room-1",
          status: "ASSIGNED",
          queuePosition: 0,
          estimatedWaitMinutes: 0,
          assignedAgentName: "Sarah",
        }}
      />
    );
    expect(screen.getByTestId("queue-status-position")).toBeTruthy();

    await render(<RadarPulse isScanning isMatched={false} />);
    expect(screen.getByTestId("radar-pulse")).toBeTruthy();

    await render(
      <ChatMessageBubble
        message={{
          id: "bot-1",
          clientId: "bot-c-1",
          conversationId: "room-1",
          senderType: "BOT",
          content: "Pick a topic",
          contentType: "text",
          isEdited: false,
          createdAt: "2026-11-21T00:00:00.000Z",
          attachments: [
            {
              id: "att-img",
              url: "https://example.com/photo.jpg",
              mimeType: "image/jpeg",
              fileName: "photo.jpg",
              fileSize: 512,
            },
          ],
          metadata: {
            isBotGreeting: true,
            options: [{ id: "arch", labelEn: "Architecture", query: "architecture" }],
          },
        }}
        onSelectFaqOption={onFaq}
      />
    );
    expect(screen.getByTestId("chat-message-bubble-bot-badge")).toBeTruthy();
    await fireEvent.press(screen.getByTestId("bot-bubble-opt-arch"));
    await fireEvent(screen.getByTestId("chat-message-bubble-container"), "longPress");

    await render(
      <ChatMessageBubble
        message={{
          id: "del-1",
          clientId: "del-c-1",
          conversationId: "room-1",
          senderType: "USER",
          content: null,
          contentType: "text",
          isEdited: false,
          deletedAt: "2026-11-21T01:00:00.000Z",
          createdAt: "2026-11-21T00:00:00.000Z",
          attachments: [],
        }}
        isOwn
      />
    );
    expect(screen.getByTestId("chat-message-bubble-deleted")).toBeTruthy();

    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    await render(
      <ErrorBoundary>
        <Thrower shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText(/boom in child/)).toBeTruthy();

    await render(
      <ListErrorBoundary sectionName="Rooms">
        <Thrower shouldThrow />
      </ListErrorBoundary>
    );
    expect(screen.getByText(/boom in child/)).toBeTruthy();
    errorSpy.mockRestore();
  });
});
