/**
 * Image Upload Utilities
 *
 * Functions for handling image uploads in SlashMenu.
 */

import type { Editor } from '@tiptap/core';
import type { ImageUploadConfig } from '../../types/editor';

/**
 * Upload image file and return URL
 * Uses custom handler if provided, otherwise converts to base64
 */
export async function uploadImage(
  file: File,
  config?: ImageUploadConfig
): Promise<string> {
  const maxSize = config?.maxSize ?? 10 * 1024 * 1024; // 10MB default
  if (file.size > maxSize) {
    throw new Error(`Image file is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
  }

  // If custom handler is provided, use it
  if (config?.handler) {
    try {
      return await config.handler(file);
    } catch (error) {
      console.warn('Custom image upload failed, falling back to base64:', error);
      // Fall through to base64 conversion
    }
  }

  // Default: convert to base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (src) {
        resolve(src);
      } else {
        reject(new Error('Failed to read image file'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Handle image upload from file
 */
export function handleImageUpload(editor: Editor, file: File, imageUploadConfig?: ImageUploadConfig): void {
  // Check if file is an image
  const accept = imageUploadConfig?.accept ?? ['image/*'];
  const isImage = accept.some((pattern) => {
    if (pattern === 'image/*') {
      return file.type.startsWith('image/');
    }
    return file.type === pattern;
  });

  if (!isImage) {
    console.warn('Selected file is not an image');
    return;
  }

  // Upload image (uses custom handler or base64)
  uploadImage(file, imageUploadConfig)
    .then((src) => {
      // Insert image at current position
      editor
        .chain()
        .focus()
        .setImage({ src })
        .run();
    })
    .catch((error) => {
      console.error('Failed to upload image:', error);
    });
}

