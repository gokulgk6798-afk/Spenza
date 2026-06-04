import { useWindowDimensions } from "react-native";

import { getHorizontalPadding, layout } from "../constants/theme";

export function useResponsiveLayout() {
  const { width } = useWindowDimensions();

  return {
    horizontalPadding: getHorizontalPadding(width),
    maxWidth: layout.maxWidth
  };
}
