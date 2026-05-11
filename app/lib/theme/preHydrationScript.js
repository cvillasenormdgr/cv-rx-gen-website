export const preHydrationScript = `(function () {
  try {
    var storageKey = 'rx-gen-theme';
    var darkClass = 'dark';
    var stored = window.localStorage.getItem(storageKey);
    var allowed = ['light', 'dark', 'system'];
    var theme = allowed.indexOf(stored) !== -1 ? stored : 'system';
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var resolved = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
    var root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add(darkClass);
    } else {
      root.classList.remove(darkClass);
    }
    root.style.colorScheme = resolved;
  } catch (_) {}
})();`;

export default preHydrationScript;
