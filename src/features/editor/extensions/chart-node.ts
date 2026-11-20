import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

import {
  DEFAULT_CHART_CONFIG,
  parseChartConfig,
  parseChartTagAttributes,
  serializeChartToMdx,
} from '@/lib/chart-schema'
import { CHART_BLOCK, CHART_START } from '@/lib/markdown-regex'
import { ChartNodeView } from '../components/chart-node-view'

export const ChartNode = Node.create({
  name: 'chart',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,
  isolating: true,

  addAttributes() {
    return {
      type: { default: DEFAULT_CHART_CONFIG.type },
      title: { default: DEFAULT_CHART_CONFIG.title },
      description: { default: DEFAULT_CHART_CONFIG.description },
      xLabel: { default: DEFAULT_CHART_CONFIG.xLabel },
      yLabel: { default: DEFAULT_CHART_CONFIG.yLabel },
      valueFormat: { default: DEFAULT_CHART_CONFIG.valueFormat },
      height: { default: DEFAULT_CHART_CONFIG.height },
      showGrid: { default: DEFAULT_CHART_CONFIG.showGrid },
      showLegend: { default: DEFAULT_CHART_CONFIG.showLegend },
      series: {
        default: DEFAULT_CHART_CONFIG.series,
        parseHTML: (element) => {
          const raw = element.getAttribute('data-series')
          if (!raw) return DEFAULT_CHART_CONFIG.series
          try {
            return JSON.parse(raw)
          } catch {
            return DEFAULT_CHART_CONFIG.series
          }
        },
        renderHTML: (attributes) => ({
          'data-series': JSON.stringify(attributes.series ?? DEFAULT_CHART_CONFIG.series),
        }),
      },
      data: {
        default: DEFAULT_CHART_CONFIG.data,
        parseHTML: (element) => {
          const raw = element.getAttribute('data-rows')
          if (!raw) return DEFAULT_CHART_CONFIG.data
          try {
            return JSON.parse(raw)
          } catch {
            return DEFAULT_CHART_CONFIG.data
          }
        },
        renderHTML: (attributes) => ({
          'data-rows': JSON.stringify(attributes.data ?? DEFAULT_CHART_CONFIG.data),
        }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="chart"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'chart' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChartNodeView, {
      stopEvent: ({ event }) => {
        const target = event.target
        if (!(target instanceof Element)) return false
        return Boolean(target.closest('input, textarea, select, button, [data-chart-panel]'))
      },
    })
  },

  markdownTokenizer: {
    name: 'chart',
    level: 'block',

    start(src) {
      return src.search(CHART_START)
    },

    tokenize(src) {
      const match = CHART_BLOCK.exec(src)
      if (!match) return undefined

      const [raw, attrsRaw = ''] = match
      const [err, config] = parseChartTagAttributes(attrsRaw)
      if (err) return undefined

      return {
        type: 'chart',
        raw,
        chartConfig: config,
      }
    },
  },

  parseMarkdown: (token, h) => {
    const candidate = 'chartConfig' in token ? token.chartConfig : undefined
    const [err, config] = parseChartConfig(candidate)
    return h.createNode('chart', err ? { ...DEFAULT_CHART_CONFIG } : { ...config })
  },

  renderMarkdown: (node) => {
    const [err, config] = parseChartConfig(node.attrs)
    return serializeChartToMdx(err ? DEFAULT_CHART_CONFIG : config)
  },
})
