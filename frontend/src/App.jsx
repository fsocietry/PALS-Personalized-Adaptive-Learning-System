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

export default function App() {
  const [screen, setScreen] = useState('login')
  const [user, setUser] = useState({ name: '', email: '' })
  const [diagnosticResults, setDiagnosticResults] = useState(null)
  const [practiceResults, setPracticeResults] = useState(null)

  return (
    <div style={{ minHeight: '100vh', background: '#f9feff' }}>
      <AnimatePresence mode="wait">
        {screen === 'login' && (
          <Login
            key="login"
            onStart={(u) => { setUser(u); setScreen('intro') }}
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
            onComplete={(r) => { setDiagnosticResults(r); setScreen('analyzing') }}
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
            onStartQuiz={() => setScreen('practice')}
            onLogout={() => setScreen('login')}
          />
        )}
        {screen === 'practice' && (
          <PracticeQuiz
            key="practice"
            onComplete={(r) => { setPracticeResults(r); setScreen('complete') }}
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
