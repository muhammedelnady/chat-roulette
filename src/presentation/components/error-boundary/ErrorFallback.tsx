/** @format */

import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, View as RNView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Text, View } from "@/src/presentation/components/atoms";
import { ContentContainer } from "@/src/presentation/components/templates";
import { useUI } from "@/src/presentation/hooks";
import { borderRadius, gradients, spacing, typography } from "@theme";

interface ErrorFallbackProps {
  readonly error: Error | null;
  readonly resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const { t, colors, shadows, isRTL } = useUI();
  const align = isRTL ? "right" : "left";

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ContentContainer style={styles.contentContainer}>
          <RNView
            style={[
              styles.outerHalo,
              { backgroundColor: colors.errorTint, borderColor: colors.errorBorder },
            ]}
          >
            <RNView
              style={[
                styles.iconContainer,
                { backgroundColor: colors.surface, borderColor: colors.errorBorder },
              ]}
            >
              <Ionicons name="warning-outline" size={38} color={colors.error} />
            </RNView>
          </RNView>

          <Text variant="xl" weight="bold" style={[styles.title, { textAlign: align }]}>
            {t("errors.errorOccurred")}
          </Text>

          <Text
            variant="md"
            color={colors.textSecondary}
            style={[styles.message, { textAlign: align }]}
          >
            {t("errors.errorDescription")}
          </Text>

          {__DEV__ && error !== null && (
            <RNView
              style={[
                styles.errorDetails,
                shadows.sm,
                { backgroundColor: colors.surface, borderColor: colors.errorBorder },
              ]}
            >
              <Text
                variant="sm"
                weight="bold"
                color={colors.error}
                style={styles.errorDetailsTitle}
              >
                {t("errors.devDetailsTitle")}
              </Text>

              <ScrollView>
                <RNView style={[styles.errorContent, { backgroundColor: colors.surfaceElevated }]}>
                  <Text variant="sm" color={colors.error} style={styles.errorMessage}>
                    {error.message}
                  </Text>
                </RNView>
              </ScrollView>
            </RNView>
          )}

          <Button
            label={t("errors.tryAgain")}
            onPress={resetErrorBoundary}
            gradient={gradients.primary}
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
  outerHalo: {
    width: 108,
    height: 108,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[24],
  },
  iconContainer: {
    width: 82,
    height: 82,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { marginBottom: spacing[10] },
  message: {
    marginBottom: spacing[24],
    lineHeight: 22,
  },
  errorDetails: {
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    borderCurve: "continuous",
    padding: spacing[16],
    marginBottom: spacing[24],
    width: "100%",
    maxHeight: 260,
  },
  errorDetailsTitle: { marginBottom: spacing[8] },
  errorContent: {
    borderRadius: borderRadius.md,
    padding: spacing[12],
  },
  errorMessage: {
    fontFamily: typography.fontFamily.regular,
  },
  retryButton: {
    width: "100%",
    maxWidth: 280,
  },
});
