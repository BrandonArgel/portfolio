'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface CodeCopyButtonProps {
  code: string
}

export function CodeCopyButton({ code }: CodeCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available – fail silently
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied!' : 'Copy code'}
      className={cn(
        'flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-mono transition-colors cursor-pointer',
        copied
          ? 'bg-emerald-500/20 text-emerald-400'
          : 'bg-zinc-700/60 text-zinc-400 hover:bg-zinc-600/60 hover:text-zinc-200',
      )}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}
