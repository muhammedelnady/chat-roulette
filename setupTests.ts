import { notifyManager } from "@tanstack/react-query";
import type React from "react";
import { Text as mockRNText } from "react-native";
import "react-native-gesture-handler/jestSetup";

jest.mock("@react-native-async-storage/async-storage", () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("react-native-gesture-handler/src/v3/detectors/useEnsureGestureHandlerRootView", () => ({
  useEnsureGestureHandlerRootView: () => undefined,
}));

jest.mock(
  "react-native-gesture-handler/lib/module/v3/detectors/useEnsureGestureHandlerRootView",
  () => ({
    useEnsureGestureHandlerRootView: () => undefined,
  })
);

notifyManager.setBatchNotifyFunction((callback) => {
  callback();
});
notifyManager.setScheduler((callback) => {
  callback();
});

jest.mock("@infrastructure/logging/logger", () => {
  const createMockLogger = (): Record<string, jest.Mock> => {
    const instance: Record<string, jest.Mock> = {
      silly: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      exception: jest.fn(),
      setSeverity: jest.fn(),
      getSeverity: jest.fn().mockReturnValue("debug"),
      createChild: jest.fn(() => instance),
    };
    return instance;
  };
  const mockLoggerInstance = createMockLogger();
  return {
    log: mockLoggerInstance,
    Logger: Object.assign(
      jest.fn().mockImplementation(() => createMockLogger()),
      { getInstance: jest.fn(() => mockLoggerInstance) }
    ),
  };
});

process.env["EXPO_PUBLIC_CHAT_MODE"] = "simulated";
process.env["EXPO_PUBLIC_API_URL"] = "https://api.example.com";
process.env["EXPO_PUBLIC_ENV"] = "development";
process.env["EXPO_PUBLIC_APP_SCHEME"] = "chatroulette";
process.env["EXPO_PUBLIC_MMKV_ENCRYPTION_KEY"] = "test_showcase_mmkv_key_32_characters";
process.env["EXPO_OS"] = "ios";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
  MaterialIcons: "MaterialIcons",
  MaterialCommunityIcons: "MaterialCommunityIcons",
  Feather: "Feather",
}));

jest.mock("react-native-logs", () => ({
  logger: {
    createLogger: jest.fn().mockReturnValue({
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      silly: jest.fn(),
      setSeverity: jest.fn(),
    }),
  },
  consoleTransport: jest.fn(),
}));

jest.mock("@csark0812/zustand-expo-devtools", () => ({
  withDevtools: (fn: unknown) => fn,
  devtools: (fn: unknown) => fn,
}));

jest.mock("@/src/infrastructure/storage/ZustandMMKVAdapter", () => {
  const mockStorage = new Map<string, string>();
  return {
    zustandMMKVStorage: {
      getItem: jest.fn((name: string) => Promise.resolve(mockStorage.get(name) ?? null)),
      setItem: jest.fn((name: string, value: string) => {
        mockStorage.set(name, value);
        return Promise.resolve();
      }),
      removeItem: jest.fn((name: string) => {
        mockStorage.delete(name);
        return Promise.resolve();
      }),
    },
  };
});

