import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Lightbulb, CircleCheckBig, Clock, LayoutGrid, X } from 'lucide-react'
import iconPng from '../assets/icon.png'
import { buildDiagnosticSet } from '../data/questions'
import { useQuizTelemetry } from '../lib/telemetry'
import ConfidencePicker from '../components/ConfidencePicker'

const DIFF_COLOR = { easy: '#7a9e6e', medium: '#5aabde', hard: '#e05252' }

const navButtonStyle = {
  padding: '13px 20px',
  borderRadius: 10,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'rgba(178,208,238,0.8)',
  fontWeight: 600,
  fontSize: '0.88rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
}

export default function DiagnosticQuiz({ onComplete }) {
  // Generated once per mount to isolate assessment setups
  const [QS]          = useState(() => buildDiagnosticSet())
  const [idx, setIdx]           = useState(0)
  const [answers, setAnswers]   = useState(() => Array(QS.length).fill(null))
  const [hints, setHints]       = useState(() => Array(QS.length).fill(0))
  const [confidence, setConf]   = useState(() => Array(QS.length).fill(null))
  const [showNav, setShowNav]   = useState(false)
  const timesRef                = useRef(Array(QS.length).fill(0))
  const tStart                  = useRef(0)
  const tele                    = useQuizTelemetry(QS)

  const q        = QS[idx]
  const selected = answers[idx]
  const hintN    = hints[idx]
  const progress = ((idx + 1) / QS.length) * 100
  const dc       = DIFF_COLOR[q.difficulty] || '#5aabde'
  const ready    = selected !== null && confidence[idx] !== null

  useEffect(() => { tStart.current = Date.now(); tele.visit(idx) }, [idx, tele])

  const pick = i => {
    const a = [...answers]; a[idx] = i; setAnswers(a)
    tele.select(idx, i)

    // Aligned with PracticeQuiz behavior: default confidence on pick
    if (confidence[idx] === null) {
      const nextConf = [...confidence]
      nextConf[idx] = 'yakin'
      setConf(nextConf)
      tele.setConfidence(idx, 'yakin')
    }
  }

  const useHint = () => {
    if (hintN >= 3) return
    const h = [...hints]; h[idx] = hintN + 1; setHints(h)
    tele.openHint(idx, hintN + 1)
  }

  const pickConfidence = v => {
    const c = [...confidence]; c[idx] = v; setConf(c)
    tele.setConfidence(idx, v)
  }

  const recordTime = () => {
    timesRef.current[idx] = Math.round((Date.now() - tStart.current) / 1000)
  }

  const goNext = () => {
    recordTime()
    if (idx < QS.length - 1) {
      setIdx(idx + 1)
    } else {
      const telemetryRecords = tele.finalize()
      const quizResult = {
        answers: answers,
        hintsUsed: hints,
        times: timesRef.current,
        questions: QS
      }
      if (onComplete) {
        onComplete(quizResult, telemetryRecords, tele.sessionId)
      }
    }
  }

  const goPrev = () => { recordTime(); if (idx > 0) setIdx(idx - 1) }

  const navTo = e => {
    const target = Number(e.currentTarget.dataset.idx)
    if (target === idx) { setShowNav(false); return }
    recordTime()
    setShowNav(false)
    setIdx(target)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #0d1421 0%, #0e1c33 55%, #0c1828 100%)', position: 'relative' }}>

      {/* Decorative Vectors */}
      {[
        { size: 380, left: '-10%', top: '-15%', color: '#1e4080', delay: 0 },
        { size: 260, left: '72%',  top: '55%',  color: '#0d3060', delay: 3 },
      ].map((b, i) => (
        <motion.div key={i}
          style={{
            position: 'fixed', borderRadius: '50%', pointerEvents: 'none',
            width: b.size, height: b.size, left: b.left, top: b.top,
            background: `radial-gradient(circle at 35% 35%, ${b.color}, transparent 65%)`,
            filter: 'blur(55px)', zIndex: 0,
          }}
          animate={{ y: [0, -28, 0] }}
          transition={{ duration: 13 + i * 3, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'radial-gradient(rgba(113,191,235,0.06) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* Sticky Top Header */}
      <div style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 32px', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #3d6ea8, #2b598f)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(61,110,168,0.5)' }}>
                <img src={iconPng} alt="PALS" style={{ width: 26, height: 26, objectFit: 'contain' }} />
              </div>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Diagnostic Assessment</span>
            </div>
            <div style={{ padding: '5px 14px', borderRadius: 99, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <span style={{ color: '#71bfeb', fontWeight: 700, fontSize: '0.88rem' }}>
                {idx + 1} <span style={{ color: 'rgba(178,208,238,0.45)', fontSize: '0.8rem' }}>/ {QS.length}</span>
              </span>
            </div>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #3d6ea8, #71bfeb)', boxShadow: '0 0 10px rgba(113,191,235,0.55)' }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 55, damping: 18 }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px', position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
            
            {/* Main Content Card */}
            <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '32px', marginBottom: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ padding: '5px 14px', borderRadius: 99, background: 'rgba(113,191,235,0.15)', color: '#71bfeb', fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(113,191,235,0.25)' }}>
                    {q.category}
                  </span>
                  {q.difficulty && (
                    <span style={{ padding: '5px 14px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize', background: `${dc}20`, color: dc, border: `1px solid ${dc}40` }}>
                      {q.difficulty}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={() => setShowNav(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 99, border: '1px solid rgba(113,191,235,0.3)', background: 'rgba(113,191,235,0.12)', color: '#71bfeb', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                    <LayoutGrid size={13} /> View All Questions
                  </motion.button>
                  <motion.button type="button" whileTap={hintN < 3 ? { scale: 0.96 } : {}} onClick={useHint} disabled={hintN >= 3}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 99, border: 'none', background: hintN >= 3 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #f5c842, #f0a820)', color: hintN >= 3 ? 'rgba(255,255,255,0.25)' : '#1a1a2e', fontWeight: 700, fontSize: '0.8rem', cursor: hintN >= 3 ? 'not-allowed' : 'pointer', boxShadow: hintN >= 3 ? 'none' : '0 4px 14px rgba(245,200,66,0.38)', transition: 'all 0.2s ease' }}>
                    <Lightbulb size={13} /> {hintN === 0 ? 'Hint?' : `Hint ${hintN}/3`}
                  </motion.button>
                </div>
              </div>

              {/* Scaffolding Hint Area */}
              <AnimatePresence>
                {hintN > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 16 }}>
                    {q.hints.slice(0, hintN).map((hint, hi) => (
                      <div key={hi} style={{ marginBottom: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.25)', display: 'flex', gap: 8 }}>
                        <Lightbulb size={13} color="#f5c842" style={{ marginTop: 2, flexShrink: 0 }} />
                        <p style={{ color: 'rgba(245,200,66,0.85)', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
                          <span style={{ fontWeight: 700, marginRight: 5 }}>Hint {hi + 1}:</span>{hint}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', lineHeight: 1.5, marginBottom: 22, letterSpacing: '-0.3px' }}>{q.text}</h2>

              {/* Options Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {q.options.map((opt, i) => {
                  const sel = selected === i
                  return (
                    <motion.button key={i} type="button" onClick={() => pick(i)}
                      whileHover={{ background: sel ? 'rgba(43,89,143,0.75)' : 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.08 }}
                      style={{ padding: '17px 20px', borderRadius: 12, textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: sel ? 'rgba(43,89,143,0.65)' : 'rgba(255,255,255,0.05)', border: sel ? '1.5px solid #71bfeb' : '1.5px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.95rem', fontWeight: sel ? 600 : 400, cursor: 'pointer', boxShadow: sel ? '0 8px 24px rgba(43,89,143,0.35)' : 'none', transition: 'all 0.08s' }}>
                      <span>{opt}</span>
                      {sel && (
                        <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }}>
                          <CircleCheckBig size={20} color="#71bfeb" />
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {selected !== null && <ConfidencePicker value={confidence[idx]} onPick={pickConfidence} />}

              {/* Workflow Anchors Footer */}
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <motion.button type="button" whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.97 }} onClick={goPrev} disabled={idx === 0}
                  style={{ ...navButtonStyle, color: idx === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(178,208,238,0.8)', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>
                  ← Previous
                </motion.button>
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={goNext} disabled={!ready}
                  style={{ ...navButtonStyle, flex: 1, textAlign: 'center', background: ready ? 'linear-gradient(135deg, #2b598f, #4a9acc)' : 'rgba(255,255,255,0.05)', color: ready ? '#fff' : 'rgba(255,255,255,0.45)', boxShadow: ready ? '0 6px 20px rgba(43,89,143,0.4)' : 'none', cursor: ready ? 'pointer' : 'not-allowed' }}>
                  {idx < QS.length - 1 ? 'Next Question →' : 'Finish Quiz ✓'}
                </motion.button>
              </div>

              {selected !== null && confidence[idx] === null && (
                <p style={{ color: 'rgba(245,200,66,0.8)', fontSize: '0.78rem', textAlign: 'center', margin: '10px 0 0' }}>
                  Please rate your confidence profile to unlock the next structure.
                </p>
              )}
            </div>

            {/* Micro Context Meta Tips */}
            <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 20px' }}>
              {[
                { icon: <Clock size={14} color="#71bfeb" />, text: "Untimed evaluation node. We evaluate your conceptual workflow latency." },
                { icon: <Lightbulb size={14} color="#f5c842" />, text: "Scaffolding items adjust initial calibration weights. Utilize carefully." },
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: i === 0 ? 8 : 0 }}>
                  <div style={{ marginTop: 2, flexShrink: 0 }}>{tip.icon}</div>
                  <p style={{ color: 'rgba(178,208,238,0.5)', fontSize: '0.79rem', lineHeight: 1.6, margin: 0 }}>{tip.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Synchronized Questions Overview Drawer Overlay */}
      <AnimatePresence>
        {showNav && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNav(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(5,10,20,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 16 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 460, background: 'linear-gradient(155deg, #122038, #0d1830)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '24px', boxShadow: '0 24px 70px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>Assessment Node Index</h3>
                <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={() => setShowNav(false)}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
                  <X size={16} />
                </motion.button>
              </div>
              <p style={{ color: 'rgba(178,208,238,0.6)', fontSize: '0.8rem', margin: '0 0 18px' }}>
                Select index to navigate. Matrix completion status: {answers.filter(a => a !== null).length}/{QS.length} populated.
              </p>

              {/* ✅ FIX: Dynamic Matrix Layout inherited directly from PracticeQuiz */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
                {QS.map((_, i) => {
                  const answered = answers[i] !== null
                  const current = i === idx
                  const conf = confidence[i]

                  let bg = 'rgba(255,255,255,0.05)'
                  let border = '1px solid rgba(255,255,255,0.1)'
                  let text = 'rgba(255,255,255,0.65)'

                  if (current) {
                    bg = 'linear-gradient(135deg, #2b598f, #4a9acc)'
                    border = '1.5px solid #71bfeb'
                    text = '#fff'
                  } else if (conf === 'yakin') {
                    bg = 'rgba(122,158,110,0.18)'
                    border = '1.5px solid rgba(122,158,110,0.5)'
                    text = '#9fc890'
                  } else if (conf === 'ragu') {
                    bg = 'rgba(245,200,66,0.18)'
                    border = '1.5px solid rgba(245,200,66,0.5)'
                    text = '#f5c842'
                  } else if (conf === 'tidak') {
                    bg = 'rgba(224,82,82,0.18)'
                    border = '1.5px solid rgba(224,82,82,0.5)'
                    text = '#f08a8a'
                  } else if (answered) {
                    bg = 'rgba(255,255,255,0.06)'
                    border = '1.5px solid rgba(255,255,255,0.1)'
                    text = 'rgba(255,255,255,0.65)'
                  }

                  return (
                    <div key={i} style={{ position: 'relative' }}>
                      <motion.button data-idx={i} onClick={navTo} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                        style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, border, color: text, transition: 'all 0.15s ease' }}>
                        {i + 1}
                      </motion.button>
                      {hints[i] > 0 && (
                        <div style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: '50%', background: '#f5c842', color: '#1a1a2e', fontSize: '0.55rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(245,200,66,0.5)' }}>
                          {hints[i]}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* English Legend Map */}
              <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
                {[
                  { c: 'linear-gradient(135deg, #2b598f, #4a9acc)', label: 'Current Node' },
                  { c: 'rgba(122,158,110,0.5)', label: 'High Confidence' },
                  { c: 'rgba(245,200,66,0.5)', label: 'Moderate Confidence' },
                  { c: 'rgba(224,82,82,0.5)', label: 'Low Confidence' },
                  { c: 'rgba(255,255,255,0.12)', label: 'Unanswered' },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 12, height: 12, borderRadius: 4, background: l.c, display: 'inline-block' }} />
                    <span style={{ color: 'rgba(178,208,238,0.65)', fontSize: '0.74rem' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}