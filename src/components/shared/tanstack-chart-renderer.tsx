'use client'

import {
  areaY,
  barY,
  type ChartPoint,
  type ChartTheme,
  type ChartTooltipRow,
  type ChartValue,
  defineChart,
  group,
  lineY,
} from '@tanstack/charts'
import { type PieDatum, pie, polar, radialArc } from '@tanstack/charts/polar'
import { Chart } from '@tanstack/charts/react'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scalePoint } from '@tanstack/charts/scales/point'
import { tooltip } from '@tanstack/charts/tooltip'
import { useState } from 'react'

import {
  type ChartConfig,
  type ChartSeries,
  formatChartValue,
  getChartSeriesColor,
} from '@/lib/chart-schema'
import { cn } from '@/lib/utils'

interface CartesianChartRow {
  id: string
  label: string
  seriesKey: string
  seriesLabel: string
  value: number | null
}

interface PieRowInput {
  label: string
  value: number
}

export interface TanStackChartRendererProps {
  config: ChartConfig
  locale?: string
  emptyLabel?: string
  emptyPieLabel?: string
  legendAriaLabel?: string
  fallbackAriaLabel?: string
  className?: string
}

const CHART_THEME: Partial<ChartTheme> = {
  foreground: 'var(--foreground)',
  muted: 'var(--muted-foreground)',
  grid: 'var(--border)',
  background: 'transparent',
}

function buildCartesianRows(
  config: ChartConfig,
  visibleSeries: readonly ChartSeries[],
): CartesianChartRow[] {
  const rows: CartesianChartRow[] = []

  config.data.forEach((datum, rowIndex) => {
    for (const series of visibleSeries) {
      const rawValue = datum[series.key]
      const value = typeof rawValue === 'number' && Number.isFinite(rawValue) ? rawValue : null
      rows.push({
        id: `${rowIndex}::${datum.label}::${series.key}`,
        label: datum.label,
        seriesKey: series.key,
        seriesLabel: series.label,
        value,
      })
    }
  })

  return rows
}

function buildCartesianTooltip(
  points: readonly ChartPoint<CartesianChartRow, ChartValue, ChartValue>[],
  primaryPoint: ChartPoint | undefined,
  config: ChartConfig,
  locale: string,
) {
  const validRows: ChartTooltipRow[] = []

  for (const point of points) {
    if (point.datum.value === null) continue
    validRows.push({
      active: primaryPoint?.key === point.key,
      label: point.datum.seriesLabel,
      value: formatChartValue(point.datum.value, config.valueFormat, locale),
      color: point.color,
    })
  }

  return {
    title: points[0]?.datum.label ?? '',
    rows: validRows,
  }
}

function CartesianChartView({
  config,
  visibleSeries,
  locale,
  ariaLabel,
  emptyLabel,
}: {
  config: ChartConfig
  visibleSeries: readonly ChartSeries[]
  locale: string
  ariaLabel: string
  emptyLabel: string
}) {
  const rows = buildCartesianRows(config, visibleSeries)
  const allLabelsDomain = config.series.map((series) => series.label)
  const allPaletteRange = config.series.map((series, index) =>
    getChartSeriesColor(index, series.color),
  )

  const colorOption = {
    domain: allLabelsDomain,
    range: allPaletteRange,
  }

  const themeOption: Partial<ChartTheme> = {
    ...CHART_THEME,
    palette: allPaletteRange,
  }

  const yTickFormat = (value: number) => formatChartValue(value, config.valueFormat, locale)

  const yScaleOption = {
    scale: scaleLinear,
    nice: true,
    grid: config.showGrid,
    axis: {
      ...(config.yLabel ? { label: config.yLabel } : {}),
      ticks: {
        format: yTickFormat,
      },
    },
  }

  const commonTooltip = {
    use: tooltip,
    content: (
      points: readonly ChartPoint<CartesianChartRow, ChartValue, ChartValue>[],
      context: { primaryPoint?: ChartPoint },
    ) => buildCartesianTooltip(points, context.primaryPoint, config, locale),
  }

  const hasFiniteValue = rows.some((row) => row.value !== null)
  if (!hasFiniteValue) {
    return <EmptyChartState message={emptyLabel} height={config.height} />
  }

  const mark =
    config.type === 'bar'
      ? barY(
          rows.filter((row) => row.value !== null),
          {
            x: 'label',
            y: 'value',
            z: 'seriesLabel',
            color: 'seriesLabel',
            key: 'id',
            layout: group({ padding: 0.16 }),
            radius: { end: 4 },
          },
        )
      : config.type === 'line'
        ? lineY(rows, {
            x: 'label',
            y: 'value',
            z: 'seriesLabel',
            color: 'seriesLabel',
            points: true,
            strokeWidth: 2.25,
          })
        : areaY(rows, {
            x: 'label',
            y: 'value',
            z: 'seriesLabel',
            color: 'seriesLabel',
            fillOpacity: 0.2,
            strokeWidth: 2,
          })

  const xScale =
    config.type === 'bar'
      ? () => scaleBand<string>().padding(0.22)
      : config.type === 'line'
        ? () => scalePoint<string>().padding(0.2)
        : () => scalePoint<string>().padding(0.15)

  const definition = defineChart({
    marks: [mark],
    scales: {
      x: {
        scale: xScale,
        axis: config.xLabel ? { label: config.xLabel } : {},
      },
      y: yScaleOption,
    },
    color: colorOption,
    theme: themeOption,
    tooltip: commonTooltip,
  })

  return (
    <Chart
      definition={definition}
      height={config.height}
      ariaLabel={ariaLabel}
      ariaDescription={config.description || undefined}
      className="w-full"
    />
  )
}

