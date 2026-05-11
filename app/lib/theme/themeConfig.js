export const themeConfig = Object.freeze({
  storageKey: 'rx-gen-theme',
  themes: Object.freeze(['light', 'dark', 'system']),
  defaultTheme: 'system',
  darkClassName: 'dark',
  mediaQuery: '(prefers-color-scheme: dark)',
});

export default themeConfig;
