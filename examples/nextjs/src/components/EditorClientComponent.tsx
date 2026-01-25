'use client';

import { useState } from 'react';
import { PubwaveEditor } from '@pubwave/editor';
import type { EditorTheme, EditorLocale } from '@pubwave/editor';
import type { JSONContent } from '@tiptap/core';
import { PreviewModal } from './PreviewModal';
import '@pubwave/editor/style.css';

// Chart images as base64 (SVG converted to data URLs) - AI themed
const chartDashboard =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBzdHlsZT0iYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgI2Y4ZmFmYyAwJSwgI2ZmZmZmZiAxMDAlKTsiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2MzY2ZjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM4YjVjZjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmZmZmIi8+PHRleHQgeD0iNDAiIHk9IjM1IiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIE94eWdlbiwgVWJ1bnR1LCBDYW50YXJlbGwsICdIZWx2ZXRpY2EgTmV1ZScsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMxZjI5MzciPkFJIFN5c3RlbSBQZXJmb3JtYW5jZSBEYXNoYm9hcmQ8L3RleHQ+PHJlY3QgeD0iNDAiIHk9IjgwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjEyMCIgZmlsbD0idXJsKCNncmFkKSIgcng9IjgiLz48dGV4dCB4PSI1MCIgeT0iMTEwIiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIE94eWdlbiwgVWJ1bnR1LCBDYW50YXJlbGwsICdIZWx2ZXRpY2EgTmV1ZScsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmZmZmYiPjEwMCs8L3RleHQ+PHRleHQgeD0iNTAiIHk9IjEzNSIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBPeHlnZW4sIFVidW50dSwgQ2FudGFyZWxsLCAnSGVsdmV0aWNhIE5ldWUnLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjkiPk1vZGVsczwvdGV4dD48cmVjdCB4PSIyNjAiIHk9IjgwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2VjNDg5OSIgcng9IjgiLz48dGV4dCB4PSIyNzAiIHk9IjExMCIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBPeHlnZW4sIFVidW50dSwgQ2FudGFyZWxsLCAnSGVsdmV0aWNhIE5ldWUnLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZmZmZmZmIj4xME0rPC90ZXh0Pjx0ZXh0IHg9IjI3MCIgeT0iMTM1IiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIE94eWdlbiwgVWJ1bnR1LCBDYW50YXJlbGwsICdIZWx2ZXRpY2EgTmV1ZScsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNmZmZmZmYiIG9wYWNpdHk9IjAuOSI+UHJlZGljdGlvbnM8L3RleHQ+PHJlY3QgeD0iNDgwIiB5PSI4MCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiMzYjgyZjYiIHJ4PSI4Ii8+PHRleHQgeD0iNDkwIiB5PSIxMTAiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgT3h5Z2VuLCBVYnVudHUsIENhbnRhcmVsbCwgJ0hlbHZldGljYSBOZXVlJywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZmZmZiI+OTklKzwvdGV4dD48dGV4dCB4PSI0OTAiIHk9IjEzNSIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBPeHlnZW4sIFVidW50dSwgQ2FudGFyZWxsLCAnSGVsdmV0aWNhIE5ldWUnLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjkiPkFjY3VyYWN5PC90ZXh0PjxyZWN0IHg9IjQwIiB5PSIyMjAiIHdpZHRoPSIxODAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMzhiZGY4IiByeD0iOCIvPjx0ZXh0IHg9IjUwIiB5PSIyNTAiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgT3h5Z2VuLCBVYnVudHUsIENhbnRhcmVsbCwgJ0hlbHZldGljYSBOZXVlJywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZmZmZiI+NTArPC90ZXh0Pjx0ZXh0IHg9IjUwIiB5PSIyNzUiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgT3h5Z2VuLCBVYnVudHUsIENhbnRhcmVsbCwgJ0hlbHZldGljYSBOZXVlJywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC45Ij5EYXRhc2V0czwvdGV4dD48cmVjdCB4PSIyNjAiIHk9IjIyMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiNmNTU3NmMiIHJ4PSI4Ii8+PHRleHQgeD0iMjcwIiB5PSIyNTAiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgT3h5Z2VuLCBVYnVudHUsIENhbnRhcmVsbCwgJ0hlbHZldGljYSBOZXVlJywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZmZmZiI+MU0rPC90ZXh0Pjx0ZXh0IHg9IjI3MCIgeT0iMjc1IiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIE94eWdlbiwgVWJ1bnR1LCBDYW50YXJlbGwsICdIZWx2ZXRpY2EgTmV1ZScsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNmZmZmZmYiIG9wYWNpdHk9IjAuOSI+QVBJIENhbGxzPC90ZXh0PjxyZWN0IHg9IjQ4MCIgeT0iMjIwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2Y1NTc2YyIgcng9IjgiLz48dGV4dCB4PSI0OTAiIHk9IjI1MCIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBPeHlnZW4sIFVidW50dSwgQ2FudGFyZWxsLCAnSGVsdmV0aWNhIE5ldWUnLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZmZmZmZmIj4xME0rPC90ZXh0Pjx0ZXh0IHg9IjQ5MCIgeT0iMjc1IiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIE94eWdlbiwgVWJ1bnR1LCBDYW50YXJlbGwsICdIZWx2ZXRpY2EgTmV1ZScsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNmZmZmZmYiIG9wYWNpdHk9IjAuOSI+VG9rZW5zPC90ZXh0Pjwvc3ZnPg==';

