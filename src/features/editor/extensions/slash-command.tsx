import { Extension } from '@tiptap/core'
import { ReactRenderer } from '@tiptap/react'
import Suggestion, { type SuggestionKeyDownProps, type SuggestionProps } from '@tiptap/suggestion'
import {
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Image,
  Info,
  List,
  ListOrdered,
  Minus,
  Quote,
  Table,
  Type,
  Video,
} from 'lucide-react'
import tippy, { type Instance as TippyInstance } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import { type SlashMenuItem, SlashMenuList } from '../components/slash-menu-list'
import { createCalloutContent } from '../config/callout'

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      dictionary: {
        emptyText: 'No results',
        text: 'Text',
        h1: 'Heading 1',
        h2: 'Heading 2',
        h3: 'Heading 3',
        h4: 'Heading 4',
        h5: 'Heading 5',
        h6: 'Heading 6',
        bulletList: 'Bullet List',
        orderedList: 'Ordered List',
        taskList: 'Task List',
        codeBlock: 'Code Block',
        quote: 'Quote',
        callout: 'Callout',
        divider: 'Divider',
        image: 'Image',
        video: 'Video',
        youtubePrompt: 'YouTube URL:',
        table: 'Table',
      },
      suggestion: {
        char: '/',
        startOfLine: false,
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }) => {
          const dict = this.options.dictionary

          const items: SlashMenuItem[] = [
            {
              title: dict.text,
              icon: <Type className="size-4" />,
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setNode('paragraph').run()
              },
            },
            {
              title: dict.h1,
              icon: <Heading1 className="size-4" />,
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
              },
            },
            {
              title: dict.h2,
              icon: <Heading2 className="size-4" />,
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
              },
            },
            {
              title: dict.h3,
              icon: <Heading3 className="size-4" />,
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
              },
            },
            {
              title: dict.h4,
              icon: <Heading4 className="size-4" />,
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 4 }).run()
              },
            },
            {
              title: dict.h5,
              icon: <Heading5 className="size-4" />,
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 5 }).run()
              },
            },
            {
              title: dict.h6,
              icon: <Heading6 className="size-4" />,
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 6 }).run()
              },
            },
            {
              title: dict.bulletList,
              icon: <List className="size-4" />,
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run()
              },
            },
            {
              title: dict.orderedList,
              icon: <ListOrdered className="size-4" />,
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run()
              },
            },
            {
              title: dict.taskList,
              icon: <List className="size-4" />,
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleTaskList().run()
              },
            },
            {
              title: dict.codeBlock,
              icon: <Code className="size-4" />,
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
              },
            },
            {
              title: dict.quote,
              icon: <Quote className="size-4" />,
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleBlockquote().run()
              },
            },
            {
              title: dict.callout,
              icon: <Info className="size-4" />,
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .insertContent(createCalloutContent())
                  .run()
              },
            },
            {
              title: dict.divider,
              icon: <Minus className="size-4" />,
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setHorizontalRule().run()
              },
            },
            {
              title: dict.image,
              icon: <Image className="size-4" />,
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setNode('image').run()
              },
            },
            {
              title: dict.video,
              icon: <Video className="size-4" />,
              command: ({ editor, range }) => {
                const url = prompt(dict.youtubePrompt || 'YouTube URL:')
                if (url) {
                  editor.chain().focus().deleteRange(range).setYoutubeVideo({ src: url }).run()
                }
              },
            },
            {
              title: dict.table,
              icon: <Table className="size-4" />,
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              },
            },
          ]

          return items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
        },
        command: ({ editor, range, props }) => {
          props.command({ editor, range })
        },
        render: () => {
          let component: ReactRenderer<any>
          let popup: TippyInstance | undefined

          return {
            onStart: (props: SuggestionProps) => {
              component = new ReactRenderer(SlashMenuList, {
                props: { ...props, emptyText: this.options.dictionary.emptyText },
                editor: props.editor,
              })

              if (!props.clientRect) return

              const dummyElement = document.createElement('div')

              popup = tippy(dummyElement, {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                zIndex: 99999,
                arrow: false,
                offset: [0, 8],
                theme: 'notion',
              })
            },
            onUpdate: (props: SuggestionProps) => {
              component.updateProps({ ...props, emptyText: this.options.dictionary.emptyText })
              if (!props.clientRect) return
              popup?.setProps({
                getReferenceClientRect: props.clientRect as () => DOMRect,
              })
            },
            onKeyDown: (props: SuggestionKeyDownProps) => {
              if (props.event.key === 'Escape') {
                popup?.hide()
                return true
              }
              return component.ref?.onKeyDown(props) || false
            },
            onExit: () => {
              popup?.destroy()
              component?.destroy()
            },
          }
        },
      }),
    ]
  },
})
