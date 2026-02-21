'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore, useWalkthroughStore } from '@/lib/store';
import { NAV_MODULES } from '@/lib/navigation';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { currentChapter } = useWalkthroughStore();
  const totalChapters = 15;

  return (
    <aside
      className={`
        fixed left-0 top-shell-topbar bottom-0 z-30
        bg-bg-secondary border-r border-border
        transition-all duration-200
        ${sidebarCollapsed ? 'w-shell-sidebar-collapsed' : 'w-shell-sidebar'}
      `}
    >
      <div className="flex flex-col h-full">
        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center h-10 border-b border-border text-text-muted hover:text-text-primary transition-colors"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={`transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
          >
            <path d="M10 4L6 8l4 4" />
          </svg>
        </button>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_MODULES.map((module) => {
            const isActive = pathname === module.path || pathname?.startsWith(module.path + '/');
            const isWalkthrough = module.id === 'walkthrough';

            return (
              <Link
                key={module.id}
                href={module.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg
                  transition-colors duration-150
                  ${isActive
                    ? 'bg-accent-amber/10 text-accent-amber'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'
                  }
                `}
                title={sidebarCollapsed ? module.label : undefined}
              >
                <span className="text-lg flex-shrink-0 w-6 text-center">{module.icon}</span>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="text-body-sm font-medium truncate">{module.label}</div>
                    {isWalkthrough && isActive && (
                      <div className="text-caption text-text-muted mt-0.5">
                        Ch. {currentChapter}/{totalChapters}
                      </div>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Evidence confidence legend (bottom) */}
        {!sidebarCollapsed && (
          <div className="border-t border-border p-3">
            <div className="text-caption text-text-muted mb-2 font-medium">Evidence Confidence</div>
            <div className="flex gap-3">
              <span className="flex items-center gap-1 text-caption text-text-secondary">
                <span className="w-2 h-2 rounded-full bg-confidence-green" />
                Est.
              </span>
              <span className="flex items-center gap-1 text-caption text-text-secondary">
                <span className="w-2 h-2 rounded-full bg-confidence-yellow" />
                Disp.
              </span>
              <span className="flex items-center gap-1 text-caption text-text-secondary">
                <span className="w-2 h-2 rounded-full bg-confidence-red" />
                Alleg.
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
