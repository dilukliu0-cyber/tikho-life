import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(`tikho:${key}`)
      .then(saved => { if (active && saved !== null) setValue(JSON.parse(saved)); })
      .catch(() => {})
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, [key]);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(`tikho:${key}`, JSON.stringify(value)).catch(() => {});
  }, [key, ready, value]);

  return [value, setValue];
}
