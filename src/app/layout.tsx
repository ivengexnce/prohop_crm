import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-context';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NexusCRM | Enterprise Support Ops & Ticketing CRM',
  description:
    'Advanced full-stack customer support ticketing CRM with real-time analytics, SLA tracking, AI triage, and team collaboration workflows.',
  keywords: ['CRM', 'Customer Support', 'Ticketing System', 'Helpdesk', 'Next.js', 'React', 'Kanban'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full dark" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-full flex flex-col antialiased selection:bg-indigo-600 selection:text-white`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
