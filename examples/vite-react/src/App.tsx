import { useState } from 'react';
import { PubwaveEditor } from '@pubwave/editor';
import type { EditorTheme, EditorLocale } from '@pubwave/editor';
import type { JSONContent } from '@tiptap/core';
import { PreviewModal } from './PreviewModal';
import '@pubwave/editor/index.css';

// Chart images as base64 (SVG converted to data URLs) - AI themed
const chartBar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBzdHlsZT0iYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgI2Y4ZmFmYyAwJSwgI2ZmZmZmZiAxMDAlKTsiPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2MzY2ZjEiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjOGI1Y2Y2Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgo8dGV4dCB4PSI0MCIgeT0iMzUiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgT3h5Z2VuLCBVYnVudHUsIENhbnRhcmVsbCwgJ0hlbHZldGljYSBOZXVlJywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzFmMjkzNyI+QUkgVGVjaG5vbG9neSBBZG9wdGlvbiBTdGF0aXN0aWNzPC90ZXh0Pgo8cmVjdCB4PSI4MCIgeT0iMjgwIiB3aWR0aD0iODAiIGhlaWdodD0iMTAwIiBmaWxsPSJ1cmwoI2dyYWQpIiByeD0iNCIvPgo8dGV4dCB4PSIxMjAiIHk9IjM5NSIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBPeHlnZW4sIFVidW50dSwgQ2FudGFyZWxsLCAnSGVsdmV0aWNhIE5ldWUnLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMWYyOTM3IiBmb250LXdlaWdodD0iNTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NTCBNb2RlbHM8L3RleHQ+CjxyZWN0IHg9IjIwMCIgeT0iMjQwIiB3aWR0aD0iODAiIGhlaWdodD0iMTQwIiBmaWxsPSJ1cmwoI2dyYWQpIiByeD0iNCIvPgo8dGV4dCB4PSIyNDAiIHk9IjM5NSIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBPeHlnZW4sIFVidW50dSwgQ2FudGFyZWxsLCAnSGVsdmV0aWNhIE5ldWUnLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMWYyOTM3IiBmb250LXdlaWdodD0iNTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5OZXVyYWwgTmV0czwvdGV4dD4KPHJlY3QgeD0iMzIwIiB5PSIyMjAiIHdpZHRoPSI4MCIgaGVpZ2h0PSIxNjAiIGZpbGw9InVybCgjZ3JhZCkiIHJ4PSI0Ii8+Cjx0ZXh0IHg9IjM2MCIgeT0iMzk1IiBmb250LWZhbWlseT0iLWFwcGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgT3h5Z2VuLCBVYnVudHUsIENhbnRhcmVsbCwgJ0hlbHZldGljYSBOZXVlJywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzFmMjkzNyIgZm9udC13ZWlnaHQ9IjUwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TkxQIEFwcHM8L3RleHQ+CjxyZWN0IHg9IjQ0MCIgeT0iMjAwIiB3aWR0aD0iODAiIGhlaWdodD0iMTgwIiBmaWxsPSJ1cmwoI2dyYWQpIiByeD0iNCIvPgo8dGV4dCB4PSI0ODAiIHk9IjM5NSIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBPeHlnZW4sIFVidW50dSwgQ2FudGFyZWxsLCAnSGVsdmV0aWNhIE5ldWUnLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMWYyOTM3IiBmb250LXdlaWdodD0iNTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DVjwvdGV4dD4KPHJlY3QgeD0iNTYwIiB5PSIyNjAiIHdpZHRoPSI4MCIgaGVpZ2h0PSIxMjAiIGZpbGw9InVybCgjZ3JhZCkiIHJ4PSI0Ii8+Cjx0ZXh0IHg9IjYwMCIgeT0iMzk1IiBmb250LWZhbWlseT0iLWFwcGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgT3h5Z2VuLCBVYnVudHUsIENhbnRhcmVsbCwgJ0hlbHZldGljYSBOZXVlJywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzFmMjkzNyIgZm9udC13ZWlnaHQ9IjUwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Um9ib3RpY3M8L3RleHQ+CjxyZWN0IHg9IjY4MCIgeT0iMjQwIiB3aWR0aD0iODAiIGhlaWdodD0iMTQwIiBmaWxsPSJ1cmwoI2dyYWQpIiByeD0iNCIvPgo8dGV4dCB4PSI3MjAiIHk9IjM5NSIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBPeHlnZW4sIFVidW50dSwgQ2FudGFyZWxsLCAnSGVsdmV0aWNhIE5ldWUnLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMWYyOTM3IiBmb250LXdlaWdodD0iNTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BdXRvbWF0aW9uPC90ZXh0Pgo8L3N2Zz4=';
const chartLine = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBzdHlsZT0iYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgI2Y4ZmFmYyAwJSwgI2ZmZmZmZiAxMDAlKTsiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2MzY2ZjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM4YjVjZjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmZmZmIi8+PHRleHQgeD0iNDAiIHk9IjM1IiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIE94eWdlbiwgVWJ1bnR1LCBDYW50YXJlbGwsICdIZWx2ZXRpY2EgTmV1ZScsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMxZjI5MzciPkFJIE1vZGVsIFBlcmZvcm1hbmNlIEdyb3d0aCAyMDIwLTIwMjQ8L3RleHQ+PHBhdGggZD0iTTgwIDMyMCBMMTYwIDI4MCBMMjQwIDI0MCBMMzIwIDIwMCBMNDAwIDE2MCBMNTIwIDE0MCBMNjQwIDEyMCBMNzIwIDEwMCIgc3Ryb2tlPSJ1cmwoI2dyYWQpIiBzdHJva2Utd2lkdGg9IjQiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjgwIiBjeT0iMzIwIiByPSI2IiBmaWxsPSIjNjM2NmYxIi8+PGNpcmNsZSBjeD0iMTYwIiBjeT0iMjgwIiByPSI2IiBmaWxsPSIjNjM2NmYxIi8+PGNpcmNsZSBjeD0iMjQwIiBjeT0iMjQwIiByPSI2IiBmaWxsPSIjNjM2NmYxIi8+PGNpcmNsZSBjeD0iMzIwIiBjeT0iMjAwIiByPSI2IiBmaWxsPSIjNjM2NmYxIi8+PGNpcmNsZSBjeD0iNDAwIiBjeT0iMTYwIiByPSI2IiBmaWxsPSIjNjM2NmYxIi8+PGNpcmNsZSBjeD0iNTIwIiBjeT0iMTQwIiByPSI2IiBmaWxsPSIjNjM2NmYxIi8+PGNpcmNsZSBjeD0iNjQwIiBjeT0iMTIwIiByPSI2IiBmaWxsPSIjNjM2NmYxIi8+PGNpcmNsZSBjeD0iNzIwIiBjeT0iMTAwIiByPSI2IiBmaWxsPSIjNjM2NmYxIi8+PHRleHQgeD0iODAiIHk9IjM2MCIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBPeHlnZW4sIFVidW50dSwgQ2FudGFyZWxsLCAnSGVsdmV0aWNhIE5ldWUnLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMWYyOTM3IiBmb250LXdlaWdodD0iNTAwIj4yMDIwPC90ZXh0Pjx0ZXh0IHg9IjE2MCIgeT0iMzYwIiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIE94eWdlbiwgVWJ1bnR1LCBDYW50YXJlbGwsICdIZWx2ZXRpY2EgTmV1ZScsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiMxZjI5MzciIGZvbnQtd2VpZ2h0PSI1MDAiPjIwMjE8L3RleHQ+PHRleHQgeD0iMjQwIiB5PSIzNjAiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgT3h5Z2VuLCBVYnVudHUsIENhbnRhcmVsbCwgJ0hlbHZldGljYSBOZXVlJywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzFmMjkzNyIgZm9udC13ZWlnaHQ9IjUwMCI+MjAyMjwvdGV4dD48dGV4dCB4PSIzMjAiIHk9IjM2MCIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBPeHlnZW4sIFVidW50dSwgQ2FudGFyZWxsLCAnSGVsdmV0aWNhIE5ldWUnLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMWYyOTM3IiBmb250LXdlaWdodD0iNTAwIj4yMDIzPC90ZXh0Pjx0ZXh0IHg9IjQwMCIgeT0iMzYwIiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIE94eWdlbiwgVWJ1bnR1LCBDYW50YXJlbGwsICdIZWx2ZXRpY2EgTmV1ZScsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiMxZjI5MzciIGZvbnQtd2VpZ2h0PSI1MDAiPjIwMjQ8L3RleHQ+PHRleHQgeD0iNTIwIiB5PSIzNjAiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgT3h5Z2VuLCBVYnVudHUsIENhbnRhcmVsbCwgJ0hlbHZldGljYSBOZXVlJywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzFmMjkzNyIgZm9udC13ZWlnaHQ9IjUwMCI+MjAyNTwvdGV4dD48dGV4dCB4PSI2NDAiIHk9IjM2MCIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBPeHlnZW4sIFVidW50dSwgQ2FudGFyZWxsLCAnSGVsdmV0aWNhIE5ldWUnLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMWYyOTM3IiBmb250LXdlaWdodD0iNTAwIj4yMDI2PC90ZXh0Pjx0ZXh0IHg9IjcyMCIgeT0iMzYwIiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIE94eWdlbiwgVWJ1bnR1LCBDYW50YXJlbGwsICdIZWx2ZXRpY2EgTmV1ZScsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiMxZjI5MzciIGZvbnQtd2VpZ2h0PSI1MDAiPjIwMjc8L3RleHQ+PC9zdmc+';
const chartPie = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBzdHlsZT0iYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgI2Y4ZmFmYyAwJSwgI2ZmZmZmZiAxMDAlKTsiPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkMSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2MzY2ZjEiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjOGI1Y2Y2Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgo8dGV4dCB4PSI0MCIgeT0iMzUiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgT3h5Z2VuLCBVYnVudHUsIENhbnRhcmVsbCwgJ0hlbHZldGljYSBOZXVlJywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iIzFmMjkzNyI+QUkgQXBwbGljYXRpb24gRGlzdHJpYnV0aW9uPC90ZXh0Pgo8IS0tIE5ldXJhbCBOZXR3b3JrcyAzMCUgKDEwOCBkZWdyZWVzKSAtLT4KPHBhdGggZD0iTTIwMCAyMDAgTDIwMC4wIDEwMC4wIEExMDAgMTAwIDAgMCAxIDI5NS4xIDIzMC45IFoiIGZpbGw9InVybCgjZ3JhZDEpIi8+Cjx0ZXh0IHg9IjI0OC41IiB5PSIxNjQuNyIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBPeHlnZW4sIFVidW50dSwgQ2FudGFyZWxsLCAnSGVsdmV0aWNhIE5ldWUnLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj4zMCU8L3RleHQ+CjwhLS0gTkxQIEFwcGxpY2F0aW9ucyAyNSUgKDkwIGRlZ3JlZXMpIC0tPgo8cGF0aCBkPSJNMjAwIDIwMCBMMjk1LjEgMjMwLjkgQTEwMCAxMDAgMCAwIDEgMTY5LjEgMjk1LjEgWiIgZmlsbD0iI2VjNDg5OSIvPgo8dGV4dCB4PSIyMjcuMiIgeT0iMjUzLjUiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgT3h5Z2VuLCBVYnVudHUsIENhbnRhcmVsbCwgJ0hlbHZldGljYSBOZXVlJywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+MjUlPC90ZXh0Pgo8IS0tIENvbXB1dGVyIFZpc2lvbiAyMCUgKDcyIGRlZ3JlZXMpIC0tPgo8cGF0aCBkPSJNMjAwIDIwMCBMMTY5LjEgMjk1LjEgQTEwMCAxMDAgMCAwIDEgMTAwLjAgMjAwLjAgWiIgZmlsbD0iIzNiODJmNiIvPgo8dGV4dCB4PSIxNTEuNSIgeT0iMjM1LjMiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgT3h5Z2VuLCBVYnVudHUsIENhbnRhcmVsbCwgJ0hlbHZldGljYSBOZXVlJywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+MjAlPC90ZXh0Pgo8IS0tIFJvYm90aWNzIDE1JSAoNTQgZGVncmVlcykgLS0+CjxwYXRoIGQ9Ik0yMDAgMjAwIEwxMDAuMCAyMDAuMCBBMTAwIDEwMCAwIDAgMSAxNDEuMiAxMTkuMSBaIiBmaWxsPSIjMzhiZGY4Ii8+Cjx0ZXh0IHg9IjE0Ni41IiB5PSIxNzIuOCIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBPeHlnZW4sIFVidW50dSwgQ2FudGFyZWxsLCAnSGVsdmV0aWNhIE5ldWUnLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iNjAwIiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj4xNSU8L3RleHQ+CjwhLS0gQXV0b21hdGlvbiAxMCUgKDM2IGRlZ3JlZXMpIC0tPgo8cGF0aCBkPSJNMjAwIDIwMCBMMTQxLjIgMTE5LjEgQTEwMCAxMDAgMCAwIDEgMjAwLjAgMTAwLjAgWiIgZmlsbD0iI2Y1NTc2YyIvPgo8dGV4dCB4PSIxODEuNSIgeT0iMTQyLjkiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgT3h5Z2VuLCBVYnVudHUsIENhbnRhcmVsbCwgJ0hlbHZldGljYSBOZXVlJywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+MTAlPC90ZXh0Pgo8IS0tIExlZ2VuZCAtLT4KPHJlY3QgeD0iNTAwIiB5PSIxMjAiIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgZmlsbD0idXJsKCNncmFkMSkiIHJ4PSIyIi8+Cjx0ZXh0IHg9IjUyMCIgeT0iMTMwIiBmb250LWZhbWlseT0iLWFwcGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgT3h5Z2VuLCBVYnVudHUsIENhbnRhcmVsbCwgJ0hlbHZldGljYSBOZXVlJywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzFmMjkzNyI+TmV1cmFsIE5ldHdvcmtzPC90ZXh0Pgo8cmVjdCB4PSI1MDAiIHk9IjE1MCIgd2lkdGg9IjEyIiBoZWlnaHQ9IjEyIiBmaWxsPSIjZWM0ODk5IiByeD0iMiIvPgo8dGV4dCB4PSI1MjAiIHk9IjE2MCIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBPeHlnZW4sIFVidW50dSwgQ2FudGFyZWxsLCAnSGVsdmV0aWNhIE5ldWUnLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMWYyOTM3Ij5OTFAgQXBwbGljYXRpb25zPC90ZXh0Pgo8cmVjdCB4PSI1MDAiIHk9IjE4MCIgd2lkdGg9IjEyIiBoZWlnaHQ9IjEyIiBmaWxsPSIjM2I4MmY2IiByeD0iMiIvPgo8dGV4dCB4PSI1MjAiIHk9IjE5MCIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBPeHlnZW4sIFVidW50dSwgQ2FudGFyZWxsLCAnSGVsdmV0aWNhIE5ldWUnLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMWYyOTM3Ij5Db21wdXRlciBWaXNpb248L3RleHQ+CjxyZWN0IHg9IjUwMCIgeT0iMjEwIiB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIGZpbGw9IiMzOGJkZjgiIHJ4PSIyIi8+Cjx0ZXh0IHg9IjUyMCIgeT0iMjIwIiBmb250LWZhbWlseT0iLWFwcGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgT3h5Z2VuLCBVYnVudHUsIENhbnRhcmVsbCwgJ0hlbHZldGljYSBOZXVlJywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzFmMjkzNyI+Um9ib3RpY3M8L3RleHQ+CjxyZWN0IHg9IjUwMCIgeT0iMjQwIiB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIGZpbGw9IiNmNTU3NmMiIHJ4PSIyIi8+Cjx0ZXh0IHg9IjUyMCIgeT0iMjUwIiBmb250LWZhbWlseT0iLWFwcGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgT3h5Z2VuLCBVYnVudHUsIENhbnRhcmVsbCwgJ0hlbHZldGljYSBOZXVlJywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzFmMjkzNyI+QXV0b21hdGlvbjwvdGV4dD4KPC9zdmc+';
const chartDashboard = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBzdHlsZT0iYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgI2Y4ZmFmYyAwJSwgI2ZmZmZmZiAxMDAlKTsiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2MzY2ZjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM4YjVjZjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmZmZmIi8+PHRleHQgeD0iNDAiIHk9IjM1IiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIE94eWdlbiwgVWJ1bnR1LCBDYW50YXJlbGwsICdIZWx2ZXRpY2EgTmV1ZScsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMxZjI5MzciPkFJIFN5c3RlbSBQZXJmb3JtYW5jZSBEYXNoYm9hcmQ8L3RleHQ+PHJlY3QgeD0iNDAiIHk9IjgwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjEyMCIgZmlsbD0idXJsKCNncmFkKSIgcng9IjgiLz48dGV4dCB4PSI1MCIgeT0iMTEwIiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIE94eWdlbiwgVWJ1bnR1LCBDYW50YXJlbGwsICdIZWx2ZXRpY2EgTmV1ZScsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmZmZmYiPjEwMCs8L3RleHQ+PHRleHQgeD0iNTAiIHk9IjEzNSIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBPeHlnZW4sIFVidW50dSwgQ2FudGFyZWxsLCAnSGVsdmV0aWNhIE5ldWUnLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjkiPk1vZGVsczwvdGV4dD48cmVjdCB4PSIyNjAiIHk9IjgwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2VjNDg5OSIgcng9IjgiLz48dGV4dCB4PSIyNzAiIHk9IjExMCIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBPeHlnZW4sIFVidW50dSwgQ2FudGFyZWxsLCAnSGVsdmV0aWNhIE5ldWUnLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZmZmZmZmIj4xME0rPC90ZXh0Pjx0ZXh0IHg9IjI3MCIgeT0iMTM1IiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIE94eWdlbiwgVWJ1bnR1LCBDYW50YXJlbGwsICdIZWx2ZXRpY2EgTmV1ZScsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNmZmZmZmYiIG9wYWNpdHk9IjAuOSI+UHJlZGljdGlvbnM8L3RleHQ+PHJlY3QgeD0iNDgwIiB5PSI4MCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiMzYjgyZjYiIHJ4PSI4Ii8+PHRleHQgeD0iNDkwIiB5PSIxMTAiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgT3h5Z2VuLCBVYnVudHUsIENhbnRhcmVsbCwgJ0hlbHZldGljYSBOZXVlJywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZmZmZiI+OTklKzwvdGV4dD48dGV4dCB4PSI0OTAiIHk9IjEzNSIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBPeHlnZW4sIFVidW50dSwgQ2FudGFyZWxsLCAnSGVsdmV0aWNhIE5ldWUnLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjkiPkFjY3VyYWN5PC90ZXh0PjxyZWN0IHg9IjQwIiB5PSIyMjAiIHdpZHRoPSIxODAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMzhiZGY4IiByeD0iOCIvPjx0ZXh0IHg9IjUwIiB5PSIyNTAiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgT3h5Z2VuLCBVYnVudHUsIENhbnRhcmVsbCwgJ0hlbHZldGljYSBOZXVlJywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZmZmZiI+NTArPC90ZXh0Pjx0ZXh0IHg9IjUwIiB5PSIyNzUiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgT3h5Z2VuLCBVYnVudHUsIENhbnRhcmVsbCwgJ0hlbHZldGljYSBOZXVlJywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC45Ij5EYXRhc2V0czwvdGV4dD48cmVjdCB4PSIyNjAiIHk9IjIyMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiNmNTU3NmMiIHJ4PSI4Ii8+PHRleHQgeD0iMjcwIiB5PSIyNTAiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIFJvYm90bywgT3h5Z2VuLCBVYnVudHUsIENhbnRhcmVsbCwgJ0hlbHZldGljYSBOZXVlJywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZmZmZiI+MU0rPC90ZXh0Pjx0ZXh0IHg9IjI3MCIgeT0iMjc1IiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIE94eWdlbiwgVWJ1bnR1LCBDYW50YXJlbGwsICdIZWx2ZXRpY2EgTmV1ZScsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNmZmZmZmYiIG9wYWNpdHk9IjAuOSI+QVBJIENhbGxzPC90ZXh0PjxyZWN0IHg9IjQ4MCIgeT0iMjIwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2Y1NTc2YyIgcng9IjgiLz48dGV4dCB4PSI0OTAiIHk9IjI1MCIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBPeHlnZW4sIFVidW50dSwgQ2FudGFyZWxsLCAnSGVsdmV0aWNhIE5ldWUnLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZmZmZmZmIj4xME0rPC90ZXh0Pjx0ZXh0IHg9IjQ5MCIgeT0iMjc1IiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCAnU2Vnb2UgVUknLCBSb2JvdG8sIE94eWdlbiwgVWJ1bnR1LCBDYW50YXJlbGwsICdIZWx2ZXRpY2EgTmV1ZScsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNmZmZmZmYiIG9wYWNpdHk9IjAuOSI+VG9rZW5zPC90ZXh0Pjwvc3ZnPg==';

