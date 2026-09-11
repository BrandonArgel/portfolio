import { type Ref, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import { cn } from '@/lib/utils'

interface SlashMenuListRef {
  onKeyDown: (args: { event: KeyboardEvent }) => boolean
}

interface SlashMenuListProps {
  items: any[]
  command: (item: any) => void
  emptyText: string
  ref?: Ref<SlashMenuListRef>
}

export const SlashMenuList = ({ items, command, emptyText, ref }: SlashMenuListProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!items) return
    setSelectedIndex(0)
  }, [items])

  useEffect(() => {
    const activeElement = document.getElementById(`slash-menu-item-${selectedIndex}`)
    if (activeElement) {
      activeElement.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  const selectItem = useCallback(
    (index: number) => {
      const item = items[index]
      if (item) {
        command(item)
      }
    },
    [items, command],
  )

  useImperativeHandle(
    ref,
    () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((prev) => (prev + items.length - 1) % items.length)
          return true
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((prev) => (prev + 1) % items.length)
          return true
        }
        if (event.key === 'Enter') {
          selectItem(selectedIndex)
          return true
        }
        return false
      },
    }),
    [items.length, selectedIndex, selectItem],
  )

  return (
    <div className="flex w-64 max-h-128 overflow-y-auto flex-col gap-1 rounded-md border border-border bg-background p-1.5 shadow-xl">
      {items.length > 0 ? (
        items.map((item, index) => (
          <button
            key={index}
            id={`slash-menu-item-${index}`}
            type="button"
            onClick={() => selectItem(index)}
            className={cn(
              'flex items-center gap-3 rounded-sm px-2 py-2 text-sm text-left transition-colors cursor-pointer',
              index === selectedIndex
                ? 'bg-muted text-foreground font-medium'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            <div className="flex size-6 items-center justify-center rounded-sm border border-border bg-background">
              {item.icon}
            </div>
            <span>{item.title}</span>
          </button>
        ))
      ) : (
        <div className="p-3 text-sm text-center text-muted-foreground">{emptyText}</div>
      )}
    </div>
  )
}

SlashMenuList.displayName = 'SlashMenuList'
