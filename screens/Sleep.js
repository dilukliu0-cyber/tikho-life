import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { useAppState } from '../AppStateContext';

const ink = '#1D2C3D';
const muted = '#7E8993';

const two = (n) => String(n).padStart(2, '0');
const nowTime = () => {
  const d = new Date();
  return `${two(d.getHours())}:${two(d.getMinutes())}`;
};

function minutes(t) {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(String(t).trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

export default function Sleep() {
  const {
    sleepBed,
    setSleepBed,
    sleepWake,
    setSleepWake,
    sleeping,
    setSleeping,
    sleepRecorded,
    setSleepRecorded,
    sleepEnergy,
    setSleepEnergy,
    sleepDuration,
  } = useAppState();

  const [editing, setEditing] = useState(false);
  const [draftBed, setDraftBed] = useState(sleepBed);
  const [draftWake, setDraftWake] = useState(sleepWake);

  const saveManual = () => {
    if (minutes(draftBed) === null || minutes(draftWake) === null) {
      Alert.alert('Проверь время', 'Используй формат 23:10 и 07:30.');
      return;
    }
    setSleepBed(draftBed);
    setSleepWake(draftWake);
    setSleepRecorded(true);
    setSleeping(false);
    setEditing(false);
  };

  const goToBed = () => {
    setSleepBed(nowTime());
    setSleeping(true);
    setSleepRecorded(false);
  };

  const wakeUp = () => {
    if (!sleeping) {
      Alert.alert('Сначала отметь сон', 'Нажми «Ложусь спать», когда будешь готов.');
      return;
    }
    setSleepWake(nowTime());
    setSleeping(false);
    setSleepRecorded(true);
  };

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.heading}>Сон</Text>
          <Pressable
            onPress={() => {
              setDraftBed(sleepBed);
              setDraftWake(sleepWake);
              setEditing((v) => !v);
            }}
            style={s.plus}
            accessibilityRole="button"
            accessibilityLabel="Изменить время сна"
          >
            <Feather name={editing ? 'x' : 'plus'} size={23} color={ink} />
          </Pressable>
        </View>

        <View style={s.night}>
          <View style={s.stars}>
            <Text style={s.starOne}>✦</Text>
            <Text style={s.starTwo}>·    ✦        ·        ✦</Text>
          </View>
          <Text style={s.moon}>☾</Text>
          <Text style={s.nightText}>Запись сна{'\n'}и времени подъёма</Text>
          <View style={s.mountainBack} />
          <View style={s.mountainFront} />
        </View>

        <View style={s.card}>
          <View style={s.summary}>
            <View>
              <Text style={s.duration}>
                {sleepRecorded ? sleepDuration : sleeping ? 'Сон идёт' : '—'}
              </Text>
              <Text style={s.small}>
                {sleepRecorded
                  ? 'Последняя запись'
                  : sleeping
                  ? `С ${sleepBed}`
                  : 'Ожидаем запись'}
              </Text>
            </View>
            <View style={s.goal}>
              <View style={s.goalRing}>
                <View style={s.goalInner} />
              </View>
              <View>
                <Text style={s.small}>Цель</Text>
                <Text style={s.goalText}>8 ч</Text>
              </View>
            </View>
          </View>
          <View style={s.timeline}>
            <View style={[s.segment, { flex: 2, backgroundColor: '#4A78BC' }]} />
            <View style={[s.segment, { flex: 1.2, backgroundColor: '#ABC2E6' }]} />
            <View style={[s.segment, { flex: 2.4, backgroundColor: '#6991CE' }]} />
            <View style={[s.segment, { flex: 1.1, backgroundColor: '#CBD9EF' }]} />
            <View style={[s.segment, { flex: 1.8, backgroundColor: '#5A81C2' }]} />
            <View style={[s.segment, { flex: 0.8, backgroundColor: '#EABDB6' }]} />
            <View style={[s.segment, { flex: 1.5, backgroundColor: '#779BD2' }]} />
          </View>
          <View style={s.between}>
            <Text style={s.small}>{sleepBed}</Text>
            <Text style={s.small}>{sleeping ? 'сейчас' : sleepWake}</Text>
          </View>
          <View style={s.legend}>
            <Text style={s.legendText}>
              <Text style={{ color: '#447EC4' }}>● </Text>Глубокий
            </Text>
            <Text style={s.legendText}>
              <Text style={{ color: '#B6C9EA' }}>● </Text>Лёгкий
            </Text>
            <Text style={s.legendText}>
              <Text style={{ color: '#EABDB6' }}>● </Text>Бодрствование
            </Text>
          </View>
        </View>

        <View style={s.actions}>
          <Pressable
            onPress={goToBed}
            style={[s.action, sleeping && s.activeAction]}
            accessibilityRole="button"
          >
            <Image
              source={require('../assets/sleep-action.png')}
              style={s.actionImage}
            />
            <View style={s.actionCopy}>
              <Text style={s.actionTitle}>
                {sleeping ? 'Сон записывается' : 'Ложусь спать'}
              </Text>
              <Text style={s.actionSub}>
                {sleeping ? `Начало в ${sleepBed}` : 'Отметить начало сна'}
              </Text>
            </View>
            <Feather name="arrow-right" size={17} color="#4B6B82" />
          </Pressable>
          <Pressable onPress={wakeUp} style={s.action} accessibilityRole="button">
            <View style={s.sunCircle}>
              <Feather name="sunrise" size={22} color="#B77C55" />
            </View>
            <View style={s.actionCopy}>
              <Text style={s.actionTitle}>Проснулся</Text>
              <Text style={s.actionSub}>Отметить пробуждение</Text>
            </View>
            <Feather name="arrow-right" size={17} color="#4B6B82" />
          </Pressable>
        </View>

        {editing && (
          <View style={s.manual}>
            <Text style={s.sectionTitle}>Добавить сон вручную</Text>
            <View style={s.manualRow}>
              <View style={s.inputWrap}>
                <Text style={s.inputLabel}>Лёг спать</Text>
                <TextInput
                  value={draftBed}
                  onChangeText={setDraftBed}
                  placeholder="23:10"
                  keyboardType="numbers-and-punctuation"
                  style={s.input}
                />
              </View>
              <View style={s.inputWrap}>
                <Text style={s.inputLabel}>Проснулся</Text>
                <TextInput
                  value={draftWake}
                  onChangeText={setDraftWake}
                  placeholder="07:30"
                  keyboardType="numbers-and-punctuation"
                  style={s.input}
                />
              </View>
            </View>
            <Pressable style={s.save} onPress={saveManual}>
              <Text style={s.saveText}>Сохранить сон</Text>
            </Pressable>
          </View>
        )}

        <View style={s.energyCard}>
          <Text style={s.sectionTitle}>Энергия днём</Text>
          <View style={s.chartWrap}>
            <View style={s.chartLabels}>
              <Text style={s.axis}>Высокая</Text>
              <Text style={s.axis}>Средняя</Text>
              <Text style={s.axis}>Низкая</Text>
            </View>
            <View style={s.chart}>
              <Svg width="100%" height="100%" viewBox="0 0 240 115" preserveAspectRatio="none">
                <Defs>
                  <LinearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#B9D7DD" stopOpacity="0.45" />
                    <Stop offset="1" stopColor="#EAF3F3" stopOpacity="0.08" />
                  </LinearGradient>
                </Defs>
                <Path
                  d="M0 88 C30 86 41 35 65 32 C87 29 111 78 137 76 C164 73 182 23 205 19 C222 17 231 34 240 43 L240 115 L0 115 Z"
                  fill="url(#area)"
                />
                <Path
                  d="M0 88 C30 86 41 35 65 32 C87 29 111 78 137 76 C164 73 182 23 205 19 C222 17 231 34 240 43"
                  stroke="#3379A6"
                  strokeWidth="2"
                  fill="none"
                />
                <Circle cx="65" cy="32" r="4" fill="#3988B5" stroke="#FFF" strokeWidth="1.5" />
                <Circle cx="137" cy="76" r="4" fill="#4FA087" stroke="#FFF" strokeWidth="1.5" />
                <Circle cx="205" cy="19" r="4" fill="#4FA087" stroke="#FFF" strokeWidth="1.5" />
              </Svg>
            </View>
          </View>
          <View style={s.hours}>
            {['6', '9', '12', '15', '18', '21'].map((h) => (
              <Text key={h} style={s.axis}>
                {h}
              </Text>
            ))}
          </View>
          <View style={s.energyChoice}>
            <Text style={s.energyPrompt}>Уровень энергии сейчас:</Text>
            <View style={s.energyButtons}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable
                  onPress={() => setSleepEnergy(n)}
                  key={n}
                  style={[s.energyButton, sleepEnergy === n && s.energySelected]}
                >
                  <Text
                    style={[
                      s.energyNumber,
                      sleepEnergy === n && { color: '#FFF', fontWeight: '700' },
                    ]}
                  >
                    {n}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFCFA' },
  content: { paddingHorizontal: 21, paddingTop: 20, paddingBottom: 36 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },
  heading: { fontSize: 29, fontWeight: '700', color: ink, letterSpacing: -0.7 },
  plus: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F3F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  night: {
    height: 110,
    borderRadius: 17,
    backgroundColor: '#2C4664',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 12,
  },
  stars: { position: 'absolute', left: 17, top: 8, right: 10 },
  starOne: { color: '#DCE8F5', position: 'absolute', top: 2, left: 110, fontSize: 6 },
  starTwo: { color: '#CFDCEB', fontSize: 11, letterSpacing: 26 },
  moon: {
    color: '#F9E9D9',
    fontSize: 50,
    marginRight: 35,
    zIndex: 2,
    marginTop: -10,
  },
  nightText: { color: '#FFF', fontSize: 15, lineHeight: 22, zIndex: 2 },
  mountainBack: {
    position: 'absolute',
    width: 230,
    height: 70,
    borderRadius: 85,
    backgroundColor: '#3D5874',
    bottom: -54,
    left: -36,
    transform: [{ rotate: '-7deg' }],
  },
  mountainFront: {
    position: 'absolute',
    width: 300,
    height: 75,
    borderRadius: 95,
    backgroundColor: '#243D57',
    bottom: -60,
    right: -60,
    transform: [{ rotate: '9deg' }],
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9E8E6',
    backgroundColor: '#FFF',
    padding: 15,
    marginBottom: 11,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  duration: { fontSize: 23, fontWeight: '700', color: ink },
  small: { color: muted, fontSize: 11, marginTop: 2 },
  goal: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  goalRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 5,
    borderColor: '#4F9A87',
    borderLeftColor: '#C6DFE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalInner: { width: 15, height: 15, borderRadius: 7.5, backgroundColor: '#FFF' },
  goalText: { fontSize: 14, color: ink, fontWeight: '600' },
  timeline: {
    height: 24,
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 6,
  },
  segment: { borderRightWidth: 2, borderRightColor: '#FFFFFF8A' },
  between: { flexDirection: 'row', justifyContent: 'space-between' },
  legend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  legendText: { color: '#52616E', fontSize: 11 },
  actions: { gap: 9, marginBottom: 11 },
  action: {
    borderRadius: 14,
    backgroundColor: '#F2F6F5',
    minHeight: 60,
    padding: 7,
    paddingRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeAction: { backgroundColor: '#E4F0EB' },
  actionImage: { width: 46, height: 46, borderRadius: 12, marginRight: 11 },
  sunCircle: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFF1E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },
  actionCopy: { flex: 1 },
  actionTitle: { color: ink, fontWeight: '600', fontSize: 13 },
  actionSub: { color: muted, fontSize: 11, marginTop: 2 },
  manual: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E9E8E6',
    padding: 14,
    marginBottom: 11,
  },
  manualRow: { flexDirection: 'row', gap: 10, marginVertical: 12 },
  inputWrap: { flex: 1 },
  inputLabel: { color: muted, fontSize: 11, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#E3E7E7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: ink,
    backgroundColor: '#FBFDFC',
  },
  save: {
    backgroundColor: '#5D8C7B',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 11,
  },
  saveText: { color: '#FFF', fontWeight: '600' },
  energyCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9E8E6',
    backgroundColor: '#FFF',
    padding: 14,
  },
  sectionTitle: { color: ink, fontSize: 15, fontWeight: '600' },
  chartWrap: { flexDirection: 'row', height: 110, marginTop: 14 },
  chartLabels: { width: 50, justifyContent: 'space-between', paddingBottom: 4 },
  chart: { flex: 1 },
  axis: { color: muted, fontSize: 10 },
  hours: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 50,
    marginTop: 4,
  },
  energyChoice: {
    borderTopWidth: 1,
    borderTopColor: '#F0EFEC',
    marginTop: 15,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  energyPrompt: { color: '#55616C', fontSize: 11 },
  energyButtons: { flexDirection: 'row', gap: 6 },
  energyButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFF2F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  energySelected: { backgroundColor: '#659783' },
  energyNumber: { color: '#667580', fontSize: 11 },
});
