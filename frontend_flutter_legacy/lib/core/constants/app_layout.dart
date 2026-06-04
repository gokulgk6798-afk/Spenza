class AppLayout {
  static double horizontalPadding(double width) {
    if (width >= 900) {
      return 32;
    }
    if (width >= 600) {
      return 28;
    }
    return 20;
  }

  static double contentMaxWidth(double width) {
    if (width >= 900) {
      return 820;
    }
    if (width >= 600) {
      return 700;
    }
    return width;
  }
}
