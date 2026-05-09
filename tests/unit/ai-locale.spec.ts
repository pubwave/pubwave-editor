/**
 * Locale → language mapping
 */

import { describe, it, expect } from 'vitest';
import { localeToLanguage } from '../../src/core/ai/locale';

describe('localeToLanguage', () => {
  it('maps known locales', () => {
    expect(localeToLanguage('en')).toBe('English');
    expect(localeToLanguage('zh-CN')).toBe('Simplified Chinese');
    expect(localeToLanguage('zh')).toBe('Traditional Chinese');
    expect(localeToLanguage('ja')).toBe('Japanese');
  });

  it('falls back to English for missing or unknown values', () => {
    expect(localeToLanguage(undefined)).toBe('English');
    expect(localeToLanguage('xx')).toBe('English');
  });
});
