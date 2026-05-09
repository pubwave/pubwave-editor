/**
 * AI config context
 *
 * Lets internal UI surfaces (bubble toolbar, etc.) discover whether AI is
 * configured without prop drilling. Mirrors `LocaleContext`.
 */

import { createContext, useContext } from 'react';
import type { AIConfig } from '../../core/ai/types';

interface AIConfigContextValue {
  config: AIConfig | null;
}

const AIConfigContext = createContext<AIConfigContextValue>({ config: null });

export const AIConfigProvider = AIConfigContext.Provider;

export function useAIConfig(): AIConfig | null {
  return useContext(AIConfigContext).config;
}
