/**
 * Chart Editor Modal
 *
 * A modal dialog for editing chart data.
 * Features:
 * - Edit chart type, title, labels, and datasets
 * - Add/remove datasets
 * - Uses createPortal for proper z-index layering
 * - Responsive design
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import type {
  ChartEditorModalProps,
  ChartNodeData,
  PubwaveChartType,
  ChartDataset,
} from './chartTypes';

/**
 * All supported chart types for the dropdown
 */
const CHART_TYPES: Array<{ value: PubwaveChartType; label: string }> = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'doughnut', label: 'Doughnut Chart' },
  { value: 'radar', label: 'Radar Chart' },
  { value: 'polarArea', label: 'Polar Area Chart' },
];

/**
 * Get default color for a dataset index
 */
function getDefaultColor(index: number): { backgroundColor: string; borderColor: string } {
  return {
    backgroundColor: `rgba(59, 130, 246, ${0.5 + (index % 3) * 0.2})`,
    borderColor: `rgba(59, 130, 246, 1)`,
  };
}

/**
 * ChartEditorModal Component
 *
 * Renders a modal dialog for editing chart data.
 */
export function ChartEditorModal({ initialData, onSave, onCancel }: ChartEditorModalProps) {
  // Local state for form data
  const [chartType, setChartType] = useState<PubwaveChartType>(initialData.type);
  const [chartTitle, setChartTitle] = useState(initialData.options?.plugins?.title?.text ?? '');
  const [showLegend, setShowLegend] = useState(initialData.options?.plugins?.legend?.display ?? true);
  const [legendPosition, setLegendPosition] = useState<'top' | 'bottom' | 'left' | 'right'>(
    (initialData.options?.plugins?.legend?.position as any) ?? 'bottom'
  );
  const [labels, setLabels] = useState<string[]>(initialData.data.labels);
  const [datasets, setDatasets] = useState<ChartDataset[]>(initialData.data.datasets);

  // Modal ref for click-outside detection
  const modalRef = useRef<HTMLDivElement>(null);

  /**
   * Handle ESC key to close modal
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  /**
   * Handle click outside modal
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        // Don't close if clicking on a child element (like inputs)
        // This is handled by the modal overlay
      }
    };

    // Add a small delay to avoid immediately closing on open
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Update dataset label
   */
  const updateDatasetLabel = useCallback((index: number, label: string) => {
    setDatasets((prev) =>
      prev.map((ds, i) => (i === index ? { ...ds, label } : ds))
    );
  }, []);

  /**
   * Update dataset data
   */
  const updateDatasetData = useCallback((index: number, data: string) => {
    setDatasets((prev) =>
      prev.map((ds, i) =>
        i === index
          ? { ...ds, data: data.split(',').map((s) => parseFloat(s.trim()) || 0) }
          : ds
      )
    );
  }, []);

  /**
   * Add a new dataset
   */
  const addDataset = useCallback(() => {
    const colors = getDefaultColor(datasets.length);
    setDatasets((prev) => [
      ...prev,
      {
        label: `Dataset ${prev.length + 1}`,
        data: labels.map(() => Math.floor(Math.random() * 100)),
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        borderWidth: 2,
      },
    ]);
  }, [datasets.length, labels]);

  /**
   * Remove a dataset
   */
  const removeDataset = useCallback((index: number) => {
    setDatasets((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Update labels
   */
  const updateLabels = useCallback((value: string) => {
    setLabels(value.split(',').map((s) => s.trim()).filter(Boolean));
  }, []);

  /**
   * Handle save
   */
  const handleSave = useCallback(() => {
    const newData: ChartNodeData = {
      type: chartType,
      data: {
        labels,
        datasets,
      },
      options: {
        ...initialData.options,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!chartTitle,
            text: chartTitle,
            color: 'var(--pubwave-text, #37352f)',
            font: {
              size: 16,
              weight: 'bold' as const,
            },
          },
          legend: {
            display: showLegend,
            position: legendPosition,
          },
        },
      },
    };

    onSave(newData);
  }, [chartType, chartTitle, showLegend, legendPosition, labels, datasets, initialData.options, onSave]);

  /**
   * Handle overlay click (close modal)
   */
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  }, [onCancel]);

  const modalContent = (
    <div className="pubwave-modal__overlay" onClick={handleOverlayClick}>
      <div ref={modalRef} className="pubwave-modal__container" role="dialog" aria-modal="true" aria-labelledby="chart-modal-title">
        <div className="pubwave-modal__header">
          <h2 id="chart-modal-title" className="pubwave-modal__title">Edit Chart</h2>
          <button
            type="button"
            className="pubwave-modal__close"
            onClick={onCancel}
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="pubwave-modal__body">
          {/* Chart Type */}
          <div className="pubwave-form__field">
            <label htmlFor="chart-type" className="pubwave-form__label">Chart Type</label>
            <select
              id="chart-type"
              className="pubwave-form__select"
              value={chartType}
              onChange={(e) => setChartType(e.target.value as PubwaveChartType)}
            >
              {CHART_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Chart Title */}
          <div className="pubwave-form__field">
            <label htmlFor="chart-title" className="pubwave-form__label">Title</label>
            <input
              id="chart-title"
              type="text"
              className="pubwave-form__input"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
              placeholder="Chart title..."
            />
          </div>

          {/* Legend Settings */}
          <div className="pubwave-form__row">
            <div className="pubwave-form__field">
              <label className="pubwave-form__checkbox-label">
                <input
                  type="checkbox"
                  className="pubwave-form__checkbox"
                  checked={showLegend}
                  onChange={(e) => setShowLegend(e.target.checked)}
                />
                Show Legend
              </label>
            </div>
            {showLegend && (
              <div className="pubwave-form__field">
                <label htmlFor="legend-position" className="pubwave-form__label">Position</label>
                <select
                  id="legend-position"
                  className="pubwave-form__select"
                  value={legendPosition}
                  onChange={(e) => setLegendPosition(e.target.value as 'top' | 'bottom' | 'left' | 'right')}
                >
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            )}
          </div>

          {/* Labels */}
          <div className="pubwave-form__field">
            <label htmlFor="chart-labels" className="pubwave-form__label">Labels (comma-separated)</label>
            <input
              id="chart-labels"
              type="text"
              className="pubwave-form__input"
              value={labels.join(', ')}
              onChange={(e) => updateLabels(e.target.value)}
              placeholder="Jan, Feb, Mar, Apr..."
            />
          </div>

          {/* Datasets */}
          <div className="pubwave-form__section">
            <div className="pubwave-form__section-header">
              <h3 className="pubwave-form__section-title">Datasets</h3>
              <button
                type="button"
                className="pubwave-button pubwave-button--secondary pubwave-button--small"
                onClick={addDataset}
              >
                + Add Dataset
              </button>
            </div>

            {datasets.map((dataset, index) => (
              <div key={index} className="pubwave-form__dataset">
                <div className="pubwave-form__dataset-header">
                  <span className="pubwave-form__dataset-title">Dataset {index + 1}</span>
                  {datasets.length > 1 && (
                    <button
                      type="button"
                      className="pubwave-button pubwave-button--danger pubwave-button--small"
                      onClick={() => removeDataset(index)}
                      aria-label={`Remove dataset ${index + 1}`}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="pubwave-form__field">
                  <label htmlFor={`dataset-label-${index}`} className="pubwave-form__label">Label</label>
                  <input
                    id={`dataset-label-${index}`}
                    type="text"
                    className="pubwave-form__input"
                    value={dataset.label ?? ''}
                    onChange={(e) => updateDatasetLabel(index, e.target.value)}
                    placeholder="Dataset label..."
                  />
                </div>

                <div className="pubwave-form__field">
                  <label htmlFor={`dataset-data-${index}`} className="pubwave-form__label">Data (comma-separated numbers)</label>
                  <input
                    id={`dataset-data-${index}`}
                    type="text"
                    className="pubwave-form__input"
                    value={dataset.data.join(', ')}
                    onChange={(e) => updateDatasetData(index, e.target.value)}
                    placeholder="10, 20, 30, 40..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pubwave-modal__footer">
          <button
            type="button"
            className="pubwave-button pubwave-button--secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="pubwave-button pubwave-button--primary"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

  // Render modal at document.body level for proper z-index
  return createPortal(modalContent, document.body);
}

export default ChartEditorModal;
