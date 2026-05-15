import { motion } from 'framer-motion'
import { User, LogOut, Award, Clock, TrendingUp, ChevronRight } from 'lucide-react'
import { useCountUp } from '../hooks/useCountUp'

const CATS = [
  { emoji: '📝', name: 'Grammar',              sub: '10 questions · Intermediate' },
  { emoji: '📚', name: 'Vocabulary',            sub: '8 questions · Advanced'     },
  { emoji: '📖', name: 'Reading Comprehension', sub: '5 questions · Beginner'     },
  { emoji: '💬', name: 'Idioms & Phrases',      sub: '7 questions · Advanced'     },
]

const RECENT = [
  { name: 'Grammar Basics',      score: 85, date: 'May 10' },
  { name: 'Advanced Vocabulary', score: 92, date: 'May 8'  },
  { name: 'Reading Practice',    score: 78, date: 'May 5'  },
]

const glass = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)',
}

export default function Dashboard({ user, onStartQuiz, onLogout }) {
  const avg    = useCountUp(85, 1000, 150)
  const taken  = useCountUp(23, 900, 300)
  const streak = useCountUp(7,  700, 450)

  const STATS = [
    { icon: <Award size={17} color="#fff" />,       bg: 'linear-gradient(135deg,#2b598f,#3d7ab5)', label: 'Average Score', val: `${avg}%`       },
    { icon: <Clock size={17} color="#0f1623" />,    bg: 'linear-gradient(135deg,#5aabde,#3d8bbf)', label: 'Quizzes Taken', val: taken            },
    { icon: <TrendingUp size={17} color="#fff" />,  bg: 'linear-gradient(135deg,#7a9e6e,#5d8a52)', label: 'Streak',        val: `${streak} days` },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #0d1421 0%, #0e1c33 55%, #0c1828 100%)',
        position: 'relative', overflow: 'hidden',
      }}>

      {[
        { size: 420, left: '-10%', top: '-15%', color: '#1e4080', delay: 0 },
        { size: 300, left: '70%',  top: '50%',  color: '#0d3060', delay: 2.5 },
      ].map((b, i) => (
        <motion.div key={i}
          style={{
            position: 'fixed', borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
            width: b.size, height: b.size, left: b.left, top: b.top,
            background: `radial-gradient(circle at 35% 35%, ${b.color}, transparent 65%)`,
            filter: 'blur(55px)',
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

      {/* Header */}
      <div style={{
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg, #5aabde, #3d8bbf)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 14px rgba(90,171,222,0.45)',
          }}>
            <User size={18} color="#fff" />
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.94rem', margin: 0 }}>
              Welcome back{user?.name ? `, ${user.name}` : ''}!
            </p>
            <p style={{ color: 'rgba(113,191,235,0.7)', fontSize: '0.76rem', margin: 0 }}>Ready to practice?</p>
          </div>
        </div>
        <motion.button type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            borderRadius: 8, background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
          }}>
          <LogOut size={14} /> Logout
        </motion.button>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px', position: 'relative', zIndex: 1 }}>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.08, type: 'spring', stiffness: 100 }}
              whileHover={{ y: -3 }}
              style={{ ...glass, borderRadius: 14, padding: '18px 16px', transition: 'transform 0.25s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', background: s.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
                }}>
                  {s.icon}
                </div>
                <span style={{ color: 'rgba(178,208,238,0.6)', fontSize: '0.76rem' }}>{s.label}</span>
              </div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '2rem', margin: 0 }}>{s.val}</p>
            </motion.div>
          ))}
        </div>

        {/* Main 2-col */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Quiz Categories */}
          <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28 }}
            style={{ ...glass, borderRadius: 16, padding: '22px 20px' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>
              Quiz Categories
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CATS.map((cat, i) => (
                <motion.button key={cat.name} type="button"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.34 + i * 0.06 }}
                  whileHover={{ x: 3, background: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onStartQuiz}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '11px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer', width: '100%', textAlign: 'left',
                    transition: 'background 0.2s ease',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.2rem' }}>{cat.emoji}</span>
                    <div>
                      <p style={{ fontWeight: 600, color: '#fff', fontSize: '0.86rem', margin: 0 }}>{cat.name}</p>
                      <p style={{ color: 'rgba(178,208,238,0.5)', fontSize: '0.72rem', margin: 0 }}>{cat.sub}</p>
                    </div>
                  </div>
                  <ChevronRight size={15} color="rgba(113,191,235,0.6)" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Recent Performance */}
          <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={{ ...glass, borderRadius: 16, padding: '22px 20px' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>
              Recent Performance
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {RECENT.map((r, i) => (
                <motion.div key={r.name}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38 + i * 0.07 }}
                  style={{
                    padding: '11px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontWeight: 600, color: '#fff', fontSize: '0.86rem', margin: '0 0 3px' }}>{r.name}</p>
                      <p style={{ color: 'rgba(178,208,238,0.45)', fontSize: '0.73rem', margin: 0 }}>{r.date}</p>
                    </div>
                    <span style={{
                      padding: '3px 10px', borderRadius: 99, fontWeight: 700,
                      fontSize: '0.78rem', color: '#fff',
                      background: r.score >= 80
                        ? 'linear-gradient(135deg,#7a9e6e,#5d8a52)'
                        : 'linear-gradient(135deg,#2b598f,#3d7ab5)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}>
                      {r.score}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.button type="button"
              whileHover={{ scale: 1.02, boxShadow: '0 10px 28px rgba(90,171,222,0.35)' }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartQuiz}
              className="shimmer-btn"
              style={{
                width: '100%', padding: '13px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #2b598f, #4a9acc)',
                color: '#fff', fontWeight: 700, fontSize: '0.88rem',
                boxShadow: '0 6px 20px rgba(43,89,143,0.4)',
                position: 'relative', overflow: 'hidden',
                transition: 'box-shadow 0.25s ease',
              }}>
              Start New Quiz
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
