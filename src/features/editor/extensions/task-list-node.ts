import type { MarkdownToken } from '@tiptap/core'
import TaskList from '@tiptap/extension-task-list'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { TaskListComponent } from '../components/task-list'

const CHECKLIST_START_REGEX = /^[ \t]*<Checklist(?:\s|>)/m
const CHECKLIST_BLOCK_REGEX =
  /^[ \t]*<Checklist(?:\s+([^>]*))?>[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*<\/Checklist>[ \t]*(?:\r?\n|$)/
const DISABLED_ATTR_REGEX = /\bdisabled(?:\s*=\s*(?:\{\s*(true|false)\s*\}|"([^"]*)"|'([^']*)'))?/i
const INTERACTIVE_ATTR_REGEX = /\binteractive\s*=\s*(?:\{\s*(true|false)\s*\}|"([^"]*)"|'([^']*)')/i
const LOOSE_TASK_GAP_REGEX = /\r?\n(?:[ \t]*\r?\n)+(?=[ \t]*[-+*]\s+\[[ xX]\]\s+)/g

interface TaskListToken extends MarkdownToken {
  items?: MarkdownToken[]
  interactive?: boolean
}

function resolveChecklistInteractive(attrsRaw: string | undefined): boolean {
  if (!attrsRaw?.trim()) return true

  const disabledMatch = DISABLED_ATTR_REGEX.exec(attrsRaw)
  if (disabledMatch) {
    const rawDisabled = (disabledMatch[1] ?? disabledMatch[2] ?? disabledMatch[3] ?? '').trim()
    if (rawDisabled.toLowerCase() !== 'false') {
      return false
    }
  }

  const interactiveMatch = INTERACTIVE_ATTR_REGEX.exec(attrsRaw)
  if (interactiveMatch) {
    const rawInteractive = (
      interactiveMatch[1] ??
      interactiveMatch[2] ??
      interactiveMatch[3] ??
      ''
    ).trim()
    if (rawInteractive.toLowerCase() === 'false') {
      return false
    }
    if (rawInteractive.toLowerCase() === 'true') {
      return true
    }
  }

  return true
}

const parentTokenizer = TaskList.config.markdownTokenizer

export const TaskListNode = TaskList.extend({
  name: 'taskList',

  addAttributes() {
    return {
      interactive: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-interactive') === 'true',
        renderHTML: (attributes) => (attributes.interactive ? { 'data-interactive': 'true' } : {}),
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(TaskListComponent, {
      contentDOMElementTag: 'ul',
    })
  },

  markdownTokenizer: {
    name: 'taskList',
    level: 'block',

    start(src) {
      const checklistIndex = src.search(CHECKLIST_START_REGEX)
      const parentStart =
        typeof parentTokenizer?.start === 'function' ? parentTokenizer.start.call(this, src) : -1

      if (checklistIndex === -1) return parentStart
      if (parentStart === -1) return checklistIndex
      return Math.min(checklistIndex, parentStart)
    },

    tokenize(src, tokens, lexer) {
      const checklistMatch = CHECKLIST_BLOCK_REGEX.exec(src)

      if (checklistMatch) {
        const [, attrsRaw, innerBodyRaw] = checklistMatch
        const normalizedBody = innerBodyRaw.trim().replace(LOOSE_TASK_GAP_REGEX, '\n')
        const innerToken = parentTokenizer?.tokenize.call(this, normalizedBody, tokens, lexer) as
          | TaskListToken
          | undefined

        if (
          innerToken &&
          innerToken.type === 'taskList' &&
          Array.isArray(innerToken.items) &&
          typeof innerToken.raw === 'string' &&
          innerToken.raw.trimEnd().length === normalizedBody.trimEnd().length
        ) {
          return {
            type: 'taskList',
            raw: checklistMatch[0],
            items: innerToken.items,
            interactive: resolveChecklistInteractive(attrsRaw),
          } satisfies TaskListToken
        }

        return undefined
      }

      const plainToken = parentTokenizer?.tokenize.call(this, src, tokens, lexer) as
        | TaskListToken
        | undefined
      if (!plainToken) return undefined

      return {
        ...plainToken,
        interactive: false,
      } satisfies TaskListToken
    },
  },

  parseMarkdown: (token, h) => {
    const taskToken = token as TaskListToken
    return h.createNode(
      'taskList',
      { interactive: Boolean(taskToken.interactive) },
      h.parseChildren(taskToken.items || []),
    )
  },

  renderMarkdown: (node, h) => {
    if (!node.content) return ''
    const renderedItems = h.renderChildren(node.content, '\n')

    if (node.attrs?.interactive) {
      return `<Checklist>\n\n${renderedItems}\n\n</Checklist>`
    }

    return renderedItems
  },
})
