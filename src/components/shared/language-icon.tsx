import { FileCode, FileText } from 'lucide-react'
import type React from 'react'
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

interface LanguageIconProps extends React.ComponentPropsWithoutRef<'svg'> {
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
  mdx: SiMarkdown,
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
  text: FileText,
  plaintext: FileText,
}

export function LanguageIcon({ language, className, ...props }: LanguageIconProps) {
  const lang = language.trim().toLowerCase()

  if (!lang) {
    return <FileText className={className} {...props} />
  }

  const IconComponent = LANGUAGE_ICON_MAP[lang] ?? FileCode
  return <IconComponent className={className} {...props} />
}
