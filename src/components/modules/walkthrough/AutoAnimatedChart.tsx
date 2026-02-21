'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ChartConfig } from '@/types';

interface AutoAnimatedChartProps {
  config: ChartConfig;
}

export function AutoAnimatedChart({ config }: AutoAnimatedChartProps) {
  const { datasets, title, yAxisLabel, annotations, type } = config;

  // Compute chart dimensions
  const width = 700;
  const height = 300;
  const padding = { top: 30, right: 20, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const { xScale, yScale, allDates } = useMemo(() => {
    const allDataPoints = datasets.flatMap((ds) => ds.data);
    const dates = [...new Set(allDataPoints.map((d) => d.date))].sort();
    const values = allDataPoints.map((d) => d.value);
    const minVal = Math.min(0, ...values);
    const maxVal = Math.max(...values) * 1.1;

    const xScale = (date: string) => {
      const idx = dates.indexOf(date);
      return padding.left + (idx / Math.max(dates.length - 1, 1)) * chartWidth;
    };

    const yScale = (value: number) => {
      return padding.top + chartHeight - ((value - minVal) / (maxVal - minVal)) * chartHeight;
    };

    return { xScale, yScale, allDates: dates, minVal, maxVal };
  }, [datasets, chartWidth, chartHeight, padding.left, padding.top]);

  const renderLine = (dataset: typeof datasets[0], index: number) => {
    const pathD = dataset.data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.date)} ${yScale(d.value)}`)
      .join(' ');

    return (
      <g key={dataset.label}>
        <motion.path
          d={pathD}
          fill="none"
          stroke={dataset.color}
          strokeWidth={2}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: index * 0.3, ease: 'easeOut' }}
        />
        {/* Data points */}
        {dataset.data.map((d, i) => (
          <motion.circle
            key={i}
            cx={xScale(d.date)}
            cy={yScale(d.value)}
            r={3}
            fill={dataset.color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.3 + (i / dataset.data.length) * 1.5 }}
          />
        ))}
      </g>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderBar = (dataset: typeof datasets[0], index: number) => {
    const barWidth = Math.max(chartWidth / dataset.data.length - 4, 8);

    return (
      <g key={dataset.label}>
        {dataset.data.map((d, i) => {
          const barHeight = Math.abs(yScale(0) - yScale(d.value));
          return (
            <motion.rect
              key={i}
              x={xScale(d.date) - barWidth / 2}
              y={yScale(Math.max(0, d.value))}
              width={barWidth}
              height={barHeight}
              fill={dataset.color}
              rx={2}
              initial={{ height: 0, y: yScale(0) }}
              animate={{ height: barHeight, y: yScale(Math.max(0, d.value)) }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
          );
        })}
      </g>
    );
  };

  // Generate Y axis labels
  const yTicks = useMemo(() => {
    const allValues = datasets.flatMap((ds) => ds.data.map((d) => d.value));
    const max = Math.max(...allValues) * 1.1;
    const step = max / 4;
    return Array.from({ length: 5 }, (_, i) => Math.round(i * step));
  }, [datasets]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="my-8"
    >
      {/* Title */}
      <h4 className="text-body-sm font-semibold text-text-secondary mb-2">{title}</h4>

      <div className="bg-bg-tertiary rounded-lg p-4 border border-border overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[700px]">
          {/* Grid lines */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={yScale(tick)}
                x2={width - padding.right}
                y2={yScale(tick)}
                stroke="var(--border-subtle)"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={yScale(tick) + 4}
                textAnchor="end"
                className="text-[10px]"
                fill="var(--text-muted)"
              >
                {tick >= 1000000000
                  ? `$${(tick / 1000000000).toFixed(1)}B`
                  : tick >= 1000000
                    ? `$${(tick / 1000000).toFixed(0)}M`
                    : tick >= 1000
                      ? `$${(tick / 1000).toFixed(0)}K`
                      : `$${tick}`}
              </text>
            </g>
          ))}

          {/* X axis dates */}
          {allDates.filter((_, i) => i % Math.max(1, Math.floor(allDates.length / 6)) === 0).map((date) => (
            <text
              key={date}
              x={xScale(date)}
              y={height - 8}
              textAnchor="middle"
              className="text-[10px]"
              fill="var(--text-muted)"
            >
              {new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
            </text>
          ))}

          {/* Y axis label */}
          {yAxisLabel && (
            <text
              x={14}
              y={height / 2}
              textAnchor="middle"
              transform={`rotate(-90, 14, ${height / 2})`}
              className="text-[10px]"
              fill="var(--text-muted)"
            >
              {yAxisLabel}
            </text>
          )}

          {/* Data */}
          {datasets.map((ds, i) =>
            type === 'bar' ? renderBar(ds, i) : renderLine(ds, i)
          )}

          {/* Annotations */}
          {annotations?.map((ann) => (
            <g key={ann.label}>
              <line
                x1={xScale(ann.date)}
                y1={padding.top}
                x2={xScale(ann.date)}
                y2={height - padding.bottom}
                stroke={ann.color || 'var(--danger)'}
                strokeDasharray="4 2"
                strokeWidth={1}
              />
              <text
                x={xScale(ann.date) + 4}
                y={padding.top + 12}
                className="text-[9px] font-medium"
                fill={ann.color || 'var(--danger)'}
              >
                {ann.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Legend */}
        {datasets.length > 1 && (
          <div className="flex gap-4 mt-3 justify-center">
            {datasets.map((ds) => (
              <span key={ds.label} className="flex items-center gap-1.5 text-caption text-text-muted">
                <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: ds.color }} />
                {ds.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
