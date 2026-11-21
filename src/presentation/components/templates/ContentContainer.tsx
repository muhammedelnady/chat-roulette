/** @format */

import type { ViewProps } from "react-native";
import { StyleSheet } from "react-native";

import { View } from "@/src/presentation/components/atoms";
import { useUI } from "@presentation/hooks";

export interface ContentContainerProps extends ViewProps {
  readonly children: React.ReactNode;
  readonly fullBleed?: boolean;
}

export function ContentContainer({
  children,
  fullBleed = false,
  style,
  ...props
}: ContentContainerProps) {
  const { spacing } = useUI();
  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: fullBleed ? 0 : spacing[14],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
});
