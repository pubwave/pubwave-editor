/**
 * Chart Block Types
 *
 * Type definitions for the Chart block using Chart.js.
 * Charts are stored as node attributes in the ProseMirror document.
 */

import type { EditorLocale } from '../../i18n';

/**
 * Supported chart types in pubwave-editor
 */
export type PubwaveChartType =
  | 'bar'
  | 'line'
  | 'pie'
  | 'doughnut'
  | 'radar'
  | 'polarArea';

/**
 * Chart dataset configuration
 * Based on Chart.js dataset structure
 */
export interface ChartDataset {
  /** Label for the dataset (shown in legend/tooltip) */
  label?: string;
  /** Data values for this dataset */
  data: number[];
  /** Background color(s) for the dataset elements */
  backgroundColor?: string | string[];
  /** Border color(s) for the dataset elements */
  borderColor?: string | string[];
  /** Border width in pixels */
  borderWidth?: number;
  /** Additional Chart.js dataset options */
  [key: string]: unknown;
}

/**
 * Chart data structure
 * Based on Chart.js data format
 */
export interface ChartData {
  /** Labels for the x-axis (or for chart segments in pie/doughnut) */
  labels: string[];
  /** Array of datasets to display */
  datasets: ChartDataset[];
}

/**
 * Chart options structure
 * Based on Chart.js options format
 */
export interface ChartOptions {
  /** Chart title configuration */
  plugins?: {
    title?: {
      display?: boolean;
      text?: string;
      color?: string;
      font?: {
        size?: number;
        weight?: number | 'bold' | 'normal' | 'lighter' | 'bolder';
      };
    };
    legend?: {
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
      labels?: {
        color?: string;
        font?: {
          size?: number;
        };
        [key: string]: unknown;
      };
    };
  };
  /** Whether the chart should maintain aspect ratio */
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  /** Additional Chart.js options */
  [key: string]: unknown;
}

/**
 * Complete chart node data structure
 * This is stored as node attributes in the ProseMirror document
 */
export interface ChartNodeData {
  /** Type of chart to render */
  type: PubwaveChartType;
  /** Chart data (labels and datasets) */
  data: ChartData;
  /** Chart rendering options */
  options?: ChartOptions;
}

/**
 * Default colors for chart datasets
 * These colors work well on both light and dark backgrounds
 */
export const DEFAULT_CHART_COLORS = [
  'rgba(59, 130, 246, 0.7)', // blue
  'rgba(236, 72, 153, 0.7)', // pink
  'rgba(34, 197, 94, 0.7)', // green
  'rgba(251, 146, 60, 0.7)', // orange
  'rgba(139, 92, 246, 0.7)', // purple
  'rgba(14, 165, 233, 0.7)', // sky
  'rgba(244, 63, 94, 0.7)', // rose
  'rgba(234, 179, 8, 0.7)', // yellow
] as const;

/**
 * Default border colors (opaque versions of background colors)
 */
export const DEFAULT_BORDER_COLORS = [
  'rgba(59, 130, 246, 1)',
  'rgba(236, 72, 153, 1)',
  'rgba(34, 197, 94, 1)',
  'rgba(251, 146, 60, 1)',
  'rgba(139, 92, 246, 1)',
  'rgba(14, 165, 233, 1)',
  'rgba(244, 63, 94, 1)',
  'rgba(234, 179, 8, 1)',
] as const;

/**
 * Props for the ChartBlock component
 */
export interface ChartBlockProps {
  /** The chart data from node attributes */
  data: ChartNodeData;
  /** Whether the editor is editable */
  editable: boolean;
  /** Callback to update the chart data */
  onUpdate: (data: ChartNodeData) => void;
  /** Node view wrapper from TipTap */
  NodeViewWrapper: React.ComponentType<any>;
}

/**
 * Props for the ChartEditorModal component
 */
export interface ChartEditorModalProps {
  /** Current chart data */
  initialData: ChartNodeData;
  /** Callback when user saves the chart */
  onSave: (data: ChartNodeData) => void;
  /** Callback to close the modal without saving */
  onCancel: () => void;
  /** Locale for internationalization */
  locale?: EditorLocale;
}

/**
 * Default chart options for new charts
 */
export const DEFAULT_CHART_OPTIONS: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: 'Chart Title',
      color: 'var(--pubwave-text, #37352f)',
      font: {
        size: 16,
        weight: 'bold',
      },
    },
    legend: {
      display: true,
      position: 'top',
    },
  },
};

/**
 * Create a default chart dataset
 */
export function createDefaultDataset(
  label: string,
  data: number[],
  index: number
): ChartDataset {
  const colorIndex = index % DEFAULT_CHART_COLORS.length;
  return {
    label,
    data,
    backgroundColor: DEFAULT_CHART_COLORS[colorIndex],
    borderColor: DEFAULT_BORDER_COLORS[colorIndex],
    borderWidth: 2,
  };
}

/**
 * Create a default chart node data structure
 */
export function createDefaultChartData(type: PubwaveChartType): ChartNodeData {
  return {
    type,
    data: {
      labels: ['Category 1', 'Category 2', 'Category 3', 'Category 4'],
      datasets: [createDefaultDataset('Dataset 1', [12, 19, 3, 5], 0)],
    },
    options: { ...DEFAULT_CHART_OPTIONS },
  };
}
