import { z } from 'zod'
import { error, okay, type Result } from '@/utils/result'

export const CHART_TYPES = ['bar', 'line', 'area', 'pie'] as const
export type ChartType = (typeof CHART_TYPES)[number]

export const CHART_VALUE_FORMATS = ['number', 'currency', 'percent', 'compact'] as const
export type ChartValueFormat = (typeof CHART_VALUE_FORMATS)[number]

const CHART_COLOR_TOKENS = [
  'var(--ts-chart-1)',
  'var(--ts-chart-2)',
  'var(--ts-chart-3)',
  'var(--ts-chart-4)',
  'var(--ts-chart-5)',
  'var(--ts-chart-6)',
] as const

export const CHART_MIN_HEIGHT = 180
export const CHART_MAX_HEIGHT = 640
const CHART_DEFAULT_HEIGHT = 320

type ChartParseError =
  | { reason: 'INVALID_CHART_JSON'; details: string }
  | { reason: 'INVALID_CHART_CONFIG'; details: string }
  | { reason: 'INVALID_TABULAR_DATA'; details: string }
  | { reason: 'EMPTY_CHART_DATA' }

export interface ChartSeries {
  key: string
  label: string
  color?: string
}

export type ChartDatum = { label: string } & Record<string, string | number | null>

export interface ChartConfig {
  type: ChartType
  title: string
  description: string
  xLabel: string
  yLabel: string
  valueFormat: ChartValueFormat
  height: number
  showGrid: boolean
  showLegend: boolean
  series: ChartSeries[]
  data: ChartDatum[]
}

const SAFE_COLOR_REGEX =
  /^(?:#[0-9a-fA-F]{3,8}|(?:var\(--[a-zA-Z0-9_-]+\)|oklch\([^)]+\)|hsl\([^)]+\)|rgb\([^)]+\)))$/
const CHART_ATTR_REGEX = /([a-zA-Z_][\w-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|\{\s*([^}]*?)\s*\}))?/g

const chartTypeSchema = z.enum(CHART_TYPES)
const chartValueFormatSchema = z.enum(CHART_VALUE_FORMATS)

const chartSeriesSchema = z.object({
  key: z.string().trim().min(1).max(64),
  label: z.string().trim().min(1).max(120),
  color: z.string().trim().regex(SAFE_COLOR_REGEX).optional(),
})

const chartDatumValueSchema = z.union([z.string(), z.number().refine(Number.isFinite), z.null()])

const chartDatumRecordSchema = z
  .record(z.string(), chartDatumValueSchema)
  .superRefine((row, ctx) => {
    if (typeof row.label !== 'string') {
      ctx.addIssue({
        code: 'custom',
        path: ['label'],
        message: 'Chart row requires a string label',
      })
    }
  })

const chartConfigSchema = z
  .object({
    type: chartTypeSchema.default('bar'),
    title: z.string().max(180).default(''),
    description: z.string().max(400).default(''),
    xLabel: z.string().max(80).default(''),
    yLabel: z.string().max(80).default(''),
    valueFormat: chartValueFormatSchema.default('number'),
    height: z
      .number()
      .int()
      .min(CHART_MIN_HEIGHT)
      .max(CHART_MAX_HEIGHT)
      .default(CHART_DEFAULT_HEIGHT),
    showGrid: z.boolean().default(true),
    showLegend: z.boolean().default(true),
    series: z.array(chartSeriesSchema).min(1).max(12),
    data: z.array(chartDatumRecordSchema).min(1).max(200),
  })
  .superRefine((config, ctx) => {
    const keys = new Set<string>()
    for (let i = 0; i < config.series.length; i++) {
      const seriesKey = config.series[i].key
      if (seriesKey === 'label') {
        ctx.addIssue({
          code: 'custom',
          path: ['series', i, 'key'],
          message: 'Series key cannot be "label"',
        })
      }
      if (keys.has(seriesKey)) {
        ctx.addIssue({
          code: 'custom',
          path: ['series', i, 'key'],
          message: `Duplicate series key "${seriesKey}"`,
        })
      }
      keys.add(seriesKey)
    }
  })

