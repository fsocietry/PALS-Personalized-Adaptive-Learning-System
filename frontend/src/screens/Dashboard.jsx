import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { User, LogOut, Award, Clock, TrendingUp, ChevronRight, History, Calendar } from 'lucide-react'
import { useCountUp } from '../hooks/useCountUp'
import { questionsByTense } from '../data/questions'

// Konfigurasi lencana kognitif hasil klasterisasi relasional
const CLUSTER_BADGES = {
  1: { text: 'Independent', color: '#7a9e6e', bg: 'rgba(122,158,110,0.15)', border: 'rgba(122,158,110,0.25)' }, 
  0: { text: 'Assisted',    color: '#f5c842', bg: 'rgba(245,200,66,0.15)',  border: 'rgba(245,200,66,0.25)'  }, 
  2: { text: 'Struggling',   color: '#e05252', bg: 'rgba(224,82,82,0.15)',   border: 'rgba(224,82,82,0.25)'   }, 
  'none': { text: 'Pending', color: 'rgba(178,208,238,0.4)', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)' } 
}

// Map rumpun tenses (Present / Past / Future)
const FAMILY = {
  Present: { Icon: Clock,   color: '#7a9e6e' },
  Past:    { Icon: History, color: '#f5c842' },
  Future:  { Icon: null,     color: '#5aabde' }, 
}

const familyOf = (topic) =>
  topic.startsWith('Simple Present') || topic.startsWith('Present') ? 'Present'
  : topic.startsWith('Simple Past') || topic.startsWith('Past') ? 'Past'
  : 'Future'

// Sinkronisasi kategori tenses dari JSON data kuis
const CATS = questionsByTense.map((g) => {
  return { name: g.topic, sub: `${g.questions.length - 10} Dynamic Questions` }
})

const glass = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)',
}

