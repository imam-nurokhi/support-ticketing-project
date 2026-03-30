import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Resolv — Enterprise Support by Nexora',
  description: 'Professional helpdesk ticketing system for Nexora customers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
