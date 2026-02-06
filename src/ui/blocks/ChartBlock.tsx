/**
 * Chart Block Component
 *
 * Renders a Chart.js chart as a block in the editor.
 * Features:
 * - Editable via modal dialog
 * - Hover to show edit button
 * - Uses CSS variables for theme support
 * - Maintains aspect ratio
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import type { Chart } from 'chart.js';
import { ChartEditorModal } from './ChartEditorModal';
import type { ChartNodeData, PubwaveChartType } from './chartTypes';
import { useLocale } from '../LocaleContext';

// Lazy load Chart.js to avoid requiring it as a hard dependency
const loadChartJs = async (): Promise<typeof import('chart.js/auto')> => {
  return import('chart.js/auto');
};

/**
 * Get the actual color value from a CSS variable
 * @param element - The element to get the computed style from
 * @param varName - The CSS variable name (with or without var())
 * @param fallback - The fallback color value
 * @returns The resolved color value
 */
function getCSSVariableColor(
  element: HTMLElement,
  varName: string,
  fallback: string
): string {
  const computedStyle = getComputedStyle(element);
  const cleanVarName = varName.replace(/^var\(/, '').replace(/\)$/, '');
  const color = computedStyle.getPropertyValue(cleanVarName).trim();
  return color || fallback;
}

/**
 * ChartBlock Component
 *
 * Wraps the chart in a NodeViewWrapper and provides editing functionality.
 */