function PieChartView({
  config,
  hiddenCategories,
  locale,
  ariaLabel,
  emptyPieLabel,
}: {
  config: ChartConfig
  hiddenCategories: ReadonlySet<string>
  locale: string
  ariaLabel: string
  emptyPieLabel: string
}) {
  const primarySeries = config.series[0]
  if (!primarySeries) {
    return <EmptyChartState message={emptyPieLabel} height={config.height} />
  }

  const allCategoryLabels: string[] = []
  const positiveRows: PieRowInput[] = []

  for (const datum of config.data) {
    allCategoryLabels.push(datum.label)
    if (hiddenCategories.has(datum.label)) continue
    const rawValue = datum[primarySeries.key]
    if (typeof rawValue === 'number' && Number.isFinite(rawValue) && rawValue > 0) {
      positiveRows.push({ label: datum.label, value: rawValue })
    }
  }

  if (positiveRows.length === 0) {
    return <EmptyChartState message={emptyPieLabel} height={config.height} />
  }

  const slices = pie(positiveRows, { value: 'value' })
  const paletteRange = allCategoryLabels.map((_, index) => getChartSeriesColor(index))
  const percentFormatter = new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 1,
  })

  const definition = defineChart({
    marks: [
      polar({
        inset: 8,
        radiusRatio: 0.86,
        scales: { angle: null, radius: null },
        marks: [
          radialArc(slices, {
            innerRadius: ({ radius }) => radius * 0.56,
            cornerRadius: 4,
            color: 'label',
            key: (datum) => `${datum.index}::${datum.label}`,
          }),
        ],
      }),
    ],
    scales: { x: null, y: null },
    color: {
      domain: allCategoryLabels,
      range: paletteRange,
    },
    theme: {
      ...CHART_THEME,
      palette: paletteRange,
    },
    tooltip: {
      use: tooltip,
      content: (points: readonly ChartPoint<PieDatum<PieRowInput>, ChartValue, ChartValue>[]) => {
        const first = points[0]
        return {
          title: primarySeries.label,
          color: first?.color,
          rows: points.map((point) => ({
            active: true,
            label: point.datum.label,
            value: `${formatChartValue(point.datum.value, config.valueFormat, locale)} (${percentFormatter.format(point.datum.fraction)})`,
            color: point.color,
          })),
        }
      },
    },
  })

  return (
    <Chart
      definition={definition}
      height={config.height}
      ariaLabel={ariaLabel}
      ariaDescription={config.description || undefined}
      className="w-full"
    />
  )
}

function EmptyChartState({ message, height }: { message: string; height: number }) {
  return (
    <div
      style={{ height }}
      className="flex w-full items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 text-center text-sm text-muted-foreground"
    >
      {message}
    </div>
  )
}

