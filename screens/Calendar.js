import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppState } from '../AppStateContext';

const ink = '#1D2C3D';
const muted = '#7B8490';
const weekday = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const months = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];
const monthTitle = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const today = new Date();

export default function Calendar() {
  const { calendarEvents, setCalendarEvents } = useAppState();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [day, setDay] = useState(today.getDate());
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');

  const key = `${month.getFullYear()}-${month.getMonth()}-${day}`;
  const selectedEvents = [...(calendarEvents[key] || [])].sort((a, b) =>
    a.time.localeCompare(b.time)
  );

  const cells = useMemo(() => {
    const offset = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  }, [month]);

  const changeMonth = (direction) => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + direction, 1));
    setDay(1);
  };

  const addEvent = () => {
    const name = title.trim();
    const when = time.trim();
    if (!name || !/^([01]?\d|2[0-3]):[0-5]\d$/.test(when)) {
      Alert.alert('Проверь запись', 'Напиши название и время в формате 09:30.');
      return;
    }
    setCalendarEvents((prev) => ({
      ...prev,
      [key]: [
        ...(prev[key] || []),
        {
          time: when.padStart(5, '0'),
          title: name,
          subtitle: 'Моё событие',
          color: '#5FA38D',
        },
      ],
    }));
    setTitle('');
    setTime('');
    setAdding(false);
  };

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.heading}>Календарь</Text>
          <Pressable
            onPress={() => setAdding(true)}
            style={s.plus}
            accessibilityRole="button"
            accessibilityLabel="Добавить событие"
          >
            <Feather name="plus" size={23} color={ink} />
          </Pressable>
        </View>

        <View style={s.month}>
          <Pressable onPress={() => changeMonth(-1)} hitSlop={15}>
            <Feather name="chevron-left" size={21} color={ink} />
          </Pressable>
          <Text style={s.monthText}>
            {monthTitle[month.getMonth()]} {month.getFullYear()}
          </Text>
          <Pressable onPress={() => changeMonth(1)} hitSlop={15}>
            <Feather name="chevron-right" size={21} color={ink} />
          </Pressable>
        </View>

        <View style={s.grid}>
          {weekday.map((x) => (
            <Text key={x} style={s.weekday}>
              {x}
            </Text>
          ))}
          {cells.map((n, i) => {
            const hasEvent =
              n && calendarEvents[`${month.getFullYear()}-${month.getMonth()}-${n}`]?.length;
            return (
              <Pressable
                key={i}
                disabled={!n}
                onPress={() => setDay(n)}
                style={[s.dayCell, n === day && s.selected]}
              >
                <Text style={[s.dayText, n === day && s.selectedText]}>{n || ''}</Text>
                {hasEvent && n !== day ? <View style={s.dot} /> : null}
              </Pressable>
            );
          })}
        </View>

        <Text style={s.dateHeading}>
          {day} {months[month.getMonth()]},{' '}
          {weekday[
            (new Date(month.getFullYear(), month.getMonth(), day).getDay() + 6) % 7
          ].toLowerCase()}
        </Text>

        <View style={s.eventsCard}>
          {selectedEvents.length ? (
            selectedEvents.map((item, i) => (
              <View
                key={`${item.title}-${i}`}
                style={[s.event, i < selectedEvents.length - 1 && s.eventBorder]}
              >
                <View style={[s.eventAccent, { backgroundColor: item.color }]} />
                <Text style={s.time}>{item.time}</Text>
                <View style={[s.eventDot, { backgroundColor: item.color }]} />
                <View style={s.eventCopy}>
                  <Text style={s.eventTitle}>{item.title}</Text>
                  <Text style={s.eventSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={s.empty}>
              <Feather name="calendar" size={21} color="#7AA58C" />
              <Text style={s.emptyText}>На этот день нет запланированных событий.</Text>
            </View>
          )}
        </View>

        <Pressable
          onPress={() => setAdding(true)}
          style={s.addRow}
          accessibilityRole="button"
        >
          <Image
            source={require('../assets/calendar-action.png')}
            style={s.actionImage}
          />
          <Text style={s.addText}>Добавить событие</Text>
          <Feather name="arrow-right" size={17} color="#3D7769" />
        </Pressable>
      </ScrollView>

      <Modal
        transparent
        visible={adding}
        animationType="fade"
        onRequestClose={() => setAdding(false)}
      >
        <View style={s.overlay}>
          <View style={s.dialog}>
            <View style={s.dialogTop}>
              <Text style={s.dialogTitle}>Новое событие</Text>
              <Pressable onPress={() => setAdding(false)}>
                <Feather name="x" size={22} color={ink} />
              </Pressable>
            </View>
            <Text style={s.dialogDate}>
              {day} {months[month.getMonth()]}
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Название"
              placeholderTextColor="#9AA2AA"
              style={s.input}
            />
            <TextInput
              value={time}
              onChangeText={setTime}
              placeholder="Время, например 09:30"
              placeholderTextColor="#9AA2AA"
              keyboardType="numbers-and-punctuation"
              style={s.input}
            />
            <Pressable onPress={addEvent} style={s.save}>
              <Text style={s.saveText}>Добавить</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFCFA' },
  content: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 35 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heading: { fontSize: 30, fontWeight: '700', color: ink, letterSpacing: -0.7 },
  plus: {
    width: 38,
    height: 38,
    backgroundColor: '#F1F3F3',
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  monthText: { fontSize: 16, fontWeight: '600', color: ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  weekday: {
    width: '14.2857%',
    textAlign: 'center',
    color: '#4D5965',
    fontSize: 12,
    marginBottom: 12,
  },
  dayCell: {
    width: '14.2857%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  selected: { backgroundColor: '#6A927D' },
  dayText: { color: ink, fontSize: 14 },
  selectedText: { color: '#FFF', fontWeight: '600' },
  dot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E98783',
    bottom: 3,
  },
  dateHeading: { color: ink, fontSize: 15, fontWeight: '600', marginBottom: 8 },
  eventsCard: {
    borderWidth: 1,
    borderColor: '#EBE9E6',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 12,
  },
  event: { flexDirection: 'row', alignItems: 'center', minHeight: 52 },
  eventBorder: { borderBottomWidth: 1, borderBottomColor: '#F0EFED' },
  eventAccent: { width: 5, height: 23, borderRadius: 3, marginRight: 12 },
  time: { width: 44, color: '#3F4954', fontSize: 12 },
  eventDot: { width: 9, height: 9, borderRadius: 5, marginRight: 10, opacity: 0.85 },
  eventCopy: { flex: 1 },
  eventTitle: { color: ink, fontSize: 13, fontWeight: '600' },
  eventSubtitle: { color: muted, fontSize: 11, marginTop: 2 },
  empty: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 18 },
  emptyText: { color: muted, fontSize: 13 },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 6,
    paddingRight: 15,
    backgroundColor: '#F2F6F5',
    borderRadius: 14,
    marginTop: 12,
  },
  actionImage: { width: 42, height: 42, borderRadius: 10 },
  addText: { flex: 1, color: '#3D7769', fontSize: 13, fontWeight: '600' },
  overlay: {
    flex: 1,
    backgroundColor: '#17263477',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  dialog: { backgroundColor: '#FFFCFA', borderRadius: 20, padding: 20 },
  dialogTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dialogTitle: { fontSize: 20, color: ink, fontWeight: '700' },
  dialogDate: { color: muted, marginVertical: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#E4E8E7',
    backgroundColor: '#FFF',
    borderRadius: 12,
    color: ink,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 14,
    marginBottom: 10,
  },
  save: {
    backgroundColor: '#557E72',
    padding: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
  },
  saveText: { color: '#FFF', fontWeight: '600' },
});
