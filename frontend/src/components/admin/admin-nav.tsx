'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils/cn';

const links = [
  { href: '/admin', key: 'overview' },
  { href: '/admin/submissions', key: 'submissions' },
] as const;

export function AdminNav() {
  const t = useTranslations('Admin');
  const nav = useTranslations('Nav');
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <nav className="flex items-center gap-1 overflow-x-auto">
        {links.map((link) => {
          const active =
            link.href === '/admin'
              ? pathname === '/admin'
              : pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors',
                active
                  ? 'bg-brand-800 text-white'
                  : 'text-ink/70 hover:bg-brand-50 hover:text-brand-800',
              )}
            >
              {t(link.key)}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/"
        className="text-sm font-semibold text-brand-800 hover:text-brand-900"
      >
        {nav('viewPublic')}
      </Link>
    </div>
  );
}