interface LegendItem {
  id: string
  label: string
  color: string
  hidden: boolean
}

export function TanStackChartRenderer({
  config,
  locale = 'en-US',
  emptyLabel = 'No numeric data to display.',
  emptyPieLabel = 'Pie charts require positive numeric values.',
  legendAriaLabel = 'Chart series legend',
  fallbackAriaLabel = 'Data chart',
  className,
}: TanStackChartRendererProps) {
  const [hiddenCartesianKeys, setHiddenCartesianKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const [hiddenPieCategories, setHiddenPieCategories] = useState<ReadonlySet<string>>(
    () => new Set(),
  )

  const ariaLabel = config.title || fallbackAriaLabel

  // Keep only hidden keys that still exist in the current config so edits never leave orphan filters.
  const activeCartesianKeys = new Set(config.series.map((s) => s.key))
  const effectiveHiddenSeries = new Set(
    [...hiddenCartesianKeys].filter((key) => activeCartesianKeys.has(key)),
  )
  const visibleSeries = config.series.filter((s) => !effectiveHiddenSeries.has(s.key))
  const resolvedVisibleSeries = visibleSeries.length > 0 ? visibleSeries : config.series

  const activeCategoryLabels = new Set(config.data.map((row) => row.label))
  const effectiveHiddenPie = new Set(
    [...hiddenPieCategories].filter((label) => activeCategoryLabels.has(label)),
  )

  const toggleSeries = (key: string) => {
    setHiddenCartesianKeys((prev) => {
      const next = new Set([...prev].filter((k) => activeCartesianKeys.has(k)))
      if (next.has(key)) {
        next.delete(key)
        return next
      }
      const remaining = config.series.filter((s) => s.key !== key && !next.has(s.key))
      if (remaining.length === 0) return prev
      next.add(key)
      return next
    })
  }

  const toggleCategory = (label: string) => {
    setHiddenPieCategories((prev) => {
      const next = new Set([...prev].filter((l) => activeCategoryLabels.has(l)))
      if (next.has(label)) {
        next.delete(label)
        return next
      }
      const remaining = config.data.filter((row) => row.label !== label && !next.has(row.label))
      if (remaining.length === 0) return prev
      next.add(label)
      return next
    })
  }

  const legendItems: LegendItem[] =
    config.type === 'pie'
      ? config.data.map((datum, index) => ({
          id: datum.label,
          label: datum.label,
          color: getChartSeriesColor(index),
          hidden: effectiveHiddenPie.has(datum.label),
        }))
      : config.series.map((series, index) => ({
          id: series.key,
          label: series.label,
          color: getChartSeriesColor(index, series.color),
          hidden: effectiveHiddenSeries.has(series.key),
        }))

  return (
    <div className={cn('w-full min-w-0 space-y-3', className)}>
      <div className="w-full min-w-0">
        {config.type === 'pie' ? (
          <PieChartView
            config={config}
            hiddenCategories={effectiveHiddenPie}
            locale={locale}
            ariaLabel={ariaLabel}
            emptyPieLabel={emptyPieLabel}
          />
        ) : (
          <CartesianChartView
            config={config}
            visibleSeries={resolvedVisibleSeries}
            locale={locale}
            ariaLabel={ariaLabel}
            emptyLabel={emptyLabel}
          />
        )}
      </div>

      {config.showLegend && legendItems.length > 0 && (
        <fieldset
          aria-label={legendAriaLabel}
          className="m-0 flex flex-wrap items-center justify-center gap-1.5 border-0 p-0 pt-0.5"
        >
          {legendItems.map((item, index) => (
            <button
              key={`${item.id}-${index}`}
              type="button"
              aria-pressed={!item.hidden}
              onClick={() =>
                config.type === 'pie' ? toggleCategory(item.id) : toggleSeries(item.id)
              }
              className={cn(
                'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all',
                item.hidden
                  ? 'border-border/50 bg-transparent text-muted-foreground/60 line-through opacity-60 hover:opacity-85'
                  : 'border-border/80 bg-muted/40 text-foreground hover:bg-muted',
              )}
            >
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
            </button>
          ))}
        </fieldset>
      )}
    </div>
  )
}
