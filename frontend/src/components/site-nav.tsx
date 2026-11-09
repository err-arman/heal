'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils/cn';

const links = [
  { href: '/research', key: 'research' },
  { href: '/submit', key: 'submit' },
  { href: '/admin', key: 'admin' },
] as const;

export function SiteNav() {
  const t = useTranslations('Nav');
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto">
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors',
              active
                ? 'bg-brand-50 text-brand-800'
                : 'text-ink/70 hover:bg-brand-50 hover:text-brand-800',
            )}
          >
            {t(link.key)}
          </Link>
        );
      })}
    </nav>
  );
}
