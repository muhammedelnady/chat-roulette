/** @format */

export interface RouletteHeroCardProps {
  readonly onlineCount: number;
  readonly isActive?: boolean;
  readonly onSpinPress: () => void;
  readonly testID?: string;
}
