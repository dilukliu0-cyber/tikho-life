import { Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export type SleepWidgetProps = {
  duration: string;
  state: string;
};

const SleepView = (props: SleepWidgetProps, environment: WidgetEnvironment) => {
  'widget';
  if (environment.widgetFamily === 'accessoryInline') {
    return <Text>Сон · {props.duration || props.state}</Text>;
  }

  if (environment.widgetFamily === 'accessoryCircular') {
    return (
      <VStack alignment="center" spacing={1}>
        <Text modifiers={[font({ size: 13, weight: 'bold' })]}>
          {props.duration?.split(' ')?.[0] || '8'}ч
        </Text>
        <Text modifiers={[font({ size: 9, weight: 'medium' })]}>СОН</Text>
      </VStack>
    );
  }

  if (environment.widgetFamily === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" spacing={2}>
        <Text modifiers={[font({ size: 10, weight: 'medium' })]}>СОН</Text>
        <Text modifiers={[font({ size: 16, weight: 'semibold' })]}>
          {props.duration || '8 ч 20 мин'}
        </Text>
        <Text modifiers={[font({ size: 11 })]}>{props.state || 'Хороший сон'}</Text>
      </VStack>
    );
  }

  return (
    <VStack alignment="leading" spacing={9}>
      <Text modifiers={[font({ size: 12, weight: 'medium' }), foregroundStyle('#8580A4')]}>
        ТИХО · СОН
      </Text>
      <Text modifiers={[font({ size: 26, weight: 'semibold' }), foregroundStyle('#303736')]}>
        {props.duration || '—'}
      </Text>
      <Text modifiers={[font({ size: 13 }), foregroundStyle('#77817C')]}>
        {props.state || 'Хороший сон'}
      </Text>
    </VStack>
  );
};

export default createWidget('SleepWidget', SleepView);
