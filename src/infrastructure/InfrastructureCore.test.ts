/** @format */

import NetInfo from "@react-native-community/netinfo";
import * as Audio from "expo-audio";
import AudioModule from "expo-audio/build/AudioModule";
import * as Haptics from "expo-haptics";
import * as SecureStore from "expo-secure-store";

import { isErr, isOk } from "@/src/domain/Result";
import { ConnectivityAdapter } from "@/src/infrastructure/adapters/ConnectivityAdapter";
import { ExpoAudioRecordingService } from "@/src/infrastructure/audio/ExpoAudioRecordingService";
import { HapticsService } from "@/src/infrastructure/haptics/HapticsService";
import { directionFromLangTag } from "@/src/infrastructure/i18n/direction";
import { resolveLangCode } from "@/src/infrastructure/i18n/resolve-lang";
import { Logger, log } from "@/src/infrastructure/logging/logger";
import {
  clearQueryCache,
  clientAsyncStorage,
  queryClient,
  setupOnlineManager,
} from "@/src/infrastructure/query/queryClient";
import { clearAll, getData, removeData, saveData } from "@/src/infrastructure/storage/storage";
import { TOKEN_KEYS, TokenStorageImpl } from "@/src/infrastructure/storage/TokenStorageImpl";
import { zustandMMKVStorage } from "@/src/infrastructure/storage/ZustandMMKVAdapter";
import {
  env,
  isDevelopment,
  isProduction,
  isSimulatedChatMode,
} from "@/src/infrastructure/system/env";
import { reloadApp } from "@/src/infrastructure/system/reload-app";
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
  });

  it("triggers all haptic feedback styles via HapticsService", async () => {
    const haptics = new HapticsService();
    await haptics.light();
    await haptics.medium();
    await haptics.heavy();
    await haptics.success();
    await haptics.warning();
    await haptics.error();
    await haptics.selection();

    expect(Haptics.impactAsync).toHaveBeenCalledTimes(3);
    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(3);
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
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

  it("records, stops, and cancels voice notes in ExpoAudioRecordingService", async () => {
    const service = new ExpoAudioRecordingService();

    const emptyStop = await service.stopRecording();
    expect(isErr(emptyStop) && emptyStop.error.code).toBe("NO_ACTIVE_RECORDING");

    (Audio.requestRecordingPermissionsAsync as jest.Mock).mockResolvedValueOnce({ granted: false });
    const deniedRes = await service.startRecording();
    expect(isErr(deniedRes) && deniedRes.error.code).toBe("MICROPHONE_PERMISSION_DENIED");

    const mockRecorder = {
      prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
      record: jest.fn(),
      stop: jest.fn().mockResolvedValue(undefined),
      isRecording: true,
      uri: "file:///rec-1.m4a",
      currentTime: 3.4,
    };
    (AudioModule.AudioRecorder as unknown as jest.Mock).mockImplementationOnce(() => mockRecorder);

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

    (AudioModule.AudioRecorder as unknown as jest.Mock).mockImplementationOnce(() => ({
      ...mockRecorder,
      uri: null,
    }));
    await service.startRecording();
    expect(isOk(await service.cancelRecording())).toBe(true);
    expect(service.isRecording()).toBe(false);
    expect(service.getDurationMs()).toBe(0);
  });

  it("saves, retrieves, and clears tokens and secure storage keys", async () => {
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

    await saveData("pref_a", { theme: "dark" });
    expect(await getData<{ theme: string }>("pref_a")).toEqual({ theme: "dark" });
    await removeData("pref_a");
    expect(await getData("pref_a")).toBeNull();
    await saveData("pref_b", 123);
    await clearAll();
    expect(await getData("pref_b")).toBeNull();
  });

  it("reads/writes ZustandMMKVAdapter, QueryClient cache, env, i18n utils, and runtime", async () => {
    zustandMMKVStorage.setItem("z_key", "z_val");
    expect(await zustandMMKVStorage.getItem("z_key")).toBe("z_val");
    await zustandMMKVStorage.removeItem("z_key");

    await clientAsyncStorage.setItem("q_key", "q_val");
    expect(await clientAsyncStorage.getItem("q_key")).toBe("q_val");
    await clientAsyncStorage.removeItem("q_key");
    expect(await clientAsyncStorage.getItem("q_key")).toBeNull();

    const unsubOnline = setupOnlineManager();
    expect(NetInfo.addEventListener).toHaveBeenCalled();
    unsubOnline();
    clearQueryCache();
    expect(queryClient).toBeDefined();

    expect(directionFromLangTag("ar-EG")).toBe("rtl");
    expect(directionFromLangTag("en-US")).toBe("ltr");
    expect(directionFromLangTag()).toBe("ltr");
    expect(resolveLangCode("ar_SA")).toBe("ar");
    expect(resolveLangCode("fr-FR")).toBe("en");

    expect(env.EXPO_PUBLIC_CHAT_MODE).toBe("simulated");
    expect(isSimulatedChatMode).toBe(true);
    expect(typeof isDevelopment).toBe("boolean");
    expect(typeof isProduction).toBe("boolean");
    expect(typeof IS_EXPO_GO).toBe("boolean");
    await reloadApp();

    const childLog = log.createChild("InfraTest");
    childLog.info("ok");
    childLog.exception(new Error("test"));
    expect(Logger.getInstance()).toBeDefined();
  });
});
