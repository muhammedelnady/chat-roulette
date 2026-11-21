/** @format */

import { StyleSheet } from "react-native";
import { type Edge, SafeAreaView } from "react-native-safe-area-context";

import { View } from "@/src/presentation/components/atoms";
import { KeyboardDismissArea } from "@/src/presentation/components/molecules";
import { spacing } from "@theme";

import { ContentContainer } from "./ContentContainer";

export interface PageLayoutProps {
  readonly children: React.ReactNode;
  readonly fullBleed?: boolean;
  readonly edges?: readonly Edge[];
  readonly dismissKeyboardOnDrag?: boolean;
  readonly testID?: string;
}

const DEFAULT_EDGES: readonly Edge[] = ["top", "left", "right", "bottom"];

export function PageLayout({
  children,
  fullBleed = false,
  edges = DEFAULT_EDGES,
  dismissKeyboardOnDrag = true,
  testID,
}: PageLayoutProps) {
  const inner = (
    <ContentContainer fullBleed={fullBleed} style={styles.contentContainer}>
      {children}
    </ContentContainer>
  );

  return (
    <View testID={testID} style={styles.container}>
      <SafeAreaView edges={edges} style={styles.safeArea}>
        {dismissKeyboardOnDrag ? <KeyboardDismissArea>{inner}</KeyboardDismissArea> : inner}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: spacing[0],
  },
});
