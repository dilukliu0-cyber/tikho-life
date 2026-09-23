import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppStateProvider } from './AppStateContext';
import Today from './screens/Today';
import Calendar from './screens/Calendar';
import Habits from './screens/Habits';
import Sleep from './screens/Sleep';
import Overview from './screens/Overview';
import Notes from './screens/Notes';
import Rhythm from './screens/Rhythm';
import Widgets from './screens/Widgets';

const palette = {
  ink: '#1D2B3B',
  muted: '#71808B',
  sage: '#5E8E79',
  line: '#E8E9E6',
  bg: '#FBFAF7',
};

const tabs = [
  ['Сегодня', 'home'],
  ['Календарь', 'calendar'],
  ['Привычки', 'check-circle'],
  ['Сон', 'moon'],
  ['Обзор', 'grid'],
];

function getInitialTab() {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hash) {
    const raw = decodeURIComponent(window.location.hash.slice(1));
    if (raw) return raw;
  }
  return 'Сегодня';
}

function MainContent() {
  const [tab, setTab] = useState(getInitialTab);
  const [subScreen, setSubScreen] = useState('');

  React.useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const handleHash = () => {
      if (window.location.hash) {
        const target = decodeURIComponent(window.location.hash.slice(1));
        if (target) {
          setTab(target);
          setSubScreen('');
        }
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTab = (targetTab) => {
    setTab(targetTab);
    setSubScreen('');
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.hash = encodeURIComponent(targetTab);
    }
  };

  const pages = {
    'Сегодня': <Today />,
    'Календарь': <Calendar />,
    'Привычки': <Habits />,
    'Сон': <Sleep />,
    'Обзор': <Overview onNavigateTab={navigateTab} />,
    'Заметки': <Notes />,
    'Ритм': <Rhythm />,
    'Виджеты': <Widgets />,
  };

  const activeScreen = subScreen || tab;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={palette.bg} />
      <View style={s.shell}>
        {subScreen ? (
          <Pressable
            onPress={() => setSubScreen('')}
            style={s.back}
            accessibilityRole="button"
          >
            <Feather name="chevron-left" size={18} color={palette.sage} />
            <Text style={s.backText}>Назад к {tab}</Text>
          </Pressable>
        ) : null}

        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {pages[activeScreen] || pages['Сегодня']}
        </ScrollView>

        <View style={s.nav}>
          {tabs.map(([name, icon]) => {
            const isSelected = tab === name && !subScreen;
            return (
              <Pressable
                key={name}
                style={s.navItem}
                onPress={() => navigateTab(name)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
              >
                <Feather
                  name={icon}
                  size={21}
                  color={isSelected ? palette.sage : palette.muted}
                />
                <Text style={[s.navText, isSelected && s.navSelected]}>
                  {name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <MainContent />
    </AppStateProvider>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  shell: {
    flex: 1,
    width: '100%',
    backgroundColor: palette.bg,
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  content: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 16 : 8,
    paddingBottom: 28,
  },
  nav: {
    height: 68,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: palette.line,
    backgroundColor: '#FFFFFF',
  },
  navItem: {
    minWidth: 62,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  navText: {
    fontSize: 10,
    color: palette.muted,
  },
  navSelected: {
    color: palette.ink,
    fontWeight: '700',
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 2,
  },
  backText: {
    fontSize: 14,
    color: palette.sage,
    fontWeight: '600',
  },
});
