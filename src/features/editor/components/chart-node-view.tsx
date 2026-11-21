'use client'

import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import {
  AreaChart,
  BarChart3,
  LineChart,
  PieChart,
  Plus,
  SlidersHorizontal,
  Table2,
  Trash2,
  Upload,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useId, useState } from 'react'

import { DynamicTanStackChartRenderer } from '@/components/shared/dynamic-tanstack-chart-renderer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  CHART_MAX_HEIGHT,
  CHART_MIN_HEIGHT,
  CHART_TYPES,
  CHART_VALUE_FORMATS,
  type ChartConfig,
  type ChartDatum,
  type ChartSeries,
  type ChartType,
  type ChartValueFormat,
  DEFAULT_CHART_CONFIG,
  getChartSeriesColor,
  normalizeSeriesKey,
  parseChartConfig,
  parseTabularChartInput,
} from '@/lib/chart-schema'
import { cn } from '@/lib/utils'
import { assertNever } from '@/utils/result'

type ActivePanel = 'closed' | 'data' | 'settings'

const CHART_TYPE_ICONS: Record<ChartType, React.ComponentType<{ className?: string }>> = {
  bar: BarChart3,
  line: LineChart,
  area: AreaChart,
  pie: PieChart,
}

export function ChartNodeView({ node, selected, updateAttributes, deleteNode }: NodeViewProps) {
  const fieldId = useId()
  const locale = useLocale()
  const t = useTranslations('features.editor.chart')
  const tActions = useTranslations('common.actions')

  const [err, parsedConfig] = parseChartConfig(node.attrs)
  const config: ChartConfig = err ? DEFAULT_CHART_CONFIG : parsedConfig

  const [activePanel, setActivePanel] = useState<ActivePanel>('closed')
  const [showImportBox, setShowImportBox] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState<string | null>(null)

  const updateConfig = (patch: Partial<ChartConfig>) => {
    updateAttributes(patch)
  }

  const togglePanel = (panel: Exclude<ActivePanel, 'closed'>) => {
    setActivePanel((current) => (current === panel ? 'closed' : panel))
  }

  const handleLabelChange = (rowIndex: number, label: string) => {
    const nextData: ChartDatum[] = config.data.map((row, idx) =>
      idx === rowIndex ? { ...row, label } : row,
    )
    updateConfig({ data: nextData })
  }

  const handleCellValueChange = (rowIndex: number, seriesKey: string, rawValue: string) => {
    const trimmed = rawValue.trim()
    let numericValue: number | null = null
    if (trimmed !== '') {
      const parsed = Number(trimmed)
      numericValue = Number.isFinite(parsed) ? parsed : null
    }

    const nextData: ChartDatum[] = config.data.map((row, idx) =>
      idx === rowIndex ? { ...row, [seriesKey]: numericValue } : row,
    )
    updateConfig({ data: nextData })
  }

  const handleAddRow = () => {
    const nextRow: ChartDatum = { label: `Item ${config.data.length + 1}` }
    for (const s of config.series) {
      nextRow[s.key] = 0
    }
    updateConfig({ data: [...config.data, nextRow] })
  }

  const handleRemoveRow = (rowIndex: number) => {
    if (config.data.length <= 1) return
    updateConfig({ data: config.data.filter((_, idx) => idx !== rowIndex) })
  }

  const handleSeriesLabelChange = (seriesIndex: number, label: string) => {
    const nextSeries: ChartSeries[] = config.series.map((s, idx) =>
      idx === seriesIndex ? { ...s, label } : s,
    )
    updateConfig({ series: nextSeries })
  }

  const handleAddSeries = () => {
    const existingKeys = new Set(config.series.map((s) => s.key))
    const label = `Series ${config.series.length + 1}`
    const key = normalizeSeriesKey(label, existingKeys)
    const nextSeries: ChartSeries[] = [...config.series, { key, label }]
    const nextData: ChartDatum[] = config.data.map((row) => ({ ...row, [key]: 0 }))
    updateConfig({ series: nextSeries, data: nextData })
  }

  const handleRemoveSeries = (seriesIndex: number) => {
    if (config.series.length <= 1) return
    const removedKey = config.series[seriesIndex]?.key
    const nextSeries = config.series.filter((_, idx) => idx !== seriesIndex)
    const nextData: ChartDatum[] = config.data.map((row) => {
      if (!removedKey) return row
      const nextRow: ChartDatum = { label: row.label }
      for (const s of nextSeries) {
        nextRow[s.key] = row[s.key] ?? null
      }
      return nextRow
    })
    updateConfig({ series: nextSeries, data: nextData })
  }

  const handleApplyImport = () => {
    const [parseErr, imported] = parseTabularChartInput(importText)
    if (parseErr) {
      switch (parseErr.reason) {
        case 'EMPTY_CHART_DATA':
          setImportError(t('errors.empty'))
          return
        case 'INVALID_CHART_JSON':
          setImportError(t('errors.invalid_json'))
          return
        case 'INVALID_TABULAR_DATA':
        case 'INVALID_CHART_CONFIG':
          setImportError(t('errors.invalid_tabular'))
          return
        default:
          assertNever(parseErr)
      }
    }

    updateConfig({ series: imported.series, data: imported.data })
    setImportError(null)
    setImportText('')
    setShowImportBox(false)
  }

  const handleFormatChange = (nextValue: string | null) => {
    if (!nextValue) return
    const matched = CHART_VALUE_FORMATS.find((fmt) => fmt === nextValue)
    if (matched) {
      updateConfig({ valueFormat: matched })
    }
  }

  const handleHeightChange = (rawHeight: string) => {
    const parsed = Number(rawHeight)
    if (!Number.isFinite(parsed)) return
    const clamped = Math.min(CHART_MAX_HEIGHT, Math.max(CHART_MIN_HEIGHT, Math.round(parsed)))
    updateConfig({ height: clamped })
  }

  const ActiveTypeIcon = CHART_TYPE_ICONS[config.type]

  return (
    <NodeViewWrapper
      data-type="chart"
      contentEditable={false}
      className={cn(
        'not-prose not-typeset my-5 overflow-hidden rounded-xl border border-border bg-card/60 shadow-xs transition-all select-none',
        selected && 'border-primary/60 ring-2 ring-primary/30',
      )}
    >
      {/* Header Toolbar */}
      <div
        data-chart-panel
        className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 bg-muted/35 px-3 py-2"
      >
        <div className="flex min-w-0 items-center gap-2">
          <ActiveTypeIcon className="size-4 shrink-0 text-primary" />
          <span className="truncate text-sm font-medium text-foreground">
            {config.title || t('untitled')}
          </span>
          <Badge variant="secondary" className="hidden text-[11px] font-normal sm:inline-flex">
            {t(`types.${config.type}`)}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {/* Quick Type Switcher */}
          <div className="mr-1 inline-flex items-center rounded-md border border-border/70 bg-background p-0.5">
            {CHART_TYPES.map((chartType) => {
              const Icon = CHART_TYPE_ICONS[chartType]
              const isActive = config.type === chartType
              const typeLabel = t(`types.${chartType}`)
              return (
                <Tooltip key={chartType}>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        aria-label={typeLabel}
                        aria-pressed={isActive}
                        onClick={() => updateConfig({ type: chartType })}
                        className={cn(
                          'inline-flex cursor-pointer items-center justify-center rounded-xs px-1.5 py-1 text-xs transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-2xs'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        <Icon className="size-3.5" />
                      </button>
                    }
                  />
                  <TooltipContent sideOffset={6}>{typeLabel}</TooltipContent>
                </Tooltip>
              )
            })}
          </div>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant={activePanel === 'data' ? 'secondary' : 'ghost'}
                  size="xs"
                  onClick={() => togglePanel('data')}
                  className="gap-1"
                >
                  <Table2 className="size-3.5" />
                  <span>{t('actions.data')}</span>
                </Button>
              }
            />
            <TooltipContent sideOffset={6}>{t('actions.toggle_data')}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant={activePanel === 'settings' ? 'secondary' : 'ghost'}
                  size="xs"
                  onClick={() => togglePanel('settings')}
                  className="gap-1"
                >
                  <SlidersHorizontal className="size-3.5" />
                  <span>{t('actions.settings')}</span>
                </Button>
              }
            />
            <TooltipContent sideOffset={6}>{t('actions.toggle_settings')}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    deleteNode()
                  }}
                  aria-label={tActions('delete')}
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              }
            />
            <TooltipContent sideOffset={6}>{tActions('delete')}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Live Preview Canvas */}
      <div className="p-4 sm:p-5">
        {config.description && (
          <p className="mb-3 text-xs text-muted-foreground">{config.description}</p>
        )}

        <DynamicTanStackChartRenderer
          config={config}
          locale={locale}
          emptyLabel={t('empty_data')}
          emptyPieLabel={t('empty_pie_data')}
          legendAriaLabel={t('legend_aria')}
          fallbackAriaLabel={t('fallback_aria')}
        />
      </div>

      {/* Collapsible Data Editor Panel */}
      {activePanel === 'data' && (
        <div
          data-chart-panel
          className="space-y-3 border-t border-border/70 bg-muted/20 p-3 sm:p-4"
        >
          {config.type === 'pie' && config.series.length > 1 && config.series[0] && (
            <p className="rounded-md border border-border/70 bg-background/70 px-2.5 py-1.5 text-xs text-muted-foreground">
              {t('pie_first_series_note', { series: config.series[0].label })}
            </p>
          )}

          {showImportBox ? (
            <div className="space-y-2 rounded-lg border border-border bg-background p-3">
              <Label htmlFor={`${fieldId}-import`} className="text-xs font-medium">
                {t('fields.import_label')}
              </Label>
              <Textarea
                id={`${fieldId}-import`}
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value)
                  if (importError) setImportError(null)
                }}
                placeholder={t('fields.import_placeholder')}
                rows={5}
                className="font-mono text-xs"
              />
              {importError && <p className="text-xs text-destructive">{importError}</p>}
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    setShowImportBox(false)
                    setImportError(null)
                  }}
                >
                  {t('actions.cancel')}
                </Button>
                <Button type="button" size="xs" onClick={handleApplyImport}>
                  {t('actions.apply_import')}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-border bg-background">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="min-w-32 px-2 py-1.5 text-left font-medium text-muted-foreground">
                        {t('fields.category_column')}
                      </th>
                      {config.series.map((series, sIdx) => (
                        <th key={series.key} className="min-w-32 px-1.5 py-1.5 text-left">
                          <div className="flex items-center gap-1.5">
                            <span
                              aria-hidden="true"
                              className="size-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: getChartSeriesColor(sIdx, series.color) }}
                            />
                            <Input
                              value={series.label}
                              placeholder={t('fields.series_name_placeholder')}
                              onChange={(e) => handleSeriesLabelChange(sIdx, e.target.value)}
                              className="h-7 min-w-20 border-transparent bg-transparent px-1.5 text-xs font-medium hover:border-input focus:border-input"
                            />
                            {config.series.length > 1 && (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSeries(sIdx)}
                                      aria-label={t('actions.remove_series')}
                                      className="cursor-pointer rounded-xs p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    >
                                      <Trash2 className="size-3" />
                                    </button>
                                  }
                                />
                                <TooltipContent sideOffset={6}>
                                  {t('actions.remove_series')}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="w-12 px-1.5 py-1.5 text-right">
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={handleAddSeries}
                                aria-label={t('actions.add_series')}
                              >
                                <Plus className="size-3.5" />
                              </Button>
                            }
                          />
                          <TooltipContent sideOffset={6}>{t('actions.add_series')}</TooltipContent>
                        </Tooltip>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.data.map((row, rowIdx) => (
                      <tr
                        key={`row-${rowIdx}`}
                        className="border-b border-border/60 last:border-b-0"
                      >
                        <td className="px-1.5 py-1">
                          <Input
                            value={row.label}
                            onChange={(e) => handleLabelChange(rowIdx, e.target.value)}
                            className="h-7 border-transparent bg-transparent px-1.5 text-xs hover:border-input focus:border-input"
                          />
                        </td>
                        {config.series.map((series) => {
                          const cellValue = row[series.key]
                          return (
                            <td key={series.key} className="px-1.5 py-1">
                              <Input
                                type="number"
                                step="any"
                                value={
                                  cellValue === null || cellValue === undefined
                                    ? ''
                                    : String(cellValue)
                                }
                                onChange={(e) =>
                                  handleCellValueChange(rowIdx, series.key, e.target.value)
                                }
                                className="h-7 border-transparent bg-transparent px-1.5 font-mono text-xs tabular-nums hover:border-input focus:border-input"
                              />
                            </td>
                          )
                        })}
                        <td className="px-1.5 py-1 text-right">
                          {config.data.length > 1 && (
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRow(rowIdx)}
                                    aria-label={t('actions.remove_row')}
                                    className="cursor-pointer rounded-xs p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <Trash2 className="size-3" />
                                  </button>
                                }
                              />
                              <TooltipContent sideOffset={6}>
                                {t('actions.remove_row')}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="xs" onClick={handleAddRow}>
                    <Plus className="size-3.5" />
                    <span>{t('actions.add_row')}</span>
                  </Button>
                  <Button type="button" variant="outline" size="xs" onClick={handleAddSeries}>
                    <Plus className="size-3.5" />
                    <span>{t('actions.add_series')}</span>
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => setShowImportBox(true)}
                  className="gap-1.5"
                >
                  <Upload className="size-3.5" />
                  <span>{t('actions.import_data')}</span>
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Collapsible Settings Panel */}
      {activePanel === 'settings' && (
        <div
          data-chart-panel
          className="grid gap-3 border-t border-border/70 bg-muted/20 p-3 sm:grid-cols-2 sm:p-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-title`} className="text-xs">
              {t('fields.title')}
            </Label>
            <Input
              id={`${fieldId}-title`}
              value={config.title}
              placeholder={t('fields.title_placeholder')}
              onChange={(e) => updateConfig({ title: e.target.value })}
              className="h-8 bg-background text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-description`} className="text-xs">
              {t('fields.description')}
            </Label>
            <Input
              id={`${fieldId}-description`}
              value={config.description}
              placeholder={t('fields.description_placeholder')}
              onChange={(e) => updateConfig({ description: e.target.value })}
              className="h-8 bg-background text-xs"
            />
          </div>

          {config.type !== 'pie' && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor={`${fieldId}-xlabel`} className="text-xs">
                  {t('fields.x_label')}
                </Label>
                <Input
                  id={`${fieldId}-xlabel`}
                  value={config.xLabel}
                  placeholder={t('fields.x_label_placeholder')}
                  onChange={(e) => updateConfig({ xLabel: e.target.value })}
                  className="h-8 bg-background text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`${fieldId}-ylabel`} className="text-xs">
                  {t('fields.y_label')}
                </Label>
                <Input
                  id={`${fieldId}-ylabel`}
                  value={config.yLabel}
                  placeholder={t('fields.y_label_placeholder')}
                  onChange={(e) => updateConfig({ yLabel: e.target.value })}
                  className="h-8 bg-background text-xs"
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">{t('fields.value_format')}</Label>
            <Select value={config.valueFormat} onValueChange={handleFormatChange}>
              <SelectTrigger className="h-8 w-full bg-background text-xs">
                <SelectValue>{t(`formats.${config.valueFormat}`)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CHART_VALUE_FORMATS.map((fmt: ChartValueFormat) => (
                  <SelectItem key={fmt} value={fmt} className="text-xs">
                    {t(`formats.${fmt}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${fieldId}-height`} className="text-xs">
              {t('fields.height')}
            </Label>
            <Input
              id={`${fieldId}-height`}
              type="number"
              min={CHART_MIN_HEIGHT}
              max={CHART_MAX_HEIGHT}
              step={20}
              value={config.height}
              onChange={(e) => handleHeightChange(e.target.value)}
              className="h-8 bg-background text-xs tabular-nums"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-1 sm:col-span-2">
            {config.type !== 'pie' && (
              <div className="flex items-center gap-2">
                <Switch
                  id={`${fieldId}-show-grid`}
                  size="sm"
                  checked={config.showGrid}
                  onCheckedChange={(checked) => updateConfig({ showGrid: checked })}
                />
                <Label htmlFor={`${fieldId}-show-grid`} className="cursor-pointer text-xs">
                  {t('fields.show_grid')}
                </Label>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch
                id={`${fieldId}-show-legend`}
                size="sm"
                checked={config.showLegend}
                onCheckedChange={(checked) => updateConfig({ showLegend: checked })}
              />
              <Label htmlFor={`${fieldId}-show-legend`} className="cursor-pointer text-xs">
                {t('fields.show_legend')}
              </Label>
            </div>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  )
}