export const DEFAULT_CHART_CONFIG: ChartConfig = {
  type: 'bar',
  title: 'Quarterly Performance',
  description: 'Revenue and operating expenses by quarter',
  xLabel: 'Quarter',
  yLabel: 'USD ($K)',
  valueFormat: 'currency',
  height: CHART_DEFAULT_HEIGHT,
  showGrid: true,
  showLegend: true,
  series: [
    { key: 'revenue', label: 'Revenue' },
    { key: 'expenses', label: 'Expenses' },
  ],
  data: [
    { label: 'Q1', revenue: 42, expenses: 28 },
    { label: 'Q2', revenue: 58, expenses: 33 },
    { label: 'Q3', revenue: 74, expenses: 39 },
    { label: 'Q4', revenue: 96, expenses: 46 },
  ],
}

export function getChartSeriesColor(index: number, explicitColor?: string): string {
  if (explicitColor && SAFE_COLOR_REGEX.test(explicitColor)) {
    return explicitColor
  }
  return CHART_COLOR_TOKENS[index % CHART_COLOR_TOKENS.length]
}

export function normalizeSeriesKey(rawLabel: string, existingKeys: ReadonlySet<string>): string {
  const base = rawLabel
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  const normalizedBase = base && base !== 'label' ? base : 'series'
  if (!existingKeys.has(normalizedBase)) {
    return normalizedBase
  }
  let suffix = 2
  while (existingKeys.has(`${normalizedBase}_${suffix}`)) {
    suffix++
  }
  return `${normalizedBase}_${suffix}`
}

export function formatChartValue(
  value: number,
  format: ChartValueFormat = 'number',
  locale = 'en-US',
): string {
  if (!Number.isFinite(value)) return '—'

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: Math.abs(value) >= 100 ? 0 : 2,
      }).format(value)
    case 'percent':
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        maximumFractionDigits: 1,
      }).format(Math.abs(value) > 1 ? value / 100 : value)
    case 'compact':
      return new Intl.NumberFormat(locale, {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(value)
    case 'number':
      return new Intl.NumberFormat(locale, {
        maximumFractionDigits: 2,
      }).format(value)
  }
}

function escapeXmlDoubleQuoted(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r/g, '&#13;')
    .replace(/\n/g, '&#10;')
}

function escapeXmlSingleQuoted(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r/g, '&#13;')
    .replace(/\n/g, '&#10;')
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_match, dec: string) => {
      const code = Number.parseInt(dec, 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : _match
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_match, hex: string) => {
      const code = Number.parseInt(hex, 16)
      return Number.isFinite(code) ? String.fromCodePoint(code) : _match
    })
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

export function serializeChartToMdx(config: ChartConfig): string {
  const attrs: string[] = [
    `type="${escapeXmlDoubleQuoted(config.type)}"`,
    ...(config.title ? [`title="${escapeXmlDoubleQuoted(config.title)}"`] : []),
    ...(config.description ? [`description="${escapeXmlDoubleQuoted(config.description)}"`] : []),
    ...(config.xLabel ? [`xLabel="${escapeXmlDoubleQuoted(config.xLabel)}"`] : []),
    ...(config.yLabel ? [`yLabel="${escapeXmlDoubleQuoted(config.yLabel)}"`] : []),
    `valueFormat="${escapeXmlDoubleQuoted(config.valueFormat)}"`,
    `height="${String(config.height)}"`,
    `showGrid="${String(config.showGrid)}"`,
    `showLegend="${String(config.showLegend)}"`,
    `series='${escapeXmlSingleQuoted(JSON.stringify(config.series))}'`,
    `data='${escapeXmlSingleQuoted(JSON.stringify(config.data))}'`,
  ]

  return `<Chart ${attrs.join(' ')} />`
}

function tryParseJsonValue(raw: string): Result<unknown, ChartParseError> {
  try {
    return okay(JSON.parse(raw))
  } catch (err) {
    return error({
      reason: 'INVALID_CHART_JSON',
      details: err instanceof Error ? err.message : 'Invalid JSON payload',
    })
  }
}

function coerceBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true' || normalized === '') return true
    if (normalized === 'false') return false
  }
  return fallback
}

