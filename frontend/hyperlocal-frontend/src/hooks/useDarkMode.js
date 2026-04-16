import { useState, useEffect } from 'react';

const THEME_STORAGE_KEY = 'theme';
const themeListeners = new Set();

function readDarkTheme() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
}

function applyThemeToDocument(isDark) {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  if (isDark) {
    root.setAttribute('data-theme', 'dark');
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
  } else {
    root.removeAttribute('data-theme');
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
  }
}

let sharedDark = readDarkTheme();

if (typeof window !== 'undefined') {
  applyThemeToDocument(sharedDark);
}

function setSharedDark(nextDark) {
  sharedDark = nextDark;
  applyThemeToDocument(nextDark);
  themeListeners.forEach((listener) => listener(nextDark));
}

/**
 * Shared dark-mode hook.
 * Reads from / writes to localStorage('theme') and syncs with
 * document.documentElement[data-theme].
 */
export function useDarkMode() {
  const [dark, setDark] = useState(sharedDark);

  useEffect(() => {
    themeListeners.add(setDark);

    const syncFromStorage = () => {
      const next = readDarkTheme();
      if (next !== sharedDark) {
        setSharedDark(next);
      }
    };

    const handleStorage = (event) => {
      if (event.key === THEME_STORAGE_KEY) {
        syncFromStorage();
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      themeListeners.delete(setDark);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const toggle = () => {
    setSharedDark(!sharedDark);
  };

  return { dark, toggle };
}
