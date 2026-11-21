/** @format */

import * as Audio from "expo-audio";
import { AudioModule } from "expo-audio";
import * as Haptics from "expo-haptics";
import * as SecureStore from "expo-secure-store";
import { logger as rnLogs } from "react-native-logs";

import { PermissionError } from "@/src/domain/errors";
import { isErr, isOk } from "@/src/domain/Result";
import { HapticFeedbackType } from "@/src/domain/services/HapticFeedbackType";
import { ConnectivityAdapter } from "@/src/infrastructure/adapters/ConnectivityAdapter";
import { ExpoAudioRecordingService } from "@/src/infrastructure/audio/ExpoAudioRecordingService";
import { HapticsService } from "@/src/infrastructure/haptics/HapticsService";
import { directionFromLangTag } from "@/src/infrastructure/i18n/direction";
import { resolveLangCode } from "@/src/infrastructure/i18n/resolve-lang";
import { translate } from "@/src/infrastructure/i18n/translate";
import type { TxKeyPath } from "@/src/infrastructure/i18n/types";
import type * as LoggerModule from "@/src/infrastructure/logging/logger";
import { Logger, log } from "@/src/infrastructure/logging/logger";
import {
  getStorageSync,
  initStorage,
  isUsingFallbackStorage,
  resetStorageForTests,
} from "@/src/infrastructure/storage/mmkvStorage";
import { TOKEN_KEYS, TokenStorageImpl } from "@/src/infrastructure/storage/TokenStorageImpl";
import type * as ZustandAdapterModule from "@/src/infrastructure/storage/ZustandMMKVAdapter";
import { zustandMMKVStorage } from "@/src/infrastructure/storage/ZustandMMKVAdapter";
import {
  env,
  isDevelopment,
  isProduction,
  isSimulatedChatMode,
} from "@/src/infrastructure/system/env";
import { IS_EXPO_GO } from "@/src/infrastructure/system/runtime";

const mockSecureStoreMap = new Map<string, string>();

jest.mock("expo-secure-store", () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 1,
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockSecureStoreMap.set(key, value);
  }),
  getItemAsync: jest.fn(async (key: string) => mockSecureStoreMap.get(key) ?? null),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockSecureStoreMap.delete(key);
  }),
}));

