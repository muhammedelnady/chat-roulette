/** @format */

import type { ViewProps } from "react-native";
import { StyleSheet } from "react-native";

import { View } from "@/src/presentation/components/atoms";
import { useUI } from "@presentation/hooks";
import { getScreenWidth } from "@presentation/utils/dimensions";

export interface ContentContainerProps extends ViewProps {
  readonly children: React.ReactNode;
}

export function ContentContainer({ children, style, ...props }: ContentContainerProps) {
  const { spacing } = useUI();
  return (
    <View
      style={[
        styles.container,
        {
          width: getScreenWidth() - spacing[16],
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
    alignSelf: "center",
  },
});
