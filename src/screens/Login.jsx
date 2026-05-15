import { useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, BookOpen, ArrowRight } from 'lucide-react'

const BLOBS = [
  { size: 560, left: '-18%', top: '-22%', color: '#1e4080', delay: 0 },
  { size: 380, left: '72%',  top: '58%',  color: '#0d3060', delay: 2 },
  { size: 240, left: '8%',   top: '68%',  color: '#0a2a4a', delay: 3.5 },
  { size: 180, left: '60%',  top: '2%',   color: '#1a3a6e', delay: 1 },
]

export default function Login({ onStart }) {
  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [focused, setFocus]     = useState(null)

  const handleStart = () =>
    onStart({ name: username || 'Student', email: email || 'student@example.com' })

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #0d1421 0%, #0e1c33 55%, #0c1828 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, position: 'relative', overflow: 'hidden',
      }}>

      {/* Animated blur blobs */}
      {BLOBS.map((b, i) => (
        <motion.div key={i}
          style={{
            position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
            width: b.size, height: b.size, left: b.left, top: b.top,
            background: `radial-gradient(circle at 35% 35%, ${b.color}, transparent 65%)`,
            filter: 'blur(55px)',
          }}
          animate={{ y: [0, -36, 0], x: [0, 20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12 + i * 2.5, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Dot grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(113,191,235,0.1) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 90%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 90%)',
      }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}>

        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 70, damping: 16 }}
          style={{ textAlign: 'center', marginBottom: 36 }}>

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 14, delay: 0.28 }}
            style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
            <div className="pulse-glow" style={{
              position: 'absolute', inset: -14, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(113,191,235,0.28), transparent 70%)',
            }} />
            <div style={{
              width: 82, height: 82, borderRadius: '50%',
              background: 'linear-gradient(145deg, #5aabde 0%, #2b598f 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 36px rgba(90,171,222,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
              position: 'relative',
            }}>
              <GraduationCap size={38} color="#fff" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44 }}
            style={{
              fontSize: '3.2rem', fontWeight: 900, color: '#fff',
              margin: '0 0 8px', letterSpacing: '-2px',
              textShadow: '0 0 48px rgba(113,191,235,0.28)',
            }}>
            PALS
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.54 }}
            style={{ fontSize: '0.84rem', color: 'rgba(178,208,238,0.7)', lineHeight: 1.75, margin: 0 }}>
            Personalized Adaptive Learning System<br />in English Mastering
          </motion.p>
        </motion.div>

        {/* Glassmorphism card */}
        <motion.div
          initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 70, damping: 16 }}
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20, padding: '36px 32px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
            marginBottom: 14,
          }}>

          {[
            { id: 'username', label: 'Username', val: username, set: setUsername, ph: 'Enter your username' },
            { id: 'email',    label: 'Email',    val: email,    set: setEmail,    ph: 'Enter your email'    },
          ].map((f, i) => (
            <div key={f.id} style={{ marginBottom: i === 0 ? 18 : 28 }}>
              <label style={{
                display: 'block', fontWeight: 600, fontSize: '0.73rem',
                color: 'rgba(178,208,238,0.75)', marginBottom: 8,
                letterSpacing: '0.9px', textTransform: 'uppercase',
              }}>
                {f.label}
              </label>
              <motion.div animate={{ boxShadow: focused === f.id ? '0 0 0 3px rgba(113,191,235,0.18)' : '0 0 0 0px transparent' }}
                style={{ borderRadius: 10 }}>
                <input
                  type="text" value={f.val} placeholder={f.ph}
                  onChange={e => f.set(e.target.value)}
                  onFocus={() => setFocus(f.id)}
                  onBlur={() => setFocus(null)}
                  style={{
                    width: '100%', padding: '13px 16px', borderRadius: 10,
                    border: `1.5px solid ${focused === f.id ? 'rgba(113,191,235,0.65)' : 'rgba(255,255,255,0.08)'}`,
                    background: focused === f.id ? 'rgba(113,191,235,0.07)' : 'rgba(255,255,255,0.04)',
                    color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
                    transition: 'all 0.25s ease',
                    caretColor: '#71bfeb',
                  }}
                />
              </motion.div>
            </div>
          ))}

          <motion.button
            type="button"
            whileHover={{ scale: 1.02, boxShadow: '0 16px 48px rgba(90,171,222,0.45)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            className="shimmer-btn"
            style={{
              width: '100%', padding: '15px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #2b598f 0%, #4a9acc 100%)',
              color: '#fff', fontWeight: 700, fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 8px 28px rgba(43,89,143,0.45)',
              position: 'relative', overflow: 'hidden',
              transition: 'box-shadow 0.3s ease',
            }}>
            <BookOpen size={19} />
            Start Your Journey
            <ArrowRight size={17} />
          </motion.button>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(178,208,238,0.35)', margin: '14px 0 0' }}>
            No account required · Just dive in
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[
            { value: '25',  label: 'Questions' },
            { value: '30',  label: 'Minutes'   },
            { value: '100', label: 'Points'     },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.95 + i * 0.08, type: 'spring', stiffness: 180, damping: 14 }}
              style={{
                padding: '14px 8px', borderRadius: 12, textAlign: 'center',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(8px)',
              }}>
              <div style={{
                fontSize: '1.7rem', fontWeight: 800, color: '#71bfeb', marginBottom: 3,
                textShadow: '0 0 18px rgba(113,191,235,0.5)',
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(178,208,238,0.5)', fontWeight: 500, letterSpacing: '0.3px' }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
