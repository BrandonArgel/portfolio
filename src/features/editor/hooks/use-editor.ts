import Gapcursor from '@tiptap/extension-gapcursor'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TaskList from '@tiptap/extension-task-list'
import Youtube from '@tiptap/extension-youtube'
import { useEditor as useTiptapEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useTranslations } from 'next-intl'
import { useState, useTransition } from 'react'
import { Markdown } from 'tiptap-markdown'
import { useDebounceCallback } from '@/hooks/use-debounced-callback'
import { cn } from '@/lib/utils'
import { CalloutNode } from '../extensions/callout-node'
import { ImageNode } from '../extensions/image-node'
import { SlashCommand } from '../extensions/slash-command'
import { TaskItemNode } from '../extensions/task-item-node'

interface UseBlogEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  onImageUpload?: (file: File) => Promise<string | undefined>
}

export function useEditor({ initialContent = '', onChange, onImageUpload }: UseBlogEditorProps) {
  const t = useTranslations('features.editor')
  const [saveStatus, setSaveStatus] = useState<boolean>(true)
  const [isPending, startTransition] = useTransition()

  const debouncedUpdates = useDebounceCallback((editorInstance: any) => {
    const markdown = editorInstance.storage.markdown?.getMarkdown() || ''
    startTransition(() => {
      onChange?.(markdown)
      setSaveStatus(true)
    })
  }, 500)

  const editor = useTiptapEditor({
    extensions: [
      StarterKit.configure({
        heading: { HTMLAttributes: { class: 'font-bold font-heading' } },
        codeBlock: {
          HTMLAttributes: {
            class: 'rounded-md bg-code-bg border border-code-border p-5 font-mono',
          },
        },
      }),
      CalloutNode,
      Gapcursor,
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-primary/20 text-primary rounded-sm px-1',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            'text-primary underline underline-offset-4 cursor-pointer font-medium transition-colors hover:text-primary/80',
        },
      }),
      Placeholder.configure({ placeholder: t('placeholder'), showOnlyCurrent: true }),
      SlashCommand.configure({
        dictionary: {
          emptyText: t('commands.no_commands_found'),
          text: t('commands.text'),
          h1: t('commands.h1'),
          h2: t('commands.h2'),
          h3: t('commands.h3'),
          h4: t('commands.h4'),
          h5: t('commands.h5'),
          h6: t('commands.h6'),
          bulletList: t('commands.bullet_list'),
          orderedList: t('commands.ordered_list'),
          taskList: t('commands.task_list'),
          codeBlock: t('commands.code_block'),
          quote: t('commands.quote'),
          callout: t('commands.callout'),
          divider: t('commands.divider'),
          image: t('commands.image'),
          video: t('commands.video'),
          youtubePrompt: t('commands.youtube_prompt'),
          table: t('commands.table'),
        },
      }),
      ImageNode,
      Markdown,
      TaskList.configure({
        HTMLAttributes: {
          class: 'list-none p-0 m-0',
        },
      }),
      TaskItemNode.configure({
        nested: false,
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({
        inline: false,
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-lg border border-border shadow-sm my-6',
        },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: cn(
          'typeset typeset-docs prose-neutral dark:prose-invert',
          'w-full max-w-none focus:outline-none overflow-y-auto p-8 sm:p-12 min-h-[600px] h-full scroll-smooth',
        ),
        spellcheck: 'false',
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
      },
      handlePaste: (_, event) => {
        const items = event.clipboardData?.items
        if (!items || !onImageUpload) return false

        for (const item of items) {
          if (item.type.indexOf('image') === 0) {
            event.preventDefault()
            const file = item.getAsFile()

            if (file) {
              onImageUpload(file).then((url) => {
                if (url && editor) {
                  editor
                    .chain()
                    .focus()
                    .insertContent({
                      type: 'image',
                      attrs: { src: url, alt: t('image_alt_placeholder') },
                    })
                    .run()
                }
              })
            }
            return true
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      setSaveStatus(false)
      debouncedUpdates(editor)
    },
  })

  const isSaving = !saveStatus || isPending

  return { editor, isSaving }
}
