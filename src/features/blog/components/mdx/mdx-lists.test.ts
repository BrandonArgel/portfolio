import { describe, expect, test } from 'bun:test'
import { createElement, isValidElement } from 'react'
import { splitTaskListItemChildren } from './mdx-lists'

describe('splitTaskListItemChildren', () => {
  test('extracts leading checkbox and groups tight inline formatted children', () => {
    const checkbox = createElement('input', { type: 'checkbox', disabled: true })
    const strong = createElement('strong', null, 'Bold')
    const code = createElement('code', null, 'const x = 1')

    const split = splitTaskListItemChildren([checkbox, ' ', strong, ' and ', code, ' item'])

    expect(split).not.toBeNull()
    expect(isValidElement<{ type?: unknown }>(split?.checkbox)).toBe(true)
    if (isValidElement<{ type?: unknown }>(split?.checkbox)) {
      expect(split.checkbox.type).toBe('input')
      expect(split.checkbox.props.type).toBe('checkbox')
    }

    expect(split?.content).toHaveLength(4)
    const [firstContent, secondText, thirdCode, fourthText] = split?.content ?? []
    expect(isValidElement(firstContent) && firstContent.type === 'strong').toBe(true)
    expect(secondText).toBe(' and ')
    expect(isValidElement(thirdCode) && thirdCode.type === 'code').toBe(true)
    expect(fourthText).toBe(' item')
  })

  test('trims leading horizontal whitespace on plain text after checkbox', () => {
    const checkbox = createElement('input', { type: 'checkbox' })
    const split = splitTaskListItemChildren([checkbox, '   Plain task text'])

    expect(split?.content).toEqual(['Plain task text'])
  })

  test('unwraps single-paragraph loose task items into inline content', () => {
    const checkbox = createElement('input', { type: 'checkbox', checked: true })
    const link = createElement('a', { href: 'https://example.com' }, 'docs')
    const paragraph = createElement('p', null, checkbox, ' Read the ', link)

    const split = splitTaskListItemChildren(['\n', paragraph, '\n'])

    expect(split).not.toBeNull()
    expect(isValidElement<{ type?: unknown; checked?: boolean }>(split?.checkbox)).toBe(true)
    if (isValidElement<{ type?: unknown; checked?: boolean }>(split?.checkbox)) {
      expect(split.checkbox.props.type).toBe('checkbox')
      expect(split.checkbox.props.checked).toBe(true)
    }

    expect(split?.content).toHaveLength(2)
    expect(split?.content[0]).toBe('Read the ')
    const linkNode = split?.content[1]
    expect(isValidElement<{ href?: string }>(linkNode) && linkNode.type === 'a').toBe(true)
  })

  test('preserves extra block children in multi-paragraph loose task items', () => {
    const checkbox = createElement('input', { type: 'checkbox' })
    const strong = createElement('strong', null, 'Step 1')
    const firstParagraph = createElement('p', null, checkbox, ' ', strong)
    const secondParagraph = createElement('p', null, 'Follow-up details')

    const split = splitTaskListItemChildren(['\n', firstParagraph, '\n', secondParagraph, '\n'])

    expect(split).not.toBeNull()
    expect(isValidElement<{ type?: unknown }>(split?.checkbox)).toBe(true)
    expect(split?.content).toHaveLength(2)

    const clonedFirst = split?.content[0]
    expect(isValidElement<{ className?: string }>(clonedFirst)).toBe(true)
    if (isValidElement<{ className?: string }>(clonedFirst)) {
      expect(clonedFirst.props.className).toContain('mt-0')
    }
    const followUp = split?.content[1]
    expect(isValidElement<{ children?: string }>(followUp)).toBe(true)
    if (isValidElement<{ children?: string }>(followUp)) {
      expect(followUp.props.children).toBe('Follow-up details')
    }
  })

  test('returns null for ordinary non-task list items', () => {
    expect(splitTaskListItemChildren(['Regular bullet item'])).toBeNull()
    expect(splitTaskListItemChildren([createElement('strong', null, 'Not a checkbox')])).toBeNull()
  })
})
