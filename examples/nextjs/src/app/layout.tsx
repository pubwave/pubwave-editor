import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pubwave Editor - Next.js Example',
  description: 'A Notion-level block editor built with React and Tiptap',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
