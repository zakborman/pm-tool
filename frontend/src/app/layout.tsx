import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PM Tool - Project Management with Real-Time Collaboration',
  description: 'Modern project management tool with real-time collaboration features',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