jest.mock("react-native-mmkv", () => {
  const createStatefulStore = () => {
    const map = new Map<string, string | number | boolean | ArrayBuffer>();
    return {
      set: jest.fn((k: string, v: string | number | boolean | ArrayBuffer) => {
        map.set(k, v);
      }),
      getString: jest.fn((k: string) => {
        const val = map.get(k);
        return typeof val === "string" ? val : undefined;
      }),
      setString: jest.fn((k: string, v: string) => {
        map.set(k, v);
      }),
      getNumber: jest.fn((k: string) => {
        const val = map.get(k);
        return typeof val === "number" ? val : undefined;
      }),
      setNumber: jest.fn((k: string, v: number) => {
        map.set(k, v);
      }),
      getBoolean: jest.fn((k: string) => {
        const val = map.get(k);
        return typeof val === "boolean" ? val : undefined;
      }),
      setBoolean: jest.fn((k: string, v: boolean) => {
        map.set(k, v);
      }),
      remove: jest.fn((k: string) => map.delete(k)),
      delete: jest.fn((k: string) => {
        map.delete(k);
      }),
      contains: jest.fn((k: string) => map.has(k)),
      clearAll: jest.fn(() => {
        map.clear();
      }),
      getAllKeys: jest.fn(() => Array.from(map.keys())),
    };
  };

  return {
    MMKV: jest.fn().mockImplementation(createStatefulStore),
    createMMKV: jest.fn().mockImplementation(createStatefulStore),
    useMMKV: jest.fn(),
  };
});

jest.mock("@react-native-community/netinfo", () => ({
  fetch: jest.fn().mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
    type: "wifi",
  }),
  addEventListener: jest.fn().mockReturnValue(() => {}),
  useNetInfo: jest.fn().mockReturnValue({
    isConnected: true,
    isInternetReachable: true,
    type: "wifi",
  }),
  NetInfoStateType: {
    unknown: "unknown",
    none: "none",
    cellular: "cellular",
    wifi: "wifi",
    other: "other",
  },
}));

jest.mock("expo-router", () => {
  const ReactActual = jest.requireActual<typeof React>("react");
  const StackMock = ({ children }: { children?: React.ReactNode }) =>
    ReactActual.createElement("View", { testID: "expo-router-stack" }, children);
  StackMock.displayName = "StackMock";
  const ScreenMock = ({ name }: { name?: string }) =>
    ReactActual.createElement("View", { testID: `stack-screen-${name}` });
  ScreenMock.displayName = "ScreenMock";
  StackMock.Screen = ScreenMock;

  return {
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    }),
    useSegments: () => [],
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => cb(),
    Link: "Link",
    Redirect: ({ href }: { href: string }) =>
      ReactActual.createElement("View", {
        testID: "expo-router-redirect",
        accessibilityLabel: href,
      }),
    Stack: StackMock,
    DarkTheme: { dark: true, colors: {} },
    DefaultTheme: { dark: false, colors: {} },
    ThemeProvider: ({ children }: { children?: React.ReactNode }) =>
      ReactActual.createElement("View", { testID: "theme-provider" }, children),
  };
});

jest.mock("expo-audio", () => {
  const mockAudioRecorder = jest.fn().mockImplementation(() => ({
    prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
    record: jest.fn(),
    stop: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn(),
    isRecording: false,
    uri: null,
    currentTime: 0,
    getStatus: jest.fn().mockReturnValue({ isRecording: false }),
  }));
  (mockAudioRecorder as unknown as { prototype: Record<string, unknown> }).prototype = {
    prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
    record: jest.fn(),
    stop: jest.fn().mockResolvedValue(undefined),
  };

  return {
    useAudioPlayer: jest.fn(() => ({
      play: jest.fn(),
      pause: jest.fn(),
      playing: false,
      currentTime: 0,
      duration: 0,
    })),
    useAudioRecorder: jest.fn(() => new (mockAudioRecorder as unknown as new () => unknown)()),
    useAudioRecorderState: jest.fn(() => ({ isRecording: false, duration: 0 })),
    requestRecordingPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
    getRecordingPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    setIsAudioActiveAsync: jest.fn().mockResolvedValue(undefined),
    RecordingPresets: {
      HIGH_QUALITY: {},
      LOW_QUALITY: {},
    },
    AudioModule: {
      AudioRecorder: mockAudioRecorder,
    },
  };
});

