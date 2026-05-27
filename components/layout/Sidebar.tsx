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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex h-screen w-64 flex-col border-r border-zinc-200 bg-white px-4 py-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center mb-8 px-2">
        <PlaneTakeoff className="h-6 w-6 text-blue-600 mr-2" />
        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Air Freight</span>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                isActive
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50',
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors'
              )}
            >
              <item.icon
                className={clsx(
                  isActive ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50',
                  'mr-3 h-5 w-5 flex-shrink-0'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
