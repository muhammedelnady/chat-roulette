/** @format */

export interface ChatHeaderProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly isOnline?: boolean;
  readonly isRouletteMatch?: boolean;
  readonly onBackPress?: () => void;
  readonly onToggleOffline?: () => void;
  readonly testID?: string;
}
