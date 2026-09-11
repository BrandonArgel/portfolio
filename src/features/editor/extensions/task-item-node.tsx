import TaskItem from '@tiptap/extension-task-item'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { TaskItemComponent } from '../components/task-item'

export const TaskItemNode = TaskItem.extend({
  name: 'taskItem',

  addNodeView() {
    return ReactNodeViewRenderer(TaskItemComponent, {
      as: 'li',
      className: 'task-item-wrapper',
    })
  },
})
