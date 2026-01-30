/**
 * Image Extension
 *
 * Adds image support with paste/upload handling.
 */

import type { AnyExtension } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { ImageUploadConfig } from '../../types/editor';

/**
 * Upload image file and return URL.
 * Uses custom handler if provided, otherwise converts to base64.
 */
async function uploadImage(
  file: File,
  config?: ImageUploadConfig
): Promise<string> {
  const maxSize = config?.maxSize ?? 10 * 1024 * 1024; // 10MB default
  if (file.size > maxSize) {
    throw new Error(
      `Image file is too large. Maximum size is ${maxSize / 1024 / 1024}MB`
    );
  }

  if (config?.handler) {
    try {
      return await config.handler(file);
    } catch (error) {
      console.warn(
        'Custom image upload failed, falling back to base64:',
        error
      );
    }
  }

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

export function createImageExtension(
  imageUpload?: ImageUploadConfig
): AnyExtension {
  return Image.extend({
    addProseMirrorPlugins() {
      return [
        new Plugin({
          key: new PluginKey('imagePasteHandler'),
          props: {
            handlePaste: (view, event) => {
              const items = Array.from(event.clipboardData?.items || []);

              for (const item of items) {
                if (item.type.indexOf('image') === 0) {
                  event.preventDefault();

                  const file = item.getAsFile();
                  if (file) {
                    uploadImage(file, imageUpload)
                      .then((src) => {
                        const { state, dispatch } = view;
                        const imageNodeType = state.schema.nodes.image;

                        if (imageNodeType) {
                          const imageNode = imageNodeType.create({
                            src,
                          });

                          const transaction =
                            state.tr.replaceSelectionWith(imageNode);
                          dispatch(transaction);
                        }
                      })
                      .catch((error) => {
                        console.error('Failed to upload image:', error);
                      });

                    return true;
                  }
                }
              }

              return false;
            },
          },
        }),
      ];
    },
  }).configure({
    inline: false,
    allowBase64: true,
    HTMLAttributes: {
      class: 'pubwave-editor__image',
    },
  });
}
