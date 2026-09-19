import type { MDXComponents } from 'mdx/types'

import { MdxCallout } from './mdx-callout'
import { MdxCode, MdxPre } from './mdx-code-block'
import { MdxInput, MdxLi, MdxOl, MdxUl } from './mdx-lists'
import { MdxIframe, MdxImage, MdxYouTube } from './mdx-media'
import { MdxTable, MdxTbody, MdxTd, MdxTh, MdxThead, MdxTr } from './mdx-table'
import {
  MdxA,
  MdxBlockquote,
  MdxH1,
  MdxH2,
  MdxH3,
  MdxH4,
  MdxH5,
  MdxH6,
  MdxHr,
  MdxP,
} from './mdx-typography'

export const mdxComponents: MDXComponents = {
  h1: MdxH1,
  h2: MdxH2,
  h3: MdxH3,
  h4: MdxH4,
  h5: MdxH5,
  h6: MdxH6,
  p: MdxP,
  a: MdxA,
  hr: MdxHr,
  blockquote: MdxBlockquote,
  ul: MdxUl,
  ol: MdxOl,
  li: MdxLi,
  input: MdxInput,
  table: MdxTable,
  thead: MdxThead,
  tbody: MdxTbody,
  tr: MdxTr,
  th: MdxTh,
  td: MdxTd,
  img: MdxImage,
  iframe: MdxIframe,
  pre: MdxPre,
  code: MdxCode,
  YouTube: (props: any) => <MdxYouTube url={props.src} id={props.id} {...props} />,
  Callout: MdxCallout,
}

export {
  MdxA,
  MdxBlockquote,
  MdxCallout,
  MdxCode,
  MdxH1,
  MdxH2,
  MdxH3,
  MdxH4,
  MdxH5,
  MdxH6,
  MdxHr,
  MdxIframe,
  MdxImage,
  MdxInput,
  MdxLi,
  MdxOl,
  MdxP,
  MdxPre,
  MdxTable,
  MdxTbody,
  MdxTd,
  MdxTh,
  MdxThead,
  MdxTr,
  MdxUl,
  MdxYouTube,
}
