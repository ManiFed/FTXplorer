import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FTXplorer — The Definitive Interactive FTX Collapse Explorer',
  description: 'An interactive platform exploring the FTX collapse through guided narratives, financial data, trial evidence, and simulation models.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
