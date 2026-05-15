import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, CircleCheckBig } from 'lucide-react'

const STEPS = [
  'Evaluating accuracy and performance',
  'Identifying your learning style',
  'Building personalized recommendations',
]

const R    = 54
const CIRC = 2 * Math.PI * R

export default function Analyzing({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(155deg, #e8f1fb 0%, #f0f4f8 50%, #edf5fd 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, position: 'relative', overflow: 'hidden',
      }}>

      {/* Slowly rotating decorative rings */}
      {[{ size: 600, speed: 45 }, { size: 420, speed: -30 }, { size: 260, speed: 22 }].map((r, i) => (
        <motion.div key={i}
          animate={{ rotate: r.speed > 0 ? 360 : -360 }}
          transition={{ duration: Math.abs(r.speed), repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', width: r.size, height: r.size,
            top: '50%', left: '50%',
            marginTop: -r.size / 2, marginLeft: -r.size / 2,
            borderRadius: '50%',
            border: `1px ${i === 1 ? 'dashed' : 'solid'} rgba(113,191,235,${0.07 - i * 0.02})`,
            pointerEvents: 'none',
          }} />
      ))}

      <div style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 75, damping: 16 }}
          style={{
            background: '#fff', borderRadius: 24, padding: '52px 44px',
            textAlign: 'center',
            boxShadow: '0 24px 64px rgba(43,89,143,0.14), 0 4px 16px rgba(0,0,0,0.05)',
            border: '1px solid rgba(113,191,235,0.12)',
          }}>

          {/* SVG Progress Ring + Brain */}
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.1 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div style={{ position: 'relative', width: 124, height: 124 }}>
              <svg width="124" height="124" viewBox="0 0 124 124"
                style={{ position: 'absolute', top: 0, left: 0 }}>
                {/* Track */}
                <circle cx="62" cy="62" r={R} fill="none"
                  stroke="rgba(113,191,235,0.15)" strokeWidth="5" />
                {/* Animated progress arc */}
                <motion.circle cx="62" cy="62" r={R} fill="none"
                  stroke="url(#analyzeGrad)" strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={CIRC}
                  initial={{ strokeDashoffset: CIRC }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 3.5, ease: 'easeInOut', delay: 0.3 }}
                  transform="rotate(-90 62 62)"
                />
                <defs>
                  <linearGradient id="analyzeGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3d6ea8" />
                    <stop offset="100%" stopColor="#71bfeb" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Brain icon centered */}
              <div style={{
                position: 'absolute', inset: 14, borderRadius: '50%',
                background: 'linear-gradient(145deg, #3d6ea8, #2b598f)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 18px rgba(43,89,143,0.32)',
              }}>
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
                  <Brain size={30} color="#fff" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f1623',
              margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            Analyzing Your Results
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.32 }}
            style={{
              color: '#3d6ea8', fontSize: '0.9rem', lineHeight: 1.75,
              margin: '0 auto 32px', maxWidth: 360,
            }}>
            We're processing your answers and learning patterns to create your personalized learning profile...
          </motion.p>

          {/* Step items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {STEPS.map((s, i) => (
              <motion.div key={s}
                initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.48, type: 'spring', stiffness: 120, damping: 18 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 18px', borderRadius: 12, textAlign: 'left',
                  background: 'linear-gradient(135deg, #f2f8ff, #e8f3fb)',
                  border: '1px solid rgba(113,191,235,0.2)',
                }}>
                <motion.div
                  initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.72 + i * 0.48, type: 'spring', stiffness: 280, damping: 14 }}>
                  <CircleCheckBig size={20} color="#7a9e6e" />
                </motion.div>
                <span style={{ color: '#1a1a2e', fontSize: '0.9rem', fontWeight: 500 }}>{s}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
