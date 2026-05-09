/**
 * AI UI barrel
 */

export { AIBar } from './AIBar';
export type { AIBarProps } from './AIBar';
export { AIToolbarButton } from './AIToolbarButton';
export { AISparkleIcon, AIStopIcon, AIRetryIcon } from './AIIcon';
export { fallbackBarStrings } from './aiBarStrings';
export type { AIBarStrings } from './aiBarStrings';
export { AI_OPEN_EVENT } from './openEvent';
export type { AIOpenEvent, AIOpenEventDetail } from './openEvent';
export { markdownToHTML } from './markdown';
export {
  aiPreviewPluginKey,
  getAIPreviewRange,
  createAIPreviewPlugin,
} from '../../core/plugins/aiPreview';
export type { AIPreviewRange } from '../../core/plugins/aiPreview';
