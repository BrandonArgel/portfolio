import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkUnwrapImages from 'remark-unwrap-images'

import { preprocessMdxContent } from '../../utils/preprocess-mdx'
import { mdxComponents } from '../mdx'

interface MdxContentServerProps {
  content: string
}

export function MdxContentServer({ content }: MdxContentServerProps) {
  const safeContent = preprocessMdxContent(content)

  return (
    <div className="typeset typeset-docs prose prose-neutral dark:prose-invert max-w-none w-full pb-20">
      <MDXRemote
        source={safeContent}
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm, remarkUnwrapImages, remarkMath],
            rehypePlugins: [rehypeKatex],
          },
        }}
      />
    </div>
  )
}