// Initial content for the editor - AI themed showcase
const initialContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'The Future of Artificial Intelligence 🤖' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Artificial Intelligence is transforming the way we ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'work' },
        { type: 'text', text: ', ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'think' },
        { type: 'text', text: ', and ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'interact' },
        { type: 'text', text: ' with technology. From ' },
        { type: 'text', marks: [{ type: 'link', attrs: { href: 'https://en.wikipedia.org/wiki/Machine_learning' } }], text: 'machine learning' },
        { type: 'text', text: ' to ' },
        { type: 'text', marks: [{ type: 'link', attrs: { href: 'https://en.wikipedia.org/wiki/Deep_learning' } }], text: 'deep neural networks' },
        { type: 'text', text: ', AI is reshaping industries and creating new possibilities.' },
      ],
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: '💡 Insight:' },
            { type: 'text', text: ' The AI revolution is not coming—it\'s already here. Every day, AI systems process billions of data points, make millions of predictions, and learn from every interaction.' },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '📊 AI Technology Adoption Statistics' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'The chart below shows the adoption rates of different AI technologies across industries:' },
      ],
    },
    {
      type: 'image',
      attrs: {
        src: chartBar,
        alt: 'AI Technology Adoption Statistics',
      },
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'As you can see, ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'Computer Vision' },
        { type: 'text', text: ' and ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'NLP applications' },
        { type: 'text', text: ' are leading the adoption curve, with neural networks and machine learning models following closely behind.' },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '📈 AI Model Performance Growth' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'The performance of AI models has been improving exponentially over the past few years:' },
      ],
    },
    {
      type: 'image',
      attrs: {
        src: chartLine,
        alt: 'AI Model Performance Growth 2020-2027',
      },
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'The growth trajectory shows a ' },
        { type: 'text', marks: [{ type: 'bold' }, { type: 'italic' }], text: 'remarkable acceleration' },
        { type: 'text', text: ', with model accuracy and efficiency improving by orders of magnitude each year.' },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Key AI Technologies' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Major AI technologies transforming industries:' }],
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
                { type: 'text', marks: [{ type: 'bold' }, { type: 'link', attrs: { href: 'https://en.wikipedia.org/wiki/Machine_learning' } }], text: 'Machine Learning' },
                { type: 'text', text: ': Algorithms that learn from data to make predictions' },
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
                { type: 'text', marks: [{ type: 'bold' }, { type: 'link', attrs: { href: 'https://en.wikipedia.org/wiki/Deep_learning' } }], text: 'Deep Learning' },
                { type: 'text', text: ': Neural networks with multiple layers for complex pattern recognition' },
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
                { type: 'text', marks: [{ type: 'bold' }, { type: 'link', attrs: { href: 'https://en.wikipedia.org/wiki/Natural_language_processing' } }], text: 'Natural Language Processing' },
                { type: 'text', text: ': Understanding and generating human language' },
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
                { type: 'text', marks: [{ type: 'bold' }], text: 'Computer Vision' },
                { type: 'text', text: ': Interpreting and understanding visual information' },
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
                { type: 'text', marks: [{ type: 'bold' }], text: 'Reinforcement Learning' },
                { type: 'text', text: ': Learning through trial and error with reward signals' },
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
      content: [{ type: 'text', text: 'Typical steps in building an AI system:' }],
    },
    {
      type: 'orderedList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Collect and prepare training data' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Choose and design the model architecture' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Train the model on the dataset' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Evaluate and fine-tune performance' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Deploy to production and monitor' }],
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
              content: [{ type: 'text', text: 'Improve model interpretability and explainability' }],
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
                { type: 'text', marks: [{ type: 'strike' }], text: 'Reduce computational requirements' },
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
              content: [{ type: 'text', text: 'Develop more efficient training algorithms' }],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: { checked: false },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Address bias and fairness in AI systems' }],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: { checked: false },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Create more robust and secure AI models' }],
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
        { type: 'text', text: 'The pie chart below shows how different AI applications are distributed across various domains:' },
      ],
    },
    {
      type: 'image',
      attrs: {
        src: chartPie,
        alt: 'AI Application Distribution',
      },
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Neural networks dominate at 30%, followed by ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'NLP applications' },
        { type: 'text', text: ' at 25% and ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'computer vision' },
        { type: 'text', text: ' at 20%. This reflects the current state of AI development priorities.' },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Code Example: Simple Neural Network' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Here\'s a basic example of a neural network implementation:' }],
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
      content: [{ type: 'text', text: '💬 Expert Insights' }],
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Artificial intelligence is the future, and the future is here.' },
            { type: 'text', text: ' The question is not whether AI will transform our world, but how quickly and in what ways.' },
          ],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', marks: [{ type: 'italic' }], text: '— AI Research Community' }],
        },
      ],
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'The most important thing about AI is that it learns from ' },
            { type: 'text', marks: [{ type: 'code' }], text: 'data' },
            { type: 'text', text: ', adapts to new ' },
            { type: 'text', marks: [{ type: 'bold' }], text: 'patterns' },
            { type: 'text', text: ', and improves over time—just like human intelligence, but at scale.' },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '📈 AI System Performance Dashboard' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Here\'s a comprehensive overview of AI system performance metrics:' },
      ],
    },
    {
      type: 'image',
      attrs: {
        src: chartDashboard,
        alt: 'AI System Performance Dashboard',
      },
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'The dashboard shows impressive numbers: ' },
        { type: 'text', marks: [{ type: 'bold' }], text: '100+ models' },
        { type: 'text', text: ' in production, ' },
        { type: 'text', marks: [{ type: 'bold' }], text: '10M+ predictions' },
        { type: 'text', text: ' made daily, ' },
        { type: 'text', marks: [{ type: 'bold' }], text: '99%+ accuracy' },
        { type: 'text', text: ' across all systems, and ' },
        { type: 'text', marks: [{ type: 'bold' }], text: '50+ datasets' },
        { type: 'text', text: ' for training. The system has processed ' },
        { type: 'text', marks: [{ type: 'bold' }], text: '1M+ API calls' },
        { type: 'text', text: ' and processed ' },
        { type: 'text', marks: [{ type: 'bold' }], text: '10M+ tokens' },
        { type: 'text', text: ' with excellent performance.' },
      ],
    },
    {
      type: 'horizontalRule',
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'AI Impact Across Industries' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'AI is revolutionizing multiple sectors:' },
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
                { type: 'text', marks: [{ type: 'bold' }], text: 'Healthcare' },
                { type: 'text', text: ': Medical diagnosis, drug discovery, and personalized treatment plans' },
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
                { type: 'text', marks: [{ type: 'bold' }], text: 'Finance' },
                { type: 'text', text: ': Fraud detection, algorithmic trading, and risk assessment' },
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
                { type: 'text', marks: [{ type: 'bold' }], text: 'Transportation' },
                { type: 'text', text: ': Autonomous vehicles, traffic optimization, and route planning' },
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
                { type: 'text', marks: [{ type: 'bold' }], text: 'Education' },
                { type: 'text', text: ': Personalized learning, intelligent tutoring, and content generation' },
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
        { type: 'text', text: 'As we look ahead, AI will continue to evolve and integrate into every aspect of our lives. The key is to ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'embrace the change' },
        { type: 'text', text: ', ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'understand the technology' },
        { type: 'text', text: ', and ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'use it responsibly' },
        { type: 'text', text: ' to create a better future for all. ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'The AI revolution is just beginning! 🚀' },
      ],
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #6b46c1 50%, #5b21b6 75%, #4c1d95 100%)',
      text: '#f3f4f6',
      textMuted: '#e5e7eb',
      border: '#8b5cf6',
      primary: '#8b5cf6',
      linkColor: '#60a5fa', // Bright blue for better visibility on purple background
    },
  },
  rose: {
    colors: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 25%, #e91e63 50%, #c2185b 75%, #880e4f 100%)',
      text: '#fdf2f8',
      textMuted: '#fce7f3',
      border: '#ec4899',
      primary: '#ec4899',
    },
  },
  sky: {
    colors: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 25%, #00d4ff 50%, #0099cc 75%, #006699 100%)',
      text: '#f0f9ff',
      textMuted: '#e0f2fe',
      border: '#38bdf8',
      primary: '#38bdf8',
    },
  },
  // Example theme with background image
  image: {
    colors: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #6b46c1 50%, #5b21b6 75%, #4c1d95 100%)',
      text: '#ffffff',
      textMuted: '#e0f2fe',
      border: '#e5e7eb',
      primary: '#3b82f6',
      linkColor: '#60a5fa', // Bright blue for better visibility on purple background
    },
    backgroundImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=80',
    backgroundImageOptions: {
      size: 'cover',
      position: 'center',
      repeat: 'no-repeat',
      attachment: 'fixed',
    },
  },
};

