import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Award, Lightbulb, ChevronRight } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useCountUp } from '../hooks/useCountUp'

function compute(results) {
  if (!results) return { correct: 4, total: 5, score: 80, hints: 1 }
  const { answers, hintsUsed, questions } = results
  const correct = answers.filter((a, i) => a === questions[i].answer).length
  return {
    correct, total: questions.length,
    score: Math.round((correct / questions.length) * 100),
    hints: hintsUsed.reduce((s, h) => s + h, 0),
  }
}

const R    = 58
const CIRC = 2 * Math.PI * R

export default function QuizComplete({ results, onBack }) {
  const { correct, total, score, hints } = compute(results)
  const display = useCountUp(score, 1300, 500)
  const fired   = useRef(false)
  const isGood  = score >= 70

  useEffect(() => {
    if (fired.current || score < 50) return
    fired.current = true
    const end    = Date.now() + 2200
    const colors = ['#71bfeb', '#7a9e6e', '#f5c842', '#2b598f', '#5aabde']
    const burst  = () => {
      confetti({ particleCount: 6, angle: 60,  spread: 55, origin: { x: 0 }, colors })
      confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 }, colors })
      if (Date.now() < end) requestAnimationFrame(burst)
    }
    burst()
  }, [score])

  const strokeOffset = CIRC * (1 - score / 100)
  const scoreColor   = isGood ? '#7a9e6e' : '#5aabde'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #0d1421 0%, #0e1c33 55%, #0c1828 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, position: 'relative', overflow: 'hidden',
      }}>

      {[
        { size: 420, left: '-12%', top: '-18%', color: '#1e4080', delay: 0 },
        { size: 300, left: '70%',  top: '58%',  color: '#0d3060', delay: 2 },
      ].map((b, i) => (
        <motion.div key={i}
          style={{
            position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
            width: b.size, height: b.size, left: b.left, top: b.top,
            background: `radial-gradient(circle at 35% 35%, ${b.color}, transparent 65%)`,
            filter: 'blur(55px)',
          }}
          animate={{ y: [0, -28, 0] }}
          transition={{ duration: 12 + i * 3, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(113,191,235,0.06) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      }} />

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 80, damping: 16 }}
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24, padding: '48px 40px',
            textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}>

          {/* SVG Score Ring + Trophy */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ position: 'relative', width: 140, height: 140 }}>
              <svg width="140" height="140" viewBox="0 0 140 140"
                style={{ position: 'absolute', top: 0, left: 0 }}>
                <circle cx="70" cy="70" r={R} fill="none"
                  stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                <motion.circle cx="70" cy="70" r={R} fill="none"
                  stroke="url(#scoreGrad)" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={CIRC}
                  initial={{ strokeDashoffset: CIRC }}
                  animate={{ strokeDashoffset: strokeOffset }}
                  transition={{ duration: 1.4, delay: 0.5, ease: 'easeOut' }}
                  transform="rotate(-90 70 70)"
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={isGood ? '#7a9e6e' : '#3d6ea8'} />
                    <stop offset="100%" stopColor={isGood ? '#5d8a52' : '#71bfeb'} />
                  </linearGradient>
                </defs>
              </svg>
              <motion.div
                initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
                style={{
                  position: 'absolute', inset: 16, borderRadius: '50%',
                  background: isGood
                    ? 'linear-gradient(145deg, #7a9e6e, #5d8a52)'
                    : 'linear-gradient(145deg, #3d6ea8, #2b598f)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 6px 22px ${isGood ? 'rgba(122,158,110,0.45)' : 'rgba(43,89,143,0.45)'}`,
                }}>
                <Award size={34} color="#fff" />
              </motion.div>
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Quiz Complete!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.44 }}
            style={{ color: 'rgba(178,208,238,0.6)', fontSize: '0.88rem', marginBottom: 16 }}>
            Your Score
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 140, damping: 12, delay: 0.5 }}
            style={{
              fontSize: '4.2rem', fontWeight: 900, color: scoreColor,
              lineHeight: 1, marginBottom: 14, letterSpacing: '-2px',
              textShadow: `0 0 32px ${isGood ? 'rgba(122,158,110,0.4)' : 'rgba(90,171,222,0.4)'}`,
            }}>
            {display}%
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.76 }}
            style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', marginBottom: 16 }}>
            You answered <strong style={{ color: '#fff' }}>{correct}</strong> out of <strong style={{ color: '#fff' }}>{total}</strong> questions correctly.
          </motion.p>

          {hints > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.88 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 99,
                background: 'rgba(245,200,66,0.1)',
                border: '1px solid rgba(245,200,66,0.25)',
                marginBottom: 18,
              }}>
              <Lightbulb size={15} color="#f5c842" />
              <span style={{ color: 'rgba(245,200,66,0.9)', fontSize: '0.84rem', fontWeight: 600 }}>
                {hints} {hints === 1 ? 'hint' : 'hints'} used
              </span>
            </motion.div>
          )}

          {/* Result message */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            style={{
              padding: '14px 18px', borderRadius: 12, marginBottom: 28,
              background: isGood ? 'rgba(122,158,110,0.1)' : 'rgba(113,191,235,0.08)',
              border: `1px solid ${isGood ? 'rgba(122,158,110,0.25)' : 'rgba(113,191,235,0.2)'}`,
            }}>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.87rem', lineHeight: 1.65, margin: 0 }}>
              {score === 100 ? '🎉 Perfect score! Absolutely outstanding!'
                : score >= 80  ? "⭐ Great job! You're showing strong English skills."
                : score >= 60  ? '👍 Good effort! Keep practicing to improve.'
                : '💪 Keep going! Every quiz makes you better.'}
            </p>
          </motion.div>

          <motion.button type="button"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
            whileHover={{ scale: 1.02, boxShadow: '0 14px 40px rgba(90,171,222,0.4)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onBack}
            className="shimmer-btn"
            style={{
              width: '100%', padding: '15px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #2b598f, #4a9acc)',
              color: '#fff', fontWeight: 700, fontSize: '0.95rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: '0 8px 28px rgba(43,89,143,0.45)',
              position: 'relative', overflow: 'hidden',
              transition: 'box-shadow 0.25s ease',
            }}>
            Back to Dashboard <ChevronRight size={16} />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}
