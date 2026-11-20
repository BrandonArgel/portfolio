import type React from 'react'
import { Children, cloneElement, isValidElement } from 'react'

import { cn } from '@/lib/utils'
import { MdxTaskCheckbox } from './mdx-checklist'

function isCheckboxElement(node: React.ReactNode): node is React.ReactElement<{ type?: unknown }> {
  return isValidElement<{ type?: unknown }>(node) && node.props.type === 'checkbox'
}

function findLeadingNonWhitespaceIndex(nodes: readonly React.ReactNode[]): number {
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i]
    if (typeof node === 'string' && node.trim() === '') {
      continue
    }
    return i
  }
  return -1
}

function trimLeadingHorizontalSpace(nodes: readonly React.ReactNode[]): React.ReactNode[] {
  const result: React.ReactNode[] = []
  let trimming = true

  for (const node of nodes) {
    if (!trimming) {
      result.push(node)
      continue
    }

    if (typeof node === 'string') {
      const stripped = node.replace(/^[ \t]+/, '')
      if (stripped.length > 0) {
        result.push(stripped)
        trimming = false
      }
      continue
    }

    trimming = false
    result.push(node)
  }

  return result
}

interface SplitTaskListItemResult {
  checkbox: React.ReactNode
  content: React.ReactNode[]
}

export function splitTaskListItemChildren(
  children: React.ReactNode,
): SplitTaskListItemResult | null {
  const directChildren = Children.toArray(children)
  const firstIdx = findLeadingNonWhitespaceIndex(directChildren)

  if (firstIdx === -1) {
    return null
  }

  const firstNode = directChildren[firstIdx]

  if (isCheckboxElement(firstNode)) {
    return {
      checkbox: firstNode,
      content: trimLeadingHorizontalSpace(directChildren.slice(firstIdx + 1)),
    }
  }

  if (isValidElement<{ children?: React.ReactNode; className?: string }>(firstNode)) {
    const nested = Children.toArray(firstNode.props.children)
    const nestedIdx = findLeadingNonWhitespaceIndex(nested)

    if (nestedIdx !== -1 && isCheckboxElement(nested[nestedIdx])) {
      const checkbox = nested[nestedIdx]
      const remainingNested = trimLeadingHorizontalSpace(nested.slice(nestedIdx + 1))
      const tail = directChildren
        .slice(firstIdx + 1)
        .filter((node) => !(typeof node === 'string' && node.trim() === ''))

      if (tail.length === 0) {
        return {
          checkbox,
          content: remainingNested,
        }
      }

      const clonedParagraph = cloneElement(
        firstNode,
        { className: cn('mt-0', firstNode.props.className) },
        ...remainingNested,
      )

      return {
        checkbox,
        content: [clonedParagraph, ...tail],
      }
    }
  }

  return null
}

export function MdxUl({ className, ...props }: React.ComponentPropsWithoutRef<'ul'>) {
  return (
    <ul
      className={cn(
        'my-6 ml-6 list-disc [&>li]:mt-2 [&.contains-task-list]:ml-0 [&.contains-task-list]:list-none',
        className,
      )}
      {...props}
    />
  )
}

export function MdxOl({ className, ...props }: React.ComponentPropsWithoutRef<'ol'>) {
  return <ol className={cn('my-6 ml-6 list-decimal [&>li]:mt-2', className)} {...props} />
}

export function MdxLi({ className, children, ...props }: React.ComponentPropsWithoutRef<'li'>) {
  const isTaskItem = className?.split(/\s+/).includes('task-list-item')
  const split = isTaskItem ? splitTaskListItemChildren(children) : null

  if (split) {
    return (
      <li
        className={cn(
          'leading-7 [&.task-list-item]:flex [&.task-list-item]:items-start [&.task-list-item]:gap-2.5 [&.task-list-item:has(>input:checked)>span]:line-through [&.task-list-item:has(>input:checked)>span]:text-muted-foreground [&.task-list-item:has(>input:checked)>span]:opacity-70',
          className,
        )}
        {...props}
      >
        {split.checkbox}
        <span className="min-w-0 flex-1 [&>p:first-child]:mt-0">{split.content}</span>
      </li>
    )
  }

  return (
    <li className={cn('leading-7', className)} {...props}>
      {children}
    </li>
  )
}

export function MdxInput({ type, className, ...props }: React.ComponentPropsWithoutRef<'input'>) {
  if (type === 'checkbox') {
    return <MdxTaskCheckbox type="checkbox" className={className} {...props} />
  }

  return <input type={type} className={className} {...props} />
}