function coerceHeight(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(CHART_MAX_HEIGHT, Math.max(CHART_MIN_HEIGHT, Math.round(value)))
  }
  if (typeof value === 'string') {
    const parsed = Number(value.trim())
    if (Number.isFinite(parsed)) {
      return Math.min(CHART_MAX_HEIGHT, Math.max(CHART_MIN_HEIGHT, Math.round(parsed)))
    }
  }
  return fallback
}

function normalizeDatumRow(
  row: Record<string, string | number | null>,
  series: readonly ChartSeries[],
): ChartDatum {
  const normalized: ChartDatum = {
    label: typeof row.label === 'string' ? row.label : String(row.label ?? ''),
  }

  for (const s of series) {
    const rawVal = row[s.key]
    if (typeof rawVal === 'number' && Number.isFinite(rawVal)) {
      normalized[s.key] = rawVal
    } else if (typeof rawVal === 'string' && rawVal.trim() !== '') {
      const parsed = Number(rawVal.trim().replace(/[$,%]/g, ''))
      normalized[s.key] = Number.isFinite(parsed) ? parsed : null
    } else {
      normalized[s.key] = null
    }
  }

  return normalized
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null
  }
  return Object.fromEntries(Object.entries(value))
}

export function parseChartConfig(input: unknown): Result<ChartConfig, ChartParseError> {
  const record = toRecord(input)
  if (!record) {
    return error({
      reason: 'INVALID_CHART_CONFIG',
      details: 'Expected a chart configuration object',
    })
  }

  let seriesValue = record.series
  if (typeof seriesValue === 'string') {
    const [jsonErr, parsed] = tryParseJsonValue(seriesValue)
    if (jsonErr) return error(jsonErr)
    seriesValue = parsed
  }

  let dataValue = record.data
  if (typeof dataValue === 'string') {
    const [jsonErr, parsed] = tryParseJsonValue(dataValue)
    if (jsonErr) return error(jsonErr)
    dataValue = parsed
  }

  if (Array.isArray(dataValue) && dataValue.length === 0) {
    return error({ reason: 'EMPTY_CHART_DATA' })
  }

  const candidate = {
    type: record.type ?? 'bar',
    title: typeof record.title === 'string' ? record.title : '',
    description: typeof record.description === 'string' ? record.description : '',
    xLabel: typeof record.xLabel === 'string' ? record.xLabel : '',
    yLabel: typeof record.yLabel === 'string' ? record.yLabel : '',
    valueFormat: record.valueFormat ?? 'number',
    height: coerceHeight(record.height, CHART_DEFAULT_HEIGHT),
    showGrid: coerceBoolean(record.showGrid, true),
    showLegend: coerceBoolean(record.showLegend, true),
    series: seriesValue,
    data: dataValue,
  }

  const parsed = chartConfigSchema.safeParse(candidate)
  if (!parsed.success) {
    return error({
      reason: 'INVALID_CHART_CONFIG',
      details: parsed.error.issues.map((issue) => issue.message).join('; '),
    })
  }

  const normalizedData = parsed.data.data.map((row) => normalizeDatumRow(row, parsed.data.series))

  return okay({
    type: parsed.data.type,
    title: parsed.data.title,
    description: parsed.data.description,
    xLabel: parsed.data.xLabel,
    yLabel: parsed.data.yLabel,
    valueFormat: parsed.data.valueFormat,
    height: parsed.data.height,
    showGrid: parsed.data.showGrid,
    showLegend: parsed.data.showLegend,
    series: parsed.data.series,
    data: normalizedData,
  })
}

export function parseChartMdxProps(
  props: Record<string, unknown>,
): Result<ChartConfig, ChartParseError> {
  return parseChartConfig(props)
}

export function parseChartTagAttributes(rawAttrs: string): Result<ChartConfig, ChartParseError> {
  const attrs: Record<string, string> = {}

  for (const match of rawAttrs.matchAll(CHART_ATTR_REGEX)) {
    const name = match[1]
    if (!name) continue
    const rawValue = match[2] ?? match[3] ?? match[4]
    attrs[name] = rawValue !== undefined ? decodeXmlEntities(rawValue) : 'true'
  }

  return parseChartConfig(attrs)
}

