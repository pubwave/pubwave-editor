/**
 * Drop Indicator Overlay Component
 *
 * Renders the visible drop line indicator using React.
 * Subscribes to the DnD plugin state for position updates.
 * Calculates precise DOM position relative to the editor container.
 */

import React, { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/core';
import { dndPluginKey, DndState } from '../../core/plugins/dnd';
import { DropIndicator } from './DropIndicator';

export interface DropIndicatorOverlayProps {
    editor: Editor;
}

export function DropIndicatorOverlay({ editor }: DropIndicatorOverlayProps): React.ReactElement | null {
    const [dndState, setDndState] = useState<DndState | null>(null);
    const [position, setPosition] = useState<{ top: number; width: number; left: number } | null>(null);

    // Subscribe to editor updates to get the plugin state
    useEffect(() => {
        // Initial state
        const pluginState = dndPluginKey.getState(editor.state) as DndState | undefined;
        if (pluginState) {
            setDndState(pluginState);
        }

        // Subscribe to transactions
        const handleUpdate = () => {
            const newState = dndPluginKey.getState(editor.state) as DndState | undefined;
            // Simple shallow comparison to avoid unnecessary renders
            if (newState && (
                newState.dropTargetPos !== dndState?.dropTargetPos ||
                newState.dropPosition !== dndState?.dropPosition
            )) {
                setDndState(newState);
            }
        };

        editor.on('transaction', handleUpdate);
        return () => {
            editor.off('transaction', handleUpdate);
        };
    }, [editor, dndState]);

    // Update DOM position when state changes
    useEffect(() => {
        if (!dndState?.dropTargetPos || !dndState.dropPosition) {
            setPosition(null);
            return;
        }

        // We need to wait for DOM to be ready, potential layout shift?
        // Use requestAnimationFrame to ensure we measure after any potential renders
        const frameId = requestAnimationFrame(() => {
            const view = editor.view;
            const pos = dndState.dropTargetPos;

            if (pos === null) return;

            // Find the approximate DOM node for this position
            // For block drops, we usually want the block node itself
            let domNode = view.nodeDOM(pos) as HTMLElement | null;

            // Ensure we have an HTML element
            if (!domNode && pos > 0) {
                // Retry slightly differently if needed, but nodeDOM usually works for block starts
                // Or find node at pos
                const node = view.domAtPos(pos).node as HTMLElement;
                if (node instanceof HTMLElement) domNode = node;
            }

            // If still no node, fallback or abort
            if (!domNode || !(domNode instanceof HTMLElement)) {
                return;
            }

            // Check content rect
            const rect = domNode.getBoundingClientRect();
            const editorRect = view.dom.closest('.pubwave-editor')?.getBoundingClientRect();

            if (!editorRect) return;

            // Standard offset 0.5em approx 8px
            const OFFSET = 8;

            let top = 0;
            if (dndState.dropPosition === 'before') {
                top = rect.top - editorRect.top - OFFSET;
            } else {
                top = rect.bottom - editorRect.top + OFFSET;
            }

            setPosition({
                top,
                left: rect.left - editorRect.left,
                width: rect.width,
            });
        });

        return () => cancelAnimationFrame(frameId);
    }, [dndState, editor]);

    if (!dndState?.dropTargetPos || !dndState.dropPosition || !position) {
        return null;
    }

    // Reuse the existing DropIndicator UI but position it ourselves
    return (
        <div
            style={{
                position: 'absolute',
                top: position.top,
                left: position.left,
                width: position.width,
                height: '2px', // Container for the indicator line
                pointerEvents: 'none',
                zIndex: 50, // High z-index to show above everything
            }}
        >
            <DropIndicator visible={true} position={dndState.dropPosition} className="pubwave-drop-indicator--overlay" />
        </div>
    );
}
