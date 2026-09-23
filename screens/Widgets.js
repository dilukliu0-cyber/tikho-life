import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppState } from '../AppStateContext';

const ink = '#1E2D40',
  muted = '#78858E',
  sage = '#628E75';

export default function Widgets() {
  const { tasks, habits, sleepDuration, sleepBed, sleepWake, note } = useAppState();

  const completedTasks = tasks.filter((t) => t[2]).length;
  const nextTask = tasks.find((t) => !t[2])?.[0] || 'Все дела завершены';

  return (
    <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <Text style={s.title}>Виджеты</Text>
      <Text style={s.subtitle}>Превью нативных виджетов для iPhone</Text>

      <Text style={s.section}>Для домашнего экрана (Home Screen)</Text>
      <View style={s.row}>
        {/* Today Widget Small */}
        <View style={[s.tile, { backgroundColor: '#fff' }]}>
          <Text style={s.tileTitle}>
            Сегодня <Text style={s.counter}>{completedTasks} из {tasks.length}</Text>
          </Text>
          {tasks.slice(0, 3).map((x, i) => (
            <View key={x[0]} style={s.task}>
              <Feather
                name={x[2] ? 'check-circle' : 'circle'}
                size={17}
                color={x[2] ? sage : muted}
              />
              <Text
                style={[s.taskText, x[2] && { textDecorationLine: 'line-through', color: muted }]}
                numberOfLines={1}
              >
                {x[0]}
              </Text>
            </View>
          ))}
          <View style={s.add}>
            <Text style={s.addText}>{nextTask}</Text>
          </View>
        </View>

        {/* Focus Widget Small */}
        <View style={[s.tile, { backgroundColor: '#F4FAF6' }]}>
          <Text style={s.tileTitle}>Фокус</Text>
          <View style={s.focusRing}>
            <Text style={s.timer}>25:00</Text>
            <View style={s.play}>
              <Feather name="play" size={17} color="white" />
            </View>
          </View>
          <Text style={s.caption}>Таймер концентрации</Text>
        </View>
      </View>

      {/* Sleep Widget Medium */}
      <View style={[s.wide, { backgroundColor: '#F1F6FF' }]}>
        <View style={s.wideTop}>
          <View>
            <Text style={s.tileTitle}>Сон</Text>
            <Text style={s.sleepTime}>{sleepDuration}</Text>
            <Text style={s.caption}>● Хороший сон</Text>
          </View>
          <Feather name="moon" size={48} color="#829DD2" />
        </View>
        <View style={s.sleepTrack}>
          {[17, 9, 22, 8, 23, 7, 14].map((n, i) => (
            <View
              key={i}
              style={{
                width: `${n}%`,
                backgroundColor: i % 2 ? '#B5C9E8' : '#5679B4',
              }}
            />
          ))}
        </View>
        <View style={s.wideBottom}>
          <Text style={s.caption}>{sleepBed}</Text>
          <Text style={s.caption}>{sleepWake}</Text>
        </View>
      </View>

      <Text style={s.section}>Для экрана блокировки (Lock Screen)</Text>
      <View style={s.row}>
        {/* Rectangular: Следующая задача */}
        <View style={s.lock}>
          <Feather name="check-square" size={20} color="white" />
          <View style={{ flex: 1 }}>
            <Text style={s.lockSmall}>Следующая задача</Text>
            <Text style={s.lockText} numberOfLines={1}>
              {nextTask}
            </Text>
            <Text style={s.lockSmall}>{completedTasks} из {tasks.length} дел</Text>
          </View>
        </View>

        {/* Rectangular: Сон */}
        <View style={s.lock}>
          <Feather name="moon" size={22} color="white" />
          <View style={{ flex: 1 }}>
            <Text style={s.lockSmall}>Сон</Text>
            <Text style={s.lockText}>{sleepDuration}</Text>
            <Text style={s.lockSmall}>{sleepBed} – {sleepWake}</Text>
          </View>
        </View>
      </View>

      <View style={[s.row, { marginTop: 10 }]}>
        {/* Circular Complications */}
        <View style={[s.lockCircular, { backgroundColor: '#3A424A' }]}>
          <Feather name="check" size={16} color="white" />
          <Text style={s.lockCircularText}>{completedTasks}/{tasks.length}</Text>
          <Text style={s.lockCircularLabel}>Дела</Text>
        </View>

        <View style={[s.lockCircular, { backgroundColor: '#3A424A' }]}>
          <Feather name="moon" size={16} color="white" />
          <Text style={s.lockCircularText}>{sleepDuration.split(' ')[0]} ч</Text>
          <Text style={s.lockCircularLabel}>Сон</Text>
        </View>

        <View style={[s.lockCircular, { backgroundColor: '#3A424A' }]}>
          <Feather name="droplet" size={16} color="white" />
          <Text style={s.lockCircularText}>
            {habits.filter((h) => h[4]?.[3]).length}/{habits.length}
          </Text>
          <Text style={s.lockCircularLabel}>Привычки</Text>
        </View>
      </View>

      <Text style={s.hint}>
        Превью виджетов WidgetKit (HomeScreen и LockScreen), синхронизируемых через AppStateContext
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: '#FFFEFC',
  },
  title: { fontSize: 30, fontWeight: '700', color: ink },
  subtitle: { fontSize: 14, color: muted, marginTop: 4, marginBottom: 20 },
  section: {
    fontSize: 16,
    fontWeight: '700',
    color: ink,
    marginBottom: 12,
    marginTop: 10,
  },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  tile: {
    flex: 1,
    minHeight: 170,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8ECE9',
    padding: 14,
  },
  tileTitle: { fontSize: 16, fontWeight: '700', color: ink },
  counter: { fontSize: 11, color: muted, fontWeight: '400' },
  caption: { fontSize: 12, color: muted },
  focusRing: {
    width: 95,
    height: 95,
    borderRadius: 48,
    borderWidth: 6,
    borderColor: sage,
    borderLeftColor: '#DDE8E0',
    alignSelf: 'center',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: { fontSize: 20, fontWeight: '700', color: ink },
  play: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: sage,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  task: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 10 },
  taskText: { fontSize: 11, color: ink, flex: 1 },
  add: {
    borderTopWidth: 1,
    borderColor: '#E8E8E8',
    marginTop: 10,
    paddingTop: 8,
  },
  addText: { fontSize: 11, color: sage, fontWeight: '600' },
  wide: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8ECE9',
    padding: 16,
    marginBottom: 10,
  },
  wideTop: { flexDirection: 'row', justifyContent: 'space-between' },
  sleepTime: { fontSize: 24, fontWeight: '700', color: ink, marginTop: 12 },
  sleepTrack: {
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    marginTop: 14,
  },
  wideBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  lock: {
    flex: 1,
    minHeight: 100,
    borderRadius: 18,
    backgroundColor: '#3E464E',
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  lockSmall: { fontSize: 10, color: '#D5DADF' },
  lockText: { fontSize: 13, fontWeight: '600', color: 'white', marginVertical: 3 },
  lockCircular: {
    flex: 1,
    height: 90,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  lockCircularText: { color: 'white', fontWeight: '700', fontSize: 13, marginTop: 3 },
  lockCircularLabel: { color: '#B0B8C0', fontSize: 10, marginTop: 1 },
  hint: { fontSize: 11, color: muted, marginTop: 12, textAlign: 'center' },
});
