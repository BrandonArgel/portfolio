import type { MDXComponents } from 'mdx/types'
import { cn } from '@/lib/utils'
import { CalloutWrapper } from './callout-wrapper'
import { CodeBlockWrapper } from './code-block'
import { YoutubeEmbed } from './youtube-embed'

interface MarkdownNode {
  type: string
  tagName?: string
  children?: MarkdownNode[]
}

type ParagraphProps = React.ComponentPropsWithoutRef<'p'> & {
  node?: MarkdownNode
}

export const sharedMdxComponents: MDXComponents = {
  YoutubeEmbed,
  youtubeembed: YoutubeEmbed as React.ComponentType<React.ComponentPropsWithoutRef<'div'>>,

  pre: (props: React.ComponentPropsWithoutRef<'pre'>) => {
    return <CodeBlockWrapper {...props} />
  },

  code: ({ className, children, ...props }: React.ComponentPropsWithoutRef<'code'>) => {
    return (
      <code className={cn('font-mono text-sm', className)} {...props}>
        {children}
      </code>
    )
  },

  blockquote: (props: React.ComponentPropsWithoutRef<'blockquote'>) => {
    return <CalloutWrapper {...props} />
  },

  p: ({ children, node, ...props }: ParagraphProps) => {
    const containsCustomBlock = node?.children?.some(
      (child) =>
        child.type === 'element' && child.tagName && ['youtubeembed'].includes(child.tagName),
    )

    if (containsCustomBlock) return <>{children}</>

    return <p {...props}>{children}</p>
  },
}
