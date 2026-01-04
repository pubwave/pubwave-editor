/**
 * SlashMenu Styles
 *
 * Style constants for the SlashMenu component.
 */

import type { CSSProperties } from 'react';

export const menuStyle: CSSProperties = {
  backgroundColor: 'var(--pubwave-bg, #ffffff)',
  border: `1px solid var(--pubwave-border, #e5e7eb)`,
  borderRadius: 'var(--pubwave-radius-lg, 8px)',
  boxShadow: 'var(--pubwave-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05))',
  maxHeight: '280px',
  overflowY: 'auto',
  minWidth: '240px',
  maxWidth: '300px',
  padding: 'var(--pubwave-spacing-1, 4px)',
  display: 'flex',
  flexDirection: 'column',
};

export const groupContainerStyle: CSSProperties = {
  marginBottom: '0',
};

export const groupLabelStyle: CSSProperties = {
  padding: 'var(--pubwave-spacing-2, 8px) var(--pubwave-spacing-3, 12px) var(--pubwave-spacing-1, 4px)',
  fontSize: 'var(--pubwave-font-size-xs, 11px)',
  fontWeight: 600,
  color: 'var(--pubwave-text-muted, #6b7280)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

export const itemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--pubwave-spacing-3, 12px)',
  width: '100%',
  padding: 'var(--pubwave-spacing-2, 8px) var(--pubwave-spacing-3, 12px)',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  borderRadius: 'var(--pubwave-radius-md, 6px)',
  transition: `background-color 0.1s ease`,
  fontSize: 'var(--pubwave-font-size-base, 14px)',
  color: 'var(--pubwave-text, #1a1a1a)',
};

export const iconStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'var(--pubwave-icon-size, 20px)',
  height: 'var(--pubwave-icon-size, 20px)',
  color: 'var(--pubwave-text-tertiary, #4b5563)',
  flexShrink: 0,
};

export const titleStyle: CSSProperties = {
  fontSize: 'var(--pubwave-font-size-base, 14px)',
  fontWeight: 400,
  color: 'var(--pubwave-text, #1a1a1a)',
};

