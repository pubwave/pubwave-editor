/**
 * @pubwave/editor - A Notion-level block editor built with React and Tiptap
 *
 * This is the public API surface of the library.
 * All exports here are considered stable and part of the public contract.
 */

// Types
export type {
  EditorConfig,
  EditorAPI,
  EditorState,
  EditorTheme,
  EditorLocale,
  BlockType,
  MarkType,
  SelectionState,
  MarkState,
} from './types/editor';

// Core
export { createEditor, destroyEditor, isEditorValid } from './core/createEditor';
export { SUPPORTED_BLOCKS, SUPPORTED_MARKS, createExtensions } from './core/extensions';
export {
  getSelectionState,
  isSelectionEmpty,
  shouldShowToolbar,
  getSelectionBounds,
} from './core/selection';
export {
  toggleBold,
  toggleItalic,
  setLink,
  unsetLink,
  setParagraph,
  setHeading,
  toggleHeading,
  undo,
  redo,
  focusEditor,
  selectAll,
  clearFormatting,
  isMarkActive,
  isNodeActive,
  getActiveMarks,
  getActiveLinkHref,
} from './core/commands';

// UI Components
export { PubwaveEditor } from './ui/PubwaveEditor';
export { BubbleToolbar } from './ui/BubbleToolbar';
export type { BubbleToolbarProps, ToolbarPosition } from './ui/BubbleToolbar';
export {
  SlashMenuList,
  createSlashCommandsExtension,
  defaultSlashCommands,
} from './ui/SlashMenu';
export type { SlashCommand } from './ui/SlashMenu';

// UI Guards
export {
  isReadOnly,
  isEditable,
  shouldRenderEditUI,
  shouldAllowToolbar,
  shouldShowDragHandle,
  shouldAllowInteraction,
} from './ui/readOnlyGuards';

// Focus Management
export {
  focusAt,
  restoreFocus,
  focusAfterClick,
  maintainFocus,
  saveSelection,
  restoreSelection,
  handleSelectionClear,
  createFocusTrap,
} from './ui/focus';
export type { FocusPosition, SavedSelection } from './ui/focus';

// Theme
export { cn, tokens, defaultTokens } from './ui/theme';

// Toolbar Actions
export {
  toggleBold as toolbarToggleBold,
  toggleItalic as toolbarToggleItalic,
  setLink as toolbarSetLink,
  removeLink as toolbarRemoveLink,
  toggleLink as toolbarToggleLink,
  setHeading as toolbarSetHeading,
  setParagraph as toolbarSetParagraph,
  createActionHandler,
  defaultToolbarActions,
} from './ui/toolbar/actions';
export type { ActionResult, ToolbarActionDescriptor } from './ui/toolbar/actions';

// Drag and Drop
export { DragHandle } from './ui/dnd/DragHandle';
export type { DragHandleProps } from './ui/dnd/DragHandle';
export { BlockHandle } from './ui/dnd/BlockHandle';
export type { BlockHandleProps } from './ui/dnd/BlockHandle';
export { DropIndicator } from './ui/dnd/DropIndicator';
export type { DropIndicatorProps } from './ui/dnd/DropIndicator';
export {
  createDndPlugin,
  dndPluginKey,
  getDndState,
  startDrag,
  cancelDrag,
  moveBlock,
  findBlockAtPos,
} from './core/plugins/dnd';
export type { DndState } from './core/plugins/dnd';
export { createAutoScroller, useAutoScroll } from './ui/dnd/autoScroll';

// Toast Notifications
export { Toast, ToastContainer, createToastId } from './ui/toast';
export type { ToastProps, ToastItem, ToastContainerProps } from './ui/toast';

// Utilities
export { isSSR, canUseDOM } from './core/ssr';
