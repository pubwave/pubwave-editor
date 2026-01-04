/**
 * useScrollIntoView Hook
 *
 * Custom hook for handling scroll behavior in SlashMenu.
 * Ensures selected items are visible while preserving top/bottom content visibility.
 */

import { useEffect, RefObject } from 'react';

/**
 * Hook to handle scrolling selected item into view
 * @param selectedIndex - Index of the currently selected item
 * @param menuRef - Ref to the menu container element
 * @param selectedItemRef - Ref to the currently selected item element
 */
export function useScrollIntoView(
  selectedIndex: number,
  menuRef: RefObject<HTMLDivElement>,
  selectedItemRef: RefObject<HTMLButtonElement>
): void {
  useEffect(() => {
    if (selectedIndex >= 0 && selectedItemRef.current && menuRef.current) {
      const menu = menuRef.current;
      const selectedItem = selectedItemRef.current;

      const menuScrollTop = menu.scrollTop;
      const menuClientHeight = menu.clientHeight;
      const menuScrollHeight = menu.scrollHeight;
      const itemOffsetTop = selectedItem.offsetTop;
      const itemHeight = selectedItem.offsetHeight;

      // Find first group and first item for top visibility check
      const firstGroup = menu.querySelector('.pubwave-slash-menu__group') as HTMLElement | null;
      const firstItem = menu.querySelector('.pubwave-slash-menu__item') as HTMLElement | null;
      const lastItem = Array.from(menu.querySelectorAll('.pubwave-slash-menu__item')).pop() as HTMLElement | null;

      // Calculate item position relative to visible area
      const itemTopRelative = itemOffsetTop - menuScrollTop;
      const itemBottomRelative = itemTopRelative + itemHeight;

      // Check if we need to scroll
      let targetScrollTop = menuScrollTop;

      // If item is above visible area, scroll up but ensure first group/item remains visible
      if (itemTopRelative < 0) {
        targetScrollTop = itemOffsetTop - 4; // 4px padding from top
        // Ensure first group is still visible (must be at or above scrollTop)
        if (firstGroup && targetScrollTop > firstGroup.offsetTop) {
          targetScrollTop = Math.max(0, firstGroup.offsetTop);
        }
        // Ensure first item is still visible (must be at or above scrollTop + small padding)
        if (firstItem && targetScrollTop > firstItem.offsetTop - 2) {
          targetScrollTop = Math.max(0, firstItem.offsetTop - 2);
        }
      }
      // If item is below visible area, scroll down but ensure last item remains visible
      else if (itemBottomRelative > menuClientHeight) {
        targetScrollTop = itemOffsetTop - menuClientHeight + itemHeight + 4; // 4px padding from bottom
        // Ensure last item is still visible (with some padding at bottom)
        if (lastItem) {
          const lastItemBottom = lastItem.offsetTop + lastItem.offsetHeight;
          const maxScrollTop = lastItemBottom - menuClientHeight + 2; // 2px padding from bottom
          if (targetScrollTop > maxScrollTop) {
            targetScrollTop = maxScrollTop;
          }
        }
        // Don't scroll beyond maximum
        targetScrollTop = Math.min(menuScrollHeight - menuClientHeight, targetScrollTop);
      }
      // If item is already visible, don't scroll to preserve top/bottom visibility

      // Only update scroll if it changed
      if (Math.abs(targetScrollTop - menuScrollTop) > 0.5) {
        menu.scrollTop = targetScrollTop;
      }
    }
  }, [selectedIndex, menuRef, selectedItemRef]);
}

