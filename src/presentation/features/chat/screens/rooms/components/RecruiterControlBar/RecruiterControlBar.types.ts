/** @format */

export interface RecruiterControlBarProps {
  readonly isOnline: boolean;
  readonly isDark: boolean;
  readonly isActive?: boolean;
  readonly showOfflineSim?: boolean;
  readonly outboundQueueCount: number;
  readonly onToggleOffline: () => void;
  readonly onToggleTheme: () => void;
  readonly onToggleLanguage: () => void;
  readonly testID?: string;
}
