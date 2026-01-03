/**
 * Locale Context
 * 
 * Provides locale information to editor components
 */

import { createContext, useContext } from 'react';
import type { EditorLocale as EditorLocaleType } from '../types/editor';
import { getLocale, enLocale, type EditorLocale } from '../i18n';

interface LocaleContextValue {
  locale: EditorLocale;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: enLocale,
});

export const LocaleProvider = LocaleContext.Provider;

export function useLocale(): EditorLocale {
  const context = useContext(LocaleContext);
  return context.locale;
}

/**
 * Get locale from locale code string
 */
export function useLocaleFromCode(localeCode?: EditorLocaleType | string): EditorLocale {
  return getLocale(localeCode);
}
