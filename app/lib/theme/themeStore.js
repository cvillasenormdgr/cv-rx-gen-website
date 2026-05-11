'use client';

import { themeConfig } from '@/app/lib/theme/themeConfig';
import { themeUtils } from '@/app/lib/theme/themeUtils';

const themeListeners = new Set();

const notifyThemeListeners = () => {
  themeListeners.forEach((listener) => listener());
};

const subscribeToTheme = (listener) => {
  themeListeners.add(listener);
  const handleStorageChange = (event) => {
    if (event.key === themeConfig.storageKey) listener();
  };
  window.addEventListener('storage', handleStorageChange);
  return () => {
    themeListeners.delete(listener);
    window.removeEventListener('storage', handleStorageChange);
  };
};

const subscribeToSystemTheme = (listener) => {
  const mediaQueryList = window.matchMedia(themeConfig.mediaQuery);
  mediaQueryList.addEventListener('change', listener);
  return () => mediaQueryList.removeEventListener('change', listener);
};

const getThemeSnapshot = () => themeUtils.readStoredTheme();

const getServerThemeSnapshot = () => themeConfig.defaultTheme;

const getSystemSnapshot = () => themeUtils.getSystemResolvedTheme();

const getServerSystemSnapshot = () => 'light';

const writeTheme = (next) => {
  if (!themeUtils.isValidTheme(next)) return;
  themeUtils.writeStoredTheme(next);
  themeUtils.applyResolvedThemeToDocument(themeUtils.resolveTheme(next));
  notifyThemeListeners();
};

export const themeStore = Object.freeze({
  subscribeToTheme,
  subscribeToSystemTheme,
  getThemeSnapshot,
  getServerThemeSnapshot,
  getSystemSnapshot,
  getServerSystemSnapshot,
  writeTheme,
});

export default themeStore;
