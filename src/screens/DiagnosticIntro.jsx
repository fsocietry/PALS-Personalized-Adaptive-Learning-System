import { motion } from 'framer-motion'
import { Brain, Target, TrendingUp, Info, ChevronRight } from 'lucide-react'

export default function DiagnosticIntro({ onBegin }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(155deg, #e8f1fb 0%, #f0f4f8 45%, #edf5fd 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, position: 'relative', overflow: 'hidden',
      }}>

      {/* Corner orbs */}
      <div style={{
        position: 'absolute', width: 420, height: 420, top: -120, right: -120, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(113,191,235,0.12), transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 320, height: 320, bottom: -100, left: -100, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(43,89,143,0.08), transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 560, position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 44 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 75, damping: 16 }}
          style={{
            background: '#fff', borderRadius: 24, padding: '48px 40px',
            boxShadow: '0 24px 64px rgba(43,89,143,0.13), 0 4px 16px rgba(0,0,0,0.05)',
            border: '1px solid rgba(113,191,235,0.14)',
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
                  boxShadow: '0 8px 28px rgba(43,89,143,0.35)',
                }}>
                <Brain size={30} color="#fff" />
              </motion.div>
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: '2rem', fontWeight: 800, color: '#0f1623',
              margin: '0 0 6px', textAlign: 'center', letterSpacing: '-0.6px' }}>
            Diagnostic Assessment
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
            style={{ color: '#3d6ea8', fontWeight: 600, fontSize: '0.9rem',
              textAlign: 'center', marginBottom: 8 }}>
            Let's understand your learning style
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.34 }}
            style={{ color: '#6b7280', fontSize: '0.86rem', textAlign: 'center',
              lineHeight: 1.75, margin: '0 auto 28px', maxWidth: 400 }}>
            This initial assessment helps us create a personalized learning path tailored specifically for you.
          </motion.p>

          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            {[
              {
                icon: <Target size={15} color="#3d6ea8" />, title: 'What We Measure',
                items: ['Your current English proficiency','Learning pace and style','Strengths and growth areas','Question-solving behavior','How you use hints and learning aids'],
              },
              {
                icon: <TrendingUp size={15} color="#3d6ea8" />, title: 'What You Get',
                items: ['Personalized learning path','Custom quiz recommendations','Adaptive difficulty levels','Targeted skill development'],
              },
            ].map((card, i) => (
              <motion.div key={card.title}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42 + i * 0.1 }}
                style={{
                  padding: '16px', borderRadius: 14,
                  background: 'linear-gradient(145deg, #f2f8ff, #e8f3fb)',
                  border: '1px solid rgba(113,191,235,0.2)',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  {card.icon}
                  <span style={{ fontWeight: 700, fontSize: '0.81rem', color: '#1a1a2e' }}>{card.title}</span>
                </div>
                {card.items.map(item => (
                  <div key={item} style={{ display: 'flex', gap: 7, marginBottom: 5, alignItems: 'flex-start' }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#5aabde', marginTop: 7, flexShrink: 0 }} />
                    <span style={{ color: '#374151', fontSize: '0.77rem', lineHeight: 1.6 }}>{item}</span>
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
              background: 'linear-gradient(145deg, #fffbee, #fffbf0)',
              border: '1px solid rgba(245,200,66,0.3)',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <Info size={14} color="#b45309" />
              <span style={{ fontWeight: 700, fontSize: '0.81rem', color: '#92400e' }}>Important Notes</span>
            </div>
            {[
              "Take your time - there's no time limit",
              'Answer honestly for best results',
              '8 questions covering different skills',
              'Each question has 3 hints available if needed',
              'We track hint usage to understand your learning style',
            ].map(note => (
              <div key={note} style={{ display: 'flex', gap: 7, marginBottom: 5, alignItems: 'flex-start' }}>
                <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#d97706', marginTop: 8, flexShrink: 0 }} />
                <span style={{ color: '#78350f', fontSize: '0.79rem', lineHeight: 1.65 }}>{note}</span>
              </div>
            ))}
          </motion.div>

          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.72 }}
            whileHover={{ scale: 1.02, boxShadow: '0 14px 40px rgba(43,89,143,0.38)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onBegin}
            className="shimmer-btn"
            style={{
              width: '100%', padding: '16px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #1e3a5f, #2b598f)',
              color: '#fff', fontWeight: 700, fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 8px 24px rgba(43,89,143,0.32)',
              position: 'relative', overflow: 'hidden',
            }}>
            Begin Assessment <ChevronRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}
