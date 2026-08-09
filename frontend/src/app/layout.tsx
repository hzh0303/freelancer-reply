import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Newsreader, Work_Sans } from 'next/font/google';
import './globals.css';
import { site } from '@/lib/site';
import { Analytics } from '@/components/layout/Analytics';

const news = Newsreader({ subsets: ['latin'], variable: '--font-news', display: 'swap' });
const work = Work_Sans({ subsets: ['latin'], variable: '--font-work', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'Payment Reminder Email Generator for Freelancers | FreelancerReply',
    template: '%s | FreelancerReply'
  },
  description:
    'Get one recommended late payment reminder draft for your freelance invoice situation, with a subject line, email body, short DM, and clear stage reason.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'FreelancerReply — Payment Reminder Email Generator',
    description:
      'Describe an overdue invoice situation and get a recommended reminder draft you can review, edit, copy, and send yourself.',
    url: site.url,
    siteName: site.name,
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreelancerReply — Payment Reminder Email Generator',
    description: 'Get one recommended late payment reminder draft for your freelance invoice situation.'
  },
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
