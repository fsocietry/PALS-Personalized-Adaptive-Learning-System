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
import { preprocessTelemetryForML, sendToHuggingFace, saveQuizToBackend } from './lib/api'

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
  
  // STATE BARU UNTUK MENAMPUNG HASIL AI
  const [aiProfileData, setAiProfileData] = useState(null)

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
            onDone={async (mlResults) => { // <-- Diubah menjadi async
              console.log("Rapor ML sukses didapatkan di App.jsx:", mlResults)
              // 1. Simpan hasil AI ke state agar bisa dilempar ke Profil
              setAiProfileData(mlResults) 

              // ─── PIPA DATA BARU: SIMPAN DIAGNOSTIC KE SQL ───
              try {
                console.log("Menyimpan rekam jejak Diagnostic ke Database SQL...");
                
                // Hitung manual total soal dan jawaban benar
                const totalQ = diagnosticResults?.questions ? diagnosticResults.questions.length : 15;
                const correctAns = diagnosticResults?.answers ? diagnosticResults.answers.filter((a, i) => a === diagnosticResults.questions[i].answer).length : 0;
                
                const hfData = mlResults && mlResults.length > 0 ? mlResults[0] : null;

                let aiConfidence = 0.85;
                if (hfData && hfData.probability && hfData.prediction !== undefined) {
                    aiConfidence = hfData.probability[hfData.prediction]; 
                }

                // Guardrail (Pagar Pengaman)
                let finalPrediction = hfData?.prediction ?? 2;
                if (correctAns === 0) {
                    finalPrediction = 2; // Paksa ke Beginner
                }

                // Payload SQL. Kita gunakan topicIndex: 0 sebagai penanda Diagnostic (Tes Awal)
                const sqlPayload = {
                    topicIndex: 0, 
                    score: scoreOf(diagnosticResults),
                    totalQuestion: totalQ,
                    correctAnswer: correctAns,
                    difficulty: 1, 
                    
                    predictedLevel: finalPrediction, 
                    confidence: aiConfidence,
                    nextTopic: 1 // Setelah Diagnostic, rekomendasikan mulai belajar dari Topik 1
                };

                await saveQuizToBackend(sqlPayload);
                console.log("✅ Data Diagnostic & ML sukses mendarat di SQL Connect!");

              } catch (error) {
                console.error("🛑 Gagal menyimpan Diagnostic ke SQL:", error)
              }
              // ─── BATAS PIPA DATA DIAGNOSTIC ───

              setScreen('profile')
            }}
          />
        )}
        {screen === 'profile' && (
          <LearningProfile
            key="profile"
            results={diagnosticResults}
            // 2. Lempar data AI ke dalam komponen LearningProfile
            aiResults={aiProfileData} 
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
            onComplete={async (r) => {
              setPracticeResults(r)
              recordQuizResult(user.email, { score: scoreOf(r), type: 'practice', topic: practiceTopic })
              
              try {
                const telemetryRows = r.telemetry 
                let hfResponses = null; // Siapkan variabel penampung hasil ML
                
                if (telemetryRows && telemetryRows.length > 0) {
                  console.log("Menjalankan preprocessing untuk data Practice...");
                  const mlPayloads = preprocessTelemetryForML(telemetryRows)
                  
                  console.log("Mengirim data Practice ke Hugging Face ...");
                  hfResponses = await sendToHuggingFace(mlPayloads)
                  console.log("Respons Model ML untuk Practice Sukses:", hfResponses)
                }

                // ─── PIPA DATA BARU: SIMPAN KE DATABASE SQL ───
                console.log("Menyimpan rekam jejak ke Database SQL...");
                
                // Hitung manual total soal dan jawaban benar
                const totalQ = r.questions ? r.questions.length : 10;
                const correctAns = r.answers ? r.answers.filter((a, i) => a === r.questions[i].answer).length : 0;
                
                // 1. Buat pemetaan (kamus) Nama Topik ke Angka Index
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

                // 2. Terjemahkan string menjadi angka (fallback ke 1 jika tidak ditemukan)
                const currentTopicId = topicToIdMap[practiceTopic] || 1;

                // 3. Susun payload sesuai yang diminta backend
                const hfData = hfResponses && hfResponses.length > 0 ? hfResponses[0] : null;

                // Ekstrak confidence dari array probability
                let aiConfidence = 0.85;
                if (hfData && hfData.probability && hfData.prediction !== undefined) {
                    aiConfidence = hfData.probability[hfData.prediction]; 
                }

                // ─── GUARDRAIL (PAGAR PENGAMAN) ───
                let finalPrediction = hfData?.prediction ?? 2;
                if (correctAns === 0) {
                    finalPrediction = 2; // Paksa ke level Beginner jika salah semua
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

                // Eksekusi fungsi pengirim
                await saveQuizToBackend(sqlPayload);
                console.log("✅ Data Practice & ML sukses mendarat di SQL Connect!");

              } catch (error) {
                console.error("🛑 Gagal memproses pipeline kognitif Practice / SQL:", error)
              }
              
              // Setelah semua proses selesai, lempar user ke halaman kuis selesai
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