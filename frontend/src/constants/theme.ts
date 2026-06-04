export const colors = {
  background: "#F7F8FC",
  surface: "#FFFFFF",
  ink: "#101828",
  deepNavy: "#121A35",
  secondaryText: "#475467",
  mutedText: "#8A93A6",
  border: "#E6E9F2",
  primaryBlue: "#315CFF",
  success: "#12B76A",
  successBright: "#32D583",
  warning: "#C47A0B",
  danger: "#EF4444",
  purple: "#7C3AED"
};

export const layout = {
  baseDesignWidth: 390,
  cardGap: 16,
  maxWidth: 520,
  sectionGap: 24,
  spacing: {
    small: 16,
    standard: 20,
    large: 24,
    tablet: 32
  }
};

export function getHorizontalPadding(width: number) {
  if (width >= 768) return layout.spacing.tablet;
  if (width >= 430) return layout.spacing.large;
  if (width >= 390) return layout.spacing.standard;
  return layout.spacing.small;
}

export const shadow = {
  shadowColor: "#101828",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.06,
  shadowRadius: 18,
  elevation: 2
};
