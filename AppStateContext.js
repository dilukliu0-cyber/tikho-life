import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncNativeWidgets } from './native-widgets/sync';

const AppStateContext = createContext(null);

// Brand new clean empty initial states
const initialTasks = [];
const initialHabits = [];
const initialCalendar = {};

function calculateSleepDuration(bed, wake) {
  const parse = (t) => {
    const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(String(t || '').trim());
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  };
  const b = parse(bed);
  const w = parse(wake);
  if (b === null || w === null) return '—';
  let diff = w - b;
  if (diff < 0) diff += 1440;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  return `${hours} ч ${String(mins).padStart(2, '0')} мин`;
}

export function AppStateProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [tasks, setTasks] = useState(initialTasks);
  const [habits, setHabits] = useState(initialHabits);
  const [calendarEvents, setCalendarEvents] = useState(initialCalendar);
  const [sleepBed, setSleepBed] = useState('23:00');
  const [sleepWake, setSleepWake] = useState('07:00');
  const [sleeping, setSleeping] = useState(false);
  const [sleepRecorded, setSleepRecorded] = useState(false);
  const [sleepEnergy, setSleepEnergy] = useState(3);
  const [note, setNote] = useState('');
  const [noteDate, setNoteDate] = useState('');

  // Focus timer state
  const [focusSeconds, setFocusSeconds] = useState(1500);
  const [focusRunning, setFocusRunning] = useState(false);

  // Load from AsyncStorage (using clean v2 prefix so existing old test data is not loaded)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [
          savedTasks,
          savedHabits,
          savedCal,
          savedBed,
          savedWake,
          savedActive,
          savedRecorded,
          savedEnergy,
          savedNote,
          savedNoteDate,
        ] = await Promise.all([
          AsyncStorage.getItem('tikho_v2:tasks'),
          AsyncStorage.getItem('tikho_v2:habits'),
          AsyncStorage.getItem('tikho_v2:calendar-events'),
          AsyncStorage.getItem('tikho_v2:sleep-bed'),
          AsyncStorage.getItem('tikho_v2:sleep-wake'),
          AsyncStorage.getItem('tikho_v2:sleep-active'),
          AsyncStorage.getItem('tikho_v2:sleep-recorded'),
          AsyncStorage.getItem('tikho_v2:sleep-energy'),
          AsyncStorage.getItem('tikho_v2:overview-note'),
          AsyncStorage.getItem('tikho_v2:overview-note-date'),
        ]);

        if (!active) return;
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedHabits) setHabits(JSON.parse(savedHabits));
        if (savedCal) setCalendarEvents(JSON.parse(savedCal));
        if (savedBed) setSleepBed(JSON.parse(savedBed));
        if (savedWake) setSleepWake(JSON.parse(savedWake));
        if (savedActive !== null) setSleeping(JSON.parse(savedActive));
        if (savedRecorded !== null) setSleepRecorded(JSON.parse(savedRecorded));
        if (savedEnergy !== null) setSleepEnergy(JSON.parse(savedEnergy));
        if (savedNote !== null) setNote(JSON.parse(savedNote));
        if (savedNoteDate) setNoteDate(JSON.parse(savedNoteDate));
      } catch (e) {
        // ignore load errors
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Save to AsyncStorage on changes
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem('tikho_v2:tasks', JSON.stringify(tasks)).catch(() => {});
  }, [tasks, ready]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem('tikho_v2:habits', JSON.stringify(habits)).catch(() => {});
  }, [habits, ready]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem('tikho_v2:calendar-events', JSON.stringify(calendarEvents)).catch(() => {});
  }, [calendarEvents, ready]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem('tikho_v2:sleep-bed', JSON.stringify(sleepBed)).catch(() => {});
    AsyncStorage.setItem('tikho_v2:sleep-wake', JSON.stringify(sleepWake)).catch(() => {});
    AsyncStorage.setItem('tikho_v2:sleep-active', JSON.stringify(sleeping)).catch(() => {});
    AsyncStorage.setItem('tikho_v2:sleep-recorded', JSON.stringify(sleepRecorded)).catch(() => {});
    AsyncStorage.setItem('tikho_v2:sleep-energy', JSON.stringify(sleepEnergy)).catch(() => {});
  }, [sleepBed, sleepWake, sleeping, sleepRecorded, sleepEnergy, ready]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem('tikho_v2:overview-note', JSON.stringify(note)).catch(() => {});
    AsyncStorage.setItem('tikho_v2:overview-note-date', JSON.stringify(noteDate)).catch(() => {});
  }, [note, noteDate, ready]);

  // Focus timer countdown
  useEffect(() => {
    if (!focusRunning) return;
    const id = setInterval(() => {
      setFocusSeconds((val) => {
        if (val <= 1) {
          setFocusRunning(false);
          return 1500;
        }
        return val - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [focusRunning]);

  // Sync with native iOS widgets
  useEffect(() => {
    if (!ready) return;
    const completedTasks = tasks.filter((t) => t[2]).length;
    const nextTask = tasks.find((t) => !t[2]);
    const taskName = nextTask
      ? nextTask[0]
      : (tasks.length ? 'Все дела завершены' : 'Планов пока нет');
    const sleepDur = sleepRecorded
      ? calculateSleepDuration(sleepBed, sleepWake)
      : (sleeping ? 'Сон идёт' : '—');
    const sleepState = sleeping
      ? `Начало в ${sleepBed}`
      : (sleepRecorded ? 'Хороший сон' : 'Ожидаем запись');

    syncNativeWidgets(
      {
        task: taskName,
        completed: completedTasks,
        total: tasks.length,
      },
      {
        duration: sleepDur,
        state: sleepState,
      }
    );
  }, [tasks, sleepBed, sleepWake, sleeping, sleepRecorded, ready]);

  // Actions
  const toggleTask = (index) => {
    setTasks((current) =>
      current.map((item, i) => (i === index ? [item[0], item[1], !item[2]] : item))
    );
  };

  const addTask = (title, time = '') => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks((current) => [...current, [trimmed, time, false]]);
  };

  const toggleHabit = (habitIndex, dayIndex = 3) => {
    setHabits((current) =>
      current.map((item, i) => {
        if (i !== habitIndex) return item;
        const week = [...item[4]];
        week[dayIndex] = week[dayIndex] ? 0 : 1;
        return [...item.slice(0, 4), week];
      })
    );
  };

  const addHabit = (name, goal = 'Каждый день', icon = 'heart', color = '#F3EEF8') => {
    setHabits((current) => [...current, [name, goal, icon, color, [0, 0, 0, 0, 0, 0, 0]]]);
  };

  const updateNote = (newNote) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    setNote(newNote);
    setNoteDate(`Сегодня, ${timeStr}`);
  };

  // Next event resolution
  const nextEvent = useMemo(() => {
    const allKeys = Object.keys(calendarEvents).sort();
    for (const k of allKeys) {
      if (calendarEvents[k]?.length) {
        const sorted = [...calendarEvents[k]].sort((a, b) => a.time.localeCompare(b.time));
        const parts = k.split('-');
        let dateLabel = 'Скоро';
        if (parts.length === 3) {
          dateLabel = `${parts[2]} число`;
        }
        return { ...sorted[0], dateLabel };
      }
    }
    return null;
  }, [calendarEvents]);

  const value = {
    ready,
    tasks,
    setTasks,
    toggleTask,
    addTask,
    habits,
    setHabits,
    toggleHabit,
    addHabit,
    calendarEvents,
    setCalendarEvents,
    nextEvent,
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
    sleepDuration: calculateSleepDuration(sleepBed, sleepWake),
    note,
    noteDate,
    updateNote,
    focusSeconds,
    setFocusSeconds,
    focusRunning,
    setFocusRunning,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
