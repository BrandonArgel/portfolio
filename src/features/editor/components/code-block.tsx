'use client'

import type { NodeViewProps } from '@tiptap/react'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import { Check, ChevronDown, Copy, FileCode, FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type React from 'react'
import { useMemo, useState } from 'react'
import {
  SiCplusplus,
  SiCss,
  SiDocker,
  SiGo,
  SiHtml5,
  SiJavascript,
  SiJson,
  SiMarkdown,
  SiOpenjdk,
  SiPython,
  SiRust,
  SiToml,
  SiTypescript,
  SiYaml,
} from 'react-icons/si'
import { TbBrandCSharp } from 'react-icons/tb'
import { VscDatabase, VscTerminal } from 'react-icons/vsc'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface CodeLanguageOption {
  label: string
  value: string
}

export interface LanguageIconProps extends React.ComponentPropsWithoutRef<'svg'> {
  language: string
  className?: string
}

const LANGUAGE_ICON_MAP: Readonly<Record<string, React.ComponentType<{ className?: string }>>> = {
  ts: SiTypescript,
  typescript: SiTypescript,
  tsx: SiTypescript,
  js: SiJavascript,
  javascript: SiJavascript,
  jsx: SiJavascript,
  py: SiPython,
  python: SiPython,
  html: SiHtml5,
  htm: SiHtml5,
  css: SiCss,
  json: SiJson,
  md: SiMarkdown,
  markdown: SiMarkdown,
  sh: VscTerminal,
  bash: VscTerminal,
  shell: VscTerminal,
  zsh: VscTerminal,
  sql: VscDatabase,
  rust: SiRust,
  rs: SiRust,
  go: SiGo,
  golang: SiGo,
  cpp: SiCplusplus,
  'c++': SiCplusplus,
  c: SiCplusplus,
  csharp: TbBrandCSharp,
  'c#': TbBrandCSharp,
  cs: TbBrandCSharp,
  java: SiOpenjdk,
  yaml: SiYaml,
  yml: SiYaml,
  toml: SiToml,
  docker: SiDocker,
  dockerfile: SiDocker,
}

export function LanguageIcon({ language, className, ...props }: LanguageIconProps) {
  const lang = language.trim().toLowerCase()

  if (!lang) {
    return <FileText className={className} {...props} />
  }

  const IconComponent = LANGUAGE_ICON_MAP[lang] ?? FileCode
  return <IconComponent className={className} {...props} />
}

export function CodeBlockComponent({ node, updateAttributes }: NodeViewProps) {
  const t = useTranslations('features.editor')
  const [copied, setCopied] = useState(false)
  const currentLanguage = typeof node.attrs.language === 'string' ? node.attrs.language : ''

  const codeLanguages = useMemo<readonly CodeLanguageOption[]>(
    () => [
      { label: t('code_block.auto'), value: '' },
      { label: 'TypeScript', value: 'typescript' },
      { label: 'JavaScript', value: 'javascript' },
      { label: 'TSX', value: 'tsx' },
      { label: 'JSX', value: 'jsx' },
      { label: 'Python', value: 'python' },
      { label: 'HTML', value: 'html' },
      { label: 'CSS', value: 'css' },
      { label: 'JSON', value: 'json' },
      { label: 'Markdown', value: 'markdown' },
      { label: 'Bash / Shell', value: 'bash' },
      { label: 'SQL', value: 'sql' },
      { label: 'Rust', value: 'rust' },
      { label: 'Go', value: 'go' },
      { label: 'C++', value: 'cpp' },
      { label: 'C#', value: 'csharp' },
      { label: 'Java', value: 'java' },
      { label: 'YAML', value: 'yaml' },
      { label: 'TOML', value: 'toml' },
      { label: 'Docker', value: 'dockerfile' },
    ],
    [t],
  )

  const currentOption = useMemo(() => {
    return (
      codeLanguages.find((lang) => lang.value.toLowerCase() === currentLanguage.toLowerCase()) || {
        label: currentLanguage || t('code_block.plain_text'),
        value: currentLanguage,
      }
    )
  }, [codeLanguages, currentLanguage, t])

  const handleLanguageChange = (newLanguage: string) => {
    updateAttributes({ language: newLanguage })
  }

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(node.textContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code block content', err)
    }
  }

  return (
    <NodeViewWrapper as="div" className="not-typeset group relative my-5" data-type="code-block">
      {/* Floating Toolbar with DropdownMenu and Copy Button */}
      <div
        role="toolbar"
        aria-label={t('code_block.actions')}
        contentEditable={false}
        className="absolute top-2 right-2 z-10 flex items-center gap-1.5 select-none opacity-70 transition-opacity hover:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100"
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background/95 px-2.5 py-1 font-mono text-xs text-muted-foreground shadow-xs backdrop-blur-md transition-colors hover:bg-background hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label={t('code_block.select_language')}
                title={t('code_block.select_language')}
              >
                <LanguageIcon language={currentLanguage} className="size-3.5 shrink-0" />
                <span>{currentOption.label}</span>
                <ChevronDown className="size-3 text-muted-foreground" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="max-h-64 w-44 overflow-y-auto">
            {codeLanguages.map((lang) => {
              const isSelected =
                lang.value === currentLanguage || (!currentLanguage && lang.value === '')

              return (
                <DropdownMenuItem
                  key={lang.value || 'auto'}
                  onClick={() => handleLanguageChange(lang.value)}
                  className="flex cursor-pointer items-center gap-2 font-mono text-xs"
                >
                  <LanguageIcon language={lang.value} className="size-3.5 shrink-0" />
                  <span className="flex-1">{lang.label}</span>
                  {isSelected && <Check className="size-3.5 text-primary" />}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? t('code_block.copied') : t('code_block.copy')}
          title={copied ? t('code_block.copied') : t('code_block.copy')}
          className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-border bg-background/95 text-muted-foreground shadow-xs backdrop-blur-md transition-colors hover:bg-background hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {copied ? (
            <Check className="size-3.5 text-green-500 transition-transform scale-110" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      </div>

      <pre className="overflow-x-auto rounded-xl border border-code-border bg-code-bg p-4 font-mono text-sm leading-relaxed shadow-xs">
        <NodeViewContent className={currentLanguage ? `language-${currentLanguage}` : undefined} />
      </pre>
    </NodeViewWrapper>
  )
}
