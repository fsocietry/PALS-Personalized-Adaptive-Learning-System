import { useState } from 'react'
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
import { preprocessTelemetryForML, sendToHuggingFace } from './lib/api'

// Percentage of correct answers for a finished quiz result.
function scoreOf(r) {
  if (!r || !r.questions || !r.answers) return 0
  const correct = r.answers.filter((a, i) => a === r.questions[i].answer).length
  return Math.round((correct / r.questions.length) * 100)
}

// The diagnostic test is a one-time, first-login experience. We remember per
// user (keyed by email) whether it's been completed so returning users skip
// straight to the dashboard after signing in again.
const doneKey = (email) => `pals_diagnostic_done_${email || 'anon'}`

function hasDoneDiagnostic(email) {
  try { return localStorage.getItem(doneKey(email)) === '1' } catch { return false }
}

function markDiagnosticDone(email) {
  try { localStorage.setItem(doneKey(email), '1') } catch { /* storage unavailable */ }
}

export default function App() {
  const [screen, setScreen] = useState('login')
  const [user, setUser] = useState({ name: '', email: '' })

// Menyimpan data kuis mentah dan session ID sebelum dilempar ke Hugging Face & Drive
  const [savedRawRecords, setSavedRawRecords] = useState([])
  const [savedSessionId, setSavedSessionId] = useState('')

  const [diagnosticResults, setDiagnosticResults] = useState(null)
  const [practiceResults, setPracticeResults] = useState(null)
  const [practiceTopic, setPracticeTopic] = useState(null)

  return (
    <div style={{ minHeight: '100vh', background: '#f9feff' }}>
      <AnimatePresence mode="wait">
        {screen === 'login' && (
          <Login
            key="login"
            onStart={(u) => {
              setUser(u)
              setScreen(hasDoneDiagnostic(u.email) ? 'dashboard' : 'intro')
            }}
          />
        )}
        {screen === 'intro' && (
          <DiagnosticIntro
            key="intro"
            onBegin={() => setScreen('quiz')}
          />
        )}
        {screen === 'quiz' && (
        <DiagnosticQuiz
            key="quiz"
            // Tangkap 3 parameter terpisah hasil kiriman dari fungsi 'next' di kuis
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
            // Menerima array cluster hasil olahan model ML dari Hugging Face
            onDone={(mlResults) => {
              console.log("Rapor ML sukses didapatkan di App.jsx:", mlResults)
              setScreen('profile')
            }}
          />
        )}
        {screen === 'profile' && (
          <LearningProfile
            key="profile"
            results={diagnosticResults}
            onContinue={() => setScreen('dashboard')}
          />
        )}
        {screen === 'dashboard' && (
        <Dashboard
            key="dashboard"
            user={user}
            results={diagnosticResults}
            onStartQuiz={(topic) => { setPracticeTopic(topic); setScreen('practice') }}
            onLogout={() => setScreen('login')}
        />
        )}
        {screen === 'practice' && (
        <PracticeQuiz
            key={`practice-${practiceTopic ?? 'all'}`}
            topic={practiceTopic}
            // Ubah menjadi fungsi async agar bisa menunggu (await) respons dari Hugging Face
            onComplete={async (r) => {
            setPracticeResults(r)
            recordQuizResult(user.email, { score: scoreOf(r), type: 'practice', topic: practiceTopic })
            
            // ─── PIPA DATA KHUSUS PRACTICE (HANYA KE HUGGING FACE) ───
            try {
                const telemetryRows = r.telemetry // 1. Ambil array telemetry murni dari properti .telemetry
                
                if (telemetryRows && telemetryRows.length > 0) {
                console.log("Menjalankan preprocessing untuk data Practice...");
                const mlPayloads = preprocessTelemetryForML(telemetryRows)
                
                console.log("Mengirim data Practice ke Hugging Face ...");
                const hfResponses = await sendToHuggingFace(mlPayloads)
                
                console.log("Respons Model ML untuk Practice Sukses:", hfResponses)
                }
            } catch (error) {
                console.error("🛑 Gagal memproses pipeline kognitif Practice:", error)
            }
            
            // Setelah proses pengiriman selesai, lempar user ke halaman kuis selesai
            setScreen('complete')
            }}
            onExit={() => setScreen('dashboard')}
        />
        )}
        {screen === 'complete' && (
          <QuizComplete
            key="complete"
            results={practiceResults}
            onBack={() => setScreen('dashboard')}
          />
        )}
      </AnimatePresence>
    </div>
  )
}