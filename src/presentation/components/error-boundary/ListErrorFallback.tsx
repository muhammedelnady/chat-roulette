/** @format */

import { StyleSheet, View } from "react-native";

import { Button, Text } from "@/src/presentation/components/atoms";
import { useUI } from "@/src/presentation/hooks";
import { spacing } from "@theme";

interface ListErrorFallbackProps {
  readonly error: Error | null;
  readonly sectionName?: string;
  readonly onRetry: () => void;
}

export function ListErrorFallback({ error, sectionName, onRetry }: ListErrorFallbackProps) {
  const { t, colors } = useUI();
  const section = sectionName ?? t("errors.defaultSection");

  return (
    <View style={styles.container}>
      <Text variant="sm" weight="medium" colorKey="error" style={styles.title}>
        {t("errors.sectionFailed", { section })}
      </Text>

      {__DEV__ && error !== null && (
        <Text variant="xs" color={colors.error} style={styles.message}>
          {error.message}
        </Text>
      )}

      <Button
        label={t("errors.retry")}
        onPress={onRetry}
        variant="outline"
        size="sm"
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing[16],
    alignItems: "center",
    justifyContent: "center",
    minHeight: 150,
  },
  title: {
    marginBottom: spacing[8],
    textAlign: "center",
  },
  message: {
    marginBottom: spacing[12],
  },
  button: {
    paddingHorizontal: spacing[16],
  },
});
