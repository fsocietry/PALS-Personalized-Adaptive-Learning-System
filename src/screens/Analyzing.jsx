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
        background: 'linear-gradient(145deg, #0d1421 0%, #0e1c33 55%, #0c1828 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, position: 'relative', overflow: 'hidden',
      }}>

      {/* Blobs */}
      {[
        { size: 400, left: '-12%', top: '-18%', color: '#1e4080', delay: 0 },
        { size: 280, left: '70%',  top: '58%',  color: '#0d3060', delay: 2 },
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

      {/* Rotating decorative rings */}
      {[{ size: 600, speed: 45 }, { size: 420, speed: -30 }, { size: 260, speed: 22 }].map((r, i) => (
        <motion.div key={i}
          animate={{ rotate: r.speed > 0 ? 360 : -360 }}
          transition={{ duration: Math.abs(r.speed), repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', width: r.size, height: r.size,
            top: '50%', left: '50%',
            marginTop: -r.size / 2, marginLeft: -r.size / 2,
            borderRadius: '50%',
            border: `1px ${i === 1 ? 'dashed' : 'solid'} rgba(113,191,235,${0.06 - i * 0.015})`,
            pointerEvents: 'none',
          }} />
      ))}

      <div style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 75, damping: 16 }}
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24, padding: '52px 44px',
            textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}>

          {/* SVG Progress Ring + Brain */}
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.1 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div style={{ position: 'relative', width: 124, height: 124 }}>
              <svg width="124" height="124" viewBox="0 0 124 124"
                style={{ position: 'absolute', top: 0, left: 0 }}>
                <circle cx="62" cy="62" r={R} fill="none"
                  stroke="rgba(113,191,235,0.1)" strokeWidth="5" />
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
              <div style={{
                position: 'absolute', inset: 14, borderRadius: '50%',
                background: 'linear-gradient(145deg, #3d6ea8, #2b598f)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 18px rgba(43,89,143,0.5)',
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
            style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff',
              margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            Analyzing Your Results
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.32 }}
            style={{
              color: 'rgba(178,208,238,0.7)', fontSize: '0.9rem', lineHeight: 1.75,
              margin: '0 auto 32px', maxWidth: 360,
            }}>
            We're processing your answers and learning patterns to create your personalized learning profile...
          </motion.p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {STEPS.map((s, i) => (
              <motion.div key={s}
                initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.48, type: 'spring', stiffness: 120, damping: 18 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 18px', borderRadius: 12, textAlign: 'left',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(113,191,235,0.15)',
                }}>
                <motion.div
                  initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.72 + i * 0.48, type: 'spring', stiffness: 280, damping: 14 }}>
                  <CircleCheckBig size={20} color="#7a9e6e" />
                </motion.div>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', fontWeight: 500 }}>{s}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
