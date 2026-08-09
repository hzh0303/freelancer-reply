import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Newsreader, Work_Sans } from 'next/font/google';
import './globals.css';
import { pageMetadata, site } from '@/lib/site';
import { Analytics } from '@/components/layout/Analytics';

const news = Newsreader({ subsets: ['latin'], variable: '--font-news', display: 'swap' });
const work = Work_Sans({ subsets: ['latin'], variable: '--font-work', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  ...pageMetadata({
    title: 'Payment Reminder Generator | FreelancerReply',
    description:
      'Create a polite late payment reminder draft for a freelance invoice, including a subject line, email body, short DM, and clear stage reason.',
    path: '/'
  }),
  verification: { google: 'GE82_YkM9w41urQVzZA_Cq8HtJmvW6naJqECBqBtODY' },
  icons: { icon: '/favicon.svg' }
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${news.variable} ${work.variable}`}>
      <body>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
