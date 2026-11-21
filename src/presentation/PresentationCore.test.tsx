/** @format */

import { NetInfoStateType } from "@react-native-community/netinfo";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react-native";
import * as Audio from "expo-audio";
import { AudioModule } from "expo-audio";
import * as Haptics from "expo-haptics";
import type { ReactNode } from "react";
import { useReducedMotion } from "react-native-reanimated";

import { UseCasesProvider } from "@/src/di/UseCasesProvider";
import { AnimatedPressable, Button, PulseDot, Text } from "@/src/presentation/components/atoms";
import { ErrorBoundary, ListErrorBoundary } from "@/src/presentation/components/error-boundary";
import { ChatEmptyState } from "@/src/presentation/features/chat/screens/chat/components/ChatEmptyState";
import { ChatFaqOptionsBar } from "@/src/presentation/features/chat/screens/chat/components/ChatFaqOptionsBar";
import { ChatMessageBubble } from "@/src/presentation/features/chat/screens/chat/components/ChatMessageBubble";
import { CHAT_MESSAGE_BUBBLE_TEST_IDS } from "@/src/presentation/features/chat/screens/chat/components/ChatMessageBubble/ChatMessageBubble.constants";
import { MessageImageLightbox } from "@/src/presentation/features/chat/screens/chat/components/ChatMessageBubble/MessageImageLightbox";
import { ChatTypingIndicator } from "@/src/presentation/features/chat/screens/chat/components/ChatTypingIndicator";
import { QueueStatusBanner } from "@/src/presentation/features/chat/screens/chat/components/QueueStatusBanner";
import { RadarPulse } from "@/src/presentation/features/chat/screens/roulette/components/RadarPulse";
import { useChatNavigation } from "@/src/presentation/features/chat/shared/hooks";
import {
  formatDuration,
  useAppInitialization,
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
import { darkColors, projectVelocity, rubberband } from "@/src/presentation/theme";
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
    jest.clearAllMocks();
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
    useConnectivityStore.getState().setDemoOfflineOverride(false);
    expect(useConnectivityStore.getState().demoOfflineOverride).toBe(false);
    const unsub = useConnectivityStore.getState().subscribe();
    unsub();
  });

  it("exposes hooks, style utilities, and cancels active recording on unmount", async () => {
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
    uiResult.current.nav.replaceWithChat("room-2");
    uiResult.current.nav.navigateToRoulette();
    uiResult.current.nav.navigateBack();

    const { result: voiceResult, unmount: unmountVoice } = await renderHook(
      () => useVoiceRecording(),
      {
        wrapper: UseCasesProvider,
      }
    );

    const recorderStop = jest.fn().mockResolvedValue(undefined);
    const nativeAudio = AudioModule;
    (nativeAudio.AudioRecorder as unknown as jest.Mock).mockImplementation(() => ({
      prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
      record: jest.fn(),
      stop: recorderStop,
      isRecording: true,
      uri: "file:///voice-core.m4a",
      currentTime: 2.5,
    }));

    let started = false;
    await act(async () => {
      started = await voiceResult.current.startRecording();
    });
    expect(started).toBe(true);
    expect(voiceResult.current.isRecording).toBe(true);

    let stoppedUri: string | undefined;
    await act(async () => {
      const note = await voiceResult.current.stopRecording();
      stoppedUri = note?.uri;
    });
    expect(stoppedUri).toBe("file:///voice-core.m4a");
    expect(voiceResult.current.isRecording).toBe(false);

    await act(async () => {
      await voiceResult.current.startRecording();
    });
    expect(voiceResult.current.isRecording).toBe(true);
    await unmountVoice();
    expect(Audio.setAudioModeAsync).toHaveBeenLastCalledWith({
      allowsRecording: false,
      playsInSilentMode: true,
    });

    const { result: initResult } = await renderHook(() => useAppInitialization());
    await act(async () => {
      await Promise.resolve();
    });
    expect(typeof initResult.current.isReady).toBe("boolean");
  });

  it("renders UI components, triggers Button haptics, and renders error boundaries", async () => {
    const onPress = jest.fn();
    await render(
      <Button
        label="Launch"
        gradient
        variant="primary"
        size="lg"
        onPress={onPress}
        testID="core-btn"
      />,
      { wrapper: UseCasesProvider }
    );
    await fireEvent(screen.getByTestId("core-btn"), "pressIn");
    await fireEvent.press(screen.getByTestId("core-btn"));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);

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

  it("handles motion helpers, PulseDot, reduced motion, RadarPulse states, and MessageImageLightbox", async () => {
    expect(projectVelocity(1000)).toBeGreaterThan(400);
    expect(projectVelocity(0)).toBe(0);
    const resisted = rubberband(200, 400);
    expect(resisted).toBeGreaterThan(0);
    expect(resisted).toBeLessThan(200);

    await render(
      <PulseDot
        color={darkColors.success}
        haloColor={darkColors.successTint}
        active
        testID="pulse-active"
      />
    );
    expect(screen.getByTestId("pulse-active")).toBeTruthy();

    await render(<PulseDot color={darkColors.warning} active={false} testID="pulse-inactive" />);
    expect(screen.getByTestId("pulse-inactive")).toBeTruthy();

    const reducedSpy = useReducedMotion as jest.Mock;
    reducedSpy.mockReturnValue(true);

    const onLongPress = jest.fn();
    const onDisabledPress = jest.fn();
    await render(
      <>
        <AnimatedPressable onLongPress={onLongPress} testID="long-press-target">
          <Text>Hold</Text>
        </AnimatedPressable>
        <AnimatedPressable disabled onPress={onDisabledPress} testID="disabled-press-target">
          <Text>Disabled</Text>
        </AnimatedPressable>
      </>
    );
    await fireEvent(screen.getByTestId("long-press-target"), "pressIn");
    await fireEvent(screen.getByTestId("long-press-target"), "longPress");
    await fireEvent(screen.getByTestId("long-press-target"), "pressOut");
    expect(onLongPress).toHaveBeenCalledTimes(1);

    await fireEvent(screen.getByTestId("disabled-press-target"), "pressIn");
    await fireEvent.press(screen.getByTestId("disabled-press-target"));
    expect(onDisabledPress).not.toHaveBeenCalled();

    await render(<RadarPulse isScanning={false} isMatched={false} testID="radar-idle" />);
    expect(screen.getByTestId("radar-idle")).toBeTruthy();

    reducedSpy.mockReturnValue(false);

    await render(<RadarPulse isScanning={false} isMatched={false} testID="radar-idle-motion" />);
    expect(screen.getByTestId("radar-idle-motion")).toBeTruthy();
    await render(
      <RadarPulse isScanning isMatched={false} isActive={false} testID="radar-paused" />
    );
    expect(screen.getByTestId("radar-paused")).toBeTruthy();
    await render(<RadarPulse isScanning isMatched={false} testID="radar-scan-motion" />);
    expect(screen.getByTestId("radar-scan-motion")).toBeTruthy();
    await render(<RadarPulse isScanning={false} isMatched testID="radar-matched-motion" />);
    expect(screen.getByTestId("radar-matched-motion")).toBeTruthy();

    const onClose = jest.fn();
    await render(
      <MessageImageLightbox imageUrl="https://example.com/photo.jpg" onClose={onClose} />
    );
    expect(screen.getByTestId(CHAT_MESSAGE_BUBBLE_TEST_IDS.LIGHTBOX_MODAL)).toBeTruthy();
    await fireEvent.press(screen.getByTestId(CHAT_MESSAGE_BUBBLE_TEST_IDS.LIGHTBOX_CLOSE));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
