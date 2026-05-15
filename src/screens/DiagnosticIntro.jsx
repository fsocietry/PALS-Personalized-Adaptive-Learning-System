import { motion } from 'framer-motion'
import { Brain, Target, TrendingUp, Info, ChevronRight } from 'lucide-react'

const BLOBS = [
  { size: 420, left: '-12%', top: '-18%', color: '#1e4080', delay: 0 },
  { size: 300, left: '70%',  top: '60%',  color: '#0d3060', delay: 2.5 },
]

export default function DiagnosticIntro({ onBegin }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #0d1421 0%, #0e1c33 55%, #0c1828 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, position: 'relative', overflow: 'hidden',
      }}>

      {BLOBS.map((b, i) => (
        <motion.div key={i}
          style={{
            position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
            width: b.size, height: b.size, left: b.left, top: b.top,
            background: `radial-gradient(circle at 35% 35%, ${b.color}, transparent 65%)`,
            filter: 'blur(55px)',
          }}
          animate={{ y: [0, -30, 0], x: [0, 16, 0] }}
          transition={{ duration: 12 + i * 3, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(113,191,235,0.08) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 90%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 90%)',
      }} />

      <div style={{ width: '100%', maxWidth: 560, position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 44 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 75, damping: 16 }}
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24, padding: '48px 40px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}>

          {/* Brain with orbiting dot */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div style={{ position: 'relative', width: 96, height: 96 }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: '1.5px dashed rgba(113,191,235,0.3)',
              }}>
                <div className="orbit-dot" style={{
                  position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)',
                  width: 10, height: 10, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #5aabde, #71bfeb)',
                  boxShadow: '0 0 10px rgba(113,191,235,0.8)',
                }} />
              </div>
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                style={{
                  position: 'absolute', inset: 12, borderRadius: '50%',
                  background: 'linear-gradient(145deg, #3d6ea8, #2b598f)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 28px rgba(43,89,143,0.5)',
                }}>
                <Brain size={30} color="#fff" />
              </motion.div>
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: '2rem', fontWeight: 800, color: '#fff',
              margin: '0 0 6px', textAlign: 'center', letterSpacing: '-0.6px' }}>
            Diagnostic Assessment
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
            style={{ color: '#71bfeb', fontWeight: 600, fontSize: '0.9rem',
              textAlign: 'center', marginBottom: 8 }}>
            Let's understand your learning style
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.34 }}
            style={{ color: 'rgba(178,208,238,0.65)', fontSize: '0.86rem', textAlign: 'center',
              lineHeight: 1.75, margin: '0 auto 28px', maxWidth: 400 }}>
            This initial assessment helps us create a personalized learning path tailored specifically for you.
          </motion.p>

          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            {[
              {
                icon: <Target size={15} color="#71bfeb" />, title: 'What We Measure',
                items: ['Your current English proficiency','Learning pace and style','Strengths and growth areas','Question-solving behavior','How you use hints and learning aids'],
              },
              {
                icon: <TrendingUp size={15} color="#71bfeb" />, title: 'What You Get',
                items: ['Personalized learning path','Custom quiz recommendations','Adaptive difficulty levels','Targeted skill development'],
              },
            ].map((card, i) => (
              <motion.div key={card.title}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42 + i * 0.1 }}
                style={{
                  padding: '16px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(113,191,235,0.15)',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  {card.icon}
                  <span style={{ fontWeight: 700, fontSize: '0.81rem', color: '#fff' }}>{card.title}</span>
                </div>
                {card.items.map(item => (
                  <div key={item} style={{ display: 'flex', gap: 7, marginBottom: 5, alignItems: 'flex-start' }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#5aabde', marginTop: 7, flexShrink: 0 }} />
                    <span style={{ color: 'rgba(178,208,238,0.7)', fontSize: '0.77rem', lineHeight: 1.6 }}>{item}</span>
                  </div>
                ))}
              </motion.div>
            ))}
          </div>

          {/* Important Notes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62 }}
            style={{
              padding: '16px 18px', borderRadius: 12, marginBottom: 28,
              background: 'rgba(245,200,66,0.08)',
              border: '1px solid rgba(245,200,66,0.2)',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <Info size={14} color="#f5c842" />
              <span style={{ fontWeight: 700, fontSize: '0.81rem', color: '#f5c842' }}>Important Notes</span>
            </div>
            {[
              "Take your time - there's no time limit",
              'Answer honestly for best results',
              '8 questions covering different skills',
              'Each question has 3 hints available if needed',
              'We track hint usage to understand your learning style',
            ].map(note => (
              <div key={note} style={{ display: 'flex', gap: 7, marginBottom: 5, alignItems: 'flex-start' }}>
                <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#f5c842', marginTop: 8, flexShrink: 0 }} />
                <span style={{ color: 'rgba(245,200,66,0.75)', fontSize: '0.79rem', lineHeight: 1.65 }}>{note}</span>
              </div>
            ))}
          </motion.div>

          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.72 }}
            whileHover={{ scale: 1.02, boxShadow: '0 14px 40px rgba(90,171,222,0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onBegin}
            className="shimmer-btn"
            style={{
              width: '100%', padding: '16px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #2b598f, #4a9acc)',
              color: '#fff', fontWeight: 700, fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 8px 28px rgba(43,89,143,0.45)',
              position: 'relative', overflow: 'hidden',
            }}>
            Begin Assessment <ChevronRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}
