import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Lightbulb, CircleCheckBig } from 'lucide-react'
import { diagnosticQuestions as QS } from '../data/questions'

const DIFF_COLOR = { easy: '#7a9e6e', medium: '#5aabde', hard: '#e05252' }

export default function DiagnosticQuiz({ onComplete }) {
  const [idx, setIdx]           = useState(0)
  const [answers, setAnswers]   = useState(Array(QS.length).fill(null))
  const [hints, setHints]       = useState(Array(QS.length).fill(0))
  const [showHint, setShowHint] = useState(false)
  const timesRef                = useRef(Array(QS.length).fill(0))
  const tStart                  = useRef(Date.now())

  const q        = QS[idx]
  const selected = answers[idx]
  const hintN    = hints[idx]
  const progress = ((idx + 1) / QS.length) * 100
  const dc       = DIFF_COLOR[q.difficulty] || '#5aabde'

  useEffect(() => { setShowHint(false); tStart.current = Date.now() }, [idx])

  const pick = i => {
    if (selected !== null) return
    const a = [...answers]; a[idx] = i; setAnswers(a)
  }

  const useHint = () => {
    if (hintN >= 3) return
    const h = [...hints]; h[idx] = hintN + 1; setHints(h); setShowHint(true)
  }

  const recordTime = () => {
    timesRef.current[idx] = Math.round((Date.now() - tStart.current) / 1000)
  }

  const next = () => {
    recordTime()
    if (idx < QS.length - 1) setIdx(idx + 1)
    else onComplete({ answers, hintsUsed: hints, times: timesRef.current, questions: QS })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #0d1421 0%, #0e1c33 55%, #0c1828 100%)',
        position: 'relative',
      }}>

      {/* Background blobs */}
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

      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'radial-gradient(rgba(113,191,235,0.06) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      }} />

      {/* Sticky header */}
      <div style={{
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '14px 32px', position: 'sticky', top: 0, zIndex: 20,
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, #3d6ea8, #2b598f)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 14px rgba(61,110,168,0.5)',
              }}>
                <Brain size={17} color="#fff" />
              </div>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>
                Diagnostic Assessment
              </span>
            </div>
            <div style={{
              padding: '5px 14px', borderRadius: 99,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <span style={{ color: '#71bfeb', fontWeight: 700, fontSize: '0.88rem' }}>
                {idx + 1} <span style={{ color: 'rgba(178,208,238,0.45)', fontSize: '0.8rem' }}>/ {QS.length}</span>
              </span>
            </div>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div
              style={{
                height: '100%', borderRadius: 99,
                background: 'linear-gradient(90deg, #3d6ea8, #71bfeb)',
                boxShadow: '0 0 10px rgba(113,191,235,0.55)',
              }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 55, damping: 18 }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px', position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div key={idx}
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.22, ease: 'easeOut' }}>

            {/* Question card */}
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20, padding: '32px', marginBottom: 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)',
            }}>

              {/* Badges */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <span style={{
                  padding: '5px 14px', borderRadius: 99,
                  background: 'rgba(113,191,235,0.15)', color: '#71bfeb',
                  fontSize: '0.8rem', fontWeight: 600,
                  border: '1px solid rgba(113,191,235,0.25)',
                }}>
                  {q.category}
                </span>
                {q.difficulty && (
                  <span style={{
                    padding: '5px 14px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600,
                    textTransform: 'capitalize', background: `${dc}20`, color: dc,
                    border: `1px solid ${dc}40`,
                  }}>
                    {q.difficulty}
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff',
                lineHeight: 1.5, marginBottom: 22, letterSpacing: '-0.3px' }}>
                {q.text}
              </h2>

              {/* Hint */}
              <div style={{ marginBottom: 22 }}>
                <motion.button type="button"
                  whileHover={hintN < 3 ? { scale: 1.04 } : {}}
                  whileTap={hintN < 3 ? { scale: 0.96 } : {}}
                  onClick={useHint} disabled={hintN >= 3}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 18px', borderRadius: 99, border: 'none',
                    background: hintN >= 3 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #f5c842, #f0a820)',
                    color: hintN >= 3 ? 'rgba(255,255,255,0.25)' : '#1a1a2e',
                    fontWeight: 700, fontSize: '0.83rem',
                    cursor: hintN >= 3 ? 'not-allowed' : 'pointer',
                    boxShadow: hintN >= 3 ? 'none' : '0 4px 14px rgba(245,200,66,0.38)',
                    transition: 'all 0.2s ease',
                  }}>
                  <Lightbulb size={14} />
                  {hintN === 0 ? 'Need a Hint?' : `Hint ${hintN}/3`}
                </motion.button>

                <AnimatePresence>
                  {showHint && hintN > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{
                        marginTop: 12, padding: '12px 16px', borderRadius: 10,
                        background: 'rgba(245,200,66,0.08)',
                        border: '1px solid rgba(245,200,66,0.25)',
                        display: 'flex', gap: 8,
                      }}>
                        <Lightbulb size={14} color="#f5c842" style={{ marginTop: 2, flexShrink: 0 }} />
                        <p style={{ color: 'rgba(245,200,66,0.85)', fontSize: '0.84rem', lineHeight: 1.65, margin: 0 }}>
                          {q.hints[hintN - 1]}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {q.options.map((opt, i) => {
                  const sel = selected === i
                  return (
                    <motion.button key={i} type="button"
                      onClick={() => pick(i)}
                      whileHover={selected === null ? { y: -2, background: 'rgba(255,255,255,0.1)' } : {}}
                      whileTap={selected === null ? { scale: 0.99 } : {}}
                      style={{
                        padding: '17px 20px', borderRadius: 12, textAlign: 'left',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: sel ? 'rgba(43,89,143,0.65)' : 'rgba(255,255,255,0.05)',
                        border: sel ? '1.5px solid #71bfeb' : '1.5px solid rgba(255,255,255,0.08)',
                        color: '#fff',
                        fontSize: '0.95rem', fontWeight: sel ? 600 : 400,
                        cursor: selected !== null ? 'default' : 'pointer',
                        boxShadow: sel ? '0 8px 24px rgba(43,89,143,0.35)' : 'none',
                        transition: 'background 0.18s, border-color 0.18s, box-shadow 0.18s',
                      }}>
                      <span>{opt}</span>
                      {sel && (
                        <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 14 }}>
                          <CircleCheckBig size={20} color="#71bfeb" />
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Next button */}
              <motion.button type="button"
                whileHover={selected !== null ? { scale: 1.02, boxShadow: '0 12px 32px rgba(90,171,222,0.35)' } : {}}
                whileTap={selected !== null ? { scale: 0.98 } : {}}
                onClick={next} disabled={selected === null}
                className={selected !== null ? 'shimmer-btn' : ''}
                style={{
                  width: '100%', padding: '15px', borderRadius: 12,
                  fontWeight: 700, fontSize: '0.95rem', border: 'none',
                  background: selected !== null ? 'linear-gradient(135deg, #2b598f, #4a9acc)' : 'rgba(255,255,255,0.05)',
                  color: selected !== null ? '#fff' : 'rgba(255,255,255,0.2)',
                  cursor: selected !== null ? 'pointer' : 'not-allowed',
                  boxShadow: selected !== null ? '0 6px 20px rgba(43,89,143,0.4)' : 'none',
                  transition: 'all 0.25s ease',
                  position: 'relative', overflow: 'hidden',
                }}>
                {idx < QS.length - 1 ? 'Next Question →' : 'Finish Quiz ✓'}
              </motion.button>
            </div>

            {/* Tips */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14, padding: '16px 20px',
            }}>
              {[
                { icon: '⏱', text: "Take your time. We're analyzing how you approach each question." },
                { icon: '💡', text: "Use hints wisely! Trying first helps us understand your natural abilities." },
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start',
                  marginBottom: i === 0 ? 8 : 0 }}>
                  <span style={{ fontSize: '0.9rem', marginTop: 1 }}>{tip.icon}</span>
                  <p style={{ color: 'rgba(178,208,238,0.55)', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>{tip.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
