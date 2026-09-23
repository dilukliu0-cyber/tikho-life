import { Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export type TodayWidgetProps = {
  task: string;
  completed: number;
  total: number;
};

const TodayView = (props: TodayWidgetProps, environment: WidgetEnvironment) => {
  'widget';
  if (environment.widgetFamily === 'accessoryInline') {
    return (
      <Text>
        Дела: {props.completed}/{props.total} · {props.task || 'Планов нет'}
      </Text>
    );
  }

  if (environment.widgetFamily === 'accessoryCircular') {
    return (
      <VStack alignment="center" spacing={1}>
        <Text modifiers={[font({ size: 14, weight: 'bold' })]}>
          {props.completed}/{props.total}
        </Text>
        <Text modifiers={[font({ size: 9, weight: 'medium' })]}>
          ДЕЛА
        </Text>
      </VStack>
    );
  }

  if (environment.widgetFamily === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" spacing={2}>
        <Text modifiers={[font({ size: 10, weight: 'medium' })]}>
          СЛЕДУЮЩАЯ ЗАДАЧА
        </Text>
        <Text modifiers={[font({ size: 14, weight: 'semibold' })]}>
          {props.task || 'Все дела завершены'}
        </Text>
        <Text modifiers={[font({ size: 11 })]}>
          {props.completed} из {props.total} дел
        </Text>
      </VStack>
    );
  }

  const compact = environment.widgetFamily === 'systemSmall';
  return (
    <VStack alignment="leading" spacing={compact ? 8 : 12}>
      <Text modifiers={[font({ size: 12, weight: 'medium' }), foregroundStyle('#648572')]}>
        ТИХО · СЕГОДНЯ
      </Text>
      <Text modifiers={[font({ size: compact ? 18 : 22, weight: 'semibold' }), foregroundStyle('#303736')]}>
        {props.task || 'Планов пока нет'}
      </Text>
      <Text modifiers={[font({ size: 13 }), foregroundStyle('#77817C')]}>
        {props.completed} из {props.total} дел
      </Text>
    </VStack>
  );
};

export default createWidget('TodayWidget', TodayView);