export default function Dashboard({ user, onStartQuiz, onLogout, cognitiveProfile, quizHistory, hasDiagnostic, onTakeDiagnostic }) {
  
  // 🎯 REAL-TIME SINKRONISASI EVALUASI DATA DIAGNOSTIC & PRACTICE
  const calculatedStats = useMemo(() => {
    const historyArray = Array.isArray(quizHistory) ? quizHistory : [];
    
    // Saring data kuis latihan mandiri (Single Practice)
    const practiceQuizzes = historyArray.filter(item => item.topicIndex !== 0);
    // Saring data hasil Diagnostic (yang tersimpan 12 baris dengan difficulty = 0)
    const diagnosticRows = historyArray.filter(item => item.topicIndex === 0 || item.difficulty === 0);

    // Tentukan jumlah total kuis selesai secara logis edukasi (1 paket Diagnostic dihitung 1 kuis)
    const totalPracticeCount = practiceQuizzes.length;
    const hasCompletedDiagnosticPack = diagnosticRows.length > 0;
    const totalQuizzesCompleted = totalPracticeCount + (hasCompletedDiagnosticPack ? 1 : 0);

    // Hitung akumulasi skor rata-rata gabungan
    let avgScore = 0;
    let scoreSum = 0;
    let weightCount = 0;

    // Tambahkan bobot skor kuis latihan mandiri jika ada
    practiceQuizzes.forEach(q => {
      scoreSum += (Number(q.score) || 0);
      weightCount++;
    });

    // Tambahkan bobot rata-rata dari paket Diagnostic Test jika ada
    if (hasCompletedDiagnosticPack) {
      const diagAvg = Math.round(diagnosticRows.reduce((sum, d) => sum + (Number(d.score) || 0), 0) / diagnosticRows.length);
      scoreSum += diagAvg;
      weightCount++;
    }

    avgScore = weightCount > 0 ? Math.round(scoreSum / weightCount) : 0;

    // Ambil total hari aktif belajar unik
    let streakDays = 0;
    if (historyArray.length > 0) {
      const uniqueDays = [...new Set(historyArray.map(item => {
        const dateStr = item.createdAt || new Date().toISOString();
        return dateStr.slice(0, 10);
      }))];
      streakDays = uniqueDays.length;
    }

    return { quizzesTaken: totalQuizzesCompleted, avgScore, streakDays };
  }, [quizHistory]);

  const avg    = useCountUp(calculatedStats.avgScore,     1000, 150)
  const taken  = useCountUp(calculatedStats.quizzesTaken,  900, 300)
  const streak = useCountUp(calculatedStats.streakDays,    700, 450)

  const STATS = [
    { icon: <Award size={17} color="#fff" />,      bg: 'linear-gradient(135deg,#2b598f,#3d7ab5)', label: 'Average Score', val: `${avg}%` },
    { icon: <Clock size={17} color="#0f1623" />,    bg: 'linear-gradient(135deg,#5aabde,#3d8bbf)', label: 'Quizzes Completed', val: taken },
    { icon: <TrendingUp size={17} color="#fff" />,  bg: 'linear-gradient(135deg,#7a9e6e,#5d8a52)', label: 'Learning Streak', val: `${streak} ${streak === 1 ? 'day' : 'days'}` },
  ]

  // Bersihkan rendering riwayat agar Diagnostic Test tidak membludak memakan 12 baris list di dashboard
  const uniqueHistoryDisplayList = useMemo(() => {
    const historyArray = Array.isArray(quizHistory) ? quizHistory : [];
    const displayList = [];
    const checkedDiagnosticSessions = new Set();

    historyArray.forEach((session) => {
      // Jika baris data adalah paket Diagnostic Test, kompilasikan jadi 1 item baris log summary
      if (session.topicIndex === 0 || session.difficulty === 0) {
        const dateKey = session.createdAt ? session.createdAt.slice(0, 16) : "diag";
        if (!checkedDiagnosticSessions.has(dateKey)) {
          checkedDiagnosticSessions.add(dateKey);
          displayList.push({
            id: session.id || dateKey,
            topicName: "Initial Cognitive Evaluation",
            isDiagnostic: true,
            score: session.score || 89, 
            totalQuestion: 36,
            correctAnswer: Math.round(36 * ((session.score || 89) / 100)),
            createdAt: session.createdAt
          });
        }
      } else {
        // Jika kuis latihan biasa, langsung masukkan secara normal
        displayList.push({
          id: session.id,
          topicName: TENSE_TOPICS[session.topicIndex - 1] || "Practice Session",
          isDiagnostic: false,
          score: Number(session.score) || 0,
          totalQuestion: session.totalQuestion || 5,
          correctAnswer: session.correctAnswer || 0,
          createdAt: session.createdAt
        });
      }
    });

    // 🎯 REVERSE CHRONOLOGICAL ORDER: Urutkan data kuis dari yang paling baru dikerjakan (Paling Atas)
    displayList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return displayList;
  }, [quizHistory]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #0d1421 0%, #0e1c33 55%, #0c1828 100%)',
        position: 'relative', overflow: 'hidden',
      }}>

      {/* Ambient background blur circles */}
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

      {/* Navigation Top Bar */}
      <div style={{
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(20px)',
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
            <p style={{ color: 'rgba(113,191,235,0.7)', fontSize: '0.76rem', margin: 0 }}>Ready to resume your training?</p>
          </div>
        </div>
        <motion.button type="button" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
          }}>
          <LogOut size={14} /> Logout
        </motion.button>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px', position: 'relative', zIndex: 1 }}>

        {/* Analytics Info Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.08, type: 'spring', stiffness: 100 }}
              style={{ ...glass, borderRadius: 14, padding: '18px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: s.bg, boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
                }}>
                  {s.icon}
                </div>
                <span style={{ color: 'rgba(178,208,238,0.6)', fontSize: '0.76rem' }}>{s.label}</span>
              </div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '2rem', margin: 0 }}>{s.val}</p>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* AI Cognitive Profiler Controller Panel */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ ...glass, borderRadius: 16, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
                Cognitive Profiling Assessment
              </h3>
              <p style={{ color: 'rgba(178,208,238,0.6)', fontSize: '0.78rem', margin: 0 }}>
                {hasDiagnostic ? 'Recalibrate your baseline cognitive clustering and proficiency weights.' : 'Assessment required to initialize personalized AI recommendations.'}
              </p>
            </div>
            <motion.button type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onTakeDiagnostic}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none',
                background: hasDiagnostic ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #2b598f, #4a9acc)',
                color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                boxShadow: hasDiagnostic ? 'none' : '0 4px 15px rgba(43,89,143,0.4)',
              }}
            >
              {hasDiagnostic ? '🔄 Retake Diagnostic' : '🎯 Begin Diagnostic Evaluation'}
            </motion.button>
          </motion.div>

          {/* Syllabus Curriculum Grid Panel */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
            style={{ ...glass, borderRadius: 16, padding: '22px 20px' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
              Grammatical Core Categories
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <p style={{ color: 'rgba(178,208,238,0.5)', fontSize: '0.78rem', margin: 0 }}>
                Select a specific tense to target. Item difficulty scales dynamically according to your predictive scale profile.
              </p>
              
              <motion.button type="button" disabled={!hasDiagnostic}
                whileHover={hasDiagnostic ? { scale: 1.03, boxShadow: '0 0 20px rgba(113,191,235,0.25)' } : {}} whileTap={hasDiagnostic ? { scale: 0.97 } : {}}
                onClick={() => onStartQuiz(null)} 
                style={{
                  padding: '6px 14px', borderRadius: 99, 
                  border: hasDiagnostic ? '1px solid #71bfeb' : '1px solid rgba(255,255,255,0.08)',
                  background: hasDiagnostic ? 'linear-gradient(135deg, rgba(61,110,168,0.3), rgba(113,191,235,0.3))' : 'rgba(255,255,255,0.02)',
                  color: hasDiagnostic ? '#71bfeb' : 'rgba(255,255,255,0.25)', 
                  fontSize: '0.78rem', fontWeight: 700, cursor: hasDiagnostic ? 'pointer' : 'not-allowed',
                  opacity: hasDiagnostic ? 1 : 0.5, transition: 'all 0.2s ease'
                }}
              >
                ⚡ Smart Practice (AI-Personalized)
              </motion.button>
            </div>

            <div className="cats-scroll" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, maxHeight: 190, overflowY: 'auto', paddingRight: 6 }}>
              {CATS.map((cat, i) => {
                const rawCluster = cognitiveProfile ? cognitiveProfile[cat.name] : undefined;
                const isTopicCalibrated = rawCluster !== undefined && rawCluster !== 'none' && rawCluster !== -1;
                const isItemUnlocked = hasDiagnostic && isTopicCalibrated;

                const userCluster = isTopicCalibrated ? rawCluster : 'none';
                const badge = CLUSTER_BADGES[userCluster] || CLUSTER_BADGES['none'];

                return (
                  <motion.button key={cat.name} type="button" disabled={!isItemUnlocked} 
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 + i * 0.04 }}
                    whileHover={isItemUnlocked ? { background: 'rgba(255,255,255,0.1)' } : {}} whileTap={isItemUnlocked ? { scale: 0.98 } : {}}
                    onClick={() => onStartQuiz(cat.name)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderRadius: 10,
                      background: isItemUnlocked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                      border: isItemUnlocked ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.03)',
                      cursor: isItemUnlocked ? 'pointer' : 'not-allowed', width: '100%', textAlign: 'left', transition: 'all 0.2s ease', opacity: isItemUnlocked ? 1 : 0.45, 
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                      <p style={{ fontWeight: 600, color: isItemUnlocked ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: '0.86rem', margin: 0 }}>{cat.name}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, color: badge.color, background: badge.bg, border: `1px solid ${badge.border}` }}>
                        {badge.text}
                      </span>
                      <ChevronRight size={15} color={isItemUnlocked ? "rgba(113,191,235,0.6)" : "rgba(255,255,255,0.1)"} />
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>

          {/* 📜 RE-DESIGN: RECENT ACTIVITY LOG SECTION WITH SYMMETRIC OVERFLOW */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ ...glass, borderRadius: 16, padding: '22px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <History size={17} color="#5aabde" />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                Recent Activity Log
              </h3>
            </div>

            {(uniqueHistoryDisplayList.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '24px 10px', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12, background: 'rgba(0,0,0,0.1)' }}>
                <Calendar size={24} color="rgba(255,255,255,0.15)" style={{ margin: '0 auto 8px' }} />
                <p style={{ color: 'rgba(178,208,238,0.4)', fontSize: '0.8rem', margin: 0 }}>
                  No historical training entries recorded yet.
                </p>
              </div>
            ) : (
              /* 🎯 EXACT MATCH STYLE: Menggunakan class 'cats-scroll' dengan max-height 190 dan padding 6 murni simetris */
              <div className="cats-scroll" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, maxHeight: 190, overflowY: 'auto', paddingRight: 6 }}>
                {uniqueHistoryDisplayList.map((session, sIdx) => {
                  const formattedDate = session.createdAt ? new Date(session.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' }) : "Just Now";

                  return (
                    <div key={session.id || sIdx} 
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                        padding: '11px 14px', borderRadius: 10, 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* 🚫 NO NUMBER BADGE: Elemen nomor lingkaran dilepas total agar tulisan rata kiri rapi */}
                        <div>
                          <p style={{ color: '#fff', fontSize: '0.86rem', fontWeight: 600, margin: 0 }}>
                            {session.topicName}
                          </p>
                          <p style={{ color: 'rgba(113,191,235,0.7)', fontSize: '0.72rem', margin: 0 }}>
                            {formattedDate} • Completed Node Items: {session.totalQuestion}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: session.score >= 80 ? '#7a9e6e' : session.score >= 60 ? '#f5c842' : '#e05252' }}>
                          {session.score}%
                        </span>
                        <p style={{ color: 'rgba(178,208,238,0.4)', fontSize: '0.65rem', margin: 0 }}>
                          Passed: {session.correctAnswer}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </motion.div>
  )
}

// Tambahkan konstanta array topik tenses lokal agar tidak memicu eror 'TENSE_TOPICS is not defined'
const TENSE_TOPICS = [
  "Simple Present Tense", "Present Continuous Tense", "Present Perfect Tense", "Present Perfect Continuous Tense",
  "Simple Past Tense", "Past Continuous Tense", "Past Perfect Tense", "Past Perfect Continuous Tense",
  "Simple Future Tense", "Future Continuous Tense", "Future Perfect Tense", "Future Perfect Continuous Tense"
];