import { motion } from 'framer-motion'
import { Brain, Award, Clock, Lightbulb, TrendingUp, Target, CircleCheckBig, TriangleAlert, ChevronRight } from 'lucide-react'
import { useCountUp } from '../hooks/useCountUp'

function compute(results) {
  if (!results) return {
    accuracy: 13, avgTime: 7, hints: 3, level: 'Beginner',
    style: 'Methodical & Consistent',
    strong: ['Subject-Verb Agreement'],
    weak: ['Articles', 'Academic Words', 'Advanced Vocabulary'],
  }
  const { answers, hintsUsed, times, questions } = results
  const correct  = answers.filter((a, i) => a === questions[i].answer).length
  const accuracy = Math.round((correct / questions.length) * 100)
  const avgTime  = Math.round(times.reduce((s, t) => s + t, 0) / times.length) || 0
  const hints    = hintsUsed.reduce((s, h) => s + h, 0)
  const level    = accuracy >= 80 ? 'Advanced' : accuracy >= 55 ? 'Intermediate' : 'Beginner'
  let style = 'Methodical & Consistent'
  if (avgTime < 15 && hints === 0) style = 'Quick Learner'
  else if (avgTime > 45) style = 'Analytical & Thorough'
  else if (hints > 5) style = 'Visual & Structured'
  const strong = [...new Set(answers.map((a, i) => a === questions[i].answer ? questions[i].category : null).filter(Boolean))]
  const weak   = [...new Set(answers.map((a, i) => a !== questions[i].answer ? questions[i].category : null).filter(Boolean))]
  return { accuracy, avgTime, hints, level, style,
    strong: strong.length ? strong : ['Grammar'],
    weak: weak.length ? weak : ['Vocabulary'] }
}

const STYLE_DESC = {
  'Quick Learner': 'You process information rapidly and prefer a fast-paced learning environment. Focus on challenging materials to stay engaged.',
  'Analytical & Thorough': 'You take time to deeply understand concepts. This methodical approach ensures strong retention and mastery.',
  'Methodical & Consistent': 'You maintain a steady pace and show disciplined learning habits. This consistency leads to reliable progress.',
  'Visual & Structured': 'You benefit from organized, well-structured content with clear examples and visual aids.',
}

const RECS = {
  Beginner:     ['Start with foundational grammar and basic vocabulary exercises','Practice with shorter, simpler texts to build confidence','Take time to review your answers before submitting','Great use of hints! Continue using them strategically when stuck'],
  Intermediate: ['Focus on expanding vocabulary and complex sentence structures','Engage with intermediate reading materials','Prioritize practice in: Articles, Academic Words','Build on your strengths to boost confidence'],
  Advanced:     ['Challenge yourself with advanced literature and academic texts','Practice nuanced language skills like idiomatic expressions','Aim for speed and accuracy in timed challenges','Teach peers — sharing knowledge reinforces mastery'],
}

