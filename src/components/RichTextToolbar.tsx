import React from 'react'
import { Bold, Underline, Italic, List, ListOrdered, Heading1, Heading2, Heading3, Quote, Link } from 'lucide-react'

type Props = {
  targetRef: React.RefObject<HTMLTextAreaElement>
  value: string
  onChange: (v: string) => void
}

const setSelection = (el: HTMLTextAreaElement, start: number, end: number) => {
  requestAnimationFrame(() => {
    el.focus()
    el.setSelectionRange(start, end)
  })
}

export const RichTextToolbar: React.FC<Props> = ({ targetRef, value, onChange }) => {
  const wrap = (tokenStart: string, tokenEnd: string) => {
    const el = targetRef.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const before = value.slice(0, s)
    const selected = value.slice(s, e)
    const after = value.slice(e)
    if (s === e) {
      const next = `${before}${tokenStart}${tokenEnd}${after}`
      onChange(next)
      setSelection(el, s + tokenStart.length, s + tokenStart.length)
    } else {
      const next = `${before}${tokenStart}${selected}${tokenEnd}${after}`
      onChange(next)
      setSelection(el, s + tokenStart.length, e + tokenStart.length)
    }
  }

  const prefixLines = (getPrefix: (i: number) => string) => {
    const el = targetRef.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const before = value.slice(0, s)
    const selected = value.slice(s, e)
    const after = value.slice(e)

    const selText = selected || ''
    const lines = (selText || value).split(/\r?\n/)

    let startIdx = s
    let endIdx = e
    if (!selText) {
      const lineStart = value.lastIndexOf('\n', s - 1) + 1
      const lineEndBreak = value.indexOf('\n', s)
      const lineEnd = lineEndBreak === -1 ? value.length : lineEndBreak
      startIdx = lineStart
      endIdx = lineEnd
    }

    const block = value.slice(startIdx, endIdx)
    const blockLines = block.split(/\r?\n/)
    const nextBlock = blockLines.map((l, i) => `${getPrefix(i)}${l.replace(/^\s*(?:#{1,6}\s*|>\s*|[-*]|\d+\.\s*)?/, '')}`).join('\n')
    const next = `${value.slice(0, startIdx)}${nextBlock}${value.slice(endIdx)}`
    onChange(next)
    setSelection(el, startIdx, startIdx + nextBlock.length)
  }

  const prefixHeading = (level: 1 | 2 | 3) => {
    const token = '#'.repeat(level) + ' '
    prefixLines(() => token)
  }

  const insertLink = () => {
    const el = targetRef.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const before = value.slice(0, s)
    const selected = value.slice(s, e)
    const after = value.slice(e)
    const label = selected || 'texto'
    const snippet = `[${label}](https://)`
    const next = `${before}${snippet}${after}`
    onChange(next)
    const urlStart = before.length + label.length + 3
    const urlEnd = urlStart + 8
    setSelection(el, urlStart, urlEnd)
  }

  return (
    <div className="flex items-center gap-2 bg-[#0b1326] border border-white/10 px-2 py-2 rounded-lg">
      <button type="button" className="text-white/80 hover:text-white" onClick={() => wrap('**', '**')} title="Negrito">
        <Bold className="w-4 h-4" />
      </button>
      <button type="button" className="text-white/80 hover:text-white" onClick={() => wrap('*', '*')} title="Itálico">
        <Italic className="w-4 h-4" />
      </button>
      <button type="button" className="text-white/80 hover:text-white" onClick={() => wrap('__', '__')} title="Sublinhado">
        <Underline className="w-4 h-4" />
      </button>
      <span className="w-px h-4 bg-white/10" />
      <button type="button" className="text-white/80 hover:text-white" onClick={() => prefixHeading(1)} title="Título H1">
        <Heading1 className="w-4 h-4" />
      </button>
      <button type="button" className="text-white/80 hover:text-white" onClick={() => prefixHeading(2)} title="Título H2">
        <Heading2 className="w-4 h-4" />
      </button>
      <button type="button" className="text-white/80 hover:text-white" onClick={() => prefixHeading(3)} title="Título H3">
        <Heading3 className="w-4 h-4" />
      </button>
      <button type="button" className="text-white/80 hover:text-white" onClick={() => prefixLines(() => '> ')} title="Citação">
        <Quote className="w-4 h-4" />
      </button>
      <button type="button" className="text-white/80 hover:text-white" onClick={insertLink} title="Link">
        <Link className="w-4 h-4" />
      </button>
      <button type="button" className="text-white/80 hover:text-white" onClick={() => prefixLines(() => '- ')} title="Lista">
        <List className="w-4 h-4" />
      </button>
      <button type="button" className="text-white/80 hover:text-white" onClick={() => prefixLines((i) => `${i + 1}. `)} title="Lista numerada">
        <ListOrdered className="w-4 h-4" />
      </button>
    </div>
  )
}
