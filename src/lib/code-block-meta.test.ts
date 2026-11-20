import { describe, expect, test } from 'bun:test'
import {
  buildLineDecorations,
  cycleLineAnnotation,
  formatLineRanges,
  getLineAnnotationMap,
  inferLanguageFromFilename,
  normalizeStartLine,
  parseCodeFenceInfo,
  parseCodeFenceMeta,
  parseLineRanges,
  serializeCodeFenceInfo,
} from './code-block-meta'

describe('inferLanguageFromFilename', () => {
  test('infers languages from extensions, nested paths, and special filenames', () => {
    expect(inferLanguageFromFilename('example.tsx')).toBe('tsx')
    expect(inferLanguageFromFilename('src/lib/highlighter.ts')).toBe('typescript')
    expect(inferLanguageFromFilename('migrations\\0001_init.sql')).toBe('sql')
    expect(inferLanguageFromFilename('Dockerfile')).toBe('dockerfile')
    expect(inferLanguageFromFilename('Dockerfile.prod')).toBe('dockerfile')
    expect(inferLanguageFromFilename('styles/main.css')).toBe('css')
    expect(inferLanguageFromFilename('scripts/deploy.sh')).toBe('bash')
    expect(inferLanguageFromFilename('.zshrc')).toBe('bash')
    expect(inferLanguageFromFilename('Cargo.toml')).toBe('toml')
  })

  test('returns null for unrecognized extensions or blank names', () => {
    expect(inferLanguageFromFilename('')).toBeNull()
    expect(inferLanguageFromFilename('README')).toBeNull()
    expect(inferLanguageFromFilename('archive.unknown')).toBeNull()
  })
})

describe('line range helpers & cycling', () => {
  test('parses and formats line numbers and ranges cleanly', () => {
    expect(parseLineRanges('5, 2-4, 4, invalid, 10-8, 0')).toEqual([2, 3, 4, 5])
    expect(formatLineRanges([5, 3, 1, 4, 3, 9])).toBe('1,3-5,9')
    expect(formatLineRanges([])).toBe('')
    expect(normalizeStartLine('15')).toBe(15)
    expect(normalizeStartLine('0')).toBe(1)
    expect(normalizeStartLine(-4)).toBe(1)
  })

  test('cycles line annotations exclusively: normal -> highlight -> add -> remove -> normal', () => {
    let state = { highlight: '1', add: '', remove: '' }

    state = cycleLineAnnotation(3, state)
    expect(state).toEqual({ highlight: '1,3', add: '', remove: '' })

    state = cycleLineAnnotation(3, state)
    expect(state).toEqual({ highlight: '1', add: '3', remove: '' })

    state = cycleLineAnnotation(3, state)
    expect(state).toEqual({ highlight: '1', add: '', remove: '3' })

    state = cycleLineAnnotation(3, state)
    expect(state).toEqual({ highlight: '1', add: '', remove: '' })
  })

  test('builds TanStack Highlight decorations and line annotation map', () => {
    const annotations = { highlight: '2', add: '4-6', remove: '8,10' }
    const map = getLineAnnotationMap(annotations)

    expect(map.get(2)).toBe('highlight')
    expect(map.get(5)).toBe('add')
    expect(map.get(8)).toBe('remove')
    expect(map.get(9)).toBeUndefined()

    expect(buildLineDecorations(annotations)).toEqual([
      { className: 'th-line--highlighted', lines: 2 },
      { className: 'th-line--inserted', lines: [4, 6] },
      { className: 'th-line--deleted', lines: 8 },
      { className: 'th-line--deleted', lines: 10 },
    ])
  })
})

describe('parseCodeFenceMeta / parseCodeFenceInfo / serializeCodeFenceInfo', () => {
  test('parses canonical and alias fence metadata strings', () => {
    const canonical = parseCodeFenceInfo(
      'tsx title="src/app/page.tsx" highlight="5" add="7-10" remove="3" startLine="12" lineNumbers="false"',
    )

    expect(canonical).toEqual({
      language: 'tsx',
      title: 'src/app/page.tsx',
      highlight: '5',
      add: '7-10',
      remove: '3',
      startLine: 12,
      lineNumbers: false,
    })

    const aliases = parseCodeFenceMeta(
      "filename='app.py' {2, 4-5} ins={7-8} del={1} start=5 showLineNumbers",
    )
    expect(aliases).toEqual({
      title: 'app.py',
      highlight: '2,4-5',
      add: '7-8',
      remove: '1',
      startLine: 5,
      lineNumbers: true,
    })
  })

  test('handles language-only, empty, and meta-only fence info strings', () => {
    expect(parseCodeFenceInfo('typescript')).toEqual({
      language: 'typescript',
      title: '',
      highlight: '',
      add: '',
      remove: '',
      startLine: 1,
      lineNumbers: true,
    })

    expect(parseCodeFenceInfo('title="notes.txt" highlight="2"')).toEqual({
      language: '',
      title: 'notes.txt',
      highlight: '2',
      add: '',
      remove: '',
      startLine: 1,
      lineNumbers: true,
    })
  })

  test('serializes cleanly while omitting defaults and preserving CommonMark meta separation', () => {
    expect(
      serializeCodeFenceInfo({
        language: 'tsx',
        title: 'example.tsx',
        highlight: '5',
        add: '7, 8, 9, 10',
        remove: '3',
        startLine: 1,
        lineNumbers: true,
      }),
    ).toBe('tsx title="example.tsx" highlight="5" add="7-10" remove="3"')

    expect(serializeCodeFenceInfo({ language: 'sql', lineNumbers: true, startLine: 1 })).toBe('sql')

    expect(serializeCodeFenceInfo({ language: '', title: 'snippet.txt', lineNumbers: false })).toBe(
      'text title="snippet.txt" lineNumbers="false"',
    )

    expect(serializeCodeFenceInfo({ language: '', startLine: 1, lineNumbers: true })).toBe('')
  })
})
