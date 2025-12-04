import React from 'react'

const inlineChunks = (text: string): (string | JSX.Element)[] => {
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|\[[^\]]+\]\([^\)]+\))/g)
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2)
      return <strong key={`b-${idx}`}>{content}</strong>
    }
    if (part.startsWith('__') && part.endsWith('__')) {
      const content = part.slice(2, -2)
      return <span key={`u-${idx}`} className="underline">{content}</span>
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      const content = part.slice(1, -1)
      return <em key={`i-${idx}`}>{content}</em>
    }
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const m = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/)
      if (m) {
        const [, textLabel, url] = m
        return <a key={`l-${idx}`} href={url} target="_blank" rel="noopener noreferrer" className="text-neon-blue underline">{textLabel}</a>
      }
    }
    return part
  })
}

export const renderDescription = (raw: string): React.ReactNode => {
  if (!raw) return null
  const lines = raw.split(/\r?\n/)

  const blocks: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i++
      continue
    }

    const headingMatch = line.match(/^\s*(#{1,3})\s+(.*)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const content = headingMatch[2]
      const key = `h-${i}`
      const cls = level === 1 ? 'text-lg' : level === 2 ? 'text-base' : 'text-sm'
      blocks.push(
        <div key={key} className={`text-white font-semibold ${cls}`}>{inlineChunks(content)}</div>
      )
      i++
      continue
    }

    if (/^\s*>\s+/.test(line)) {
      const startIdx = i
      const qLines: string[] = []
      while (i < lines.length && /^\s*>\s+/.test(lines[i])) {
        qLines.push(lines[i].replace(/^\s*>\s+/, ''))
        i++
      }
      blocks.push(
        <div key={`q-${startIdx}`} className="border-l-2 border-white/20 pl-3 text-white/80 italic whitespace-pre-wrap">
          {inlineChunks(qLines.join('\n'))}
        </div>
      )
      continue
    }

    const unordered = /^\s*[-*]\s+/.test(line)
    const ordered = /^\s*\d+\.\s+/.test(line)
    if (unordered || ordered) {
      const items: string[] = []
      const startIdx = i
      while (i < lines.length) {
        const l = lines[i]
        if ((unordered && /^\s*[-*]\s+/.test(l)) || (ordered && /^\s*\d+\.\s+/.test(l))) {
          items.push(l.replace(/^\s*(?:[-*]|\d+\.)\s+/, ''))
          i++
        } else if (!l.trim()) {
          i++
          break
        } else {
          break
        }
      }
      const listClass = ordered ? 'list-decimal' : 'list-disc'
      blocks.push(
        <ul key={`list-${startIdx}`} className={`${listClass} pl-5 space-y-1`}>
          {items.map((it, idx) => (
            <li key={idx} className="whitespace-pre-wrap">{inlineChunks(it)}</li>
          ))}
        </ul>
      )
      continue
    }

    const paraLines: string[] = []
    const startPara = i
    while (i < lines.length) {
      const l = lines[i]
      if (l.trim() === '') break
      if (/^\s*[-*]\s+/.test(l) || /^\s*\d+\.\s+/.test(l)) break
      paraLines.push(l)
      i++
    }
    const text = paraLines.join('\n')
    blocks.push(
      <p key={`p-${startPara}`} className="whitespace-pre-wrap">{inlineChunks(text)}</p>
    )
  }

  return <div className="grid gap-1">{blocks}</div>
}
