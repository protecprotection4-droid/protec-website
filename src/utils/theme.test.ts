import assert from 'node:assert/strict';
import test from 'node:test';
import { parseStoredTheme, resolveInitialTheme, toggleThemeValue } from './theme';

test('parseStoredTheme accepts only light and dark strings', () => {
  assert.equal(parseStoredTheme('dark'), 'dark');
  assert.equal(parseStoredTheme('light'), 'light');
  assert.equal(parseStoredTheme('system'), null);
  assert.equal(parseStoredTheme(null), null);
  assert.equal(parseStoredTheme(undefined), null);
});

test('resolveInitialTheme prefers valid stored value over media preference', () => {
  assert.equal(resolveInitialTheme('dark', false), 'dark');
  assert.equal(resolveInitialTheme('light', true), 'light');
  assert.equal(resolveInitialTheme(null, true), 'dark');
  assert.equal(resolveInitialTheme(null, false), 'light');
  assert.equal(resolveInitialTheme('invalid', false), 'light');
});

test('toggleThemeValue alternates cleanly between light and dark', () => {
  assert.equal(toggleThemeValue('light'), 'dark');
  assert.equal(toggleThemeValue('dark'), 'light');
});
