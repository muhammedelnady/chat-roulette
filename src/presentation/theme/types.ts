/** @format */

export type ThemeMode = "light" | "dark";

export interface TextStyleFragment {
  readonly fontSize: number;
  readonly fontWeight: "400" | "500" | "600" | "700";
  readonly lineHeight: number;
  readonly textTransform?: "uppercase";
  readonly fontFamily?: string;
}

export interface ColorTokens {
  readonly background: string;
  readonly surface: string;
  readonly inputBackground: string;
  readonly searchInputBackground: string;
  readonly tabBarBackground: string;
  readonly cardBackground: string;
  readonly surfaceElevated: string;
  readonly textPrimary: string;
  readonly text: string;
  readonly textSecondary: string;
  readonly textPlaceholder: string;
  readonly placeholder: string;
  readonly textOnPrimary: string;
  readonly textMuted: string;
  readonly primary: string;
  readonly accent: string;
  readonly primaryTint: string;
  readonly primaryTint2: string;
  readonly error: string;
  readonly success: string;
  readonly warning: string;
  readonly info: string;
  readonly errorTint: string;
  readonly errorBorder: string;
  readonly successTint: string;
  readonly successBorder: string;
  readonly warningTint: string;
  readonly warningBorder: string;
  readonly infoTint: string;
  readonly infoBorder: string;
  readonly onError: string;
  readonly scrim: string;
  readonly border: string;
  readonly borderFocused: string;
  readonly borderActive: string;
  readonly borderStrong: string;
  readonly searchBorder: string;
  readonly tint: string;
  readonly tabIconDefault: string;
  readonly tabIconSelected: string;
  readonly iconPrimary: string;
  readonly iconSecondary: string;
  readonly white: string;
  readonly gray100: string;
  readonly shell: string;
  readonly ownBubble: string;
  readonly cyanGlow: string;
  readonly cyanTint: string;
}

export type ColorKey = keyof ColorTokens;

export interface TypographyTokens {
  readonly fontFamily: {
    readonly regular: string;
    readonly medium: string;
    readonly semiBold: string;
    readonly bold: string;
  };
  readonly fontSize: {
    readonly xs: number;
    readonly sm: number;
    readonly base: number;
    readonly md: number;
    readonly lg: number;
    readonly xl: number;
    readonly "2xl": number;
    readonly "3xl": number;
    readonly "4xl": number;
  };
  readonly lineHeight: {
    readonly tight: number;
    readonly normal: number;
    readonly relaxed: number;
  };
  readonly fontWeight: {
    readonly regular: "400";
    readonly medium: "500";
    readonly semiBold: "600";
    readonly bold: "700";
  };
  readonly screenTitle: TextStyleFragment;
  readonly h2: TextStyleFragment;
  readonly h3: TextStyleFragment;
  readonly body: TextStyleFragment;
  readonly sm: TextStyleFragment;
  readonly xs: TextStyleFragment;
  readonly label: TextStyleFragment;
  readonly mono: TextStyleFragment;
}

export type FontSizeKey = keyof TypographyTokens["fontSize"];
export type FontWeightKey = keyof TypographyTokens["fontWeight"];

export interface SpacingTokens {
  readonly 0: 0;
  readonly 2: 2;
  readonly 4: 4;
  readonly 6: 6;
  readonly 8: 8;
  readonly 10: 10;
  readonly 12: 12;
  readonly 14: 14;
  readonly 16: 16;
  readonly 20: 20;
  readonly 24: 24;
  readonly 28: 28;
  readonly 32: 32;
  readonly 40: 40;
  readonly 48: 48;
  readonly 56: 56;
  readonly 64: 64;
  readonly 80: 80;
  readonly 96: 96;
  readonly 112: 112;
  readonly 128: 128;
  readonly 200: 200;
  readonly 300: 300;
  readonly 350: 350;
  readonly screenPad: 14;
  readonly cardPad: 14;
  readonly cardRadius: 14;
  readonly sectionGap: 14;
  readonly itemGap: 8;
}

export type SpacingKey = keyof SpacingTokens;

export interface BorderRadiusTokens {
  readonly none: number;
  readonly sm: number;
  readonly md: number;
  readonly lg: number;
  readonly xl: number;
  readonly "2xl": number;
  readonly full: number;
}

export type BorderRadiusKey = keyof BorderRadiusTokens;

export interface ShadowStyle {
  readonly shadowColor: string;
  readonly shadowOffset: { readonly width: number; readonly height: number };
  readonly shadowOpacity: number;
  readonly shadowRadius: number;
  readonly elevation: number;
}

export interface ShadowTokens {
  readonly none: ShadowStyle;
  readonly sm: ShadowStyle;
  readonly md: ShadowStyle;
  readonly lg: ShadowStyle;
  readonly xl: ShadowStyle;
}

export type ShadowKey = keyof ShadowTokens;
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";
export type TextVariant = FontSizeKey;
export type TextWeight = FontWeightKey;

export interface ZIndexTokens {
  readonly hide: number;
  readonly base: number;
  readonly header: number;
  readonly overlay: number;
  readonly modal: number;
  readonly toast: number;
}

export type ZIndexKey = keyof ZIndexTokens;

export interface Theme {
  readonly mode: ThemeMode;
  readonly colors: ColorTokens;
  readonly typography: TypographyTokens;
  readonly spacing: SpacingTokens;
  readonly shadows: ShadowTokens;
  readonly borderRadius: BorderRadiusTokens;
  readonly zIndex: ZIndexTokens;
}
