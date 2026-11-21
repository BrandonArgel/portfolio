'use client'

import dynamic from 'next/dynamic'
import { Spinner } from '@/components/ui/spinner'
import type { TanStackChartRendererProps } from './tanstack-chart-renderer'

const LazyTanStackChartRenderer = dynamic<TanStackChartRendererProps>(
  () => import('./tanstack-chart-renderer').then((mod) => mod.TanStackChartRenderer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 w-full items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/20">
        <Spinner className="size-5 text-muted-foreground" />
      </div>
    ),
  },
)

export function DynamicTanStackChartRenderer(props: TanStackChartRendererProps) {
  return <LazyTanStackChartRenderer {...props} />
}
