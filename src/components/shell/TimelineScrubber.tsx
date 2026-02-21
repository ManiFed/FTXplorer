'use client';

import { useCallback, useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';

const TIMELINE_START = new Date('2017-01-01').getTime();
const TIMELINE_END = new Date('2024-12-31').getTime();
const TIMELINE_RANGE = TIMELINE_END - TIMELINE_START;

function dateToPercent(date: Date): number {
  return ((date.getTime() - TIMELINE_START) / TIMELINE_RANGE) * 100;
}

function percentToDate(percent: number): Date {
  return new Date(TIMELINE_START + (percent / 100) * TIMELINE_RANGE);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

const KEY_EVENTS = [
  { date: new Date('2019-05-01'), label: 'FTX Founded' },
  { date: new Date('2022-05-01'), label: 'Terra/Luna' },
  { date: new Date('2022-11-02'), label: 'CoinDesk Article' },
  { date: new Date('2022-11-11'), label: 'Bankruptcy' },
  { date: new Date('2023-10-03'), label: 'Trial Begins' },
  { date: new Date('2024-03-28'), label: 'Sentencing' },
];

export function TimelineScrubber() {
  const { viewDate, setViewDate } = useAppStore();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      setViewDate(percentToDate(percent));
    },
    [setViewDate]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      handleInteraction(e.clientX);

      const handleMouseMove = (e: MouseEvent) => handleInteraction(e.clientX);
      const handleMouseUp = () => {
        setIsDragging(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [handleInteraction]
  );

  const percent = dateToPercent(viewDate);

  return (
    <div className="fixed top-shell-topbar left-0 right-0 z-35 bg-bg-primary/90 backdrop-blur-sm border-b border-border-subtle">
      <div
        ref={trackRef}
        className="relative h-6 cursor-pointer group"
        onMouseDown={handleMouseDown}
      >
        {/* Track background */}
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-1 bg-bg-tertiary rounded-full">
          {/* Filled track */}
          <div
            className="absolute left-0 top-0 h-full bg-accent-amber/40 rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Key event markers */}
        {KEY_EVENTS.map((event) => {
          const pos = dateToPercent(event.date);
          return (
            <div
              key={event.label}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              style={{ left: `calc(${pos}% * (100% - 2rem) / 100% + 1rem)` }}
            >
              <div className="w-1 h-3 bg-border-strong rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}

        {/* Thumb */}
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2
            w-3 h-3 rounded-full bg-accent-amber border-2 border-bg-primary
            transition-transform
            ${isDragging ? 'scale-125' : 'group-hover:scale-110'}
          `}
          style={{ left: `calc(${percent}% * (100% - 2rem) / 100% + 1rem)` }}
        />

        {/* Date tooltip */}
        <div
          className={`
            absolute -bottom-5 -translate-x-1/2 text-caption text-text-muted
            bg-bg-secondary px-1.5 py-0.5 rounded border border-border
            transition-opacity
            ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          `}
          style={{ left: `calc(${percent}% * (100% - 2rem) / 100% + 1rem)` }}
        >
          {formatDate(viewDate)}
        </div>

        {/* Year labels */}
        <div className="absolute inset-x-4 bottom-0 flex justify-between pointer-events-none">
          {['2017', '2019', '2021', '2023'].map((year) => (
            <span key={year} className="text-[10px] text-text-muted opacity-0 group-hover:opacity-60 transition-opacity">
              {year}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
