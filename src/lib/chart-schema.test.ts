import { describe, expect, test } from 'bun:test'
import { serialize } from 'next-mdx-remote/serialize'

import {
  type ChartConfig,
  DEFAULT_CHART_CONFIG,
  formatChartValue,
  getChartSeriesColor,
  normalizeSeriesKey,
  parseChartConfig,
  parseChartMdxProps,
  parseChartTagAttributes,
  parseTabularChartInput,
  serializeChartToMdx,
} from './chart-schema'

describe('chart-schema validation and formatting', () => {
  test('validates DEFAULT_CHART_CONFIG and clamps height safely', () => {
    const [err, parsed] = parseChartConfig({
      ...DEFAULT_CHART_CONFIG,
      height: 999,
      showGrid: 'false',
    })
    expect(err).toBeNull()
    expect(parsed?.height).toBe(640)
    expect(parsed?.showGrid).toBe(false)
    expect(parsed?.series).toHaveLength(2)
    expect(parsed?.data).toHaveLength(4)
  })

  test('returns structured Result errors for invalid JSON, empty data, and duplicate series keys', () => {
    const [jsonErr] = parseChartConfig({ series: '[bad json', data: [] })
    expect(jsonErr?.reason).toBe('INVALID_CHART_JSON')

    const [emptyErr] = parseChartConfig({ series: [{ key: 'a', label: 'A' }], data: [] })
    expect(emptyErr?.reason).toBe('EMPTY_CHART_DATA')

    const [dupErr] = parseChartConfig({
      series: [
        { key: 'rev', label: 'Rev 1' },
        { key: 'rev', label: 'Rev 2' },
      ],
      data: [{ label: 'Q1', rev: 10 }],
    })
    expect(dupErr?.reason).toBe('INVALID_CHART_CONFIG')
  })

  test('formats numeric values cleanly across all formats', () => {
    expect(formatChartValue(1250, 'number')).toBe('1,250')
    expect(formatChartValue(42.5, 'currency')).toBe('$42.50')
    expect(formatChartValue(25, 'percent')).toBe('25%')
    expect(formatChartValue(1500, 'compact')).toBe('1.5K')
    expect(formatChartValue(Number.NaN, 'number')).toBe('—')
  })

  test('normalizes series keys without collisions and resolves fallback color tokens', () => {
    const used = new Set(['revenue'])
    expect(normalizeSeriesKey('Revenue', used)).toBe('revenue_2')
    expect(normalizeSeriesKey('Label', used)).toBe('series')
    expect(getChartSeriesColor(0)).toBe('var(--ts-chart-1)')
    expect(getChartSeriesColor(6)).toBe('var(--ts-chart-1)')
    expect(getChartSeriesColor(1, '#3b82f6')).toBe('#3b82f6')
    expect(getChartSeriesColor(1, 'javascript:alert(1)')).toBe('var(--ts-chart-2)')
  })
})

describe('parseTabularChartInput', () => {
  test('parses CSV with quoted values, currency signs, and missing cells', () => {
    const csv = ['Quarter,"Gross Revenue",Costs', 'Q1,"$1,200",400', 'Q2,"$1,450",-'].join('\n')

    const [err, parsed] = parseTabularChartInput(csv)
    expect(err).toBeNull()
    expect(parsed?.series).toEqual([
      { key: 'gross_revenue', label: 'Gross Revenue' },
      { key: 'costs', label: 'Costs' },
    ])
    expect(parsed?.data).toEqual([
      { label: 'Q1', gross_revenue: 1200, costs: 400 },
      { label: 'Q2', gross_revenue: 1450, costs: null },
    ])
  })

  test('parses TSV and JSON arrays', () => {
    const [tsvErr, tsvParsed] = parseTabularChartInput('Month\tUsers\nJan\t120\nFeb\t180')
    expect(tsvErr).toBeNull()
    expect(tsvParsed?.data).toHaveLength(2)

    const [jsonErr, jsonParsed] = parseTabularChartInput(
      '[{"label":"A","Score":90},{"label":"B","Score":"85"}]',
    )
    expect(jsonErr).toBeNull()
    expect(jsonParsed?.series).toEqual([{ key: 'score', label: 'Score' }])
    expect(jsonParsed?.data).toEqual([
      { label: 'A', score: 90 },
      { label: 'B', score: 85 },
    ])
  })
})

