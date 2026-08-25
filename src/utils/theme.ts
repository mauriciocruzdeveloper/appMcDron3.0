export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme-mode';

export const getStoredThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';

  const savedMode = window.localStorage.getItem(STORAGE_KEY);
  return savedMode === 'light' || savedMode === 'dark' || savedMode === 'system'
    ? savedMode
    : 'system';
};

export const persistThemeMode = (mode: ThemeMode): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, mode);
};

export const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const resolveTheme = (mode: ThemeMode, systemTheme: ResolvedTheme): ResolvedTheme => {
  if (mode === 'dark' || mode === 'light') {
    return mode;
  }

  return systemTheme;
};

export const applyTheme = (theme: ResolvedTheme): void => {
  if (typeof document === 'undefined') return;

  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
};
