import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useAppState } from '../AppStateContext';

const ink = '#1E2D40',
  sage = '#648D77',
  muted = '#77838B',
  line = '#E8E8E5';

const week = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function Habits() {
  const { habits, toggleHabit, addHabit } = useAppState();

  const done = habits.filter((h) => h[4]?.[3]).length;
  const progress = habits.length ? done / habits.length : 0;

  return (
    <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <Text style={s.title}>Привычки</Text>
        <Pressable
          style={s.plus}
          onPress={() =>
            addHabit('Новая привычка', 'Каждый день', 'heart', '#F3EEF8')
          }
          accessibilityRole="button"
          accessibilityLabel="Добавить привычку"
        >
          <Feather name="plus" size={22} color={ink} />
        </Pressable>
      </View>

      <View style={s.progressCard}>
        <View style={s.progressRing}>
          <Svg width={120} height={120} viewBox="0 0 130 130">
            <Circle
              cx="65"
              cy="65"
              r="52"
              stroke="#E1ECE4"
              strokeWidth="10"
              fill="none"
            />
            <Circle
              cx="65"
              cy="65"
              r="52"
              stroke={sage}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52} ${2 * Math.PI * 52}`}
              strokeDashoffset={2 * Math.PI * 52 * (1 - progress)}
              rotation="-90"
              origin="65, 65"
            />
          </Svg>
          <View style={s.progressCenter}>
            <Text style={s.progressCount}>
              {done}/{habits.length}
            </Text>
            <Text style={s.progressCaption}>сегодня</Text>
          </View>
        </View>
        <View style={s.progressCopy}>
          <Text style={s.progressTitle}>Отмечено сегодня</Text>
          <Text style={s.progressBody}>
            {done} из {habits.length} привычек выполнено.{'\n'}
            Нажмите на привычку, чтобы изменить статус.
          </Text>
        </View>
      </View>

      <View style={s.list}>
        {habits.map((h, i) => {
          const habitName = h[0];
          const habitGoal = h[1];
          const habitColor = h[3] || '#F3EEF8';
          const habitDays = h[4] || [0, 0, 0, 0, 0, 0, 0];
          const habitIcons = {
            'Вода': 'droplet',
            'Чтение': 'book-open',
            'Спорт': 'activity',
            'Медитация': 'sun',
          };
          const iconName = habitIcons[habitName] || 'heart';
          const isTodayMarked = !!habitDays[3];

          return (
            <Pressable
              key={`${habitName}-${i}`}
              style={[s.habit, i > 0 && s.separator]}
              onPress={() => toggleHabit(i, 3)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isTodayMarked }}
            >
              <View style={[s.icon, { backgroundColor: habitColor }]}>
                <Feather name={iconName} size={22} color={sage} />
              </View>
              <View style={s.detail}>
                <Text style={s.name}>{habitName}</Text>
                <Text style={s.goal}>{habitGoal}</Text>
                <View style={s.week}>
                  {habitDays.map((v, j) => (
                    <Pressable
                      key={j}
                      style={s.day}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleHabit(i, j);
                      }}
                    >
                      <View style={[s.dot, v && s.dotOn]}>
                        {v ? <Feather name="check" size={9} color="white" /> : null}
                      </View>
                      <Text style={s.dayLabel}>{week[j]}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <Feather
                name={isTodayMarked ? 'check-circle' : 'circle'}
                size={20}
                color={isTodayMarked ? sage : '#B4BEB7'}
              />
            </Pressable>
          );
        })}
      </View>

      <Text style={s.hint}>
        {done} из {habits.length} привычек отмечено сегодня · Нажми на день, чтобы отметить прошлые дни
      </Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: { fontSize: 30, fontWeight: '700', color: ink, letterSpacing: -0.7 },
  plus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCard: {
    backgroundColor: '#F5FAF6',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  progressRing: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
  progressCenter: { position: 'absolute', alignItems: 'center' },
  progressCount: { fontSize: 26, fontWeight: '700', color: ink },
  progressCaption: { fontSize: 11, color: muted },
  progressCopy: { flex: 1 },
  progressTitle: { fontSize: 16, fontWeight: '700', color: ink, marginBottom: 5 },
  progressBody: { fontSize: 12, color: muted, lineHeight: 18 },
  list: {
    backgroundColor: 'white',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: line,
    paddingHorizontal: 15,
  },
  habit: {
    minHeight: 110,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  separator: { borderTopWidth: 1, borderColor: line },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detail: { flex: 1 },
  name: { fontSize: 15, color: ink, fontWeight: '600' },
  goal: { fontSize: 12, color: muted, marginTop: 2 },
  week: { flexDirection: 'row', gap: 8, marginTop: 11 },
  day: { alignItems: 'center', gap: 4 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E2E5E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotOn: { backgroundColor: sage },
  dayLabel: { fontSize: 10, color: muted },
  hint: { fontSize: 11, color: muted, textAlign: 'center', marginTop: 16 },
});
