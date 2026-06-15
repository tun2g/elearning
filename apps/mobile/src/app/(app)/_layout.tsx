import { Redirect, SplashScreen, Tabs } from 'expo-router';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { CopilotStep, walkthroughable } from 'react-native-copilot';

import {
  Home as HomeIcon,
  Feed as LessonsIcon,
  Settings as SettingsIcon,
  Language as VocabIcon,
} from '@/components/ui/icons';
import { useRegisterPush } from '@/hooks/use-register-push';
import { useAuthStore as useAuth } from '@/lib/auth/use-auth-store';
import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';

const WalkthroughView = walkthroughable(View);

export default function TabLayout() {
  const status = useAuth.use.status();
  const [isFirstTime] = useIsFirstTime();

  useRegisterPush();

  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (status !== 'idle') {
      const timer = setTimeout(() => {
        hideSplash();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hideSplash, status]);

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }
  if (status === 'signOut') {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
          tabBarButtonTestID: 'home-tab',
        }}
      />
      <Tabs.Screen
        name="lessons"
        options={{
          title: 'Lessons',
          tabBarIcon: ({ color }) => <LessonsIcon color={color} />,
          tabBarButtonTestID: 'lessons-tab',
        }}
      />
      <Tabs.Screen
        name="vocab"
        options={{
          title: 'Vocab',
          tabBarIcon: ({ color }) => <VocabIcon color={color} />,
          tabBarButtonTestID: 'vocab-tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: false,
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
          tabBarButtonTestID: 'settings-tab',
          tabBarButton: props => (
            <CopilotStep
              order={2}
              name="settings"
              text="Set your daily goal, reminders, and notifications here."
            >
              <WalkthroughView style={{ flex: 1 }}>
                <Pressable
                  onPress={props.onPress}
                  onLongPress={props.onLongPress}
                  testID={props.testID}
                  accessibilityState={props.accessibilityState}
                  accessibilityLabel={props.accessibilityLabel}
                  style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}
                >
                  {props.children}
                </Pressable>
              </WalkthroughView>
            </CopilotStep>
          ),
        }}
      />
      {/* Keep style tab hidden — useful for component dev, not shown to users */}
      <Tabs.Screen
        name="style"
        options={{ href: null }}
      />
    </Tabs>
  );
}
