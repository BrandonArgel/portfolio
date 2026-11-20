import { InputRule } from '@tiptap/core'
import TaskItem from '@tiptap/extension-task-item'
import { Fragment } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'
import { canJoin, findWrapping } from '@tiptap/pm/transform'
import { ReactNodeViewRenderer } from '@tiptap/react'

import { TASK_ITEM_INPUT_RULE } from '@/lib/markdown-regex'
import { TaskItemComponent } from '../components/task-item'

export const TaskItemNode = TaskItem.extend({
  name: 'taskItem',

  addNodeView() {
    return ReactNodeViewRenderer(TaskItemComponent, {
      as: 'li',
      className: 'task-item-wrapper',
    })
  },

  addInputRules() {
    return [
      new InputRule({
        find: TASK_ITEM_INPUT_RULE,
        handler: ({ state, range, match }) => {
          const { $from } = state.selection
          for (let depth = $from.depth; depth > 0; depth -= 1) {
            if ($from.node(depth).type === this.type) {
              return null
            }
          }

          const taskListType = state.schema.nodes[this.options.taskListTypeName]
          const paragraphType = state.schema.nodes.paragraph
          if (!taskListType || !paragraphType) {
            return null
          }

          const checked = match[1]?.toLowerCase() === 'x'
          const { tr } = state

          const isInsideBulletListItem =
            $from.depth >= 3 &&
            $from.index($from.depth - 1) === 0 &&
            $from.node($from.depth - 1).type.name === 'listItem' &&
            $from.node($from.depth - 2).type.name === 'bulletList'

          if (isInsideBulletListItem) {
            const bulletListDepth = $from.depth - 2
            const itemIndex = $from.index(bulletListDepth)
            const listItemNode = $from.node($from.depth - 1)
            const grandParentDepth = bulletListDepth - 1
            const grandParent = $from.node(grandParentDepth)
            const grandParentIndex = $from.index(grandParentDepth)

            if (!grandParent.canReplaceWith(grandParentIndex, grandParentIndex + 1, taskListType)) {
              return null
            }

            const trailingNodes = listItemNode.content.content.slice(1)
            if (
              !this.type.contentMatch.matchFragment(
                Fragment.from([paragraphType.create(), ...trailingNodes]),
              )
            ) {
              return null
            }

            tr.delete(range.from, range.to)
            const $afterDelete = tr.doc.resolve(range.from)
            const bulletListStart = $afterDelete.before(bulletListDepth)
            const bulletListEnd = $afterDelete.after(bulletListDepth)
            const updatedBulletList = $afterDelete.node(bulletListDepth)
            const updatedParagraph = $afterDelete.parent

            const beforeItems = updatedBulletList.content.content.slice(0, itemIndex)
            const afterItems = updatedBulletList.content.content.slice(itemIndex + 1)

            const beforeBulletList =
              beforeItems.length > 0
                ? updatedBulletList.type.create(updatedBulletList.attrs, beforeItems)
                : null
            const afterBulletList =
              afterItems.length > 0
                ? updatedBulletList.type.create(updatedBulletList.attrs, afterItems)
                : null

            const taskItemNode = this.type.create({ checked }, [updatedParagraph, ...trailingNodes])
            const taskListNode = taskListType.create({ interactive: false }, taskItemNode)

            const replacementNodes = [
              ...(beforeBulletList ? [beforeBulletList] : []),
              taskListNode,
              ...(afterBulletList ? [afterBulletList] : []),
            ]

            const taskListOffset = beforeBulletList ? beforeBulletList.nodeSize : 0
            const taskListEndPos = bulletListStart + taskListOffset + taskListNode.nodeSize

            tr.replaceWith(bulletListStart, bulletListEnd, replacementNodes)
            tr.setSelection(TextSelection.create(tr.doc, bulletListStart + taskListOffset + 3))

            // Join the trailing adjacent taskList first so bulletListStart stays valid for the leading join.
            if (
              !afterBulletList &&
              taskListEndPos < tr.doc.content.size &&
              tr.doc.resolve(taskListEndPos).nodeAfter?.type === taskListType &&
              canJoin(tr.doc, taskListEndPos)
            ) {
              tr.join(taskListEndPos)
            }

            if (
              !beforeBulletList &&
              bulletListStart > 0 &&
              tr.doc.resolve(bulletListStart).nodeBefore?.type === taskListType &&
              canJoin(tr.doc, bulletListStart)
            ) {
              tr.join(bulletListStart)
            }

            return
          }

          if (!$from.blockRange()) {
            return null
          }

          tr.delete(range.from, range.to)
          const $pos = tr.doc.resolve(range.from)
          const blockRange = $pos.blockRange()
          const wrapping = blockRange && findWrapping(blockRange, this.type, { checked })

          if (!wrapping) {
            return null
          }

          const listStartPos = blockRange.start
          tr.wrap(blockRange, wrapping)

          if (
            listStartPos > 0 &&
            tr.doc.resolve(listStartPos).nodeBefore?.type === taskListType &&
            canJoin(tr.doc, listStartPos)
          ) {
            tr.join(listStartPos)
          }
        },
      }),
    ]
  },
})