// Initial content for the editor - AI themed showcase
const initialContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [
        { type: 'text', text: 'The Future of Artificial Intelligence 🤖' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Artificial Intelligence is transforming the way we ',
        },
        { type: 'text', marks: [{ type: 'bold' }], text: 'work' },
        { type: 'text', text: ', ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'think' },
        { type: 'text', text: ', and ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'interact' },
        { type: 'text', text: ' with technology. From ' },
        {
          type: 'text',
          marks: [
            {
              type: 'link',
              attrs: { href: 'https://en.wikipedia.org/wiki/Machine_learning' },
            },
          ],
          text: 'machine learning',
        },
        { type: 'text', text: ' to ' },
        {
          type: 'text',
          marks: [
            {
              type: 'link',
              attrs: { href: 'https://en.wikipedia.org/wiki/Deep_learning' },
            },
          ],
          text: 'deep neural networks',
        },
        {
          type: 'text',
          text: ', AI is reshaping industries and creating new possibilities.',
        },
      ],
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: '💡 Insight:' },
            {
              type: 'text',
              text: " The AI revolution is not coming—it's already here. Every day, AI systems process billions of data points, make millions of predictions, and learn from every interaction.",
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '📊 AI Analytics Dashboard' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'The charts below show AI technology adoption rates and model performance growth:',
        },
      ],
    },
    {
      type: 'layout',
      attrs: { columns: 2 },
      content: [
        {
          type: 'layoutColumn',
          content: [
            {
              type: 'chart',
              attrs: {
                data: {
                  type: 'bar',
                  data: {
                    labels: [
                      'ML Models',
                      'Neural Nets',
                      'NLP Apps',
                      'CV',
                      'Robotics',
                      'Automation',
                    ],
                    datasets: [
                      {
                        label: 'Adoption Rate (%)',
                        data: [85, 78, 65, 72, 55, 48],
                        backgroundColor: [
                          'rgba(99, 102, 241, 0.7)',
                          'rgba(139, 92, 246, 0.7)',
                          'rgba(236, 72, 153, 0.7)',
                          'rgba(59, 130, 246, 0.7)',
                          'rgba(14, 165, 233, 0.7)',
                          'rgba(234, 179, 8, 0.7)',
                        ],
                        borderColor: [
                          'rgba(99, 102, 241, 1)',
                          'rgba(139, 92, 246, 1)',
                          'rgba(236, 72, 153, 1)',
                          'rgba(59, 130, 246, 1)',
                          'rgba(14, 165, 233, 1)',
                          'rgba(234, 179, 8, 1)',
                        ],
                        borderWidth: 2,
                      },
                    ],
                  },
                  options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: 'AI Technology Adoption',
                        color: 'var(--pubwave-text, #37352f)',
                        font: { size: 14, weight: '600' },
                      },
                      legend: { display: true, position: 'bottom' },
                    },
                  },
                },
              },
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  marks: [{ type: 'bold' }],
                  text: 'Computer Vision',
                },
                { type: 'text', text: ' and ' },
                { type: 'text', marks: [{ type: 'bold' }], text: 'NLP' },
                { type: 'text', text: ' lead adoption at ' },
                { type: 'text', marks: [{ type: 'bold' }], text: '72%' },
                { type: 'text', text: ' and ' },
                { type: 'text', marks: [{ type: 'bold' }], text: '65%' },
                { type: 'text', text: ' respectively.' },
              ],
            },
          ],
        },
        {
          type: 'layoutColumn',
          content: [
            {
              type: 'chart',
              attrs: {
                data: {
                  type: 'line',
                  data: {
                    labels: [
                      '2020',
                      '2021',
                      '2022',
                      '2023',
                      '2024',
                      '2025',
                      '2026',
                      '2027',
                    ],
                    datasets: [
                      {
                        label: 'Performance Score',
                        data: [45, 58, 68, 75, 82, 88, 92, 95],
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        borderColor: 'rgba(99, 102, 241, 1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                      },
                    ],
                  },
                  options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: 'Model Performance Growth',
                        color: 'var(--pubwave-text, #37352f)',
                        font: { size: 14, weight: '600' },
                      },
                      legend: { display: true, position: 'bottom' },
                    },
                  },
                },
              },
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Model performance shows ' },
                {
                  type: 'text',
                  marks: [{ type: 'bold' }, { type: 'italic' }],
                  text: 'remarkable acceleration',
                },
                { type: 'text', text: ', growing from ' },
                { type: 'text', marks: [{ type: 'bold' }], text: '45' },
                { type: 'text', text: ' to ' },
                { type: 'text', marks: [{ type: 'bold' }], text: '95' },
                { type: 'text', text: ' points in 7 years.' },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Key AI Technologies' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Major AI technologies transforming industries:',
        },
      ],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  marks: [
                    { type: 'bold' },
                    {
                      type: 'link',
                      attrs: {
                        href: 'https://en.wikipedia.org/wiki/Machine_learning',
                      },
                    },
                  ],
                  text: 'Machine Learning',
                },
                {
                  type: 'text',
                  text: ': Algorithms that learn from data to make predictions',
                },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  marks: [
                    { type: 'bold' },
                    {
                      type: 'link',
                      attrs: {
                        href: 'https://en.wikipedia.org/wiki/Deep_learning',
                      },
                    },
                  ],
                  text: 'Deep Learning',
                },
                {
                  type: 'text',
                  text: ': Neural networks with multiple layers for complex pattern recognition',
                },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  marks: [
                    { type: 'bold' },
                    {
                      type: 'link',
                      attrs: {
                        href: 'https://en.wikipedia.org/wiki/Natural_language_processing',
                      },
                    },
                  ],
                  text: 'Natural Language Processing',
                },
                {
                  type: 'text',
                  text: ': Understanding and generating human language',
                },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  marks: [{ type: 'bold' }],
                  text: 'Computer Vision',
                },
                {
                  type: 'text',
                  text: ': Interpreting and understanding visual information',
                },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  marks: [{ type: 'bold' }],
                  text: 'Reinforcement Learning',
                },
                {
                  type: 'text',
                  text: ': Learning through trial and error with reward signals',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'AI Development Roadmap' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Typical steps in building an AI system:' },
      ],
    },
    {
      type: 'orderedList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Collect and prepare training data' },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Choose and design the model architecture',
                },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Train the model on the dataset' },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Evaluate and fine-tune performance' },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Deploy to production and monitor' },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'AI Research Priorities' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Current focus areas in AI research:' }],
    },
    {
      type: 'taskList',
      content: [
        {
          type: 'taskItem',
          attrs: { checked: true },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Improve model interpretability and explainability',
                },
              ],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: { checked: true },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  marks: [{ type: 'strike' }],
                  text: 'Reduce computational requirements',
                },
              ],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: { checked: false },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Develop more efficient training algorithms',
                },
              ],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: { checked: false },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Address bias and fairness in AI systems',
                },
              ],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: { checked: false },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Create more robust and secure AI models',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '📊 AI Application Distribution' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'The pie chart below shows how different AI applications are distributed across various domains:',
        },
      ],
    },
    {
      type: 'chart',
      attrs: {
        data: {
          type: 'pie',
          data: {
            labels: [
              'Neural Networks',
              'NLP Apps',
              'Computer Vision',
              'Robotics',
              'Automation',
            ],
            datasets: [
              {
                label: 'Distribution',
                data: [30, 25, 20, 15, 10],
                backgroundColor: [
                  'rgba(99, 102, 241, 0.7)',
                  'rgba(236, 72, 153, 0.7)',
                  'rgba(59, 130, 246, 0.7)',
                  'rgba(56, 189, 248, 0.7)',
                  'rgba(245, 87, 108, 0.7)',
                ],
                borderColor: [
                  'rgba(99, 102, 241, 1)',
                  'rgba(236, 72, 153, 1)',
                  'rgba(59, 130, 246, 1)',
                  'rgba(56, 189, 248, 1)',
                  'rgba(245, 87, 108, 1)',
                ],
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'AI Application Distribution',
                color: 'var(--pubwave-text, #37352f)',
                font: { size: 16, weight: '600' },
              },
              legend: { display: true, position: 'top' },
            },
          },
        },
      },
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Neural networks dominate at 30%, followed by ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'NLP applications' },
        { type: 'text', text: ' at 25% and ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'computer vision' },
        {
          type: 'text',
          text: ' at 20%. This reflects the current state of AI development priorities.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Code Example: Simple Neural Network' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: "Here's a basic example of a neural network implementation:",
        },
      ],
    },
    {
      type: 'codeBlock',
      content: [
        {
          type: 'text',
          text: 'import torch\nimport torch.nn as nn\n\nclass SimpleNeuralNetwork(nn.Module):\n    def __init__(self, input_size, hidden_size, output_size):\n        super(SimpleNeuralNetwork, self).__init__()\n        self.fc1 = nn.Linear(input_size, hidden_size)\n        self.relu = nn.ReLU()\n        self.fc2 = nn.Linear(hidden_size, output_size)\n    \n    def forward(self, x):\n        out = self.fc1(x)\n        out = self.relu(out)\n        out = self.fc2(out)\n        return out\n\n# Create model\nmodel = SimpleNeuralNetwork(784, 128, 10)\nprint(f"Model parameters: {sum(p.numel() for p in model.parameters())}")',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '📋 Model Comparison Table' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'A quick comparison of common AI model families:',
        },
      ],
    },
    {
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableHeader',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Model' }],
                },
              ],
            },
            {
              type: 'tableHeader',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Strength' }],
                },
              ],
            },
            {
              type: 'tableHeader',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Typical Use' }],
                },
              ],
            },
          ],
        },
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableCell',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'CNN' }] },
              ],
            },
            {
              type: 'tableCell',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'Visual feature extraction' },
                  ],
                },
              ],
            },
            {
              type: 'tableCell',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Computer vision' }],
                },
              ],
            },
          ],
        },
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableCell',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Transformer' }],
                },
              ],
            },
            {
              type: 'tableCell',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'Long-range sequence modeling' },
                  ],
                },
              ],
            },
            {
              type: 'tableCell',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'NLP, multimodal, agents' }],
                },
              ],
            },
          ],
        },
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableCell',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'GBDT' }],
                },
              ],
            },
            {
              type: 'tableCell',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'Strong tabular performance' },
                  ],
                },
              ],
            },
            {
              type: 'tableCell',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'Ranking, risk, forecasting' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '💬 Expert Insights' }],
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              marks: [{ type: 'bold' }],
              text: 'Artificial intelligence is the future, and the future is here.',
            },
            {
              type: 'text',
              text: ' The question is not whether AI will transform our world, but how quickly and in what ways.',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              marks: [{ type: 'italic' }],
              text: '— AI Research Community',
            },
          ],
        },
      ],
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'The most important thing about AI is that it learns from ',
            },
            { type: 'text', marks: [{ type: 'code' }], text: 'data' },
            { type: 'text', text: ', adapts to new ' },
            { type: 'text', marks: [{ type: 'bold' }], text: 'patterns' },
            {
              type: 'text',
              text: ', and improves over time—just like human intelligence, but at scale.',
            },
          ],
        },
      ],
    },
    {
      type: 'horizontalRule',
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'AI Applications Across Industries' }],
    },
    {
      type: 'layout',
      attrs: { columns: 3 },
      content: [
        {
          type: 'layoutColumn',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Healthcare' },
              ],
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Medical diagnosis' }],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Drug discovery' }],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', text: 'Personalized treatment' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'layoutColumn',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Finance' },
              ],
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Fraud detection' }],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Algorithmic trading' }],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Risk assessment' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'layoutColumn',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Education' },
              ],
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        { type: 'text', text: 'Personalized learning' },
                      ],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Intelligent tutoring' }],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Automated grading' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'AI Development Tools & Frameworks' }],
    },
    {
      type: 'layout',
      attrs: { columns: 2 },
      content: [
        {
          type: 'layoutColumn',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  marks: [{ type: 'bold' }],
                  text: 'Popular ML Frameworks',
                },
              ],
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'TensorFlow' }],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'PyTorch' }],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'scikit-learn' }],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Keras' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'layoutColumn',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  marks: [{ type: 'bold' }],
                  text: 'ML Tools & Platforms',
                },
              ],
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Jupyter Notebooks' }],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Google Colab' }],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Weights & Biases' }],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'MLflow' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'horizontalRule',
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'The Future of AI' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'As we look ahead, AI will continue to evolve and integrate into every aspect of our lives. The key is to ',
        },
        { type: 'text', marks: [{ type: 'bold' }], text: 'embrace the change' },
        { type: 'text', text: ', ' },
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: 'understand the technology',
        },
        { type: 'text', text: ', and ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'use it responsibly' },
        { type: 'text', text: ' to create a better future for all. ' },
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: 'The AI revolution is just beginning! 🚀',
        },
      ],
    },
    {
      type: 'image',
      attrs: {
        src: chartDashboard,
        alt: 'AI System Performance Dashboard',
      },
    },
  ],
};

