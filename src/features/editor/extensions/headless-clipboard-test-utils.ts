import type { Editor } from '@tiptap/core'
import { Fragment, Slice } from '@tiptap/pm/model'

function createEmptyFileList(): FileList {
  const emptyFiles: readonly File[] = []
  return {
    length: 0,
    item: () => null,
    [Symbol.iterator]: () => emptyFiles.values(),
  }
}

function createEmptyDataTransferItemList(): DataTransferItemList {
  const emptyItems: readonly DataTransferItem[] = []
  return {
    length: 0,
    add: () => null,
    clear: () => {},
    remove: () => {},
    [Symbol.iterator]: () => emptyItems.values(),
  }
}

class HeadlessDataTransfer implements DataTransfer {
  dropEffect: DataTransfer['dropEffect'] = 'none'
  effectAllowed: DataTransfer['effectAllowed'] = 'all'
  readonly files: FileList = createEmptyFileList()
  readonly items: DataTransferItemList = createEmptyDataTransferItemList()
  readonly types: readonly string[]
  private readonly store: ReadonlyMap<string, string>

  constructor(data: Record<string, string>) {
    const map = new Map<string, string>(Object.entries(data))
    this.store = map
    this.types = Array.from(map.keys())
  }

  clearData(): void {}

  getData(format: string): string {
    return this.store.get(format) ?? ''
  }

  setData(): void {}

  setDragImage(): void {}
}

export class HeadlessClipboardEvent extends Event implements ClipboardEvent {
  readonly clipboardData: DataTransfer

  constructor(data: Record<string, string>) {
    super('paste', { cancelable: true })
    this.clipboardData = new HeadlessDataTransfer(data)
  }
}

export function pastePlainText(
  editor: Editor,
  text: string,
  extraData: Record<string, string> = {},
): boolean {
  const event = new HeadlessClipboardEvent({
    'text/plain': text,
    ...extraData,
  })
  const emptySlice = new Slice(Fragment.empty, 0, 0)

  for (const plugin of editor.state.plugins) {
    const handlePaste = plugin.props.handlePaste
    if (handlePaste?.call(plugin, editor.view, event, emptySlice)) {
      return true
    }
  }

  return false
}
