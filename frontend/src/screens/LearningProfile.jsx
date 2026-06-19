import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Award, Clock, Lightbulb, TrendingUp, Target, CircleCheckBig, ChevronRight, Brain, Compass } from 'lucide-react'
import iconPng from '../assets/icon.png'
import { useCountUp } from '../hooks/useCountUp'

const COGNITIVE_TIERS = {
  1: { text: 'Independent', color: '#7a9e6e', bg: 'rgba(122,158,110,0.15)', border: 'rgba(122,158,110,0.25)', desc: 'Exhibits robust conceptual autonomy with nominal dependency on system hint structures.' },
  0: { text: 'Assisted',    color: '#f5c842', bg: 'rgba(245,200,66,0.15)',  border: 'rgba(245,200,66,0.25)',  desc: 'Demonstrates clear core schema comprehension but relies systematically on hint scaffolding under stress.' },
  2: { text: 'Struggling',   color: '#e05252', bg: 'rgba(224,82,82,0.15)',   border: 'rgba(224,82,82,0.25)',   desc: 'Encountering structural mapping breakdowns or high latency indicators during tense modifications.' }
}

function compute(results, aiResults) {
  if (!results) return { accuracy: 0, avgTime: 0, hints: 0, primaryCluster: 0, strong: [], weak: [] }
  
  const { answers, hintsUsed, times, questions } = results
  const correct  = answers.filter((a, i) => a === questions[i].answer).length
  const accuracy = Math.round((correct / questions.length) * 100)
  const avgTime  = Math.round(times.reduce((s, t) => s + t, 0) / times.length) || 0
  const hints    = hintsUsed.reduce((s, h) => s + h, 0)
  
  let primaryCluster = 0 
  if (aiResults && aiResults.length > 0) {
    const clusters = aiResults.map(r => r.predicted_cluster ?? r.prediction).filter(c => c !== undefined);
    if (clusters.length > 0) {
      const counts = {};
      let maxCluster = clusters[0];
      let maxCount = 1;
      for (const c of clusters) {
        counts[c] = (counts[c] || 0) + 1;
        if (counts[c] > maxCount) {
          maxCount = counts[c];
          maxCluster = c;
        }
      }
      primaryCluster = maxCluster;
    }
  } else {
    if (accuracy >= 80 && hints <= 3) primaryCluster = 1;
    else if (accuracy < 60) primaryCluster = 2;
  }

  const topicStats = {};
  questions.forEach((q, i) => {
    if (!topicStats[q.category]) {
      topicStats[q.category] = { total: 0, correct: 0 };
    }
    topicStats[q.category].total++;
    if (answers[i] === q.answer) {
      topicStats[q.category].correct++;
    }
  });

  const strongList = [];
  const weakList = [];

  Object.keys(topicStats).forEach((topicName) => {
    const stats = topicStats[topicName];
    const topicAccuracy = (stats.correct / stats.total) * 100;
    
    if (topicAccuracy < 70) {
      weakList.push({ name: topicName, score: topicAccuracy });
    } else {
      strongList.push({ name: topicName, score: topicAccuracy });
    }
  });

  strongList.sort((a, b) => b.score - a.score);
  weakList.sort((a, b) => a.score - b.score);

  const finalStrong = strongList.map(s => s.name);
  const finalWeak = weakList.map(w => w.name);
  
  return { 
    accuracy, avgTime, hints, primaryCluster,
    strong: finalStrong.length ? finalStrong.slice(0, 3) : ['General Grammar Accuracy'],
    weak: finalWeak.length ? finalWeak.slice(0, 3) : ['None (Excellent Accuracy)'] 
  }
}

const RECS_MAP = {
  1: ['Advance directly to high-difficulty core practice sets.','Minimize learning aid dependency to lock absolute mastery weights.','Challenge yourself with structural timed challenges under 10 seconds.'],
  0: ['Execute intermediate structural drill variations to reduce hesitation metrics.','Review contextual clue guidelines inside the descriptive hint boxes.','Target tense-group structures showing volatile accuracy shifts.'],
  2: ['Remediation priority activated. Begin with foundational easy-tier syntax exercises.','Utilize step-by-step contextual hints on every question node.','Review error patterns inside the specific tense family blocks.'],
}

const glass = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)',
}

