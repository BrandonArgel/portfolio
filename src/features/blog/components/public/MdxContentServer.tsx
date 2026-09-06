import { MDXRemote } from 'next-mdx-remote/rsc'
import { cn } from '@/lib/utils'
import { sharedMdxComponents } from '../shared/mdx-components'
import { sharedRehypePlugins, sharedRemarkPlugins } from '../shared/mdx-plugins'

export function MdxContentServer({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn('typeset typeset-docs w-full max-w-none wrap-break-word', className)}>
      <MDXRemote
        source={content}
        components={sharedMdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: sharedRemarkPlugins,
            rehypePlugins: sharedRehypePlugins,
          },
        }}
      />
    </div>
  )
}
