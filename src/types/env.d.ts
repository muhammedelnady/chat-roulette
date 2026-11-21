/** @format */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_CHAT_MODE?: string;
      EXPO_PUBLIC_API_URL?: string;
      EXPO_PUBLIC_ENV?: string;
      EXPO_PUBLIC_APP_SCHEME?: string;
      EXPO_PUBLIC_MMKV_ENCRYPTION_KEY?: string;
    }
  }
}

export {};
