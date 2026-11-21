/** @format */

import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { View } from "@/src/presentation/components/atoms";
import { KeyboardDismissArea } from "@/src/presentation/components/molecules";
import { spacing } from "@theme";

import { ContentContainer } from "./ContentContainer";

export interface PageLayoutProps {
  readonly children: React.ReactNode;
  readonly testID?: string;
}

export function PageLayout({ children, testID }: PageLayoutProps) {
  return (
    <View testID={testID} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardDismissArea>
          <ContentContainer style={styles.contentContainer}>{children}</ContentContainer>
        </KeyboardDismissArea>
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
