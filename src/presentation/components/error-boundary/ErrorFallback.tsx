/** @format */

import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Text, View } from "@/src/presentation/components/atoms";
import { ContentContainer } from "@/src/presentation/components/templates";
import { useUI } from "@/src/presentation/hooks";
import { borderRadius, spacing, typography } from "@theme";

interface ErrorFallbackProps {
  readonly error: Error | null;
  readonly resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const { t, colors, isRTL } = useUI();
  const align = isRTL ? "right" : "left";

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ContentContainer style={styles.contentContainer}>
          <View style={[styles.iconContainer, { backgroundColor: colors.errorTint }]}>
            <Ionicons name="warning-outline" size={44} color={colors.error} />
          </View>

          <Text variant="xl" weight="bold" style={[styles.title, { textAlign: align }]}>
            {t("errors.errorOccurred")}
          </Text>

          <Text variant="md" style={[styles.message, { textAlign: align }]}>
            {t("errors.errorDescription")}
          </Text>

          {__DEV__ && error !== null && (
            <View
              style={[
                styles.errorDetails,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text
                variant="md"
                weight="bold"
                color={colors.error}
                style={styles.errorDetailsTitle}
              >
                {t("errors.devDetailsTitle")}
              </Text>

              <ScrollView>
                <View style={styles.errorContent}>
                  <Text variant="sm" color={colors.error} style={styles.errorMessage}>
                    {error.message}
                  </Text>
                </View>
              </ScrollView>
            </View>
          )}

          <Button
            label={t("errors.tryAgain")}
            onPress={resetErrorBoundary}
            variant="primary"
            style={styles.retryButton}
          />
        </ContentContainer>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing[24],
  },
  iconContainer: {
    width: 84,
    height: 84,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[24],
  },
  title: { marginBottom: spacing[12] },
  message: {
    marginBottom: spacing[24],
    lineHeight: 24,
  },
  errorDetails: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing[16],
    marginBottom: spacing[24],
    width: "100%",
    maxHeight: 280,
  },
  errorDetailsTitle: { marginBottom: spacing[8] },
  errorContent: {
    borderRadius: borderRadius.md,
    padding: spacing[12],
  },
  errorMessage: {
    fontFamily: typography.fontFamily.regular,
    marginBottom: spacing[8],
  },
  retryButton: {
    width: "100%",
    maxWidth: 280,
  },
});
