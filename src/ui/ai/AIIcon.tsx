/**
 * Sparkle icons used by AI affordances.
 *
 * The strokes use `currentColor` so callers control hue via theme tokens.
 */

import React from 'react';

export interface AIIconProps {
  size?: number;
  className?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}

export function AISparkleIcon({
  size = 16,
  className,
  ...rest
}: AIIconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={rest['aria-hidden'] ?? true}
    >
      <path d="M8 2v3.2M8 10.8V14M2 8h3.2M10.8 8H14" />
      <path d="M8 4.2 9.4 6.6 11.8 8 9.4 9.4 8 11.8 6.6 9.4 4.2 8 6.6 6.6 8 4.2Z" />
    </svg>
  );
}

export function AIStopIcon({
  size = 12,
  className,
}: AIIconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="8" height="8" rx="1" />
    </svg>
  );
}

export function AIRetryIcon({
  size = 14,
  className,
}: AIIconProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 8a5 5 0 0 1 8.6-3.5L13 6" />
      <path d="M13 3v3h-3" />
      <path d="M13 8a5 5 0 0 1-8.6 3.5L3 10" />
      <path d="M3 13v-3h3" />
    </svg>
  );
}
