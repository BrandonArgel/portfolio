'use client'

import type { Editor } from '@tiptap/core'
import { Mathematics } from '@tiptap/extension-mathematics'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TaskList from '@tiptap/extension-task-list'
import Youtube from '@tiptap/extension-youtube'
import { CharacterCount } from '@tiptap/extensions'
import { Markdown } from '@tiptap/markdown'
import { useEditor as useTiptapEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useTranslations } from 'next-intl'
import { useCallback, useMemo, useRef } from 'react'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { highlighter } from '@/lib/highlighter'
import { cn } from '@/lib/utils'

import { CalloutNode } from '../extensions/callout-node'
import { CalloutTitleNode } from '../extensions/callout-title-node'
import { CodeBlockNode } from '../extensions/code-block-node'
import { HighlightMark } from '../extensions/highlight-mark'
import { ImageNode } from '../extensions/image-node'
import { SlashCommand } from '../extensions/slash-command'
import { TaskItemNode } from '../extensions/task-item-node'
import { ColorExtension, TextStyleMark } from '../extensions/text-style-mark'

interface UseBlogEditorProps {
  initialContent?: string
  onChange?: (content: string) => void
  onImageUpload?: (file: File) => Promise<string | undefined>
  onSavingChange?: (isSaving: boolean) => void
}

export function useEditor({
  initialContent = '',
  onChange,
  onImageUpload,
  onSavingChange,
}: UseBlogEditorProps) {
  const t = useTranslations('features.editor')

  const onChangeRef = useRef(onChange)
  const onImageUploadRef = useRef(onImageUpload)
  const onSavingChangeRef = useRef(onSavingChange)

  onChangeRef.current = onChange
  onImageUploadRef.current = onImageUpload
  onSavingChangeRef.current = onSavingChange

  const editorRef = useRef<Editor | null>(null)

  const isSavingRef = useRef(false)

  const setSaving = useCallback((value: boolean) => {
    if (isSavingRef.current === value) return

    isSavingRef.current = value
    onSavingChangeRef.current?.(value)
  }, [])

  const debouncedUpdates = useDebouncedCallback(
    useCallback(
      (editor: Editor) => {
        const markdown = editor.getMarkdown()

        queueMicrotask(() => {
          onChangeRef.current?.(markdown)
          setSaving(false)
        })
      },
      [setSaving],
    ),
    500,
  )

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: {
          HTMLAttributes: {
            class: 'font-bold font-heading',
          },
        },
        codeBlock: false,
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class:
              'text-primary underline underline-offset-4 cursor-pointer font-medium transition-colors hover:text-primary/80',
          },
        },
        dropcursor: {
          color: 'var(--color-primary)',
          width: 2,
        },
      }),
      CharacterCount,
      TextStyleMark,
      ColorExtension,
      HighlightMark.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'rounded-sm px-1',
        },
      }),
      Placeholder.configure({
        placeholder: t('placeholder'),
        showOnlyCurrent: true,
      }),
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
          table: t('commands.table'),
          blockMath: t('commands.block_math'),
        },
      }),
      CodeBlockNode.configure({
        highlighter,
        defaultLanguage: 'plaintext',
      }),
      CalloutNode,
      CalloutTitleNode,
      ImageNode.configure({
        uploadFn: async (file: File) => {
          return onImageUploadRef.current?.(file)
        },
      }),
      Markdown.configure({
        markedOptions: {
          gfm: true,
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'list-none p-0 m-0',
        },
      }),
      TaskItemNode.configure({
        nested: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({
        inline: false,
        nocookie: true,
        modestBranding: true,
        HTMLAttributes: {
          class: 'h-full w-full border-0',
        },
      }),
      Mathematics.configure({
        inlineOptions: {
          onClick: (_node, pos) => {
            editorRef.current?.chain().focus().setNodeSelection(pos).run()
          },
        },
        blockOptions: {
          onClick: (_node, pos) => {
            editorRef.current?.chain().focus().setNodeSelection(pos).run()
          },
        },
        katexOptions: {
          throwOnError: false,
        },
      }),
    ],
    [t],
  )

  const editorProps = useMemo(
    () => ({
      attributes: {
        class: cn(
          'typeset typeset-docs prose-neutral dark:prose-invert',
          'w-full min-h-full max-w-none mx-auto focus:outline-none px-4 pt-4 md:px-8 md:pt-8 pb-8',
        ),
        spellcheck: 'false',
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
      },
    }),
    [],
  )

  const editor = useTiptapEditor({
    content: initialContent,
    contentType: 'markdown',
    editorProps,
    extensions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    onCreate: ({ editor }) => {
      editorRef.current = editor
    },
    onDestroy: () => {
      editorRef.current = null
    },
    onUpdate: ({ editor }) => {
      setSaving(true)
      debouncedUpdates(editor)
    },
  })

  return editor
}
