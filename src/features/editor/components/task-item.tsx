import type { NodeViewProps } from '@tiptap/react'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export const TaskItemComponent = (props: NodeViewProps) => {
  const { node, updateAttributes, editor: isEditable } = props
  const { checked } = node.attrs

  return (
    <NodeViewWrapper
      className="not-typeset flex w-full items-center gap-3 my-2 not-prose"
      data-type="taskItem"
      data-checked={checked ? 'true' : 'false'}
    >
      <div
        className="flex items-center justify-center select-none"
        contentEditable="false"
        suppressContentEditableWarning
      >
        <Checkbox
          checked={checked}
          onCheckedChange={(isChecked) => {
            if (isEditable.isEditable) {
              updateAttributes({ checked: isChecked })
            }
          }}
          className="size-4"
        />
      </div>

      <NodeViewContent
        className={cn(
          'flex-1 min-w-0 transition-all duration-150',
          checked && 'line-through text-muted-foreground opacity-70',
        )}
      />
    </NodeViewWrapper>
  )
}
