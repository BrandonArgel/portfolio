import remarkGfm from 'remark-gfm'
import type { PluggableList } from 'unified'
// import remarkMath from 'remark-math'
// import rehypeKatex from 'rehype-katex'
// import rehypeRaw from 'rehype-raw'

export const sharedRemarkPlugins: PluggableList = [
  remarkGfm,
  // remarkMath,
]

export const sharedRehypePlugins: PluggableList = [
  // rehypeKatex,
]