export function ChartBlock(props: NodeViewProps) {
  const { node, updateAttributes, editor, selected } = props;
  const chartData = node.attrs.data as ChartNodeData | null;
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const chartJsRef = useRef<typeof import('chart.js/auto').default | null>(null);

  const locale = useLocale();

  // Determine if editor is editable
  const editable = editor?.options?.editable ?? true;
  // In read-only mode, chart should not show selected state
  const isSelected = editable ? selected : false;

  /**
   * Update chart colors from CSS variables
   */
  const updateChartColors = useCallback(() => {
    if (!chartInstance || !chartJsRef.current || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const textColor = getCSSVariableColor(
      container,
      '--pubwave-text',
      '#37352f'
    );
    const textMutedColor = getCSSVariableColor(
      container,
      '--pubwave-text-muted',
      '#9b9a97'
    );
    const borderColor = getCSSVariableColor(
      container,
      '--pubwave-border',
      '#e3e2e0'
    );

    const plugins = chartInstance.options.plugins || {};
    const scales = chartInstance.options.scales as any;

    // Update legend color and ensure cursor events are set
    if (plugins.legend) {
      const legend = plugins.legend as any;
      if (legend.labels) {
        legend.labels.color = textColor;
      } else {
        (plugins.legend as any).labels = { color: textColor };
      }
      // Ensure onHover and onLeave events are set
      (legend as any).onHover = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.style.cursor = 'pointer';
        }
      };
      (legend as any).onLeave = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.style.cursor = 'default';
        }
      };
    }

    // Update title color if exists
    if (plugins.title) {
      (plugins.title as any).color = textColor;
    }

    // Update scales colors
    if (scales) {
      if (scales.x) {
        if (scales.x.ticks) scales.x.ticks.color = textMutedColor;
        if (scales.x.grid) scales.x.grid.color = borderColor;
        if (scales.x.title) scales.x.title.color = textColor;
        else scales.x.title = { color: textColor };
      }
      if (scales.y) {
        if (scales.y.ticks) scales.y.ticks.color = textMutedColor;
        if (scales.y.grid) scales.y.grid.color = borderColor;
        if (scales.y.title) scales.y.title.color = textColor;
        else scales.y.title = { color: textColor };
      }
    }

    chartInstance.update('none'); // Update without animation for instant theme change
  }, [chartInstance]);

  /**
   * Load Chart.js and render the chart
   */
  useEffect(() => {
    if (!canvasRef.current || !chartData) {
      return;
    }

    const renderChart = async () => {
      try {
        const ChartModule = await loadChartJs();
        const ChartJS = ChartModule.default;
        chartJsRef.current = ChartJS;

        // Destroy existing chart on the canvas if any
        if (canvasRef.current) {
          const existingChart = ChartJS.getChart(canvasRef.current);
          if (existingChart) {
            existingChart.destroy();
          }
        }

        // Also destroy our tracked chart instance
        if (chartInstance) {
          chartInstance.destroy();
        }

        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) {
          console.warn('Failed to get 2D context for chart');
          return;
        }

        // Get actual color values from CSS variables
        const container = containerRef.current;
        const textColor = container
          ? getCSSVariableColor(container, '--pubwave-text', '#37352f')
          : '#37352f';
        const textMutedColor = container
          ? getCSSVariableColor(container, '--pubwave-text-muted', '#9b9a97')
          : '#9b9a97';
        const borderColor = container
          ? getCSSVariableColor(container, '--pubwave-border', '#e3e2e0')
          : '#e3e2e0';

        // Merge chart options with theme colors
        const baseScales = (chartData.options?.scales as any) ?? {};
        const themedScales = shouldShowAxes(chartData.type)
          ? {
            x: {
              ...(baseScales.x ?? {}),
              ticks: { ...(baseScales.x?.ticks ?? {}), color: textMutedColor },
              grid: { ...(baseScales.x?.grid ?? {}), color: borderColor },
              title: { ...(baseScales.x?.title ?? {}), color: textColor },
            },
            y: {
              ...(baseScales.y ?? {}),
              ticks: { ...(baseScales.y?.ticks ?? {}), color: textMutedColor },
              grid: { ...(baseScales.y?.grid ?? {}), color: borderColor },
              title: { ...(baseScales.y?.title ?? {}), color: textColor },
            },
          }
          : undefined;

        const chartOptions = {
          ...chartData.options,
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            ...chartData.options?.plugins,
            legend: {
              display: chartData.options?.plugins?.legend?.display ?? true,
              position: chartData.options?.plugins?.legend?.position ?? 'top',
              ...(chartData.options?.plugins?.legend?.labels
                ? {
                  labels: {
                    ...chartData.options.plugins.legend.labels,
                    color: textColor,
                  },
                }
                : { labels: { color: textColor } }),
              onHover: () => {
                const canvas = canvasRef.current;
                if (canvas) {
                  canvas.style.cursor = 'pointer';
                }
              },
              onLeave: () => {
                const canvas = canvasRef.current;
                if (canvas) {
                  canvas.style.cursor = 'default';
                }
              },
            } as any,
            title: chartData.options?.plugins?.title
              ? {
                ...chartData.options.plugins.title,
                color: textColor,
                ...(chartData.options.plugins.title.font
                  ? { font: { ...chartData.options.plugins.title.font } }
                  : {}),
              }
              : undefined,
          },
          scales: themedScales,
        };

        // Create new chart
        const newChart = new ChartJS(ctx, {
          type: chartData.type,
          data: chartData.data,
          options: chartOptions,
        });

        setChartInstance(newChart);
      } catch (error) {
        console.error('Failed to load Chart.js:', error);
      }
    };

    renderChart();

    // Cleanup on unmount
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [chartData, editable]);

  /**
   * Update chart when theme changes (watch for CSS variable changes)
   */
  useEffect(() => {
    if (!chartInstance || !containerRef.current) {
      return;
    }

    // Update chart colors when theme changes
    const handleThemeChange = () => {
      // Use setTimeout to ensure CSS variables are updated before reading them
      setTimeout(() => {
        updateChartColors();
      }, 0);
    };

    // Use MutationObserver to detect style attribute changes (where CSS variables are set)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.attributeName === 'style' ||
          mutation.attributeName === 'class'
        ) {
          handleThemeChange();
        }
      });
    });

    // Observe all parent elements up to the editor container
    let element: HTMLElement | null = containerRef.current;
    while (element) {
      observer.observe(element, { attributes: true });
      // Stop if we reach a known editor container or body
      if (
        element.classList.contains('pubwave-editor') ||
        element === document.body
      ) {
        break;
      }
      element = element.parentElement;
    }

    // Also observe document.body for class changes
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
    };
  }, [chartInstance, updateChartColors]);

  /**
   * Determine if the chart type should show axes
   */
  function shouldShowAxes(type: PubwaveChartType): boolean {
    return ['bar', 'line', 'radar'].includes(type);
  }

  /**
   * Handle save from the edit modal
   */
  const handleSave = useCallback(
    (newData: ChartNodeData) => {
      updateAttributes({ data: newData });
      setIsEditing(false);
    },
    [updateAttributes]
  );

  /**
   * Handle cancel from the edit modal
   */
  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  /**
   * Handle edit button click
   */
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  if (!chartData) {
    return (
      <NodeViewWrapper className="pubwave-editor__chart">
        <div className="pubwave-chart__placeholder">Invalid chart data</div>
      </NodeViewWrapper>
    );
  }

  const chartHeight = (chartData.options as any)?.height;
  const chartMinHeight = (chartData.options as any)?.minHeight;
  const wrapperStyle =
    chartHeight || chartMinHeight
      ? {
          height: chartHeight ? `${chartHeight}px` : undefined,
          minHeight: chartMinHeight ? `${chartMinHeight}px` : undefined,
        }
      : undefined;

  return (
    <NodeViewWrapper
      ref={containerRef}
      className="pubwave-editor__chart"
      data-selected={isSelected}
      data-chart-type={chartData.type}
    >
      <div
        className="pubwave-chart__container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="pubwave-chart__canvas-wrapper" style={wrapperStyle}>
          <canvas ref={canvasRef} className="pubwave-chart__canvas" />
        </div>

        {editable && (isHovered || isSelected) && (
          <button
            type="button"
            className="pubwave-chart__edit-button"
            onClick={handleEdit}
            aria-label="Edit chart"
            title="Edit chart"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
      </div>

      {isEditing && chartData && (
        <ChartEditorModal
          initialData={chartData}
          onSave={handleSave}
          onCancel={handleCancel}
          locale={locale}
        />
      )}
    </NodeViewWrapper>
  );
}

export default ChartBlock;
