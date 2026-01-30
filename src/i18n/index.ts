/**
 * Internationalization (i18n) Support
 *
 * Provides multi-language support for the editor.
 * Each language has its own JSON file in the locales directory.
 * Default locale is English ('en').
 */

import type { EditorLocale as EditorLocaleType } from '../types/editor';
export type Locale = EditorLocaleType;

// Import locale JSON files
import enLocaleData from './locales/en.json';
import zhLocaleData from './locales/zh.json';
import zhCNLocaleData from './locales/zh-CN.json';
import jaLocaleData from './locales/ja.json';
import koLocaleData from './locales/ko.json';
import frLocaleData from './locales/fr.json';
import deLocaleData from './locales/de.json';
import esLocaleData from './locales/es.json';
import ptLocaleData from './locales/pt.json';

export interface EditorLocale {
  // Slash menu commands
  slashMenu: {
    // Command groups
    groups: {
      basic: string;
      list: string;
      media: string;
      advanced: string;
      layout?: string;
    };
    // Commands
    commands: {
      paragraph: { title: string; description: string };
      heading1: { title: string; description: string };
      heading2: { title: string; description: string };
      heading3: { title: string; description: string };
      bulletList: { title: string; description: string };
      orderedList: { title: string; description: string };
      taskList: { title: string; description: string };
      image: { title: string; description: string };
      blockquote: { title: string; description: string };
      codeBlock: { title: string; description: string };
      horizontalRule: { title: string; description: string };
      table?: { title: string; description: string };
      chart?: { title: string; description: string };
      layoutTwoColumn?: { title: string; description: string };
      layoutThreeColumn?: { title: string; description: string };
    };
  };

  // Toolbar
  toolbar: {
    bold: string;
    italic: string;
    underline: string;
    strike: string;
    code: string;
    link: string;
    turnInto: string;
    colorPicker: string;
    textColor: string;
    backgroundColor: string;
    recentlyUsed: string;
    openLink: string;
    removeLink: string;
    confirmLink: string;
    clearLink: string;
    // Block types
    blockTypes: {
      text: string;
      heading1: string;
      heading2: string;
      heading3: string;
      bulletedList: string;
      numberedList: string;
    };
  };

  // Accessibility labels
  aria: {
    editor: string;
    editorContent: string;
    toolbar: string;
    boldButton: string;
    italicButton: string;
    underlineButton: string;
    strikeButton: string;
    codeButton: string;
    linkButton: string;
    turnIntoButton: string;
    colorPickerButton: string;
    headingButton: string;
    paragraphButton: string;
    dragHandle: string;
    dropIndicator: string;
    blockMenu: string;
    addBlock: string;
    deleteBlock: string;
    linkDialog: string;
    linkUrlInput: string;
    linkSaveButton: string;
    linkRemoveButton: string;
    linkCancelButton: string;
    linkConfirmButton: string;
    linkOpenButton: string;
    linkClearButton: string;
    addBlockBelow: string;
    dragToMove: string;
    openLinkInNewTab: string;
  };

  // Placeholders
  placeholder: string;
  linkPlaceholder: string;

  // Chart editor
  chart?: {
    modal: {
      title: string;
      close: string;
      save: string;
      cancel: string;
      fields: {
        chartType: string;
        title: string;
        titlePlaceholder: string;
        showLegend: string;
        legendPosition: string;
        position: {
          top: string;
          bottom: string;
          left: string;
          right: string;
        };
        labels: string;
        labelsPlaceholder: string;
        datasets: {
          title: string;
          add: string;
          remove: string;
          datasetLabel: string;
          datasetLabelPlaceholder: string;
          data: string;
          dataPlaceholder: string;
        };
      };
    };
    chartTypes: {
      bar: string;
      line: string;
      pie: string;
      doughnut: string;
      radar: string;
      polarArea: string;
    };
    errors?: {
      invalidData: string;
    };
  };
}

/**
 * Default English locale (loaded from JSON)
 */
export const enLocale: EditorLocale = enLocaleData as EditorLocale;

/**
 * Locale registry
 * Maps locale codes to their JSON data
 * Note: 'zh' is Traditional Chinese, 'zh-CN' is Simplified Chinese
 */
const locales: Record<Locale, EditorLocale> = {
  en: enLocaleData as EditorLocale,
  zh: zhLocaleData as EditorLocale, // Traditional Chinese
  'zh-CN': zhCNLocaleData as EditorLocale, // Simplified Chinese
  ja: jaLocaleData as EditorLocale,
  ko: koLocaleData as EditorLocale,
  fr: frLocaleData as EditorLocale,
  de: deLocaleData as EditorLocale,
  es: esLocaleData as EditorLocale,
  pt: ptLocaleData as EditorLocale,
};

/**
 * Get locale by language code
 * Falls back to English if locale is not found
 */
export function getLocale(locale?: Locale | string): EditorLocale {
  if (!locale) {
    return enLocale;
  }

  // Normalize locale (e.g., 'zh-CN' -> 'zh-CN', 'zh' -> 'zh')
  const normalized = locale as Locale;

  return locales[normalized] || enLocale;
}

/**
 * Default locale
 */
export const defaultLocale: Locale = 'en';

export default {
  getLocale,
  defaultLocale,
  enLocale,
};