describe("Infrastructure Core", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSecureStoreMap.clear();
    resetStorageForTests();
  });

  it("triggers all haptic feedback styles including trigger(type) and catches native errors", async () => {
    const haptics = new HapticsService();
    await haptics.light();
    await haptics.medium();
    await haptics.heavy();
    await haptics.success();
    await haptics.warning();
    await haptics.error();
    await haptics.selection();

    await haptics.trigger(HapticFeedbackType.Light);
    await haptics.trigger(HapticFeedbackType.Medium);
    await haptics.trigger(HapticFeedbackType.Heavy);
    await haptics.trigger(HapticFeedbackType.Success);
    await haptics.trigger(HapticFeedbackType.Warning);
    await haptics.trigger(HapticFeedbackType.Error);
    await haptics.trigger(HapticFeedbackType.Selection);

    expect(Haptics.impactAsync).toHaveBeenCalledTimes(6);
    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(6);
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(2);

    (Haptics.impactAsync as jest.Mock).mockRejectedValueOnce(new Error("unavailable"));
    await expect(haptics.light()).resolves.toBeUndefined();
  });

  it("reports connectivity state and forwards observer events", () => {
    const subSpy = jest.fn();
    const adapter = new ConnectivityAdapter(
      () => false,
      (cb) => {
        subSpy(cb);
        cb(true);
        return () => {};
      }
    );
    expect(adapter.isConnected()).toBe(false);
    const observed: boolean[] = [];
    const unsub = adapter.observeConnectivity((v) => observed.push(v));
    expect(observed).toEqual([true]);
    unsub();

    const defaultAdapter = new ConnectivityAdapter();
    expect(defaultAdapter.isConnected()).toBe(true);
    expect(typeof defaultAdapter.observeConnectivity(() => {})).toBe("function");
  });

  it("records, denies with PermissionError, stops stray recorder, and resets audio mode", async () => {
    const service = new ExpoAudioRecordingService();

    const emptyStop = await service.stopRecording();
    expect(isErr(emptyStop) && emptyStop.error.code).toBe("NO_ACTIVE_RECORDING");

    (Audio.requestRecordingPermissionsAsync as jest.Mock).mockResolvedValueOnce({ granted: false });
    const deniedRes = await service.startRecording();
    expect(isErr(deniedRes) && deniedRes.error).toBeInstanceOf(PermissionError);

    const mockRecorder = {
      prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
      record: jest.fn(),
      stop: jest.fn().mockResolvedValue(undefined),
      isRecording: true,
      uri: "file:///rec-1.m4a",
      currentTime: 3.4,
    };
    const nativeAudio = AudioModule;
    (nativeAudio.AudioRecorder as unknown as jest.Mock).mockImplementationOnce(() => mockRecorder);

    const startRes = await service.startRecording();
    expect(isOk(startRes)).toBe(true);
    expect(service.isRecording()).toBe(true);
    expect(service.getDurationMs()).toBeGreaterThanOrEqual(0);

    const stopRes = await service.stopRecording();
    expect(isOk(stopRes)).toBe(true);
    if (isOk(stopRes)) {
      expect(stopRes.value.uri).toBe("file:///rec-1.m4a");
      expect(stopRes.value.durationMs).toBe(3400);
    }
    expect(Audio.setAudioModeAsync).toHaveBeenLastCalledWith({
      allowsRecording: false,
      playsInSilentMode: true,
    });

    (nativeAudio.AudioRecorder as unknown as jest.Mock).mockImplementationOnce(() => ({
      ...mockRecorder,
      uri: null,
    }));
    await service.startRecording();
    expect(isOk(await service.cancelRecording())).toBe(true);
    expect(service.isRecording()).toBe(false);
    expect(service.getDurationMs()).toBe(0);
    expect(Audio.setAudioModeAsync).toHaveBeenLastCalledWith({
      allowsRecording: false,
      playsInSilentMode: true,
    });
  });

  it("saves, retrieves, and clears tokens in SecureStore", async () => {
    const tokenStorage = new TokenStorageImpl();
    expect(isOk(await tokenStorage.saveTokens("acc-1", "ref-1"))).toBe(true);
    expect(await tokenStorage.getToken()).toBe(mockSecureStoreMap.get(TOKEN_KEYS.ACCESS_TOKEN));

    const tokensRes = await tokenStorage.getTokens();
    expect(isOk(tokensRes) && tokensRes.value).toEqual({
      accessToken: "acc-1",
      refreshToken: "ref-1",
    });

    expect(isOk(await tokenStorage.clearTokens())).toBe(true);
    expect(await tokenStorage.getToken()).toBeNull();

    (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(new Error("keychain locked"));
    expect(isErr(await tokenStorage.saveTokens("a", "b"))).toBe(true);
  });

  it("reads/writes mmkvStorage, ZustandMMKVAdapter, logger circular/redaction, env, and i18n", async () => {
    const storage = await initStorage();
    expect(isUsingFallbackStorage()).toBe(true);
    storage.setString("k1", "v1");
    expect(getStorageSync().getString("k1")).toBe("v1");
    resetStorageForTests();
    expect(getStorageSync().getString("k1")).toBeUndefined();

    zustandMMKVStorage.setItem("z_key", "z_val");
    expect(await zustandMMKVStorage.getItem("z_key")).toBe("z_val");
    await zustandMMKVStorage.removeItem("z_key");

    const realAdapterMod = jest.requireActual<typeof ZustandAdapterModule>(
      "@/src/infrastructure/storage/ZustandMMKVAdapter"
    );
    realAdapterMod.zustandMMKVStorage.setItem("real_z_key", "real_z_val");
    expect(realAdapterMod.zustandMMKVStorage.getItem("real_z_key")).toBe("real_z_val");
    expect(realAdapterMod.zustandMMKVStorage.getItem("missing_z_key")).toBeNull();
    realAdapterMod.zustandMMKVStorage.removeItem("real_z_key");
    expect(realAdapterMod.zustandMMKVStorage.getItem("real_z_key")).toBeNull();

    expect(directionFromLangTag("ar-EG")).toBe("rtl");
    expect(directionFromLangTag("en-US")).toBe("ltr");
    expect(directionFromLangTag()).toBe("ltr");
    expect(resolveLangCode("ar_SA")).toBe("ar");
    expect(resolveLangCode("fr-FR")).toBe("en");
    expect(translate("en", "toString" as TxKeyPath)).toBe("toString");

    expect(env.EXPO_PUBLIC_CHAT_MODE).toBe("simulated");
    expect(isSimulatedChatMode).toBe(true);
    expect(typeof isDevelopment).toBe("boolean");
    expect(typeof isProduction).toBe("boolean");
    expect(typeof IS_EXPO_GO).toBe("boolean");

    const childLog = log.createChild("InfraTest");
    childLog.info("ok");
    childLog.exception(new Error("test"));
    expect(Logger.getInstance()).toBeDefined();

    let formattedLogs = "";
    jest.isolateModules(() => {
      const realLoggerMod = jest.requireActual<typeof LoggerModule>(
        "@/src/infrastructure/logging/logger"
      );
      const realLogger = realLoggerMod.Logger.getInstance();
      realLogger.setSeverity("silly");
      const circular: Record<string, unknown> = {
        token: "secret-val",
        authorization: "Bearer topsecret123",
      };
      circular["self"] = circular;
      realLogger.silly(circular);
      realLogger.debug("dbg");
      realLogger.info("inf");
      realLogger.warn("wrn");
      realLogger.error("err");
      realLogger.exception(new Error("boom"), "ctx");
      realLogger.exception("raw-str");

      const realChild = realLogger.createChild("Sub");
      realChild.info("child-secret", { refreshToken: "ref-secret" });
      realChild.exception(new Error("c"), "sub");

      const results = (rnLogs.createLogger as jest.Mock).mock.results;
      const latestTransport = results[results.length - 1]?.value as
        { silly: jest.Mock; info: jest.Mock; error: jest.Mock } | undefined;
      formattedLogs = JSON.stringify({
        silly: latestTransport?.silly.mock.calls ?? [],
        info: latestTransport?.info.mock.calls ?? [],
        error: latestTransport?.error.mock.calls ?? [],
      });
    });

    expect(formattedLogs).toContain("[Circular]");
    expect(formattedLogs).toContain("[REDACTED]");
    expect(formattedLogs).not.toContain("secret-val");
    expect(formattedLogs).not.toContain("ref-secret");
    expect(formattedLogs).not.toContain("topsecret123");
  });
});
