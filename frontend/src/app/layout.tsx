import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Newsreader, Work_Sans } from 'next/font/google';
import './globals.css';
import { site } from '@/lib/site';
import { Analytics } from '@/components/layout/Analytics';
const news = Newsreader({ subsets:['latin'], variable:'--font-news', display:'swap' });
const work = Work_Sans({ subsets:['latin'], variable:'--font-work', display:'swap' });
export const metadata: Metadata = { metadataBase:new URL(site.url), title:{default:'Freelance Email Generator for Client Replies | FreelancerReply', template:'%s | FreelancerReply'}, description:'Generate polite client email drafts for freelancers, starting with late payment reminders. Get subject lines, email bodies, and short DM versions you can review, edit, and copy.', alternates:{canonical:'/'}, openGraph:{title:'FreelancerReply — Freelance Email Generator',description:'Write awkward client emails without sounding awkward. Generate polite late payment reminder drafts for freelancers and copy them when ready.',url:site.url,siteName:site.name,type:'website'}, twitter:{card:'summary_large_image',title:'FreelancerReply — Freelance Email Generator',description:'Write awkward client emails without sounding awkward.'}, icons:{icon:'/favicon.svg'} };
export const viewport: Viewport = { width:'device-width', initialScale:1 };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={`${news.variable} ${work.variable}`}><body><Suspense fallback={null}><Analytics /></Suspense>{children}</body></html>}
