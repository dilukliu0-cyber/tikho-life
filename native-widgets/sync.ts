import { Platform } from 'react-native';

export type TodayWidgetProps = {
  task: string;
  completed: number;
  total: number;
};

export type SleepWidgetProps = {
  duration: string;
  state: string;
};

export function syncNativeWidgets(today: TodayWidgetProps, sleep: SleepWidgetProps) {
  if (Platform.OS !== 'ios') return;
  try {
    const { requireOptionalNativeModule } = require('expo');
    if (!requireOptionalNativeModule || !requireOptionalNativeModule('ExpoWidgets')) return;

    // Native module exists only in a custom iOS build with WidgetKit extension, never in Expo Go.
    const TodayWidget = require('./TodayWidget').default;
    const SleepWidget = require('./SleepWidget').default;
    if (TodayWidget?.updateSnapshot) {
      TodayWidget.updateSnapshot(today);
    }
    if (SleepWidget?.updateSnapshot) {
      SleepWidget.updateSnapshot(sleep);
    }
  } catch (e) {
    // Gracefully ignore in development / preview environments where native extension is not linked
  }
}