function App() {
  const [currentTheme, setCurrentTheme] = useState<string>('violet');
  const [currentLocale, setCurrentLocale] = useState<EditorLocale>('en');
  const [editorContent, setEditorContent] = useState<JSONContent>(
    typeof window !== 'undefined' && (window as any).__TESTING__ ? { type: 'doc', content: [] } : initialContent
  );
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="app-container">
      {/* Theme switcher and preview button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
          if (themeName === 'dark' || themeName === 'violet' || themeName === 'rose' || themeName === 'sky') {
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
          } else if (themeName === 'violet' || themeName === 'rose' || themeName === 'sky') {
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
                boxShadow: isActive ? `0 0 0 3px ${primaryColor}40, 0 4px 6px -1px rgba(0, 0, 0, 0.1)` : 'none',
                textShadow: (themeName === 'dark' || themeName === 'violet' || themeName === 'rose' || themeName === 'sky')
                  ? '0 0 4px rgba(0, 0, 0, 1), 0 0 8px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9)'
                  : 'none', // Very strong text shadow for dark themes
                fontWeight: (themeName === 'dark' || themeName === 'violet' || themeName === 'rose' || themeName === 'sky')
                  ? '700'
                  : themeName === 'image' ? '600' : '500', // Make dark theme text even bolder
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
            onChange={(e) => setCurrentLocale(e.target.value as EditorLocale)}
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
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
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

      <PubwaveEditor
        key={currentLocale}
        content={typeof window !== 'undefined' && (window as any).__TESTING__ ? undefined : initialContent}
        onChange={(newContent) => {
          setEditorContent(newContent);
          console.log('Content changed:', newContent);
        }}
        onReady={(api) => {
          // Expose editor API to window for testing
          (window as any).pubwaveEditor = api;
        }}
        theme={{
          ...themes[currentTheme],
          locale: currentLocale,
        }}
        width='850px'
      />

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

export default App;
