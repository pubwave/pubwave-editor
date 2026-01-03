/**
 * Extensions Unit Tests - Core Tests Only
 * 
 * Core tests for extension configuration.
 */

import { describe, it, expect } from 'vitest';
import {
  SUPPORTED_BLOCKS,
  SUPPORTED_MARKS,
  createExtensions,
} from '../../src/core/extensions';

describe('Extensions', () => {
  it('should export SUPPORTED_BLOCKS', () => {
    expect(SUPPORTED_BLOCKS).toBeDefined();
    expect(Array.isArray(SUPPORTED_BLOCKS)).toBe(true);
    expect(SUPPORTED_BLOCKS.length).toBeGreaterThan(0);
  });

  it('should export SUPPORTED_MARKS', () => {
    expect(SUPPORTED_MARKS).toBeDefined();
    expect(Array.isArray(SUPPORTED_MARKS)).toBe(true);
    expect(SUPPORTED_MARKS.length).toBeGreaterThan(0);
  });

  it('should create extensions with default config', () => {
    const extensions = createExtensions();
    expect(extensions).toBeDefined();
    expect(Array.isArray(extensions)).toBe(true);
    expect(extensions.length).toBeGreaterThan(0);
  });

  it('should create extensions with custom placeholder', () => {
    const extensions = createExtensions({ placeholder: 'Custom placeholder' });
    expect(extensions).toBeDefined();
    expect(extensions.length).toBeGreaterThan(0);
  });
});