// Supported locales with display names
const locales: Array<{ code: EditorLocale; name: string }> = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '繁体中文' },
  { code: 'zh-CN', name: '简体中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' },
];

// Theme presets - Modern and beautiful color schemes with gradients
const themes: Record<string, EditorTheme> = {
  light: {
    colors: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      text: '#1f2937',
      textMuted: '#6b7280',
      border: '#e5e7eb',
      primary: '#3b82f6',
    },
  },
  dark: {
    colors: {
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      text: '#f1f5f9',
      textMuted: '#94a3b8',
      border: '#334155',
      primary: '#60a5fa',
      linkColor: '#3b82f6', // Brighter blue for better visibility on dark background
    },
  },
  violet: {
    colors: {
      background:
        'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #6b46c1 50%, #5b21b6 75%, #4c1d95 100%)',
      text: '#f3f4f6',
      textMuted: '#e5e7eb',
      border: '#8b5cf6',
      primary: '#8b5cf6',
      linkColor: '#60a5fa', // Bright blue for better visibility on purple background
    },
  },
  rose: {
    colors: {
      background:
        'linear-gradient(135deg, #f093fb 0%, #f5576c 25%, #e91e63 50%, #c2185b 75%, #880e4f 100%)',
      text: '#fdf2f8',
      textMuted: '#fce7f3',
      border: '#ec4899',
      primary: '#ec4899',
    },
  },
  sky: {
    colors: {
      background:
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 25%, #00d4ff 50%, #0099cc 75%, #006699 100%)',
      text: '#f0f9ff',
      textMuted: '#e0f2fe',
      border: '#38bdf8',
      primary: '#38bdf8',
    },
  },
  // Example theme with background image
  image: {
    colors: {
      background:
        'linear-gradient(135deg,rgb(26, 29, 36) 0%,rgb(3, 11, 24) 100%)',
      text: '#ffffff',
      textMuted: '#e0f2fe',
      border: '#e5e7eb',
      primary: '#3b82f6',
      linkColor: '#60a5fa', // Bright blue for better visibility on purple background
    },
    backgroundImage:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=80',
    backgroundImageOptions: {
      size: 'cover',
      position: 'center',
      repeat: 'no-repeat',
      attachment: 'fixed',
    },
  },
};