function parseNumericCell(raw: string): number | null {
  const cleaned = raw.trim()
  if (
    !cleaned ||
    cleaned === '-' ||
    cleaned.toLowerCase() === 'null' ||
    cleaned.toLowerCase() === 'na'
  ) {
    return null
  }
  const normalized = cleaned.replace(/[$,%\s]/g, '').replace(/,(?=\d{3}(?:\D|$))/g, '')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function splitDelimitedLine(line: string, delimiter: string): string[] {
  if (delimiter === '\t') {
    return line.split('\t').map((cell) => cell.trim())
  }

  const cells: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === delimiter && !inQuotes) {
      cells.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  cells.push(current.trim())
  return cells
}

export function parseTabularChartInput(
  raw: string,
): Result<{ series: ChartSeries[]; data: ChartDatum[] }, ChartParseError> {
  const trimmed = raw.trim()
  if (!trimmed) {
    return error({ reason: 'EMPTY_CHART_DATA' })
  }

  if (trimmed.startsWith('[')) {
    const [jsonErr, parsed] = tryParseJsonValue(trimmed)
    if (jsonErr) return error(jsonErr)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return error({ reason: 'EMPTY_CHART_DATA' })
    }

    const firstObj = parsed[0]
    if (typeof firstObj !== 'object' || firstObj === null || Array.isArray(firstObj)) {
      return error({
        reason: 'INVALID_TABULAR_DATA',
        details: 'Expected JSON array of row objects',
      })
    }

    const allKeys = Object.keys(firstObj)
    const labelKey =
      allKeys.find(
        (k) =>
          k.toLowerCase() === 'label' ||
          k.toLowerCase() === 'name' ||
          k.toLowerCase() === 'category',
      ) ?? allKeys[0]

    if (!labelKey) {
      return error({
        reason: 'INVALID_TABULAR_DATA',
        details: 'JSON objects must have at least one key',
      })
    }

    const usedKeys = new Set<string>()
    const series: ChartSeries[] = []
    const keyMap = new Map<string, string>()

    for (const key of allKeys) {
      if (key === labelKey) continue
      const safeKey = normalizeSeriesKey(key, usedKeys)
      usedKeys.add(safeKey)
      keyMap.set(key, safeKey)
      series.push({ key: safeKey, label: key })
    }

    if (series.length === 0) {
      return error({
        reason: 'INVALID_TABULAR_DATA',
        details: 'Need at least one value column besides label',
      })
    }

    const rows: ChartDatum[] = parsed.map((item) => {
      const obj = toRecord(item) ?? {}
      const datum: ChartDatum = { label: String(obj[labelKey] ?? '') }
      for (const [origKey, seriesKey] of keyMap.entries()) {
        const val = obj[origKey]
        if (typeof val === 'number' && Number.isFinite(val)) {
          datum[seriesKey] = val
        } else if (typeof val === 'string') {
          datum[seriesKey] = parseNumericCell(val)
        } else {
          datum[seriesKey] = null
        }
      }
      return datum
    })

    return okay({ series, data: rows })
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    return error({
      reason: 'INVALID_TABULAR_DATA',
      details: 'Expected a header row and at least one data row',
    })
  }

  const delimiter = lines[0].includes('\t') ? '\t' : ','
  const headers = splitDelimitedLine(lines[0], delimiter)
  if (headers.length < 2) {
    return error({
      reason: 'INVALID_TABULAR_DATA',
      details: 'Expected at least one label column and one numeric series column',
    })
  }

  const usedKeys = new Set<string>()
  const series: ChartSeries[] = headers.slice(1).map((header, index) => {
    const label = header || `Series ${index + 1}`
    const key = normalizeSeriesKey(label, usedKeys)
    usedKeys.add(key)
    return { key, label }
  })

  const data: ChartDatum[] = []
  for (let i = 1; i < lines.length; i++) {
    const cells = splitDelimitedLine(lines[i], delimiter)
    if (cells.length === 0) continue
    const datum: ChartDatum = { label: cells[0] || `Row ${i}` }
    for (let col = 0; col < series.length; col++) {
      datum[series[col].key] = parseNumericCell(cells[col + 1] ?? '')
    }
    data.push(datum)
  }

  if (data.length === 0) {
    return error({ reason: 'EMPTY_CHART_DATA' })
  }

  return okay({ series, data })
}
