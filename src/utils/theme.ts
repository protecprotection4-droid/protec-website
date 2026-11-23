export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'protec_theme';

export function parseStoredTheme(raw: string | null | undefined): ThemeMode | null {
  if (raw === 'dark' || raw === 'light') {
    return raw;
  }
  return null;
}

export function resolveInitialTheme(
  storedRaw: string | null | undefined,
  prefersDark = false
): ThemeMode {
  const parsed = parseStoredTheme(storedRaw);
  if (parsed) {
    return parsed;
  }
  return prefersDark ? 'dark' : 'light';
}

export function toggleThemeValue(current: ThemeMode): ThemeMode {
  return current === 'dark' ? 'light' : 'dark';
}
