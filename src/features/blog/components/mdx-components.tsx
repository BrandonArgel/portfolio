import type { MDXComponents } from 'mdx/types'
import Image from 'next/image'

export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1 className="mt-10 mb-4 text-4xl font-extrabold tracking-tight lg:text-5xl" {...props} />
  ),
  h2: (props) => (
    <h2
      className="mt-10 mb-4 text-3xl font-bold tracking-tight transition-colors border-b border-border/50 pb-2"
      {...props}
    />
  ),
  h3: (props) => <h3 className="mt-8 mb-4 text-2xl font-semibold tracking-tight" {...props} />,
  p: (props) => <p className="leading-7 not-first:mt-6 text-muted-foreground" {...props} />,
  ul: (props) => <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />,
  ol: (props) => <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />,
  code: (props) => (
    <code
      className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-primary"
      {...props}
    />
  ),

  img: (props) => (
    <div className="my-8 relative w-full flex justify-center overflow-hidden rounded-xl border border-border bg-muted/50">
      <Image
        src={props.src || ''}
        alt={props.alt || 'Blog image'}
        width={1200}
        height={630}
        className="object-cover w-full h-auto transition-all hover:scale-[1.02] duration-500"
      />
    </div>
  ),
}
