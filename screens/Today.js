import React, { useState } from 'react';
import { View, Text, Image, Pressable, TextInput, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppState } from '../AppStateContext';

const C = {
  ink: '#1D2B3B',
  muted: '#71808B',
  green: '#5E8E79',
  line: '#E8E9E6',
  pale: '#EDF4EF',
  coral: '#E8897F',
};

const dateLabel = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
}).format(new Date());

export default function Today() {
  const {
    tasks,
    toggleTask,
    addTask,
    habits,
    toggleHabit,
    focusSeconds,
    setFocusSeconds,
    focusRunning,
    setFocusRunning,
  } = useAppState();

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const done = tasks.filter((t) => t[2]).length;
  const clock = `${String(Math.floor(focusSeconds / 60)).padStart(2, '0')}:${String(
    focusSeconds % 60
  ).padStart(2, '0')}`;

  function handleAddTask() {
    const value = draft.trim();
    if (!value) return;
    addTask(value);
    setDraft('');
    setAdding(false);
  }

  function resetTimer() {
    setFocusRunning(false);
    setFocusSeconds(1500);
  }

  return (
    <View style={s.page}>
      <View style={s.hero}>
        <View style={s.heroCopy}>
          <Text style={s.date}>{dateLabel}</Text>
          <Text style={s.title}>Сегодня</Text>
          <Text style={s.tagline}>
            {done} из {tasks.length} дел выполнено · {habits.length} привычек в фокусе
          </Text>
        </View>
        <Image
          source={require('../assets/landscape.png')}
          style={s.landscape}
          resizeMode="cover"
        />
      </View>

      <View style={s.taskCard}>
        <View style={s.cardHeading}>
          <Text style={s.heading}>Дела на сегодня</Text>
          <Text style={s.count}>
            {done} из {tasks.length}
          </Text>
        </View>
        {tasks.map((task, index) => (
          <Pressable
            key={`${task[0]}-${index}`}
            onPress={() => toggleTask(index)}
            style={s.taskRow}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: !!task[2] }}
          >
            <View style={[s.checkbox, task[2] && s.checkboxOn]}>
              {task[2] && <Feather name="check" size={13} color="#fff" />}
            </View>
            <Text style={[s.taskText, task[2] && s.taskDone]} numberOfLines={2}>
              {task[0]}
            </Text>
            {!!task[1] && <Text style={s.taskTime}>{task[1]}</Text>}
          </Pressable>
        ))}
        {adding ? (
          <View style={s.addRow}>
            <Feather name="plus" size={20} color={C.green} />
            <TextInput
              autoFocus
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={handleAddTask}
              placeholder="Новое дело"
              placeholderTextColor={C.muted}
              style={s.input}
            />
            <Pressable onPress={handleAddTask}>
              <Text style={s.save}>Готово</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setAdding(true)} style={s.addRow}>
            <Feather name="plus" size={21} color="#205C63" />
            <Text style={s.addText}>Добавить задачу</Text>
          </Pressable>
        )}
      </View>

      <View style={s.focus}>
        <View style={s.focusLeaf}>
          <Feather name="feather" size={32} color="#799985" />
        </View>
        <View style={s.focusWords}>
          <Text style={s.focusTitle}>Фокус</Text>
          <Text style={s.focusSub}>{focusRunning ? 'Идёт сейчас' : 'Готов к работе'}</Text>
        </View>
        <Text style={s.timer}>{clock}</Text>
        <Pressable
          onPress={() => setFocusRunning(!focusRunning)}
          style={s.play}
          accessibilityLabel={focusRunning ? 'Пауза' : 'Начать фокус'}
        >
          <Feather
            name={focusRunning ? 'pause' : 'play'}
            size={18}
            color="#fff"
            style={!focusRunning && { marginLeft: 2 }}
          />
        </Pressable>
      </View>
      {(focusRunning || focusSeconds !== 1500) && (
        <Pressable onPress={resetTimer} style={s.reset}>
          <Feather name="rotate-ccw" size={13} color={C.green} />
          <Text style={s.resetText}>Сбросить таймер</Text>
        </Pressable>
      )}

      <Text style={s.habitTitle}>Привычки сегодня</Text>
      <View style={s.habitRow}>
        {habits.slice(0, 4).map((habit, index) => {
          const marked = !!habit[4]?.[3];
          const weekly =
            habit[4]?.reduce((sum, value) => sum + (value ? 1 : 0), 0) || 0;
          return (
            <Pressable
              key={`${habit[0]}-${index}`}
              onPress={() => toggleHabit(index, 3)}
              style={s.habit}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: marked }}
            >
              <View
                style={[
                  s.ring,
                  { borderColor: marked ? C.green : '#DCE4DE' },
                  marked && { backgroundColor: '#F1F7F3' },
                ]}
              >
                <Text style={s.ringText}>{weekly}/7</Text>
              </View>
              <Text style={s.habitLabel} numberOfLines={1}>
                {habit[0]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  page: { paddingBottom: 24 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    minHeight: 140,
    marginBottom: 14,
  },
  heroCopy: { flex: 1 },
  date: { color: C.muted, fontSize: 13, textTransform: 'capitalize' },
  title: {
    color: C.ink,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1.3,
    marginTop: 2,
    marginBottom: 6,
  },
  tagline: { color: C.ink, fontSize: 13, lineHeight: 19 },
  landscape: { width: 110, height: 110, borderRadius: 55, marginLeft: 12 },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 14,
    paddingTop: 14,
    marginBottom: 12,
  },
  cardHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 5,
  },
  heading: { fontSize: 16, fontWeight: '700', color: C.ink },
  count: { color: C.muted, fontSize: 12 },
  taskRow: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#EFF0ED',
    borderBottomWidth: 1,
    gap: 10,
  },
  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 1.3,
    borderColor: '#8C9EA5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { borderColor: C.green, backgroundColor: C.green },
  taskText: { flex: 1, color: C.ink, fontSize: 13 },
  taskDone: { color: '#76837D', textDecorationLine: 'line-through' },
  taskTime: { fontSize: 11, color: C.muted },
  addRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 9 },
  addText: { color: '#315F67', fontSize: 13 },
  input: { flex: 1, fontSize: 13, minHeight: 42, color: C.ink },
  save: { color: C.green, fontWeight: '700', fontSize: 12 },
  focus: {
    backgroundColor: C.pale,
    borderRadius: 18,
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  focusLeaf: { width: 34, alignItems: 'center' },
  focusWords: { flex: 1, marginLeft: 8 },
  focusTitle: { color: C.ink, fontSize: 15, fontWeight: '700' },
  focusSub: { color: C.muted, fontSize: 11, marginTop: 2 },
  timer: {
    color: C.ink,
    fontSize: 23,
    fontWeight: '400',
    letterSpacing: -0.5,
    marginRight: 13,
  },
  play: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reset: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  resetText: { fontSize: 11, color: C.green },
  habitTitle: {
    color: C.ink,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 12,
    marginLeft: 4,
  },
  habitRow: { flexDirection: 'row', justifyContent: 'space-around' },
  habit: { flex: 1, alignItems: 'center', gap: 5 },
  ring: {
    width: 51,
    height: 51,
    borderRadius: 26,
    borderWidth: 3.5,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: { color: C.ink, fontSize: 12, fontWeight: '500' },
  habitLabel: { color: C.ink, fontSize: 11, maxWidth: 70 },
});
