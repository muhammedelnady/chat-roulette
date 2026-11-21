/** @format */

import { Ionicons } from "@expo/vector-icons";
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
  const { t, colors, shadows } = useUI();
  const section = sectionName ?? t("errors.defaultSection");

  return (
    <View
      style={[
        styles.container,
        shadows.sm,
        { backgroundColor: colors.surface, borderColor: colors.errorBorder },
      ]}
    >
      <View style={[styles.iconMedallion, { backgroundColor: colors.errorTint }]}>
        <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
      </View>

      <Text variant="sm" weight="bold" colorKey="error" style={styles.title}>
        {t("errors.sectionFailed", { section })}
      </Text>

      {__DEV__ && error !== null && (
        <Text variant="xs" color={colors.error} style={styles.message} centered>
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
    margin: spacing[14],
    padding: spacing[20],
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
  },
  iconMedallion: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[12],
  },
  title: {
    marginBottom: spacing[6],
    textAlign: "center",
  },
  message: {
    marginBottom: spacing[14],
  },
  button: {
    paddingHorizontal: spacing[16],
  },
});
