import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypePrettyCode, { type Options as RehypePrettyCodeOptions } from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'

import { mdxComponents } from '../mdx'

interface MdxContentServerProps {
  content: string
}

const prettyCodeOptions: RehypePrettyCodeOptions = {
  theme: 'github-dark',
  keepBackground: false,
}

export function MdxContentServer({ content }: MdxContentServerProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none w-full pb-20">
      <MDXRemote
        source={content}
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
          },
        }}
      />
    </div>
  )
}