jest.mock("expo-audio/build/AudioModule", () => {
  const mockAudioRecorder = jest.fn().mockImplementation(() => ({
    prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
    record: jest.fn(),
    stop: jest.fn().mockResolvedValue(undefined),
  }));
  (mockAudioRecorder as unknown as { prototype: Record<string, unknown> }).prototype = {
    prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
  };
  return {
    __esModule: true,
    default: {
      AudioRecorder: mockAudioRecorder,
    },
  };
});

jest.mock("react-native-worklets", () => ({
  runOnJS: <T>(fn: T) => fn,
  runOnUI: <T>(fn: T) => fn,
  scheduleOnUI: (fn: () => void) => {
    if (typeof fn === "function") fn();
  },
  scheduleOnRN: (fn: () => void) => {
    if (typeof fn === "function") fn();
  },
  createWorklet: <T>(fn: T) => fn,
  makeShareable: <T>(val: T) => val,
  isWorkletFunction: () => false,
  getUIRuntimeHolder: () => ({}),
  createShareable: <T>(_runtimeId: number, initial: T) => ({ value: initial }),
  UIRuntimeId: 0,
  WorkletsError: class extends Error {},
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
    Soft: "soft",
    Rigid: "rigid",
  },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
}));

jest.mock("react-native-reanimated", () => {
  const NOOP = () => undefined;
  const NOOP_FACTORY = () => NOOP;
  const ID = <T>(t: T) => t;
  const isSharedValue = (value: unknown): boolean =>
    typeof value === "object" && value !== null && "value" in value;

  class BaseAnimationMock {
    duration() {
      return this;
    }
    delay() {
      return this;
    }
    springify() {
      return this;
    }
    damping() {
      return this;
    }
    stiffness() {
      return this;
    }
    mass() {
      return this;
    }
    withCallback() {
      return this;
    }
    easing() {
      return this;
    }
    build() {
      return () => ({ initialValues: {}, animations: {} });
    }
  }

  return {
    __esModule: true,
    reanimatedVersion: "4.x.x-mock",
    isSharedValue,
    default: {
      View: "Animated.View",
      Text: mockRNText,
      Image: "Animated.Image",
      ScrollView: "Animated.ScrollView",
      FlatList: "Animated.FlatList",
      createAnimatedComponent: ID,
      isSharedValue,
    },
    useSharedValue: <T>(init: T) => {
      const shared: { value: T; get: () => T; set: (v: T) => void } = {
        value: init,
        get: () => shared.value,
        set: (v: T) => {
          shared.value = v;
        },
      };
      return shared;
    },
    useAnimatedStyle: ID,
    useDerivedValue: <T>(processor: () => T) => ({ value: processor() }),
    useAnimatedRef: () => ({ current: null }),
    useAnimatedScrollHandler: NOOP_FACTORY,
    useAnimatedProps: ID,
    cancelAnimation: NOOP,
    withDelay: <T>(_delayMs: number, nextAnimation: T) => nextAnimation,
    withRepeat: ID,
    withSequence: () => 0,
    withSpring: (toValue: number) => toValue,
    withTiming: (toValue: number, _config?: unknown, callback?: (finished: boolean) => void) => {
      callback?.(true);
      return toValue;
    },
    Extrapolation: { CLAMP: "clamp", EXTEND: "extend", IDENTITY: "identity" },
    interpolate: NOOP,
    FadeIn: new BaseAnimationMock(),
    FadeInDown: new BaseAnimationMock(),
    FadeOutDown: new BaseAnimationMock(),
    FadeInUp: new BaseAnimationMock(),
    FadeOut: new BaseAnimationMock(),
    ZoomIn: new BaseAnimationMock(),
    Layout: new BaseAnimationMock(),
    LinearTransition: new BaseAnimationMock(),
    Easing: {
      linear: ID,
      ease: ID,
      inOut: ID,
      out: ID,
      in: ID,
    },
    runOnJS: ID,
    runOnUI: ID,
  };
});

afterEach(() => {
  jest.clearAllTimers();
});

afterAll(() => {
  jest.useRealTimers();
});
