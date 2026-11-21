'use client'

import { AlertCircle } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { DynamicTanStackChartRenderer } from '@/components/shared/dynamic-tanstack-chart-renderer'
import { parseChartMdxProps } from '@/lib/chart-schema'

export interface MdxChartProps extends Record<string, unknown> {
  type?: string
  title?: string
  description?: string
  xLabel?: string
  yLabel?: string
  valueFormat?: string
  height?: number | string
  showGrid?: boolean | string
  showLegend?: boolean | string
  series?: string | unknown
  data?: string | unknown
}

export function MdxChart(props: MdxChartProps) {
  const locale = useLocale()
  const t = useTranslations('features.editor.chart')

  const [err, config] = parseChartMdxProps(props)

  if (err) {
    return (
      <div
        role="alert"
        className="not-prose not-typeset my-6 flex items-center gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        <AlertCircle className="size-4 shrink-0" />
        <span>{t('invalid_chart')}</span>
      </div>
    )
  }

  return (
    <figure className="not-prose not-typeset my-6 overflow-hidden rounded-xl border border-border/80 bg-card/60 p-4 shadow-xs sm:p-5">
      {(config.title || config.description) && (
        <header className="mb-3 space-y-0.5">
          {config.title && (
            <h4 className="text-base font-semibold tracking-tight text-foreground">
              {config.title}
            </h4>
          )}
          {config.description && (
            <p className="text-sm text-muted-foreground">{config.description}</p>
          )}
        </header>
      )}

      <DynamicTanStackChartRenderer
        config={config}
        locale={locale}
        emptyLabel={t('empty_data')}
        emptyPieLabel={t('empty_pie_data')}
        legendAriaLabel={t('legend_aria')}
        fallbackAriaLabel={t('fallback_aria')}
      />

      {config.description && <figcaption className="sr-only">{config.description}</figcaption>}
    </figure>
  )
}
