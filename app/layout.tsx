import React from 'react';
import './globals.css';
import { ThemeProvider } from '@/lib/themeContext';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DSA Animator — Paste your code. Watch it think.',
  description: 'AI-powered Data Structures & Algorithms interactive visualizer. Paste code, get line-by-line animated breakdown synced with call stack, variable tracker, audio synthesis, and export tools.',
  keywords: ['DSA', 'Data Structures', 'Algorithms', 'Visualizer', 'AI', 'Next.js', 'React', 'Coding Education'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased overflow-x-hidden">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
