import * as React from 'react';

import { FocusAwareStatusBar, SafeAreaView, ScrollView } from '@/components/ui';
import { Buttons } from './buttons-demo';
import { Colors } from './colors-demo';
import { Inputs } from './inputs-demo';
import { Typography } from './typography-demo';

export function StyleScreen() {
  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView className="px-4">
        <SafeAreaView className="flex-1">
          <Typography />
          <Colors />
          <Buttons />
          <Inputs />
        </SafeAreaView>
      </ScrollView>
    </>
  );
}
