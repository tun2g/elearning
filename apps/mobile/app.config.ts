import type { ConfigContext, ExpoConfig } from '@expo/config';

import type { AppIconBadgeConfig } from 'app-icon-badge/types';

import 'tsx/cjs';

// adding lint exception as we need to import tsx/cjs before env.ts is imported
// eslint-disable-next-line perfectionist/sort-imports
import Env from './env';

const EXPO_ACCOUNT_OWNER = '';
const EAS_PROJECT_ID = '';

// Resolve Inter font files via the package so it works regardless of where
// pnpm hoists @expo-google-fonts/inter in the monorepo's node_modules.
function interFont(variant: string) {
  return require.resolve(`@expo-google-fonts/inter/${variant}/Inter_${variant}.ttf`);
}

const appIconBadgeConfig: AppIconBadgeConfig = {
  enabled: Env.EXPO_PUBLIC_APP_ENV !== 'production',
  badges: [
    {
      text: Env.EXPO_PUBLIC_APP_ENV,
      type: 'banner',
      color: 'white',
    },
    {
      text: Env.EXPO_PUBLIC_VERSION.toString(),
      type: 'ribbon',
      color: 'white',
    },
  ],
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: Env.EXPO_PUBLIC_NAME,
  description: `${Env.EXPO_PUBLIC_NAME} Mobile App`,
  owner: EXPO_ACCOUNT_OWNER,
  scheme: Env.EXPO_PUBLIC_SCHEME,
  slug: 'elearning',
  version: Env.EXPO_PUBLIC_VERSION.toString(),
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: Env.EXPO_PUBLIC_BUNDLE_ID,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  experiments: {
    typedRoutes: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#6c4add',
    },
    package: Env.EXPO_PUBLIC_PACKAGE,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    [
      'expo-splash-screen',
      {
        backgroundColor: '#6c4add',
        image: './assets/splash-icon.png',
        imageWidth: 150,
      },
    ],
    [
      'expo-font',
      {
        ios: {
          fonts: [
            interFont('400Regular'),
            interFont('500Medium'),
            interFont('600SemiBold'),
            interFont('700Bold'),
          ],
        },
        android: {
          fonts: [
            {
              fontFamily: 'Inter',
              fontDefinitions: [
                {
                  path: interFont('400Regular'),
                  weight: 400,
                },
                {
                  path: interFont('500Medium'),
                  weight: 500,
                },
                {
                  path: interFont('600SemiBold'),
                  weight: 600,
                },
                {
                  path: interFont('700Bold'),
                  weight: 700,
                },
              ],
            },
          ],
        },
      },
    ],
    'expo-localization',
    'expo-router',
    'expo-notifications',
    ['app-icon-badge', appIconBadgeConfig],
    ['react-native-edge-to-edge'],
  ],
  extra: {
    eas: {
      projectId: EAS_PROJECT_ID,
    },
  },
});
