import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import type { PluggableList } from 'unified'

export const sharedRemarkPlugins: PluggableList = [remarkGfm, remarkMath]

export const sharedRehypePlugins: PluggableList = [rehypeKatex]