export default function LearningProfile({ results, onContinue }) {
  const p     = compute(results)
  const accD  = useCountUp(p.accuracy, 1100, 300)
  const timeD = useCountUp(p.avgTime, 900, 450)
  const hintD = useCountUp(p.hints, 800, 600)

  const STATS = [
    { icon: <Award size={17} color="#fff" />,      bg: 'linear-gradient(135deg,#7a9e6e,#5d8a52)', label: 'Accuracy Rate',      val: `${accD}%`  },
    { icon: <Clock size={17} color="#0f1623" />,   bg: 'linear-gradient(135deg,#5aabde,#3d8bbf)', label: 'Avg. Time/Question', val: `${timeD}s` },
    { icon: <Lightbulb size={17} color="#0f1623"/>,bg: 'linear-gradient(135deg,#f5c842,#e8a820)', label: 'Hints Used',         val: hintD       },
    { icon: <TrendingUp size={17} color="#fff" />, bg: 'linear-gradient(135deg,#2b598f,#3d7ab5)', label: 'Recommended Level',  val: p.level     },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(155deg, #e8f1fb 0%, #f0f4f8 50%, #edf5fd 100%)',
        padding: '28px 24px',
      }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 80 }}
          style={{ textAlign: 'center', marginBottom: 28 }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14 }}
            style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'linear-gradient(145deg, #3d6ea8, #2b598f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 28px rgba(43,89,143,0.32)',
            }}>
            <Brain size={28} color="#fff" />
          </motion.div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f1623', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Your Learning Profile
          </h1>
          <p style={{ color: '#3d6ea8', fontSize: '0.88rem', margin: 0 }}>
            Based on your diagnostic assessment, here's what we learned about you
          </p>
        </motion.div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 100 }}
              whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(43,89,143,0.15)' }}
              style={{
                background: '#fff', borderRadius: 14, padding: '16px 14px',
                boxShadow: '0 2px 12px rgba(43,89,143,0.08)',
                border: '1px solid rgba(113,191,235,0.1)',
                transition: 'box-shadow 0.25s ease, transform 0.25s ease',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: s.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                }}>
                  {s.icon}
                </div>
                <span style={{ color: '#6b7280', fontSize: '0.72rem', lineHeight: 1.3 }}>{s.label}</span>
              </div>
              <p style={{
                color: '#0f1623', fontWeight: 700, margin: 0,
                fontSize: s.label === 'Recommended Level' ? '1.1rem' : '1.7rem',
              }}>
                {s.val}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Learning Style | Skill Analysis */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

          {/* Learning Style */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.38 }}
            style={{
              background: '#fff', borderRadius: 16, padding: '22px',
              boxShadow: '0 2px 12px rgba(43,89,143,0.08)',
              border: '1px solid rgba(113,191,235,0.1)',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
              <Brain size={17} color="#3d6ea8" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f1623', margin: 0 }}>Learning Style</h3>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #f2f8ff, #e8f3fb)',
              borderRadius: 10, padding: '12px 14px', marginBottom: 14,
              border: '1px solid rgba(113,191,235,0.15)',
            }}>
              <p style={{ fontWeight: 700, color: '#3d6ea8', fontSize: '0.95rem', margin: '0 0 5px' }}>{p.style}</p>
              <p style={{ color: '#444', fontSize: '0.79rem', lineHeight: 1.65, margin: 0 }}>{STYLE_DESC[p.style]}</p>
            </div>
            <p style={{ fontWeight: 600, fontSize: '0.84rem', color: '#0f1623', marginBottom: 10 }}>Behavior Patterns</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[
                { icon: <CircleCheckBig size={13} color="#7a9e6e" />, text: 'Maintains consistent pace',            bg: '#f0f7ee', border: 'rgba(122,158,110,0.2)' },
                { icon: <Lightbulb size={13} color="#d97706" />,      text: 'Uses hints strategically when needed', bg: '#fffbeb', border: 'rgba(245,200,66,0.25)' },
                { icon: <TriangleAlert size={13} color="#9ca3af" />,  text: 'Quick responder — consider reviewing', bg: '#f8f9fa', border: 'rgba(0,0,0,0.06)'     },
              ].map((b, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', borderRadius: 8,
                  background: b.bg, border: `1px solid ${b.border}`,
                }}>
                  {b.icon}
                  <span style={{ color: '#1a1a2e', fontSize: '0.76rem' }}>{b.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Skill Analysis */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.44 }}
            style={{
              background: '#fff', borderRadius: 16, padding: '22px',
              boxShadow: '0 2px 12px rgba(43,89,143,0.08)',
              border: '1px solid rgba(113,191,235,0.1)',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
              <Target size={17} color="#3d6ea8" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f1623', margin: 0 }}>Skill Analysis</h3>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                <CircleCheckBig size={13} color="#7a9e6e" />
                <span style={{ fontWeight: 600, fontSize: '0.79rem', color: '#7a9e6e' }}>Strong Areas</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {p.strong.map((a, i) => (
                  <motion.div key={a}
                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.07 }}
                    style={{
                      padding: '8px 12px', borderRadius: 8,
                      background: 'linear-gradient(135deg, #f0f7ee, #e8f5e4)',
                      border: '1px solid rgba(122,158,110,0.25)',
                      color: '#1a1a2e', fontSize: '0.81rem', fontWeight: 500,
                    }}>
                    {a}
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                <TrendingUp size={13} color="#3d6ea8" />
                <span style={{ fontWeight: 600, fontSize: '0.79rem', color: '#3d6ea8' }}>Growth Opportunities</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {p.weak.slice(0, 4).map((a, i) => (
                  <motion.div key={a}
                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.58 + i * 0.07 }}
                    style={{
                      padding: '8px 12px', borderRadius: 8,
                      background: 'linear-gradient(135deg, #f2f8ff, #e8f3fb)',
                      border: '1px solid rgba(113,191,235,0.2)',
                      color: '#1a1a2e', fontSize: '0.81rem', fontWeight: 500,
                    }}>
                    {a}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recommendations */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52 }}
          style={{
            background: '#fff', borderRadius: 16, padding: '24px',
            marginBottom: 28,
            boxShadow: '0 2px 12px rgba(43,89,143,0.08)',
            border: '1px solid rgba(113,191,235,0.1)',
          }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f1623', margin: '0 0 18px' }}>
            Personalized Recommendations
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {(RECS[p.level] || RECS.Beginner).map((rec, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.07 }}
                style={{
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                  padding: '12px 14px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #f2f8ff, #e8f3fb)',
                  border: '1px solid rgba(113,191,235,0.18)',
                }}>
                <ChevronRight size={13} color="#3d6ea8" style={{ marginTop: 3, flexShrink: 0 }} />
                <p style={{ color: '#1a1a2e', fontSize: '0.79rem', lineHeight: 1.6, margin: 0 }}>{rec}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <motion.button type="button"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.72 }}
            whileHover={{ scale: 1.03, boxShadow: '0 14px 40px rgba(43,89,143,0.38)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onContinue}
            className="shimmer-btn"
            style={{
              padding: '13px 44px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #2b598f, #3d7ab5)',
              color: '#fff', fontWeight: 700, fontSize: '0.95rem',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 8px 24px rgba(43,89,143,0.3)',
              position: 'relative', overflow: 'hidden',
            }}>
            Continue to Dashboard <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
