import { useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged } from 'firebase/auth' 
import { auth } from './firebase' 
import { AnimatePresence } from 'framer-motion' 
import Login from './screens/Login'
import DiagnosticIntro from './screens/DiagnosticIntro'
import DiagnosticQuiz from './screens/DiagnosticQuiz'
import Analyzing from './screens/Analyzing'
import LearningProfile from './screens/LearningProfile'
import Dashboard from './screens/Dashboard'
import PracticeQuiz from './screens/PracticeQuiz'
import QuizComplete from './screens/QuizComplete'
import { recordQuizResult } from './lib/stats'
import { 
  preprocessTelemetryForML, 
  sendToHuggingFace, 
  saveQuizToBackend,
  fetchUserProfileFromPostgres, 
  fetchQuizHistoryFromPostgres, 
  TENSE_TOPICS                  
} from './lib/api'

function scoreOf(r) {
  if (!r || !r.questions || !r.answers) return 0
  const correct = r.answers.filter((a, i) => a === r.questions[i].answer).length
  return Math.round((correct / r.questions.length) * 100)
}

const doneKey = (email) => `pals_diagnostic_done_${email || 'anon'}`
function hasDoneDiagnostic(email) {
  try { return localStorage.getItem(doneKey(email)) === '1' } catch { return false }
}
function markDiagnosticDone(email) {
  try { localStorage.setItem(doneKey(email), '1') } catch {}
}

