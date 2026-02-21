'use client';

import { type ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';

interface DetailDrawerProps {
  children?: ReactNode;
}

export function DetailDrawer({ children }: DetailDrawerProps) {
  const { drawerOpen, drawerContent, closeDrawer } = useAppStore();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [drawerOpen, closeDrawer]);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeDrawer}
          />
          {/* Drawer panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-drawer max-w-[90vw] bg-bg-secondary border-l border-border z-50 overflow-y-auto"
          >
            <div className="sticky top-0 flex items-center justify-between p-4 bg-bg-secondary border-b border-border z-10">
              <h3 className="text-heading-3 font-semibold text-text-primary truncate">
                {drawerContent?.title ?? 'Details'}
              </h3>
              <button
                onClick={closeDrawer}
                className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors"
                aria-label="Close drawer"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 5L5 15M5 5l10 10" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
