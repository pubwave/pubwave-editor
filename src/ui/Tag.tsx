import React from 'react';
import type { EditorTheme } from '../types/editor';
import { cn, tokens } from './theme';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'soft' | 'outline' | 'solid';
  size?: 'sm' | 'md';
  tone?: 'primary' | 'neutral';
  theme?: Pick<EditorTheme, 'colors'>;
  colors?: {
    background?: string;
    text?: string;
    border?: string;
  };
  spacing?: string;
}

function createThemeStyles(
  theme?: Pick<EditorTheme, 'colors'>
): React.CSSProperties & Record<string, string> {
  const colors = theme?.colors;

  if (!colors) {
    return {};
  }

  const style: React.CSSProperties & Record<string, string> = {};

  if (colors.background) {
    style['--pubwave-color-background'] = colors.background;
    style['--pubwave-color-surface'] = colors.background;
  }
  if (colors.text) {
    style['--pubwave-color-text'] = colors.text;
  }
  if (colors.textMuted) {
    style['--pubwave-color-text-muted'] = colors.textMuted;
  }
  if (colors.border) {
    style['--pubwave-color-border'] = colors.border;
  }
  if (colors.primary) {
    style['--pubwave-color-primary'] = colors.primary;
    style['--pubwave-color-primary-faded'] = `color-mix(in srgb, ${colors.primary} 14%, transparent)`;
  }
  if (colors.linkColor && !colors.primary) {
    style['--pubwave-color-primary'] = colors.linkColor;
    style['--pubwave-color-primary-faded'] = `color-mix(in srgb, ${colors.linkColor} 14%, transparent)`;
  }

  return style;
}

export function Tag({
  children,
  className,
  variant = 'soft',
  size = 'md',
  tone = 'primary',
  theme,
  colors,
  spacing,
  style,
  ...props
}: TagProps): React.ReactElement {
  return (
    <span
      className={cn(
        'pubwave-tag',
        `pubwave-tag--${variant}`,
        `pubwave-tag--${size}`,
        `pubwave-tag--${tone}`,
        className
      )}
      style={{
        fontFamily: tokens.typography.fontFamily,
        ...createThemeStyles(theme),
        ...(colors?.background
          ? { '--pubwave-tag-custom-bg': colors.background }
          : null),
        ...(colors?.text ? { '--pubwave-tag-custom-text': colors.text } : null),
        ...(colors?.border
          ? { '--pubwave-tag-custom-border': colors.border }
          : null),
        ...(colors?.background ? { backgroundColor: colors.background } : null),
        ...(colors?.text ? { color: colors.text } : null),
        ...(colors?.border ? { borderColor: colors.border } : null),
        ...(spacing
          ? {
              '--pubwave-tag-spacing': spacing,
              marginRight: spacing,
              marginInlineEnd: spacing,
            }
          : null),
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}

export default Tag;
