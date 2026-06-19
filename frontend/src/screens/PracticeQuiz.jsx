import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Lightbulb, CircleCheckBig, LayoutGrid, X, Loader2 } from 'lucide-react'
import { getPracticeSet, questionsByTense } from '../data/questions'
import { useQuizTelemetry } from '../lib/telemetry'
import ConfidencePicker from '../components/ConfidencePicker'

const DIFF_COLOR = { easy: '#7a9e6e', medium: '#5aabde', hard: '#e05252' }

const navButtonStyle = {
  padding: '13px 20px',
  borderRadius: 10,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'rgba(178,208,238,0.8)',
  fontWeight: 600,
  fontSize: '0.88rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
}

export default function PracticeQuiz({ topic, cognitiveProfile, onComplete, onExit, isSmartMode }) {
  
  const totalQuestionsCount = isSmartMode ? 10 : 5;

  // 🎯 1. STRATEGI FUZZY GATING: Pelonggaran kamus aturan kesulitan agar tidak menjebak user (Static Baseline Trap)
  const [allowedDiffs] = useState(() => {
    const cluster = cognitiveProfile ? (isSmartMode ? 0 : cognitiveProfile[topic]) : 0;
    
    // Aturan main baru: Beri ruang bernapas untuk Struggling agar bisa mencicipi tantangan!
    if (cluster === 2) return ['easy', 'medium', 'hard'];  // Struggling: Diberi akses penuh (mulai dari easy, tapi bisa naik sampai hard)
    if (cluster === 1) return ['medium', 'hard'];          // Independent: Hanya Medium & Hard
    return ['easy', 'medium', 'hard'];                     // Assisted / 0: Bisa Semua Level
  });

  // 🎯 2. PARTISI SELURUH BANK SOAL MENJADI 3 POOL TIER UTAMA
  const [pools] = useState(() => {
    let allQuestions = [];
    if (isSmartMode) {
      questionsByTense.forEach((group) => {
        allQuestions.push(...getPracticeSet(group.topic, 20));
      });
    } else {
      allQuestions = getPracticeSet(topic, 30);
    }

    return {
      easy: allQuestions.filter(q => q.difficulty.toLowerCase() === 'easy'),
      medium: allQuestions.filter(q => q.difficulty.toLowerCase() === 'medium'),
      hard: allQuestions.filter(q => q.difficulty.toLowerCase() === 'hard'),
    };
  });

  // 🎯 3. ENHANCED DIVERSITY INITIALIZATION: Buat bank kuis awal jauh lebih bervariasi!
  const [QS, setQS] = useState(() => {
    let mixedBaselinePool = [];
    
    if (isSmartMode) {
      questionsByTense.forEach((group) => {
        const rawGroupPool = getPracticeSet(group.topic, 15);
        const filteredGroup = rawGroupPool.filter(q => allowedDiffs.includes(q.difficulty.toLowerCase()));
        mixedBaselinePool.push(...filteredGroup);
      });
    } else {
      const rawSubjectPool = getPracticeSet(topic, 30);
      mixedBaselinePool = rawSubjectPool.filter(q => allowedDiffs.includes(q.difficulty.toLowerCase()));
    }

    // Acak urutan lintas tingkat kesulitan agar pengerjaan kuis bervariasi
    const randomized = mixedBaselinePool.sort(() => 0.5 - Math.random());
    
    // Agar profil Struggling (2) tidak syok dengan soal Hard di nomor 1, kita set baseline start amannya
    const cluster = cognitiveProfile ? (isSmartMode ? 0 : cognitiveProfile[topic]) : 0;
    let initialDiff = 'medium';
    if (cluster === 2) initialDiff = 'easy';
    if (cluster === 1) initialDiff = 'hard';
    
    // Pastikan butir soal nomor 1 sesuai baseline klaster amannya
    const safeFirstQuestion = randomized.find(q => q.difficulty.toLowerCase() === initialDiff) || randomized[0];
    const theRest = randomized.filter(q => q.id !== safeFirstQuestion.id);

    const finalSequence = [safeFirstQuestion, ...theRest];
    return finalSequence.length >= totalQuestionsCount ? finalSequence.slice(0, totalQuestionsCount) : finalSequence;
  });

  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState(() => Array(totalQuestionsCount).fill(null))
  const [hints, setHints] = useState(() => Array(totalQuestionsCount).fill(0))
  const [confidence, setConf] = useState(() => Array(totalQuestionsCount).fill(null))
  const [showNav, setShowNav] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const timesRef = useRef(Array(totalQuestionsCount).fill(0))
  const tStart = useRef(0)
  
  const tele = useQuizTelemetry(QS)

  const q = QS[idx] || { text: 'Compiling adaptive node matrices...', options: [], difficulty: 'medium', category: topic || 'Practice' };
  const selected = answers[idx]
  const hintN = hints[idx]
  const progress = ((idx + 1) / totalQuestionsCount) * 100
  const dc = DIFF_COLOR[q.difficulty] || '#5aabde'
  const ready = selected !== null && confidence[idx] !== null;

  // 🎯 4. ADAPTIVE DEFENSIVE HINTS EXTRACTION: Amankan parsing petunjuk kuis
  const currentHintsList = useMemo(() => {
    if (!q) return [];
    if (Array.isArray(q.hints) && q.hints.length > 0) return q.hints;
    if (q.hint) return [q.hint];
    return [
      "Pay close attention to the time markers (adverbs of time) and verb inflections used in the sentence structure.",
      "Analyze whether the action is continuous, completed, or a routine factual statement.",
      "Identify the subject-verb agreement markers to rule out incorrect syntactic options."
    ];
  }, [q]);

  useEffect(() => { 
    if (QS[idx]) {
      tStart.current = Date.now(); 
      tele.visit(idx);
    }
  }, [idx, QS, tele])

  const pick = i => {
    const nextAnswers = [...answers]
    nextAnswers[idx] = i
    setAnswers(nextAnswers)
    tele.select(idx, i)

    if (confidence[idx] === null) {
      const nextConf = [...confidence]
      nextConf[idx] = 'yakin'
      setConf(nextConf)
      tele.setConfidence(idx, 'yakin')
    }
  }

  const useHint = () => {
    if (hintN >= 3 || hintN >= currentHintsList.length) return
    const h = [...hints]; h[idx] = hintN + 1; setHints(h)
    tele.openHint(idx, hintN + 1)
  }

  const pickConfidence = v => {
    const c = [...confidence]; c[idx] = v; setConf(c)
    tele.setConfidence(idx, v)
  }

  const recordTime = () => {
    timesRef.current[idx] = Math.round((Date.now() - tStart.current) / 1000)
  }

  const goNext = async () => {
    recordTime()
    
    if (idx < totalQuestionsCount - 1) {
      const isCorrect = answers[idx] === q.answer;
      const currentDiff = q.difficulty.toLowerCase();
      
      let nextDiff = currentDiff;
      if (isCorrect) {
        if (currentDiff === 'easy' && allowedDiffs.includes('medium')) nextDiff = 'medium';
        else if (currentDiff === 'medium' && allowedDiffs.includes('hard')) nextDiff = 'hard';
        console.log(`📈 BENAR! Kesulitan naik menjadi: ${nextDiff}`);
      } else {
        if (currentDiff === 'hard' && allowedDiffs.includes('medium')) nextDiff = 'medium';
        else if (currentDiff === 'medium' && allowedDiffs.includes('easy')) nextDiff = 'easy';
        console.log(`📉 SALAH! Kesulitan turun menjadi: ${nextDiff}`);
      }

      const usedIds = QS.slice(0, idx + 1).map(item => item.id);
      let adaptiveNextQ = pools[nextDiff]?.find(item => !usedIds.includes(item.id));
      
      if (!adaptiveNextQ) {
        adaptiveNextQ = pools[currentDiff]?.find(item => !usedIds.includes(item.id)) ||
                        Object.values(pools).flat().find(item => !usedIds.includes(item.id));
      }

      if (adaptiveNextQ) {
        const updatedQS = [...QS];
        updatedQS[idx + 1] = adaptiveNextQ; 
        setQS(updatedQS);
      }
      
      setIdx(idx + 1)
    } else {
      setIsSubmitting(true);
      await onComplete({ answers, hintsUsed: hints, times: timesRef.current, questions: QS, telemetry: tele.finalize() });
      setIsSubmitting(false);
    }
  }

  const goPrev = () => { recordTime(); if (idx > 0) setIdx(idx - 1) }
  const navTo = e => {
    const target = Number(e.currentTarget.dataset.idx)
    if (target === idx) { setShowNav(false); return }
    recordTime()
    setShowNav(false)
    setIdx(target)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #0d1421 0%, #0e1c33 55%, #0c1828 100%)', position: 'relative' }}>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'radial-gradient(rgba(113,191,235,0.06) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* Sticky Header Panel */}
      <div style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 32px', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <motion.button type="button" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }} onClick={onExit} disabled={isSubmitting}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: isSubmitting ? 'rgba(255,255,255,0.3)' : '#fff', fontWeight: 600, fontSize: '0.83rem', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
              <ChevronLeft size={15} /> Exit Quiz
            </motion.button>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '50%' }}>
              {isSmartMode ? "⚡ Smart Practice Mode (AI Curated)" : topic}
            </span>
            <div style={{ padding: '5px 14px', borderRadius: 99, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <span style={{ color: '#71bfeb', fontWeight: 700, fontSize: '0.88rem' }}>
                {idx + 1} <span style={{ color: 'rgba(178,208,238,0.45)', fontSize: '0.8rem' }}>/ {totalQuestionsCount}</span>
              </span>
            </div>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #3d6ea8, #71bfeb)', boxShadow: '0 0 10px rgba(113,191,235,0.55)' }}
              animate={{ width: `${progress}%` }} transition={{ type: 'spring', stiffness: 55, damping: 18 }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px', position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.22, ease: 'easeOut' }}>

            <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '32px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ padding: '5px 14px', borderRadius: 99, background: 'rgba(113,191,235,0.15)', color: '#71bfeb', fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(113,191,235,0.25)' }}>
                    {q.category}
                  </span>
                  {q.difficulty && (
                    <span style={{ padding: '5px 14px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize', background: `${dc}20`, color: dc, border: `1px solid ${dc}40` }}>
                      {q.difficulty}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={() => setShowNav(true)} disabled={isSubmitting}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 99, border: '1px solid rgba(113,191,235,0.3)', background: 'rgba(113,191,235,0.12)', color: '#71bfeb', fontWeight: 700, fontSize: '0.8rem', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                    <LayoutGrid size={13} /> View All Questions
                  </motion.button>
                  <motion.button type="button" whileTap={hintN < currentHintsList.length ? { scale: 0.96 } : {}} onClick={useHint} disabled={hintN >= currentHintsList.length || isSubmitting}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 99, border: 'none', background: (hintN >= currentHintsList.length || isSubmitting) ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #f5c842, #f0a820)', color: (hintN >= currentHintsList.length || isSubmitting) ? 'rgba(255,255,255,0.25)' : '#1a1a2e', fontWeight: 700, fontSize: '0.8rem', cursor: (hintN >= currentHintsList.length || isSubmitting) ? 'not-allowed' : 'pointer' }}>
                    <Lightbulb size={13} /> {hintN === 0 ? 'Hint?' : `Hint ${hintN}/${currentHintsList.length}`}
                  </motion.button>
                </div>
              </div>

              <AnimatePresence>
                {hintN > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 16 }}>
                    {currentHintsList.slice(0, hintN).map((hintText, hi) => (
                      <div key={hi} style={{ marginBottom: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.25)', display: 'flex', gap: 8 }}>
                        <Lightbulb size={13} color="#f5c842" style={{ marginTop: 2, flexShrink: 0 }} />
                        <p style={{ color: 'rgba(245,200,66,0.85)', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
                          <span style={{ fontWeight: 700, marginRight: 5 }}>Hint {hi + 1}:</span>{hintText}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', lineHeight: 1.5, marginBottom: 22 }}>{q.text}</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {q.options && q.options.map((opt, i) => {
                  const sel = selected === i
                  return (
                    <motion.button key={i} type="button" onClick={isSubmitting ? null : () => pick(i)} disabled={isSubmitting}
                      whileHover={isSubmitting ? {} : { background: sel ? 'rgba(43,89,143,0.75)' : 'rgba(255,255,255,0.1)' }} whileTap={isSubmitting ? {} : { scale: 0.98 }}
                      style={{ padding: '17px 20px', borderRadius: 12, textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: sel ? 'rgba(43,89,143,0.65)' : 'rgba(255,255,255,0.05)', border: sel ? '1.5px solid #71bfeb' : '1.5px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.95rem', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                      <span>{opt}</span>
                      {sel && <CircleCheckBig size={20} color="#71bfeb" />}
                    </motion.button>
                  )
                })}
              </div>

              {selected !== null && <ConfidencePicker value={confidence[idx]} onPick={isSubmitting ? null : pickConfidence} />}

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={goPrev} disabled={idx === 0 || isSubmitting}
                  style={{ ...navButtonStyle, color: (idx === 0 || isSubmitting) ? 'rgba(255,255,255,0.2)' : 'rgba(178,208,238,0.8)', cursor: (idx === 0 || isSubmitting) ? 'not-allowed' : 'pointer' }}>
                  ← Previous
                </motion.button>
                
                <motion.button type="button" whileHover={isSubmitting ? {} : { scale: 1.02 }} whileTap={isSubmitting ? {} : { scale: 0.98 }} onClick={goNext} disabled={!ready || isSubmitting}
                  style={{ ...navButtonStyle, flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: isSubmitting ? 'rgba(113,191,235,0.2)' : ready ? 'linear-gradient(135deg, #2b598f, #4a9acc)' : 'rgba(255,255,255,0.05)', color: ready ? '#fff' : 'rgba(255,255,255,0.45)', cursor: (ready && !isSubmitting) ? 'pointer' : 'not-allowed' }}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" color="#71bfeb" />
                      <span style={{ color: '#71bfeb', fontWeight: 700 }}>Calibrating Competency Profile...</span>
                    </>
                  ) : idx < totalQuestionsCount - 1 ? (
                    'Next Question →'
                  ) : (
                    'Finish Quiz ✓'
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showNav && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNav(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(5,10,20,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 460, background: 'linear-gradient(155deg, #122038, #0d1830)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '24px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between', marginBottom: 6 }}>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>Practice Matrix Index</h3>
                <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={() => setShowNav(false)}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
                  <X size={16} />
                </motion.button>
              </div>
              <p style={{ color: 'rgba(178,208,238,0.6)', fontSize: '0.8rem', margin: '0 0 18px' }}>
                Select index to navigate. Status: {answers.filter(a => a !== null).length}/{totalQuestionsCount} populated.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                {Array.from({ length: totalQuestionsCount }).map((_, i) => {
                  const isAccessible = i <= idx || answers[i] !== null;

                  const answered = answers[i] !== null
                  const current = i === idx
                  const conf = confidence[i]

                  let bg = 'rgba(255,255,255,0.02)'
                  let border = '1px solid rgba(255,255,255,0.05)'
                  let text = 'rgba(255,255,255,0.15)'

                  if (isAccessible) {
                    text = 'rgba(255,255,255,0.65)'
                    border = '1px solid rgba(255,255,255,0.1)'
                    bg = 'rgba(255,255,255,0.05)'

                    if (current) {
                      bg = 'linear-gradient(135deg, #2b598f, #4a9acc)'
                      border = '1.5px solid #71bfeb'
                      text = '#fff'
                    } else if (conf === 'yakin') {
                      bg = 'rgba(122,158,110,0.18)'
                      border = '1.5px solid rgba(122,158,110,0.5)'
                      text = '#9fc890'
                    } else if (conf === 'ragu') {
                      bg = 'rgba(245,200,66,0.18)'
                      border = '1.5px solid rgba(245,200,66,0.5)'
                      text = '#f5c842'
                    } else if (conf === 'tidak') {
                      bg = 'rgba(224,82,82,0.18)'
                      border = '1.5px solid rgba(224,82,82,0.5)'
                      text = '#f08a8a'
                    } else if (answered) {
                      bg = 'rgba(255,255,255,0.06)'
                    }
                  }

                  return (
                    <div key={i} style={{ position: 'relative' }}>
                      <motion.button data-idx={i} onClick={isAccessible ? navTo : null} disabled={!isAccessible}
                        style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 12, cursor: isAccessible ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, border, color: text, transition: 'all 0.15s ease' }}>
                        {i + 1}
                      </motion.button>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}