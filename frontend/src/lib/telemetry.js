import { useRef, useState, useEffect, useCallback } from 'react'

// ─── Session id ──────────────────────────────────────────────────────────────
// 8-char base36 token, e.g. "upx4su7t"
export function genSessionId() {
  return Math.random().toString(36).slice(2, 10).padEnd(8, '0')
}

const STORAGE_KEY = 'pals_telemetry'

// ─── Persistence ─────────────────────────────────────────────────────────────
export function loadTelemetry() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

export function saveTelemetry(records) {
  try {
    const all = loadTelemetry().concat(records)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    /* storage unavailable — ignore */
  }
}

// ─── CSV export ──────────────────────────────────────────────────────────────
export const TELEMETRY_COLUMNS = [
  'question_id',
  'topic',
  'difficulty',
  'session_id',
  'summary.total_duration_sec',
  'summary.visit_count',
  'summary.final_is_correct',
  'summary.final_is_ideal_duration',
  'summary.max_hint_unlocked',
  'summary.total_hint_read_sec',
  'summary.first_confidence',
  'summary.final_confidence',
  'summary.total_answer_changes',
  'summary.struggle_indicators.ever_selected_correct_answer',
  'summary.struggle_indicators.changed_mind_after_correct',
  'summary.focus_loss_total',
]

function cell(v) {
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'
  if (v == null) return ''
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function telemetryToCSV(records) {
  const head = TELEMETRY_COLUMNS.join(',')
  const rows = records.map(r => TELEMETRY_COLUMNS.map(c => cell(r[c])).join(','))
  return [head, ...rows].join('\n')
}

export function downloadCSV(records, filename = 'behaviour.csv') {
  const blob = new Blob([telemetryToCSV(records)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// ─── React hook ──────────────────────────────────────────────────────────────
// Tracks per-question behaviour while the user works through a quiz.
//
//   const tele = useQuizTelemetry(QS)
//   useEffect(() => tele.visit(idx), [idx])   // mark current question
//   tele.select(idx, choice)                  // on answer pick
//   tele.setConfidence(idx, 'yakin'|'ragu')   // on confidence pick
//   tele.openHint(idx, level)                 // when a hint is unlocked
//   const records = tele.finalize()           // on quiz finish
//
export function useQuizTelemetry(questions) {
  const [sessionId] = useState(genSessionId)
  const data = useRef(
    questions.map(() => ({
      visitCount: 0,
      durationMs: 0,
      hintReadMs: 0,
      maxHint: 0,
      answerSeq: [],          // distinct consecutive option indices chosen
      firstConfidence: null,
      finalConfidence: null,
      focusLoss: 0,
    })),
  )

  const active = useRef(null)       // currently displayed question index
  const enterTs = useRef(0)         // ms timestamp the active question was entered
  const hintTs = useRef(null)       // ms timestamp hints became visible this visit

  // accumulate elapsed time onto the active question, then clear timers
  const flush = useCallback(() => {
    const i = active.current
    if (i == null) return
    const now = Date.now()
    data.current[i].durationMs += now - enterTs.current
    if (hintTs.current != null) {
      data.current[i].hintReadMs += now - hintTs.current
      hintTs.current = null
    }
  }, [])

  const visit = useCallback((idx) => {
    if (active.current === idx) return
    flush()
    active.current = idx
    enterTs.current = Date.now()
    // if this question already had hints open (revisit), keep timing the read
    hintTs.current = data.current[idx].maxHint > 0 ? Date.now() : null
    data.current[idx].visitCount += 1
  }, [flush])

  const select = useCallback((idx, choice) => {
    const seq = data.current[idx].answerSeq
    if (seq[seq.length - 1] !== choice) seq.push(choice)
  }, [])

  const setConfidence = useCallback((idx, value) => {
    const d = data.current[idx]
    if (d.firstConfidence == null) d.firstConfidence = value
    d.finalConfidence = value
  }, [])

  const openHint = useCallback((idx, level) => {
    const d = data.current[idx]
    if (hintTs.current == null) hintTs.current = Date.now()
    d.maxHint = Math.max(d.maxHint, level)
  }, [])

  // count window focus losses against the active question
  useEffect(() => {
    const onBlur = () => {
      const i = active.current
      if (i != null) data.current[i].focusLoss += 1
    }
    window.addEventListener('blur', onBlur)
    return () => window.removeEventListener('blur', onBlur)
  }, [])

  const finalize = useCallback(() => {
    flush()
    active.current = null
    const records = questions.map((q, i) => {
      const d = data.current[i]
      const seq = d.answerSeq
      const finalChoice = seq.length ? seq[seq.length - 1] : null
      const durationSec = +(d.durationMs / 1000).toFixed(2)
      const everCorrect = seq.includes(q.answer)
      let changedMind = false
      for (let k = 0; k < seq.length; k++) {
        if (seq[k] === q.answer && seq.slice(k + 1).some(v => v !== q.answer)) {
          changedMind = true
          break
        }
      }
      const answered = seq.length > 0
      return {
        question_id: q.questionId,
        topic: q.topic,
        difficulty: q.difficultyLabel,
        session_id: sessionId,
        'summary.total_duration_sec': durationSec,
        'summary.visit_count': d.visitCount,
        'summary.final_is_correct': finalChoice === q.answer ? 1 : 0,
        'summary.final_is_ideal_duration': durationSec <= q.idealDuration,
        'summary.max_hint_unlocked': d.maxHint,
        'summary.total_hint_read_sec': +(d.hintReadMs / 1000).toFixed(2),
        'summary.first_confidence': d.firstConfidence ?? (answered ? 'yakin' : ''),
        'summary.final_confidence': d.finalConfidence ?? (answered ? 'yakin' : ''),
        'summary.total_answer_changes': Math.max(0, seq.length - 1),
        'summary.struggle_indicators.ever_selected_correct_answer': everCorrect,
        'summary.struggle_indicators.changed_mind_after_correct': changedMind,
        'summary.focus_loss_total': d.focusLoss,
      }
    })
    saveTelemetry(records)
    if (typeof window !== 'undefined') window.__quizTelemetry = records
    return records
  }, [questions, flush, sessionId])

  return { sessionId, visit, select, setConfidence, openHint, finalize }
}
