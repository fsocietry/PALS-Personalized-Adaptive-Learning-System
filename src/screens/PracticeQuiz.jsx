import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Lightbulb, CircleCheckBig, Clock } from 'lucide-react'
import { practiceQuestions as QS } from '../data/questions'

export default function PracticeQuiz({ onComplete, onExit }) {
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

  const goNext = () => {
    recordTime()
    if (idx < QS.length - 1) setIdx(idx + 1)
    else onComplete({ answers, hintsUsed: hints, times: timesRef.current, questions: QS })
  }

  const goPrev = () => { recordTime(); if (idx > 0) setIdx(idx - 1) }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', background: '#f0f4f8' }}>

      {/* Sticky header */}
      <div style={{
        background: 'linear-gradient(90deg, #0d1421 0%, #1a2c4e 100%)',
        padding: '14px 32px', position: 'sticky', top: 0, zIndex: 20,
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <motion.button type="button"
              whileHover={{ scale: 1.04, boxShadow: '0 6px 18px rgba(0,0,0,0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onExit}
              style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
                borderRadius: 8, background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff', fontWeight: 600, fontSize: '0.83rem', cursor: 'pointer',
                transition: 'box-shadow 0.2s ease',
              }}>
              <ChevronLeft size={15} /> Exit Quiz
            </motion.button>
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
          {/* Gradient progress bar */}
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

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>
        <AnimatePresence mode="wait">
          <motion.div key={idx}
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.22, ease: 'easeOut' }}>

            {/* Question card */}
            <div style={{
              background: '#fff', borderRadius: 20, padding: '32px',
              marginBottom: 16,
              boxShadow: '0 4px 28px rgba(43,89,143,0.1), 0 1px 4px rgba(0,0,0,0.04)',
              border: '1px solid rgba(113,191,235,0.1)',
            }}>
              {/* Category badge */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <span style={{
                  padding: '5px 14px', borderRadius: 99,
                  background: '#e8f3fb', color: '#3d6ea8', fontSize: '0.8rem', fontWeight: 600,
                }}>
                  {q.category}
                </span>
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f1623',
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
                    background: hintN >= 3 ? '#f0f0f0' : 'linear-gradient(135deg, #f5c842, #f0a820)',
                    color: hintN >= 3 ? '#9ca3af' : '#1a1a2e',
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
                        background: 'linear-gradient(135deg, #fffbee, #fffbf0)',
                        border: '1px solid rgba(245,200,66,0.35)',
                        display: 'flex', gap: 8,
                      }}>
                        <Lightbulb size={14} color="#d97706" style={{ marginTop: 2, flexShrink: 0 }} />
                        <p style={{ color: '#1a1a2e', fontSize: '0.84rem', lineHeight: 1.65, margin: 0 }}>
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
                      whileHover={selected === null ? { y: -2, boxShadow: '0 8px 24px rgba(43,89,143,0.14)' } : {}}
                      whileTap={selected === null ? { scale: 0.99 } : {}}
                      style={{
                        padding: '17px 20px', borderRadius: 12, textAlign: 'left',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: sel ? 'linear-gradient(135deg, #3d6ea8, #2b598f)' : '#fff',
                        border: sel ? '2px solid #2b598f' : '2px solid #e8f0f8',
                        color: sel ? '#fff' : '#0f1623',
                        fontSize: '0.95rem', fontWeight: sel ? 600 : 500,
                        cursor: selected !== null ? 'default' : 'pointer',
                        boxShadow: sel ? '0 8px 24px rgba(43,89,143,0.3)' : '0 1px 4px rgba(0,0,0,0.04)',
                        transition: 'background 0.18s, border-color 0.18s, color 0.18s, box-shadow 0.18s',
                      }}>
                      <span>{opt}</span>
                      {sel && (
                        <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 14 }}>
                          <CircleCheckBig size={20} color="#fff" />
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Nav buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <motion.button type="button"
                  whileTap={idx > 0 ? { scale: 0.97 } : {}}
                  onClick={goPrev} disabled={idx === 0}
                  style={{
                    padding: '13px 20px', borderRadius: 10,
                    background: idx === 0 ? '#f0f4f8' : '#e8f3fb',
                    color: idx === 0 ? '#c0c8d4' : '#3d6ea8',
                    fontWeight: 600, fontSize: '0.88rem', border: 'none',
                    cursor: idx === 0 ? 'not-allowed' : 'pointer',
                    border: idx === 0 ? '1px solid #e8f0f8' : '1px solid rgba(113,191,235,0.25)',
                    transition: 'all 0.2s ease',
                  }}>
                  ← Previous
                </motion.button>
                <motion.button type="button"
                  whileHover={selected !== null ? { scale: 1.02, boxShadow: '0 12px 32px rgba(43,89,143,0.32)' } : {}}
                  whileTap={selected !== null ? { scale: 0.98 } : {}}
                  onClick={goNext} disabled={selected === null}
                  className={selected !== null ? 'shimmer-btn' : ''}
                  style={{
                    flex: 1, padding: '13px', borderRadius: 10, border: 'none',
                    fontWeight: 700, fontSize: '0.9rem',
                    background: selected !== null ? 'linear-gradient(135deg, #2b598f, #3d7ab5)' : '#e8f0f8',
                    color: selected !== null ? '#fff' : '#9ca3af',
                    cursor: selected !== null ? 'pointer' : 'not-allowed',
                    boxShadow: selected !== null ? '0 6px 20px rgba(43,89,143,0.26)' : 'none',
                    transition: 'all 0.25s ease',
                    position: 'relative', overflow: 'hidden',
                  }}>
                  {idx < QS.length - 1 ? 'Next Question →' : 'Finish Quiz ✓'}
                </motion.button>
              </div>
            </div>

            {/* Quick nav */}
            <div style={{
              background: '#fff', borderRadius: 14, padding: '16px 20px', marginBottom: 12,
              boxShadow: '0 1px 8px rgba(43,89,143,0.06)',
              border: '1px solid rgba(113,191,235,0.08)',
            }}>
              <p style={{ color: '#9ca3af', fontSize: '0.72rem', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
                Quick Navigation
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {QS.map((_, i) => {
                  const done = answers[i] !== null
                  const cur  = i === idx
                  return (
                    <div key={i} style={{ position: 'relative' }}>
                      <motion.button type="button"
                        whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
                        onClick={() => { recordTime(); setIdx(i) }}
                        style={{
                          width: 38, height: 38, borderRadius: 8, fontWeight: 700,
                          fontSize: '0.85rem', border: 'none', cursor: 'pointer',
                          background: done
                            ? 'linear-gradient(135deg,#7a9e6e,#5d8a52)'
                            : cur
                              ? 'linear-gradient(135deg,#2b598f,#3d7ab5)'
                              : '#e8f3fb',
                          color: done || cur ? '#fff' : '#3d6ea8',
                          boxShadow: (done || cur) ? '0 3px 10px rgba(0,0,0,0.18)' : 'none',
                          transition: 'all 0.2s ease',
                        }}>
                        {i + 1}
                      </motion.button>
                      {hints[i] > 0 && (
                        <div style={{
                          position: 'absolute', top: -4, right: -4, width: 16, height: 16,
                          borderRadius: '50%', background: '#f5c842', color: '#1a1a2e',
                          fontSize: '0.55rem', fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(245,200,66,0.4)',
                        }}>
                          {hints[i]}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tips */}
            <div style={{
              background: '#fff', borderRadius: 14, padding: '16px 20px',
              boxShadow: '0 1px 8px rgba(43,89,143,0.06)',
              border: '1px solid rgba(113,191,235,0.08)',
            }}>
              {[
                { icon: <Clock size={14} color="#3d6ea8" />, text: "Take your time. We're analyzing how you approach each question." },
                { icon: <Lightbulb size={14} color="#d97706" />, text: "Use hints wisely! Trying first helps us understand your natural abilities." },
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start',
                  marginBottom: i === 0 ? 8 : 0 }}>
                  <div style={{ marginTop: 2, flexShrink: 0 }}>{tip.icon}</div>
                  <p style={{ color: '#6b7280', fontSize: '0.79rem', lineHeight: 1.6, margin: 0 }}>{tip.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
