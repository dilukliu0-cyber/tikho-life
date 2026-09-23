import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppState } from '../AppStateContext';

const ink = '#1E2D40',
  muted = '#73818B',
  sage = '#668D76';
const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function Rhythm() {
  const { tasks, habits } = useAppState();

  const tasksDone = tasks.filter((task) => task[2]).length;
  const marks = habits.reduce(
    (sum, habit) => sum + (habit[4] || []).filter(Boolean).length,
    0
  );
  const possible = (habits.length || 1) * 7;
  const percent = possible ? Math.round((marks / possible) * 100) : 0;
  const todayHabits = habits.filter((habit) => habit[4]?.[3]).length;
  const dailyMarks = days.map(
    (_, index) => habits.filter((habit) => habit[4]?.[index]).length
  );

  return (
    <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <Text style={s.title}>Ритм недели</Text>
        <Text style={s.period}>Текущая неделя</Text>
      </View>
      <Text style={s.intro}>Фактическая статистика задач и привычек по дням</Text>

      <View style={s.summary}>
        <View style={s.summaryIcon}>
          <Feather name="check-circle" size={24} color={sage} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.big}>
            {tasksDone} из {tasks.length}
          </Text>
          <Text style={s.label}>задач выполнено сегодня</Text>
        </View>
      </View>

      <View style={s.summary}>
        <View style={[s.summaryIcon, { backgroundColor: '#E9EAF6' }]}>
          <Feather name="repeat" size={24} color="#827CB0" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.big}>
            {todayHabits} из {habits.length}
          </Text>
          <Text style={s.label}>привычек отмечено сегодня</Text>
        </View>
      </View>

      <Text style={s.section}>Привычки по дням недели</Text>
      <View style={s.chartCard}>
        <View style={s.chart}>
          {dailyMarks.map((count, index) => {
            const heightPercent = habits.length ? (count / habits.length) * 100 : 0;
            return (
              <View key={days[index]} style={s.column}>
                <Text style={s.count}>{count}</Text>
                <View style={s.track}>
                  <View style={[s.bar, { height: `${heightPercent}%` }]} />
                </View>
                <Text style={s.day}>{days[index]}</Text>
              </View>
            );
          })}
        </View>
        <Text style={s.chartNote}>
          Отмечено привычек из {habits.length} возможных в каждый день
        </Text>
      </View>

      <View style={s.weekCard}>
        <View style={s.weekTop}>
          <View>
            <Text style={s.weekValue}>{marks} из {possible}</Text>
            <Text style={s.weekLabel}>всего выполнений привычек за 7 дней</Text>
          </View>
          <Text style={s.weekPercent}>{percent}%</Text>
        </View>
        <View style={s.progress}>
          <View style={[s.progressFill, { width: `${percent}%` }]} />
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: '#FFFEFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 30, fontWeight: '700', color: ink },
  period: {
    fontSize: 12,
    color: muted,
    backgroundColor: '#F2F3F1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  intro: { fontSize: 13, color: muted, marginBottom: 18 },
  summary: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EBECEA',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 10,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E9F2EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  big: { fontSize: 22, fontWeight: '700', color: ink },
  label: { fontSize: 12, color: muted, marginTop: 2 },
  section: {
    fontSize: 16,
    fontWeight: '700',
    color: ink,
    marginTop: 16,
    marginBottom: 10,
  },
  chartCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EBECEA',
    borderRadius: 18,
    padding: 16,
  },
  chart: {
    height: 130,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  column: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    width: 32,
  },
  count: { fontSize: 12, fontWeight: '600', color: ink, marginBottom: 5 },
  track: {
    height: 85,
    width: 22,
    backgroundColor: '#EDF1ED',
    borderRadius: 7,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bar: { width: '100%', backgroundColor: sage, borderRadius: 7 },
  day: { fontSize: 11, color: muted, marginTop: 7 },
  chartNote: { fontSize: 12, color: muted, marginTop: 14 },
  weekCard: {
    backgroundColor: '#F2F7F3',
    borderRadius: 18,
    padding: 18,
    marginTop: 14,
  },
  weekTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekValue: { fontSize: 24, fontWeight: '700', color: ink },
  weekLabel: { fontSize: 12, color: muted, marginTop: 2 },
  weekPercent: { fontSize: 28, fontWeight: '700', color: sage },
  progress: {
    height: 8,
    backgroundColor: '#DDE9DF',
    borderRadius: 4,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: sage, borderRadius: 4 },
});
