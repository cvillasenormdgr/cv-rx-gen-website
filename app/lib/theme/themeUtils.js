import { themeConfig } from '@/app/lib/theme/themeConfig';

const isValidTheme = (candidate) =>
  typeof candidate === 'string' && themeConfig.themes.includes(candidate);

const readStoredTheme = () => {
  try {
    const stored = window.localStorage.getItem(themeConfig.storageKey);
    return isValidTheme(stored) ? stored : themeConfig.defaultTheme;
  } catch (_) {
    return themeConfig.defaultTheme;
  }
};

const writeStoredTheme = (next) => {
  try {
    window.localStorage.setItem(themeConfig.storageKey, next);
  } catch (_) {}
};

const getSystemResolvedTheme = () => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia(themeConfig.mediaQuery).matches ? 'dark' : 'light';
};

const resolveTheme = (theme) =>
  theme === 'system' ? getSystemResolvedTheme() : theme;

const applyResolvedThemeToDocument = (resolved) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add(themeConfig.darkClassName);
  } else {
    root.classList.remove(themeConfig.darkClassName);
  }
  root.style.colorScheme = resolved;
};

export const themeUtils = Object.freeze({
  isValidTheme,
  readStoredTheme,
  writeStoredTheme,
  getSystemResolvedTheme,
  resolveTheme,
  applyResolvedThemeToDocument,
});

export default themeUtils;
