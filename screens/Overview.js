import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppState } from '../AppStateContext';

const palette = {
  ink: '#1A2838',
  muted: '#71808B',
  sage: '#5E8E79',
  sageLight: '#EBF4F0',
  line: '#ECEAE6',
  cardBg: '#FFFFFF',
  noteBg: '#FFF9ED',
  noteLine: '#F2E9D4',
  coral: '#E87D75',
  blue: '#4D82C4',
  purple: '#8479BA',
};

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function Overview({ onNavigateTab }) {
  const {
    tasks,
    toggleTask,
    addTask,
    habits,
    toggleHabit,
    nextEvent,
    sleepDuration,
    sleepBed,
    sleepWake,
    sleeping,
    sleepRecorded,
    note,
    noteDate,
    updateNote,
  } = useAppState();

  const [addingTask, setAddingTask] = useState(false);
  const [taskDraft, setTaskDraft] = useState('');
  const [quickModal, setQuickModal] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(note);

  // Compute tasks stats
  const completedTasks = tasks.filter((t) => t[2]).length;
  const totalTasks = tasks.length;

  // Compute habits stats
  const completedHabitsToday = habits.filter((h) => h[4]?.[3]).length;
  const totalHabits = habits.length;

  // Weekly stats for Rhythm
  const weeklyMarks = habits.reduce(
    (sum, habit) => sum + (habit[4] || []).filter(Boolean).length,
    0
  );
  const possibleWeeklyMarks = totalHabits * 7;
  const habitRate = possibleWeeklyMarks ? weeklyMarks / possibleWeeklyMarks : 0;
  const taskRate = totalTasks ? completedTasks / totalTasks : 0;
  const overallPercent =
    totalTasks === 0 && totalHabits === 0
      ? 0
      : Math.min(100, Math.round((habitRate * 0.6 + taskRate * 0.4) * 100));

  // Daily activity heights for the 7 bars
  const dayBars = weekDays.map((_, dayIdx) => {
    if (totalHabits === 0 && totalTasks === 0) return 15;
    const habitCount = habits.filter((h) => h[4]?.[dayIdx]).length;
    const habitPercent = totalHabits ? (habitCount / totalHabits) * 100 : 0;
    return Math.max(15, Math.min(95, Math.round(habitPercent * 0.8 + (dayIdx === 3 && completedTasks ? 20 : 0))));
  });

  const handleAddTask = () => {
    if (taskDraft.trim()) {
      addTask(taskDraft.trim());
      setTaskDraft('');
      setAddingTask(false);
    }
  };

  const handleSaveNote = () => {
    updateNote(noteDraft.trim());
    setEditingNote(false);
  };

  return (
    <View style={s.page}>
      {/* Top Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Обзор</Text>
        <Pressable
          onPress={() => setQuickModal(true)}
          style={s.plusBtn}
          accessibilityLabel="Быстрое добавление"
          accessibilityRole="button"
        >
          <Feather name="plus" size={20} color={palette.ink} />
        </Pressable>
      </View>

      {/* Hero Banner: Сегодня */}
      <View style={s.heroCard}>
        <View style={s.heroLeft}>
          <Text style={s.heroTitle}>Сегодня</Text>
          <Text style={s.heroSubtitle}>
            {totalTasks === 0 && totalHabits === 0
              ? 'Новый день. Добавьте свои первые задачи и привычки.'
              : `${completedTasks} из ${totalTasks} дел завершено.\n${completedHabitsToday} из ${totalHabits} привычек выполнено.`}
          </Text>
          <View style={s.heroDash} />
        </View>
        <Image
          source={require('../assets/landscape.png')}
          style={s.heroImage}
          resizeMode="cover"
        />
      </View>

      {/* Grid Row 1: Задачи сегодня + (Следующее событие & Сон) */}
      <View style={s.gridRow}>
        {/* Left Column: Задачи сегодня */}
        <View style={[s.card, s.colLeft]}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>Задачи сегодня</Text>
            <Text style={s.badge}>
              {completedTasks} из {totalTasks}
            </Text>
          </View>

          <View style={s.taskList}>
            {tasks.length === 0 ? (
              <View style={s.emptyBox}>
                <Text style={s.emptyText}>Задач пока нет</Text>
              </View>
            ) : (
              tasks.slice(0, 5).map((task, index) => (
                <Pressable
                  key={`${task[0]}-${index}`}
                  onPress={() => toggleTask(index)}
                  style={s.taskItem}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: !!task[2] }}
                >
                  <View style={[s.checkbox, task[2] && s.checkboxChecked]}>
                    {task[2] && <Feather name="check" size={11} color="#FFFFFF" />}
                  </View>
                  <Text
                    style={[s.taskText, task[2] && s.taskDone]}
                    numberOfLines={2}
                  >
                    {task[0]}
                  </Text>
                </Pressable>
              ))
            )}
          </View>

          {addingTask ? (
            <View style={s.addInputRow}>
              <TextInput
                autoFocus
                value={taskDraft}
                onChangeText={setTaskDraft}
                onSubmitEditing={handleAddTask}
                placeholder="Новая задача"
                placeholderTextColor={palette.muted}
                style={s.inlineInput}
              />
              <Pressable onPress={handleAddTask} style={s.inlineDone}>
                <Feather name="check" size={16} color={palette.sage} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => setAddingTask(true)}
              style={s.addTaskBtn}
              accessibilityRole="button"
            >
              <Feather name="plus" size={17} color={palette.sage} />
              <Text style={s.addTaskText}>Добавить задачу</Text>
            </Pressable>
          )}
        </View>

        {/* Right Column: Следующее событие + Сон */}
        <View style={s.colRight}>
          {/* Card: Следующее событие */}
          <Pressable
            style={[s.card, s.subCard]}
            onPress={() => onNavigateTab?.('Календарь')}
            accessibilityRole="button"
          >
            <View style={s.cardHeader}>
              <Text style={s.cardSubTitle}>Следующее событие</Text>
              <Feather name="calendar" size={15} color={palette.muted} />
            </View>
            {nextEvent ? (
              <View style={s.eventRow}>
                <View style={s.datePill}>
                  <Text style={s.dateWeekday}>
                    {nextEvent.dateLabel?.slice(0, 2) || 'Пн'}
                  </Text>
                  <Text style={s.dateNumber}>
                    {nextEvent.dateLabel?.match(/\d+/)?.[0] || '14'}
                  </Text>
                  <Text style={s.dateMonth}>
                    {nextEvent.dateLabel?.includes('апр') ? 'апр.' : 'число'}
                  </Text>
                </View>
                <View style={s.eventDetails}>
                  <Text style={s.eventTitle} numberOfLines={1}>
                    {nextEvent.title}
                  </Text>
                  <Text style={s.eventTime}>{nextEvent.time}</Text>
                  <View style={s.eventCategoryRow}>
                    <Feather name="map-pin" size={10} color={palette.muted} />
                    <Text style={s.eventCategory}>{nextEvent.subtitle || 'Событие'}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={s.emptySubBox}>
                <Text style={s.emptyEventTitle}>Нет событий</Text>
                <Text style={s.emptyEventSub}>Календарь свободен</Text>
              </View>
            )}
          </Pressable>

          {/* Card: Сон */}
          <Pressable
            style={[s.card, s.subCard, { marginTop: 10 }]}
            onPress={() => onNavigateTab?.('Сон')}
            accessibilityRole="button"
          >
            <View style={s.cardHeader}>
              <Text style={s.cardSubTitle}>Сон</Text>
              <Feather name="moon" size={16} color={palette.blue} />
            </View>
            <Text style={s.sleepHours}>
              {sleeping ? 'Сон идёт' : sleepRecorded ? sleepDuration : '—'}
            </Text>
            <View style={s.sleepStatusRow}>
              <View
                style={[
                  s.greenDot,
                  !sleepRecorded && !sleeping && { backgroundColor: palette.muted },
                ]}
              />
              <Text style={s.sleepStatusText}>
                {sleeping
                  ? `С ${sleepBed}`
                  : sleepRecorded
                  ? 'Хороший сон'
                  : 'Ожидаем запись'}
              </Text>
            </View>
            {/* Sleep Stages Bar */}
            <View style={s.sleepBar}>
              <View style={[s.sleepSeg, { flex: 2, backgroundColor: '#3A639B' }]} />
              <View style={[s.sleepSeg, { flex: 1.2, backgroundColor: '#7799CC' }]} />
              <View style={[s.sleepSeg, { flex: 2.2, backgroundColor: '#537CB8' }]} />
              <View style={[s.sleepSeg, { flex: 1, backgroundColor: '#98B3DD' }]} />
              <View style={[s.sleepSeg, { flex: 2.5, backgroundColor: '#4770AB' }]} />
            </View>
            <View style={s.sleepTimes}>
              <Text style={s.sleepTime}>{sleepRecorded ? sleepBed : '23:00'}</Text>
              <Text style={s.sleepTime}>{sleeping ? 'сейчас' : sleepRecorded ? sleepWake : '07:00'}</Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Grid Row 2: Привычки + Заметка */}
      <View style={s.gridRow}>
        {/* Left Column: Привычки */}
        <Pressable
          style={[s.card, s.colLeft]}
          onPress={() => onNavigateTab?.('Привычки')}
          accessibilityRole="button"
        >
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>Привычки</Text>
            <Text style={s.badge}>
              {completedHabitsToday} из {totalHabits}
            </Text>
          </View>
          {habits.length === 0 ? (
            <View style={s.emptyHabitsBox}>
              <Text style={s.emptyHabitsText}>Привычки не добавлены</Text>
              <Text style={s.emptyHabitsSub}>Нажмите, чтобы создать</Text>
            </View>
          ) : (
            <View style={s.habitsGrid}>
              {habits.slice(0, 4).map((habit, index) => {
                const marked = !!habit[4]?.[3];
                const completedCount = habit[4]?.filter(Boolean).length || 0;
                const habitIcons = ['droplet', 'book-open', 'activity', 'sun'];
                const habitColors = ['#5E94C2', '#E87D75', '#5E8E79', '#8274B5'];
                const habitBgs = ['#EDF5FA', '#FDF0EE', '#EFF7F3', '#F3EFF9'];
                const currentIcon = habitIcons[index % habitIcons.length];
                const currentColor = habitColors[index % habitColors.length];
                const currentBg = habitBgs[index % habitBgs.length];

                return (
                  <Pressable
                    key={`${habit[0]}-${index}`}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleHabit(index, 3);
                    }}
                    style={s.habitItem}
                    accessibilityRole="button"
                    accessibilityLabel={`Привычка ${habit[0]}`}
                  >
                    <View
                      style={[
                        s.habitCircle,
                        {
                          backgroundColor: currentBg,
                          borderColor: marked ? currentColor : '#E2E6E4',
                        },
                      ]}
                    >
                      <Feather name={currentIcon} size={18} color={currentColor} />
                    </View>
                    <Text style={s.habitName} numberOfLines={1}>
                      {habit[0]}
                    </Text>
                    <Text style={s.habitCount}>{completedCount}/7</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </Pressable>

        {/* Right Column: Заметка */}
        <Pressable
          style={[s.card, s.colRight, s.noteCard]}
          onPress={() => {
            setNoteDraft(note);
            setEditingNote(true);
          }}
          accessibilityRole="button"
        >
          <View style={s.cardHeader}>
            <Text style={s.cardSubTitle}>Заметка</Text>
            <Feather name="file-text" size={15} color={palette.muted} />
          </View>
          <View style={s.noteContent}>
            <Text
              style={[s.noteText, !note && { color: palette.muted, fontStyle: 'italic' }]}
              numberOfLines={4}
            >
              {note || 'Нажмите, чтобы записать мысль или заметку...'}
            </Text>
          </View>
          <View style={s.noteFooter}>
            <Text style={s.noteDate}>{noteDate || 'Новая заметка'}</Text>
            <Feather name="feather" size={16} color="#8DA999" />
          </View>
        </Pressable>
      </View>

      {/* Bottom Card: Ритм недели */}
      <View style={s.rhythmCard}>
        <View style={s.rhythmHeader}>
          <Text style={s.cardTitle}>Ритм недели</Text>
        </View>

        <View style={s.rhythmBody}>
          {/* 7 Days Bars */}
          <View style={s.barsContainer}>
            {weekDays.map((day, idx) => (
              <View key={day} style={s.barColumn}>
                <View style={s.barTrack}>
                  <View
                    style={[
                      s.barFill,
                      {
                        height: `${dayBars[idx]}%`,
                        backgroundColor: idx === 3 && overallPercent > 0 ? palette.sage : '#A2BDB1',
                      },
                    ]}
                  />
                </View>
                <Text style={s.barLabel}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Right Stat */}
          <View style={s.rhythmStat}>
            <View style={s.statTop}>
              <Text style={s.statPercent}>{overallPercent}%</Text>
              <Feather name="bar-chart-2" size={18} color={palette.sage} />
            </View>
            <Text style={s.statDesc}>
              целей выполнено{'\n'}на этой неделе
            </Text>
            <View style={s.statLeaf}>
              <Feather name="feather" size={24} color="#85A795" />
            </View>
          </View>
        </View>
      </View>

      {/* Quick Add Modal */}
      <Modal
        visible={quickModal}
        transparent
        animationType="fade"
        onRequestClose={() => setQuickModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Новая задача</Text>
              <Pressable onPress={() => setQuickModal(false)}>
                <Feather name="x" size={20} color={palette.ink} />
              </Pressable>
            </View>
            <TextInput
              autoFocus
              value={taskDraft}
              onChangeText={setTaskDraft}
              placeholder="Что нужно сделать?"
              placeholderTextColor={palette.muted}
              style={s.modalInput}
            />
            <Pressable
              onPress={() => {
                handleAddTask();
                setQuickModal(false);
              }}
              style={s.modalSaveBtn}
            >
              <Text style={s.modalSaveText}>Добавить в список</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Edit Note Modal */}
      <Modal
        visible={editingNote}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingNote(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Заметка</Text>
              <Pressable onPress={() => setEditingNote(false)}>
                <Feather name="x" size={20} color={palette.ink} />
              </Pressable>
            </View>
            <TextInput
              autoFocus
              multiline
              value={noteDraft}
              onChangeText={setNoteDraft}
              placeholder="Запишите мысль или список..."
              placeholderTextColor={palette.muted}
              style={[s.modalInput, { minHeight: 90, textAlignVertical: 'top' }]}
            />
            <Pressable onPress={handleSaveNote} style={s.modalSaveBtn}>
              <Text style={s.modalSaveText}>Сохранить</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    width: '100%',
    paddingBottom: 24,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: palette.ink,
    letterSpacing: -1.2,
  },
  plusBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF0EF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    minHeight: 114,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 10,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.ink,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: palette.muted,
    lineHeight: 18,
  },
  heroDash: {
    width: 22,
    height: 2,
    backgroundColor: palette.muted,
    marginTop: 8,
    borderRadius: 1,
    opacity: 0.5,
  },
  heroImage: {
    width: 106,
    height: 82,
    borderRadius: 16,
  },
  gridRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  colLeft: {
    flex: 1,
  },
  colRight: {
    flex: 1,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: palette.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 14,
  },
  subCard: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.ink,
  },
  cardSubTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.ink,
  },
  badge: {
    fontSize: 11,
    color: palette.muted,
    fontWeight: '500',
  },
  taskList: {
    gap: 8,
    marginBottom: 10,
  },
  emptyBox: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: palette.muted,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#98ABA1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: palette.sage,
    borderColor: palette.sage,
  },
  taskText: {
    fontSize: 12,
    color: palette.ink,
    flex: 1,
    lineHeight: 16,
  },
  taskDone: {
    color: palette.muted,
    textDecorationLine: 'line-through',
  },
  addTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F1ED',
    marginTop: 4,
  },
  addTaskText: {
    fontSize: 12,
    color: palette.sage,
    fontWeight: '600',
  },
  addInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#F2F1ED',
    paddingTop: 6,
  },
  inlineInput: {
    flex: 1,
    fontSize: 12,
    color: palette.ink,
    paddingVertical: 4,
  },
  inlineDone: {
    padding: 4,
  },
  emptySubBox: {
    paddingVertical: 10,
  },
  emptyEventTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.ink,
  },
  emptyEventSub: {
    fontSize: 11,
    color: palette.muted,
    marginTop: 2,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  datePill: {
    width: 42,
    backgroundColor: '#FFF2F0',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 3,
  },
  dateWeekday: {
    fontSize: 9,
    color: palette.coral,
    fontWeight: '700',
  },
  dateNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.ink,
    lineHeight: 18,
  },
  dateMonth: {
    fontSize: 8,
    color: palette.muted,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.ink,
  },
  eventTime: {
    fontSize: 10,
    color: palette.muted,
    marginVertical: 1,
  },
  eventCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  eventCategory: {
    fontSize: 9,
    color: palette.muted,
  },
  sleepHours: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.ink,
    marginTop: 2,
  },
  sleepStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
    marginBottom: 8,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.sage,
  },
  sleepStatusText: {
    fontSize: 11,
    color: palette.muted,
  },
  sleepBar: {
    height: 9,
    borderRadius: 5,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 4,
  },
  sleepSeg: {
    height: '100%',
  },
  sleepTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sleepTime: {
    fontSize: 10,
    color: palette.muted,
  },
  emptyHabitsBox: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptyHabitsText: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.ink,
  },
  emptyHabitsSub: {
    fontSize: 10,
    color: palette.muted,
    marginTop: 3,
  },
  habitsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  habitItem: {
    alignItems: 'center',
    flex: 1,
  },
  habitCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  habitName: {
    fontSize: 10,
    color: palette.ink,
    textAlign: 'center',
  },
  habitCount: {
    fontSize: 9,
    color: palette.muted,
    marginTop: 1,
  },
  noteCard: {
    backgroundColor: palette.noteBg,
    borderColor: palette.noteLine,
  },
  noteContent: {
    flex: 1,
    minHeight: 52,
    justifyContent: 'center',
  },
  noteText: {
    fontSize: 12,
    lineHeight: 17,
    color: palette.ink,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  noteDate: {
    fontSize: 10,
    color: palette.muted,
  },
  rhythmCard: {
    width: '100%',
    backgroundColor: palette.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.line,
    padding: 16,
  },
  rhythmHeader: {
    marginBottom: 14,
  },
  rhythmBody: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barsContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-end',
    flex: 1,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    height: 70,
    width: '75%',
    maxWidth: 22,
    backgroundColor: '#EFF3F0',
    borderRadius: 9,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 9,
  },
  barLabel: {
    fontSize: 10,
    color: palette.muted,
    marginTop: 6,
  },
  rhythmStat: {
    width: 105,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#F0EFEA',
  },
  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statPercent: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.ink,
  },
  statDesc: {
    fontSize: 10,
    color: palette.muted,
    lineHeight: 14,
    marginTop: 3,
  },
  statLeaf: {
    alignSelf: 'flex-end',
    marginTop: 6,
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.ink,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: palette.ink,
    marginBottom: 14,
  },
  modalSaveBtn: {
    backgroundColor: palette.sage,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
