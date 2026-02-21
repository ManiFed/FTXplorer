'use client';

import { Sidebar } from '@/components/shell/Sidebar';
import { TopNav } from '@/components/shell/TopNav';
import { TimelineScrubber } from '@/components/shell/TimelineScrubber';
import { DetailDrawer } from '@/components/ui/DetailDrawer';
import { useAppStore } from '@/lib/store';

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div className="min-h-screen bg-bg-primary">
      <TopNav />
      <TimelineScrubber />
      <Sidebar />
      <DetailDrawer />
      <main
        className={`
          pt-[calc(theme(spacing.shell-topbar)+1.5rem)]
          transition-all duration-200
          ${sidebarCollapsed ? 'pl-shell-sidebar-collapsed' : 'pl-shell-sidebar'}
        `}
      >
        {children}
      </main>
    </div>
  );
}