export default function App() {
  const [screen, setScreen] = useState('login')
  const [user, setUser] = useState({ name: '', email: '' })
  const [isAuthChecking, setIsAuthChecking] = useState(true)

  const [savedRawRecords, setSavedRawRecords] = useState([])
  const [savedSessionId, setSavedSessionId] = useState('')

  const [diagnosticResults, setDiagnosticResults] = useState(null)
  const [practiceResults, setPracticeResults] = useState(null)
  const [practiceTopic, setPracticeTopic] = useState(null)

  const [hasDiagnostic, setHasDiagnostic] = useState(false)
  const [aiProfileData, setAiProfileData] = useState(null)

  const [quizHistory, setQuizHistory] = useState([])
  const [cognitiveProfile, setCognitiveProfile] = useState(null)
  const [adaptiveFallbackTopic, setAdaptiveFallbackTopic] = useState(null)
  const [isSmartPractice, setIsSmartPractice] = useState(false)

  const syncPostgresProfile = useCallback(async (email) => {
    if (!email) return
    try {
      console.log("🔍 [App.jsx] Fetching profile & history for:", email);
      const [postgresData, historyData] = await Promise.all([
        fetchUserProfileFromPostgres(email),
        fetchQuizHistoryFromPostgres()
      ]);

      console.log("📦 [App.jsx] Raw Postgres User Profile Data:", postgresData);
      
      // 🎯 DIAGNOSTIC LOG: Tampilkan tabel riwayat kuis mentah ke console!
      if (historyData && historyData.length > 0) {
        console.group("📜 [App.jsx] SUCCESS: Fetched quizAttempt Data from PostgreSQL");
        console.table(historyData);
        console.groupEnd();
      } else {
        console.log("⚠️ [App.jsx] WARNING: quizAttempt table is empty or failed to load.");
      }

      setQuizHistory(historyData || []);

      const profile = postgresData?.topicProfile;
      const isProfileCalibrated = profile && TENSE_TOPICS.some((_, idx) => {
        const val = profile[`topic${idx + 1}`];
        return val !== undefined && val !== -1 && val !== null;
      });

      if (isProfileCalibrated) {
        console.log("✅ [App.jsx] Profile calibrated, mapping topics...");
        const resolvedMap = {};
        TENSE_TOPICS.forEach((topicName, idx) => {
          const val = profile[`topic${idx + 1}`];
          resolvedMap[topicName] = val !== undefined ? val : -1;
        });
        
        setCognitiveProfile(resolvedMap);
        setHasDiagnostic(true); 

        let weakestTopic = TENSE_TOPICS[0];
        let maxClusterSeverity = -1;
        TENSE_TOPICS.forEach((topicName) => {
          const currentCluster = resolvedMap[topicName] || 0;
          if (currentCluster > maxClusterSeverity) {
            maxClusterSeverity = currentCluster;
            weakestTopic = topicName;
          }
        });
        setAdaptiveFallbackTopic(weakestTopic);
      } else {
        console.log("⚠️ [App.jsx] No calibrated profile found. Mandatory Diagnostic Active.");
        const resolvedMap = {};
        TENSE_TOPICS.forEach((topicName) => {
          resolvedMap[topicName] = -1;
        });
        setCognitiveProfile(resolvedMap);
        setHasDiagnostic(false); 
      }
    } catch (err) {
      console.error("🛑 [App.jsx] Gagal sinkronisasi dari PostgreSQL:", err)
      setCognitiveProfile({})
      setHasDiagnostic(false)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({ name: currentUser.displayName || '', email: currentUser.email })
        await syncPostgresProfile(currentUser.email)
        setScreen('dashboard') 
      } else {
        setScreen('login')
      }
      setIsAuthChecking(false) 
    })
    return () => unsubscribe()
  }, [syncPostgresProfile])

  if (isAuthChecking) {
    return <div style={{ minHeight: '100vh', background: '#0d1421', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>Loading Session...</div>
  } 

  return (
    <div style={{ minHeight: '100vh', background: '#f9feff' }}>
      <AnimatePresence mode="wait">
        {screen === 'login' && (
          <Login key="login" onStart={(u) => { setUser(u); setScreen('dashboard'); }} />
        )}
        {screen === 'intro' && (
          <DiagnosticIntro key="intro" onBegin={() => setScreen('quiz')} />
        )}
        {screen === 'quiz' && (
          <DiagnosticQuiz
            key="quiz"
            onComplete={(quizResult, telemetryRows, sessionId) => {
              setDiagnosticResults(quizResult)
              setSavedRawRecords(telemetryRows)
              setSavedSessionId(sessionId)
              markDiagnosticDone(user.email)
              recordQuizResult(user.email, { score: scoreOf(quizResult), type: 'diagnostic' })
              setScreen('analyzing')
            }}
          />
        )}
        {screen === 'analyzing' && (
          <Analyzing
            key="analyzing"
            sessionId={savedSessionId}
            rawTelemetryRecords={savedRawRecords}
            onDone={async (mlResults) => {
              setAiProfileData(mlResults) 
              try {
                const sqlPayload = {
                  isDiagnostic: true,
                  questions: diagnosticResults?.questions || [],
                  answers: diagnosticResults?.answers || [],
                  hintsUsed: diagnosticResults?.hintsUsed || Array(36).fill(0),
                  aiResults: mlResults 
                };
                await saveQuizToBackend(sqlPayload);
                await syncPostgresProfile(user.email);
                setScreen('profile');
              } catch (error) {
                console.error("🛑 Gagal menyimpan:", error);
                setScreen('profile');
              }
            }}
          />
        )}
        {screen === 'profile' && (
          <LearningProfile key="profile" results={diagnosticResults} aiResults={aiProfileData} onContinue={() => setScreen('dashboard')} />
        )}
        {screen === 'dashboard' && (
          <Dashboard
            key="dashboard"
            user={user}
            cognitiveProfile={cognitiveProfile} 
            quizHistory={quizHistory} 
            hasDiagnostic={hasDiagnostic}
            onTakeDiagnostic={() => setScreen('intro')} 
            onStartQuiz={(topic) => { 
              if (!topic) {
                setIsSmartPractice(true);
                setPracticeTopic(adaptiveFallbackTopic || TENSE_TOPICS[0]);
              } else {
                setIsSmartPractice(false);
                setPracticeTopic(topic);
              }
              setScreen('practice');
            }}
            onLogout={() => {
              auth.signOut()
              setUser({ name: '', email: '' })
              setCognitiveProfile(null)
              setQuizHistory([])
              setHasDiagnostic(false)
            }}
          />
        )}
        {screen === 'practice' && (
          <PracticeQuiz
            key={`practice-${practiceTopic ?? 'all'}`}
            topic={practiceTopic}
            cognitiveProfile={cognitiveProfile}
            isSmartMode={isSmartPractice}
            onComplete={async (r) => {
              setPracticeResults(r)
              recordQuizResult(user.email, { score: scoreOf(r), type: 'practice', topic: practiceTopic })
              try {
                const telemetryRows = r.telemetry 
                let hfResponses = null;
                
                if (telemetryRows && telemetryRows.length > 0) {
                  const mlPayloads = preprocessTelemetryForML(telemetryRows)
                  hfResponses = await sendToHuggingFace(mlPayloads)
                }
                
                const totalQ = r.questions ? r.questions.length : 5;
                const correctAns = r.answers ? r.answers.filter((a, i) => a === r.questions[i].answer).length : 0;
                
                const topicToIdMap = {
                  "Simple Present Tense": 1, "Present Continuous Tense": 2, "Present Perfect Tense": 3, "Present Perfect Continuous Tense": 4,
                  "Simple Past Tense": 5, "Past Continuous Tense": 6, "Past Perfect Tense": 7, "Past Perfect Continuous Tense": 8,
                  "Simple Future Tense": 9, "Future Continuous Tense": 10, "Future Perfect Tense": 11, "Future Perfect Continuous Tense": 12
                };

                const currentTopicId = topicToIdMap[practiceTopic] || 1;
                const hfData = hfResponses && hfResponses.length > 0 ? hfResponses[0] : null;

                let aiConfidence = 0.85;
                if (hfData && hfData.probability && hfData.prediction !== undefined) {
                    aiConfidence = hfData.probability[hfData.prediction]; 
                }

                let finalPrediction = hfData?.prediction ?? 2;
                if (correctAns === 0) finalPrediction = 2;

                const sqlPayload = {
                    topicIndex: currentTopicId,
                    score: scoreOf(r),
                    totalQuestion: totalQ,
                    correctAnswer: correctAns,
                    difficulty: r.difficulty || 1,
                    predictedLevel: finalPrediction, 
                    confidence: aiConfidence,
                    nextTopic: currentTopicId + 1 
                };

                await saveQuizToBackend(sqlPayload);
                await syncPostgresProfile(user.email);
              } catch (error) {
                console.error("🛑 Gagal memproses pipeline kognitif Practice / SQL:", error)
              }
              setScreen('complete')
            }}
            onExit={() => setScreen('dashboard')}
          />
        )}
        {screen === 'complete' && (
          <QuizComplete key="complete" results={practiceResults} onBack={() => setScreen('dashboard')} />
        )}
      </AnimatePresence>
    </div>
  )
}