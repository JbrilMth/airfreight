'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlaneTakeoff, Box, SplitSquareHorizontal, Users, UserCheck, Workflow } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Shipments', href: '/shipments', icon: PlaneTakeoff },
  { name: 'Boxes', href: '/boxes', icon: Box },
  { name: 'Senders', href: '/senders', icon: Users },
  { name: 'Recipients', href: '/recipients', icon: UserCheck },
  { name: 'Operations', href: '/operations', icon: Workflow },
  { name: 'Overview', href: '/overview', icon: SplitSquareHorizontal },
];

export function BottomNavbar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t border-zinc-200 bg-white px-2 py-1 dark:border-zinc-800 dark:bg-zinc-950 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={clsx(
              isActive
                ? 'text-blue-600 dark:text-blue-500'
                : 'text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50',
              'flex flex-col items-center justify-center flex-1 h-full text-[11px] font-medium transition-colors'
            )}
          >
            <item.icon
              className={clsx(
                isActive ? 'text-blue-600 dark:text-blue-500' : 'text-zinc-400 dark:text-zinc-600',
                'h-5 w-5 mb-0.5'
              )}
              aria-hidden="true"
            />
            <span className="truncate">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
