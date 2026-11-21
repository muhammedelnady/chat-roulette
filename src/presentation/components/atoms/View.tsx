/** @format */

import { memo, useMemo } from "react";
import type { ViewProps as RNViewProps, StyleProp, ViewStyle } from "react-native";
import { View as RNView } from "react-native";

import { useUI } from "@/src/presentation/hooks";
import type { ColorKey } from "@theme/types";

export interface ViewProps extends Omit<RNViewProps, "style"> {
  readonly backgroundColor?: ColorKey;
  readonly style?: StyleProp<ViewStyle>;
  readonly children?: React.ReactNode;
}

export const View = memo<ViewProps>(({ style, backgroundColor, children, ...props }) => {
  const { colors, getColor } = useUI();

  const viewStyle = useMemo<ViewStyle>(() => {
    const resolvedBackgroundColor = backgroundColor ? getColor(backgroundColor) : colors.background;
    return {
      backgroundColor: resolvedBackgroundColor,
    };
  }, [backgroundColor, colors.background, getColor]);

  return (
    <RNView style={[viewStyle, style]} {...props}>
      {children}
    </RNView>
  );
});

View.displayName = "View";
