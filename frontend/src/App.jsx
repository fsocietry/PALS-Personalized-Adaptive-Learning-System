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
              // First-time users take the diagnostic; returning users go to the dashboard.
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
            onComplete={(r) => {
              setDiagnosticResults(r)
              markDiagnosticDone(user.email)
              recordQuizResult(user.email, { score: scoreOf(r), type: 'diagnostic' })
              setScreen('analyzing')
            }}
          />
        )}
        {screen === 'analyzing' && (
          <Analyzing
            key="analyzing"
            onDone={() => setScreen('profile')}
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
            onComplete={(r) => {
              setPracticeResults(r)
              recordQuizResult(user.email, { score: scoreOf(r), type: 'practice', topic: practiceTopic })
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