interface EditorClientComponentProps {
  /** Whether to show theme switcher */
  showThemeSwitcher?: boolean;
  /** Initial theme name */
  initialTheme?: string;
}

export default function EditorClientComponent({
  showThemeSwitcher = true,
  initialTheme = 'violet',
}: EditorClientComponentProps) {
  const [currentTheme, setCurrentTheme] = useState<string>(initialTheme);
  const [currentLocale, setCurrentLocale] = useState<EditorLocale>('en');
  const [editorContent, setEditorContent] = useState<JSONContent>(
    typeof window !== 'undefined' && (window as any).__TESTING__
      ? { type: 'doc', content: [] }
      : initialContent
  );
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="editor-wrapper" style={{ position: 'relative' }}>
      {/* Theme switcher and preview button */}
      {showThemeSwitcher && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            width: '100%',
            maxWidth: '850px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <div className="theme-switcher">
              <div className="theme-switcher__label">Theme:</div>
              {Object.keys(themes).map((themeName) => {
                const theme = themes[themeName];
                const isActive = currentTheme === themeName;
                const bgColor = theme.colors?.background || '#ffffff';
                const primaryColor = theme.colors?.primary || '#2383e2';
                let textColor = theme.colors?.text || '#000000';
                const borderColor = theme.colors?.border || '#e3e2e0';

                // For dark theme buttons, force light text color for visibility
                if (
                  themeName === 'dark' ||
                  themeName === 'violet' ||
                  themeName === 'rose' ||
                  themeName === 'sky'
                ) {
                  textColor = '#ffffff';
                }
                // Image theme uses dark text on light background
                if (themeName === 'image') {
                  textColor = '#1f2937';
                }

                // Create gradient from primary color to background
                // For dark themes, use a lighter gradient to ensure text visibility
                let gradient;
                if (themeName === 'dark') {
                  // Use a gradient that includes more of the primary color for better visibility
                  gradient = `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}40 30%, #334155 70%, #1e293b 100%)`;
                } else if (
                  themeName === 'violet' ||
                  themeName === 'rose' ||
                  themeName === 'sky'
                ) {
                  // For tech themes, create a vibrant gradient from primary to darker shades
                  gradient = `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}80 30%, ${primaryColor}40 70%, ${primaryColor}20 100%)`;
                } else if (themeName === 'image') {
                  // For image theme, use a subtle gradient with primary color
                  gradient = `linear-gradient(135deg, ${primaryColor} 0%, #ffffff 100%)`;
                } else {
                  gradient = `linear-gradient(135deg, ${primaryColor} 0%, ${bgColor} 100%)`;
                }

                return (
                  <button
                    key={themeName}
                    className={`theme-switcher__button ${isActive ? 'theme-switcher__button--active' : ''}`}
                    style={{
                      background: gradient,
                      color: textColor,
                      borderColor: isActive ? primaryColor : borderColor,
                      borderWidth: isActive ? '2px' : '1px',
                      boxShadow: isActive
                        ? `0 0 0 3px ${primaryColor}40, 0 4px 6px -1px rgba(0, 0, 0, 0.1)`
                        : 'none',
                      textShadow:
                        themeName === 'dark' ||
                        themeName === 'violet' ||
                        themeName === 'rose' ||
                        themeName === 'sky'
                          ? '0 0 4px rgba(0, 0, 0, 1), 0 0 8px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9)'
                          : 'none', // Very strong text shadow for dark themes
                      fontWeight:
                        themeName === 'dark' ||
                        themeName === 'violet' ||
                        themeName === 'rose' ||
                        themeName === 'sky'
                          ? '700'
                          : themeName === 'image'
                            ? '600'
                            : '500', // Make dark theme text even bolder
                    }}
                    onClick={() => setCurrentTheme(themeName)}
                    title={`Switch to ${themeName} theme`}
                  >
                    {themeName}
                  </button>
                );
              })}
            </div>

            {/* Locale Selector */}
            <div className="theme-switcher" style={{ marginLeft: '0.5rem' }}>
              <div className="theme-switcher__label">Language:</div>
              <select
                value={currentLocale}
                onChange={(e) =>
                  setCurrentLocale(e.target.value as EditorLocale)
                }
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#ffffff',
                  color: '#1f2937',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.2s',
                  minWidth: '120px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.boxShadow =
                    '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {locales.map((locale) => (
                  <option key={locale.code} value={locale.code}>
                    {locale.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Preview Button */}
            <button
              onClick={() => setShowPreview(true)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }}
            >
              Preview
            </button>
          </div>
        </div>
      )}

      <div
        style={{ width: '100%', maxWidth: '850px' }}
        data-theme={currentTheme === 'light' ? 'light' : 'dark'}
      >
        <PubwaveEditor
          key={currentLocale}
          content={
            typeof window !== 'undefined' && (window as any).__TESTING__
              ? undefined
              : initialContent
          }
          onChange={(newContent) => {
            setEditorContent(newContent);
            console.log('Content changed:', newContent);
          }}
          onReady={(api) => {
            // Expose editor API to window for testing
            if (typeof window !== 'undefined') {
              (window as any).pubwaveEditor = api;
            }
          }}
          theme={{
            ...themes[currentTheme],
            locale: currentLocale,
          }}
          width="100%"
        />
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          content={editorContent}
          theme={{
            ...themes[currentTheme],
            locale: currentLocale,
          }}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
