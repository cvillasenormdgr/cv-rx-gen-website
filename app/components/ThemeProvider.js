'use client';

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';

import { ThemeContext } from '@/app/lib/theme/themeContext';
import { themeStore } from '@/app/lib/theme/themeStore';
import { themeUtils } from '@/app/lib/theme/themeUtils';

const ThemeProvider = ({ children }) => {
  const theme = useSyncExternalStore(
    themeStore.subscribeToTheme,
    themeStore.getThemeSnapshot,
    themeStore.getServerThemeSnapshot,
  );

  const systemTheme = useSyncExternalStore(
    themeStore.subscribeToSystemTheme,
    themeStore.getSystemSnapshot,
    themeStore.getServerSystemSnapshot,
  );

  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    themeUtils.applyResolvedThemeToDocument(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((next) => {
    themeStore.writeTheme(next);
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;
