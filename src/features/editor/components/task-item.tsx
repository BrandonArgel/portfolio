import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import { Checkbox } from '@/components/ui/checkbox'

export const TaskItemComponent = (props: any) => {
  const { node, updateAttributes, editor: isEditable } = props
  const { checked } = node.attrs

  return (
    <NodeViewWrapper
      className="not-typeset flex w-full items-center gap-3 my-2 not-prose"
      data-type="taskItem"
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

      <NodeViewContent className="flex-1 min-w-0" />
    </NodeViewWrapper>
  )
}
