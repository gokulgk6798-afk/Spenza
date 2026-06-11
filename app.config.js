const path = require('path');

const APP_NAME = 'Spenza';
const SLUG = 'spenza-g-rgnjhjm0ni790hadth6';
const BUNDLE_ID = 'com.spenza.app';
const PROJECT_ID = 'f57a55b5-f9fd-4188-be4f-4cf1e7e34ec4';
const OWNER = 'gokulgk67';
const BRAND_BACKGROUND = '#0D0D14';

const optionalExtra = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
};

module.exports = ({ config = {}, projectRoot = __dirname } = {}) => {
  const frontendRoot = path.join(__dirname, 'frontend');
  const isRepoRoot = path.resolve(projectRoot) === path.resolve(__dirname);

  return {
    ...config,
    name: APP_NAME,
    slug: SLUG,
    version: process.env.APP_VERSION || '1.0.0',
    orientation: 'portrait',
    scheme: 'spenza',
    userInterfaceStyle: 'light',
    splash: {
      backgroundColor: BRAND_BACKGROUND,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      ...config.ios,
      supportsTablet: true,
      bundleIdentifier: process.env.IOS_BUNDLE_IDENTIFIER || BUNDLE_ID,
      buildNumber: process.env.IOS_BUILD_NUMBER || '1',
    },
    android: {
      ...config.android,
      package: process.env.ANDROID_PACKAGE || BUNDLE_ID,
      permissions: [
        ...new Set([
          ...(config.android?.permissions || []),
          'READ_SMS',
          'RECEIVE_SMS',
        ]),
      ],
      versionCode: Number(process.env.ANDROID_VERSION_CODE || 1),
      adaptiveIcon: {
        ...config.android?.adaptiveIcon,
        backgroundColor: BRAND_BACKGROUND,
      },
    },
    web: {
      ...config.web,
      bundler: 'metro',
    },
    plugins: [
      ...(config.plugins || []),
      './frontend/plugins/withSpenzaSmsReader',
    ],
    extra: {
      ...config.extra,
      ...Object.fromEntries(
        Object.entries(optionalExtra).filter(([, value]) => value)
      ),
      eas: {
        ...config.extra?.eas,
        projectId: PROJECT_ID,
      },
    },
    owner: OWNER,
    entryPoint: isRepoRoot ? path.join(frontendRoot, 'App.tsx') : config.entryPoint,
  };
};