describe('MDX serialization, escaping, and next-mdx-remote compilation', () => {
  const trickyConfig: ChartConfig = {
    type: 'area',
    title: 'Bob\'s "Q1 & Q2" Metrics <v2>',
    description: 'Comparison with C++ & ==highlights== > baseline',
    xLabel: 'Quarter\'s "Window"',
    yLabel: 'Growth & Scale',
    valueFormat: 'percent',
    height: 360,
    showGrid: false,
    showLegend: true,
    series: [
      { key: 'net_gain', label: 'Net\'s Gain & "Delta"' },
      { key: 'target', label: 'Target <100%>' },
    ],
    data: [
      { label: 'Q1\'25 "Alpha" & <Start>', net_gain: 12.5, target: 10 },
      { label: "Q2'25", net_gain: 18.2, target: null },
    ],
  }

  test('round-trips tricky characters through serializeChartToMdx and parseChartTagAttributes', () => {
    const mdx = serializeChartToMdx(trickyConfig)
    expect(mdx.startsWith('<Chart ')).toBe(true)
    expect(mdx.endsWith(' />')).toBe(true)

    const attrContent = mdx.slice('<Chart '.length, -' />'.length)
    const [err, parsed] = parseChartTagAttributes(attrContent)
    expect(err).toBeNull()
    expect(parsed).toEqual(trickyConfig)

    const [propsErr, propsParsed] = parseChartMdxProps({
      type: parsed?.type,
      title: parsed?.title,
      description: parsed?.description,
      xLabel: parsed?.xLabel,
      yLabel: parsed?.yLabel,
      valueFormat: parsed?.valueFormat,
      height: String(parsed?.height),
      showGrid: String(parsed?.showGrid),
      showLegend: String(parsed?.showLegend),
      series: JSON.stringify(parsed?.series),
      data: JSON.stringify(parsed?.data),
    })
    expect(propsErr).toBeNull()
    expect(propsParsed).toEqual(trickyConfig)
  })

  test('compiles and evaluates cleanly with next-mdx-remote serialize under default blockJS: true without stripping props', async () => {
    const mdx = serializeChartToMdx(trickyConfig)
    const compiled = await serialize(mdx)

    expect(compiled.compiledSource).toContain('Chart')
    expect(compiled.compiledSource).toContain('valueFormat: "percent"')
    expect(compiled.compiledSource).toContain('height: "360"')
    expect(compiled.compiledSource).toContain('showGrid: "false"')

    let capturedProps: Record<string, unknown> | null = null
    function ChartCapture() {
      return null
    }
    const captureJsx = (type: unknown, props: Record<string, unknown>) => {
      if (type === ChartCapture) {
        capturedProps = props
      }
      return null
    }

    const hydrateFn = Reflect.construct(Function, ['opts', compiled.compiledSource])
    const mdxModule = hydrateFn({
      Fragment: Symbol('Fragment'),
      jsx: captureJsx,
      jsxs: captureJsx,
      jsxDEV: captureJsx,
      useMDXComponents: () => ({ Chart: ChartCapture }),
    })
    mdxModule.default({ components: { Chart: ChartCapture } })

    expect(capturedProps).not.toBeNull()
    if (capturedProps) {
      const [err, roundTripped] = parseChartMdxProps(capturedProps)
      expect(err).toBeNull()
      expect(roundTripped).toEqual(trickyConfig)
    }
  })
})