export default function LearningProfile({ results, aiResults, onContinue }) {
  const p = compute(results, aiResults) 
  
  const accD  = useCountUp(p.accuracy, 1100, 300)
  const timeD = useCountUp(p.avgTime, 900, 450)
  const hintD = useCountUp(p.hints, 800, 600)
  
  const activeCluster = COGNITIVE_TIERS[p.primaryCluster] || COGNITIVE_TIERS[0]

  const STATS = [
    { icon: <Award size={17} color="#fff" />,       bg: 'linear-gradient(135deg,#7a9e6e,#5d8a52)', label: 'Accuracy Rate',      val: `${accD}%`  },
    { icon: <Clock size={17} color="#0f1623" />,    bg: 'linear-gradient(135deg,#5aabde,#3d8bbf)', label: 'Avg. Time/Question', val: `${timeD}s` },
    { icon: <Lightbulb size={17} color="#0f1623" />,bg: 'linear-gradient(135deg,#f5c842,#e8a820)', label: 'Hints Requested',     val: hintD       },
    { icon: <TrendingUp size={17} color="#fff" />,  bg: 'linear-gradient(135deg,#2b598f,#3d7ab5)', label: 'Primary Placement',  val: activeCluster.text },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #0d1421 0%, #0e1c33 55%, #0c1828 100%)', padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>

      {/* Background Vectors Overlay */}
      {[
        { size: 400, left: '-10%', top: '-15%', color: '#1e4080', delay: 0 },
        { size: 280, left: '72%',  top: '55%',  color: '#0d3060', delay: 2.5 },
      ].map((b, i) => (
        <motion.div key={i}
          style={{ position: 'fixed', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, width: b.size, height: b.size, left: b.left, top: b.top, background: `radial-gradient(circle at 35% 35%, ${b.color}, transparent 65%)`, filter: 'blur(55px)' }}
          animate={{ y: [0, -26, 0] }} transition={{ duration: 13 + i * 3, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'radial-gradient(rgba(113,191,235,0.06) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header Display */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 80 }} style={{ textAlign: 'center', marginBottom: 28 }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }}
            style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(145deg, #3d6ea8, #2b598f)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 28px rgba(43,89,143,0.5)' }}>
            <img src={iconPng} alt="PALS" style={{ width: 50, height: 50, objectFit: 'contain' }} />
          </motion.div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Adaptive Cognitive Profile</h1>
          <p style={{ color: 'rgba(178,208,238,0.65)', fontSize: '0.88rem', margin: 0 }}>Diagnostic vector processing complete. Your learning telemetry profile has been calibrated.</p>
        </motion.div>

        {/* Analytics Statistics Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 100 }}
              style={{ ...glass, borderRadius: 14, padding: '16px 14px', transition: 'transform 0.25s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 33px 10px rgba(0,0,0,0.3)' }}>
                  {s.icon}
                </div>
                <span style={{ color: 'rgba(178,208,238,0.6)', fontSize: '0.72rem', lineHeight: 1.3 }}>{s.label}</span>
              </div>
              <p style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: s.label === 'Primary Placement' ? '1rem' : '1.7rem' }}>{s.val}</p>
            </motion.div>
          ))}
        </div>

        {/* AI Calibration Matrix Map */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          
          {/* Clustering Analysis Card */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.38 }} style={{ ...glass, borderRadius: 16, padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Brain size={17} color="#71bfeb" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>Clustering Analysis</h3>
            </div>
            <div style={{ background: activeCluster.bg, borderRadius: 10, padding: '12px 14px', marginBottom: 14, border: `1px solid ${activeCluster.border}` }}>
              <p style={{ fontWeight: 700, color: activeCluster.color, fontSize: '0.95rem', margin: '0 0 5px' }}>{activeCluster.text} Learner</p>
              <p style={{ color: 'rgba(178,208,238,0.7)', fontSize: '0.79rem', lineHeight: 1.65, margin: 0 }}>{activeCluster.desc}</p>
            </div>
            <p style={{ fontWeight: 600, fontSize: '0.84rem', color: 'rgba(255,255,255,0.8)', marginBottom: 10 }}>Monitored Behaviors</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <CircleCheckBig size={13} color="#7a9e6e" />
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.76rem' }}>Pacing Velocity: {p.avgTime}s / node</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Lightbulb size={13} color="#f5c842" />
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.76rem' }}>Total Scaffolding Requests: {p.hints}</span>
              </div>
            </div>
          </motion.div>

          {/* Syllabus Diagnostics Card */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.44 }} style={{ ...glass, borderRadius: 16, padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Target size={17} color="#71bfeb" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>Syllabus Diagnostics</h3>
            </div>
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontWeight: 600, fontSize: '0.79rem', color: '#7a9e6e', display: 'block', marginBottom: 6 }}>High Accuracy Focus</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {p.strong.map((item) => (
                  <div key={item} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(122,158,110,0.1)', border: '1px solid rgba(122,158,110,0.2)', color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem' }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.79rem', color: '#e05252', display: 'block', marginBottom: 6 }}>Remediation Targets</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {p.weak.map((item) => (
                  <div key={item} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.2)', color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem' }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>

        {/* Adaptive Curricular Pathways */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52 }}
          style={{ ...glass, borderRadius: 16, padding: '24px', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Compass size={17} color="#71bfeb" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>Adaptive Curricular Pathways</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
            {(RECS_MAP[p.primaryCluster] || RECS_MAP[0]).map((rec, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.07 }}
                style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(113,191,235,0.1)' }}>
                <ChevronRight size={13} color="#71bfeb" style={{ flexShrink: 0 }} />
                <p style={{ color: 'rgba(178,208,238,0.8)', fontSize: '0.81rem', margin: 0 }}>{rec}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div style={{ textAlign: 'center' }}>
          <motion.button type="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.72 }} whileHover={{ scale: 1.03, boxShadow: '0 14px 40px rgba(90,171,222,0.4)' }} whileTap={{ scale: 0.97 }}
            onClick={onContinue} className="shimmer-btn"
            style={{ padding: '13px 44px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #2b598f, #4a9acc)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 28px rgba(43,89,143,0.45)', position: 'relative', overflow: 'hidden' }}>
            Continue <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}