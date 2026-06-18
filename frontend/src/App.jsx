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
import { preprocessTelemetryForML, sendToHuggingFace, saveQuizToBackend, fetchUserStats } from './lib/api'

// Percentage of correct answers for a finished quiz result.
function scoreOf(r) {
  if (!r || !r.questions || !r.answers) return 0
  const correct = r.answers.filter((a, i) => a === r.questions[i].answer).length
  return Math.round((correct / r.questions.length) * 100)
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
  
  // STATE BARU UNTUK MENAMPUNG HASIL AI
  const [aiProfileData, setAiProfileData] = useState(null)

  // 2. STATE BARU UNTUK DASHBOARD STATS (Dari SQL)
  const [dashboardStats, setDashboardStats] = useState({ averageScore: 0, quizzesTaken: 0, streak: 0 })

  return (
    <div style={{ minHeight: '100vh', background: '#f9feff' }}>
      <AnimatePresence mode="wait">
        {/* 3. ROMBAK LOGIKA LOGIN */}
        {screen === 'login' && (
          <Login
            key="login"
            onStart={async (u) => {
              setUser(u)
              
              console.log("Mengambil data profil dari SQL...");
              const userStats = await fetchUserStats();
              
              if (userStats) {
                // Simpan stats ke state agar bisa dikirim ke Dashboard
                setDashboardStats(userStats.stats);
                
                // Cek apakah dia sudah pernah tes diagnostik dari database?
                if (userStats.hasDoneDiagnostic) {
                  setScreen('dashboard');
                } else {
                  setScreen('intro');
                }
              } else {
                // Fallback jika error jaringan, anggap user baru
                setScreen('intro');
              }
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
            onComplete={(quizResult, telemetryRows, sessionId) => {
              setDiagnosticResults(quizResult)
              setSavedRawRecords(telemetryRows)
              setSavedSessionId(sessionId)
              
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
              console.log("Rapor ML sukses didapatkan di App.jsx:", mlResults)
              setAiProfileData(mlResults) 

              try {
                console.log("Menyimpan rekam jejak Diagnostic ke Database SQL...");
                
                const totalQ = diagnosticResults?.questions ? diagnosticResults.questions.length : 15;
                const correctAns = diagnosticResults?.answers ? diagnosticResults.answers.filter((a, i) => a === diagnosticResults.questions[i].answer).length : 0;
                const hfData = mlResults && mlResults.length > 0 ? mlResults[0] : null;

                let aiConfidence = 0.85;
                if (hfData && hfData.probability && hfData.prediction !== undefined) {
                    aiConfidence = hfData.probability[hfData.prediction]; 
                }

                let finalPrediction = hfData?.prediction ?? 2;
                if (correctAns === 0) {
                    finalPrediction = 2;
                }

                const sqlPayload = {
                    topicIndex: 0, 
                    score: scoreOf(diagnosticResults),
                    totalQuestion: totalQ,
                    correctAnswer: correctAns,
                    difficulty: 1, 
                    predictedLevel: finalPrediction, 
                    confidence: aiConfidence,
                    nextTopic: 1 
                };

                await saveQuizToBackend(sqlPayload);
                console.log("✅ Data Diagnostic & ML sukses mendarat di SQL Connect!");

                const updatedData = await fetchUserStats();
                if (updatedData) setDashboardStats(updatedData.stats);

              } catch (error) {
                console.error("🛑 Gagal menyimpan Diagnostic ke SQL:", error)
              }

              setScreen('profile')
            }}
          />
        )}
        {screen === 'profile' && (
          <LearningProfile
            key="profile"
            results={diagnosticResults}
            aiResults={aiProfileData} 
            onContinue={() => setScreen('dashboard')}
          />
        )}
        
        {/* 4. LEMPAR STATS KE DASHBOARD */}
        {screen === 'dashboard' && (
          <Dashboard
            key="dashboard"
            user={user}
            results={diagnosticResults}
            stats={dashboardStats} 
            onStartQuiz={(topic) => { setPracticeTopic(topic); setScreen('practice') }}
            onLogout={() => setScreen('login')}
          />
        )}
        {screen === 'practice' && (
          <PracticeQuiz
            key={`practice-${practiceTopic ?? 'all'}`}
            topic={practiceTopic}
            onComplete={async (r) => {
              setPracticeResults(r)
              
              try {
                const telemetryRows = r.telemetry 
                let hfResponses = null;
                
                if (telemetryRows && telemetryRows.length > 0) {
                  console.log("Menjalankan preprocessing untuk data Practice...");
                  const mlPayloads = preprocessTelemetryForML(telemetryRows)
                  
                  console.log("Mengirim data Practice ke Hugging Face ...");
                  hfResponses = await sendToHuggingFace(mlPayloads)
                  console.log("Respons Model ML untuk Practice Sukses:", hfResponses)
                }

                console.log("Menyimpan rekam jejak ke Database SQL...");
                
                const totalQ = r.questions ? r.questions.length : 10;
                const correctAns = r.answers ? r.answers.filter((a, i) => a === r.questions[i].answer).length : 0;
                
                const topicToIdMap = {
                    "Simple Present Tense": 1,
                    "Present Continuous Tense": 2,
                    "Present Perfect Tense": 3,
                    "Present Perfect Continuous Tense": 4,
                    "Simple Past Tense": 5,
                    "Past Continuous Tense": 6,
                    "Past Perfect Tense": 7,
                    "Past Perfect Continuous Tense": 8,
                    "Simple Future Tense": 9,
                    "Future Continuous Tense": 10,
                    "Future Perfect Tense": 11,
                    "Future Perfect Continuous Tense": 12
                };

                const currentTopicId = topicToIdMap[practiceTopic] || 1;
                const hfData = hfResponses && hfResponses.length > 0 ? hfResponses[0] : null;

                let aiConfidence = 0.85;
                if (hfData && hfData.probability && hfData.prediction !== undefined) {
                    aiConfidence = hfData.probability[hfData.prediction]; 
                }

                let finalPrediction = hfData?.prediction ?? 2;
                if (correctAns === 0) {
                    finalPrediction = 2;
                }

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
                console.log("✅ Data Practice & ML sukses mendarat di SQL Connect!");

              } catch (error) {
                console.error("🛑 Gagal memproses pipeline kognitif Practice / SQL:", error)
              }
              
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