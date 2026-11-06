import { createHighlighter, type Highlighter } from '@tanstack/highlight/core'
import { c } from '@tanstack/highlight/languages/c'
import { cpp } from '@tanstack/highlight/languages/cpp'
import { csharp } from '@tanstack/highlight/languages/csharp'
import { css } from '@tanstack/highlight/languages/css'
import { dockerfile } from '@tanstack/highlight/languages/dockerfile'
import { go } from '@tanstack/highlight/languages/go'
import { html } from '@tanstack/highlight/languages/html'
import { java } from '@tanstack/highlight/languages/java'
import { js } from '@tanstack/highlight/languages/js'
import { json } from '@tanstack/highlight/languages/json'
import { jsx } from '@tanstack/highlight/languages/jsx'
import { markdown } from '@tanstack/highlight/languages/markdown'
import { plaintext } from '@tanstack/highlight/languages/plaintext'
import { python } from '@tanstack/highlight/languages/python'
import { rust } from '@tanstack/highlight/languages/rust'
import { shell } from '@tanstack/highlight/languages/shell'
import { sql } from '@tanstack/highlight/languages/sql'
import { toml } from '@tanstack/highlight/languages/toml'
import { ts } from '@tanstack/highlight/languages/ts'
import { tsx } from '@tanstack/highlight/languages/tsx'
import { yaml } from '@tanstack/highlight/languages/yaml'

/**
 * Singleton, tree-shaken @tanstack/highlight instance shared between
 * the Tiptap editor (ProseMirror inline decorations) and SSR/MDX rendering.
 */
export const highlighter: Highlighter = createHighlighter({
  fallbackLanguage: 'plaintext',
  languages: [
    plaintext,
    ts,
    js,
    tsx,
    jsx,
    python,
    html,
    css,
    json,
    markdown,
    shell,
    sql,
    rust,
    go,
    cpp,
    c,
    csharp,
    java,
    yaml,
    toml,
    dockerfile,
  ],
})
