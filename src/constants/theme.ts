import { StyleSheet } from "react-native";

// カラーパレット
export const colors = {
  primary: "#2196F3",
  primaryDark: "#1976D2",
  primaryLight: "#BBDEFB",
  secondary: "#4CAF50",
  background: "#F5F5F5",
  surface: "#FFFFFF",
  text: "#212121",
  textSecondary: "#757575",
  textLight: "#FFFFFF",
  border: "#E0E0E0",
  error: "#F44336",
  warning: "#FF9800",
  droplet: "#64B5F6",
  dropletDark: "#1E88E5",
} as const;

// 共通スペーシング
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

// フォントサイズ
export const fontSize = {
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 28,
  xxlarge: 36,
} as const;

// 共通スタイル
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: fontSize.large,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: fontSize.large,
    backgroundColor: colors.surface,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: fontSize.medium,
    fontWeight: "bold",
  },
  resultValue: {
    fontSize: fontSize.xxlarge,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center" as const,
  },
  resultLabel: {
    fontSize: fontSize.medium,
    color: colors.textSecondary,
    textAlign: "center" as const,
  },
});
