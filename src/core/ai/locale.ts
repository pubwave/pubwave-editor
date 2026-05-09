/**
 * Maps editor locale codes to the natural-language name used in AI prompts.
 *
 * Internal helper - not part of the public API. Translate-style actions that
 * accept a target language argument should pass that argument directly rather
 * than read this table.
 */

import type { EditorLocale } from '../../types/editor';

const LOCALE_TO_LANGUAGE: Record<EditorLocale, string> = {
  en: 'English',
  zh: 'Traditional Chinese',
  'zh-CN': 'Simplified Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  pt: 'Portuguese',
};

export function localeToLanguage(locale: string | undefined): string {
  if (!locale) return 'English';
  if (Object.prototype.hasOwnProperty.call(LOCALE_TO_LANGUAGE, locale)) {
    return LOCALE_TO_LANGUAGE[locale as EditorLocale];
  }
  return 'English';
}
