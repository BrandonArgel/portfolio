import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypeKatex from 'rehype-katex'
import rehypePrettyCode, { type Options as RehypePrettyCodeOptions } from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkUnwrapImages from 'remark-unwrap-images'

import { mdxComponents } from '../mdx'

interface MdxContentServerProps {
  content: string
}

const prettyCodeOptions: RehypePrettyCodeOptions = {
  theme: 'github-dark',
  keepBackground: false,
}

export function MdxContentServer({ content }: MdxContentServerProps) {
  // Sanitize Tiptap's malformed youtube directive into a valid MDX JSX component
  const safeContent = content.replace(/:::youtube\s*\{([^}]+)\}\s*:::/g, '<YouTube $1 />')

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none w-full pb-20">
      <MDXRemote
        source={safeContent}
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm, remarkUnwrapImages, remarkMath],
            rehypePlugins: [rehypeKatex, [rehypePrettyCode, prettyCodeOptions]],
          },
        }}
      />
    </div>
  )
}
