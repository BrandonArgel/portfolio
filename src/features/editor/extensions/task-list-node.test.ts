import { describe, expect, test } from 'bun:test'
import TaskItem from '@tiptap/extension-task-item'
import { MarkdownManager } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import { TaskListNode } from './task-list-node'

function createMarkdownManager() {
  return new MarkdownManager({
    extensions: [StarterKit, TaskListNode, TaskItem.configure({ nested: false })],
    markedOptions: { gfm: true },
  })
}

describe('TaskListNode markdown round-trip', () => {
  test('parses and serializes standard task lists with interactive=false', () => {
    const mm = createMarkdownManager()
    const input = '- [ ] **Bold** task\n- [x] Done with `code`'

    const doc = mm.parse(input)
    const taskList = doc.content?.[0]

    expect(taskList?.type).toBe('taskList')
    expect(taskList?.attrs?.interactive).toBe(false)

    const serialized = mm.serialize(doc)
    expect(serialized).toBe(input)
    expect(serialized).not.toContain('<Checklist>')
  })

  test('parses <Checklist> blocks cleanly and serializes without escaping tags', () => {
    const mm = createMarkdownManager()
    const input = [
      '<Checklist>',
      '',
      '- [ ] Check **formatting** and `code` inline',
      '- [x] Completed step',
      '',
      '</Checklist>',
    ].join('\n')

    const doc = mm.parse(input)
    const taskList = doc.content?.[0]

    expect(doc.content).toHaveLength(1)
    expect(taskList?.type).toBe('taskList')
    expect(taskList?.attrs?.interactive).toBe(true)
    expect(taskList?.content).toHaveLength(2)
    expect(taskList?.content?.[0]?.attrs?.checked).toBe(false)
    expect(taskList?.content?.[1]?.attrs?.checked).toBe(true)

    const serialized = mm.serialize(doc)
    expect(serialized).toBe(input)
    expect(serialized).not.toContain('&lt;Checklist')
    expect(serialized).not.toContain('\\<Checklist')
  })

  test('supports disabled and interactive={false} Checklist attributes as read-only', () => {
    const mm = createMarkdownManager()

    const disabledDoc = mm.parse('<Checklist disabled>\n- [x] Static item\n</Checklist>')
    expect(disabledDoc.content?.[0]?.type).toBe('taskList')
    expect(disabledDoc.content?.[0]?.attrs?.interactive).toBe(false)
    expect(mm.serialize(disabledDoc)).toBe('- [x] Static item')

    const explicitFalseDoc = mm.parse(
      '<Checklist interactive={false}>\n- [ ] Also static\n</Checklist>',
    )
    expect(explicitFalseDoc.content?.[0]?.type).toBe('taskList')
    expect(explicitFalseDoc.content?.[0]?.attrs?.interactive).toBe(false)
  })

  test('preserves both read-only and interactive task lists within the same post', () => {
    const mm = createMarkdownManager()
    const input = [
      'Intro paragraph.',
      '',
      '- [x] Read-only prerequisite with **bold**',
      '',
      '<Checklist>',
      '',
      '- [ ] Reader interactive **step one**',
      '- [ ] Reader interactive `step two`',
      '',
      '</Checklist>',
      '',
      'Outro paragraph.',
    ].join('\n')

    const doc = mm.parse(input)
    const types = doc.content?.map((node) => ({
      type: node.type,
      interactive: node.attrs?.interactive,
    }))

    expect(types).toEqual([
      { type: 'paragraph', interactive: undefined },
      { type: 'taskList', interactive: false },
      { type: 'taskList', interactive: true },
      { type: 'paragraph', interactive: undefined },
    ])

    const roundTripped = mm.serialize(doc)
    expect(roundTripped).toBe(input)
  })
})
