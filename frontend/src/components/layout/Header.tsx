"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { routes, site } from '@/lib/site';

type NavItem = {
  label: string;
  href: string;
  hash?: string;
  matchPath?: string;
};

const navItems: NavItem[] = [
  { label: 'Late Payment Reminder', href: routes.tool, matchPath: routes.tool },
  { label: 'Examples', href: '/#example', hash: '#example' },
  { label: 'Pricing', href: '/#pricing', hash: '#pricing' },
  { label: 'FAQ', href: '/#faq', hash: '#faq' }
];

export function Header() {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState('');

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash || '');
    syncHash();
    window.addEventListener('hashchange', syncHash);
    window.addEventListener('popstate', syncHash);
    return () => {
      window.removeEventListener('hashchange', syncHash);
      window.removeEventListener('popstate', syncHash);
    };
  }, []);

  useEffect(() => {
    if (pathname !== routes.home) {
      setActiveHash('');
      return;
    }

    const sections = ['#example', '#pricing', '#faq']
      .map((hash) => document.querySelector(hash))
      .filter(Boolean) as Element[];
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (window.location.hash === '#waitlist') return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveHash(`#${visible.target.id}`);
      },
      { rootMargin: '-96px 0px -55% 0px', threshold: [0.08, 0.2, 0.45] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  function scrollToHash(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    const hash = href.startsWith('/#') ? href.slice(1) : href.startsWith('#') ? href : '';
    if (!hash || pathname !== routes.home) return;

    const target = document.querySelector(hash);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.pushState(null, '', hash);
    setActiveHash(hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--border)] bg-[var(--card)]/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between gap-4 px-4 md:px-10">
        <Link href={routes.home} className="flex items-center gap-2 font-display text-2xl font-semibold text-[var(--ink)]">
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--primary)] text-white">✎</span>
          {site.name}
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium muted lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => {
            const active = item.matchPath ? pathname === item.matchPath : pathname === routes.home && activeHash === item.hash;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={(event) => scrollToHash(event, item.href)}
                aria-current={active ? 'page' : undefined}
                className={active ? 'text-[var(--primary)]' : 'hover:text-[var(--ink)]'}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/#waitlist"
            onClick={(event) => scrollToHash(event, '/#waitlist')}
            aria-current={pathname === routes.home && activeHash === '#waitlist' ? 'page' : undefined}
            className={`hidden px-3 py-2 text-sm font-semibold lg:block ${pathname === routes.home && activeHash === '#waitlist' ? 'text-[var(--primary)]' : 'muted hover:text-[var(--ink)]'}`}
          >
            Pro waitlist
          </Link>
          <Link href={routes.tool} className="btn btn-primary hide-tiny !w-auto px-4 py-3">
            Generate reminder
          </Link>
        </div>
      </div>
    </header>
  );
}
