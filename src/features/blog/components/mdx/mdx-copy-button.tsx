'use client'

import { Check, Copy } from 'lucide-react'

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { cn } from '@/lib/utils'

export interface MdxCopyButtonProps {
  code: string
  className?: string
}

export function MdxCopyButton({ code, className }: MdxCopyButtonProps) {
  const { isCopied, copy } = useCopyToClipboard()

  const handleCopy = () => {
    void copy(code)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={isCopied ? 'Copied code to clipboard' : 'Copy code to clipboard'}
      title={isCopied ? 'Copied!' : 'Copy code'}
      className={cn(
        'flex cursor-pointer select-none items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-ring',
        isCopied
          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        className,
      )}
    >
      {isCopied ? (
        <>
          <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="size-3.5" />
          <span>Copy</span>
        </>
      )}
    </button>
  )
}
