import { motion } from 'framer-motion'
import iconPng from '../assets/icon.png'
import { auth } from '../firebase'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const BLOBS = [
  { size: 560, left: '-18%', top: '-22%', color: '#1e4080', delay: 0 },
  { size: 380, left: '72%',  top: '58%',  color: '#0d3060', delay: 2 },
  { size: 240, left: '8%',   top: '68%',  color: '#0a2a4a', delay: 3.5 },
  { size: 180, left: '60%',  top: '2%',   color: '#1a3a6e', delay: 1 },
]

// Backend base URL — configurable per environment (defaults to local dev).
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Login({ onStart }) {
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Best-effort backend verification — don't block login if the API is unreachable.
      try {
        const token = await user.getIdToken()
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log('Response Backend:', await response.json())
      } catch (apiErr) {
        console.warn('Backend verification skipped:', apiErr.message)
      }

      onStart({ name: user.displayName, email: user.email })
    } catch (error) {
      console.error('Firebase Error Code:', error.code)
      console.error('Firebase Error Message:', error.message)
      console.error(error)
    }
  }

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
              <img src={iconPng} alt="PALS" style={{ width: 64, height: 64, objectFit: 'contain' }} />
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
          }}>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02, boxShadow: '0 16px 48px rgba(90,171,222,0.45)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
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
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="" width={20} height={20}
              style={{ background: '#fff', borderRadius: '50%', padding: 2 }}
            />
            Login dengan Google
          </motion.button>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(178,208,238,0.35)', margin: '14px 0 0' }}>
            Sign in to start your journey
          </p>
        </motion.div>

      </div>
    </motion.div>
  )
}
