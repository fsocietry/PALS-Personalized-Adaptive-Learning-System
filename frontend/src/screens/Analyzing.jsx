import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { CircleCheckBig, Loader2 } from 'lucide-react'
import iconPng from '../assets/icon.png'
import { preprocessTelemetryForML, sendToHuggingFace, sendToGoogleDrive } from '../lib/api'

const STEPS = [
  'Processing your behavioral patterns',
  'Analyzing learning strategies',
  'Generating cognitive profile',
]

const R    = 54
const CIRC = 2 * Math.PI * R

export default function Analyzing({ sessionId, rawTelemetryRecords, onDone }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [errorMessage, setErrorMessage] = useState(null)
  const hasTriggered = useRef(false)

  // Efek dekoratif untuk transisi langkah pengerjaan di layar
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev))
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  // ENGINE PIPELINE POST BACKGROUND OPERATIONAL
  useEffect(() => {
    if (hasTriggered.current) return
    hasTriggered.current = true

    async function runDataPipeline() {
      if (!rawTelemetryRecords || rawTelemetryRecords.length === 0) {
        onDone([])
        return
      }

      try {
        // 1. Preprocessing lokal di browser client
        const mlPayloads = preprocessTelemetryForML(rawTelemetryRecords)

        // ✅ FIX PERFORMA: Panggil Drive Webhook secara independen di background (Fire-and-Forget)
        // Langkah ini tidak akan menahan loading spinner kamu jika Google Apps Script lambat merespons.
        sendToGoogleDrive(sessionId, rawTelemetryRecords)

        // 2. Cukup await respon inferensi kognitif dari Hugging Face saja
        console.log("🧠 Executing Hugging Face Inference Node...")
        const hfResponses = await sendToHuggingFace(mlPayloads)
        console.log("🧠 Hugging Face Inference Results:", hfResponses)

        // 3. Berhasil! Beri delay sedikit agar transisi mulus, lalu panggil callback onDone
        setTimeout(() => {
          onDone(hfResponses)
        }, 500)

      } catch (error) {
        console.error("🛑 Terjadi gangguan pada pipeline integrasi:", error)
        setErrorMessage("Connection issue detected. Retrying layout...")
        
        // Fallback jika server down/sleep agar web production tidak freeze selamanya
        setTimeout(() => {
          onDone([])
        }, 3000)
      }
    }

    runDataPipeline()
  }, [rawTelemetryRecords, sessionId, onDone])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #0d1421 0%, #0e1c33 55%, #0c1828 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, position: 'relative', overflow: 'hidden',
      }}>

      {/* Blobs Background */}
      {[
        { size: 400, left: '-12%', top: '-18%', color: '#1e4080', delay: 0 },
        { size: 280, left: '70%',  top: '58%',  color: '#0d3060', delay: 2 },
      ].map((b, i) => (
        <motion.div key={i}
          style={{
            position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
            width: b.size, height: b.size, left: b.left, top: b.top,
            background: `radial-gradient(circle at 35% 35%, ${b.color}, transparent 65%)`,
            filter: 'blur(55px)',
          }}
          animate={{ y: [0, -28, 0] }}
          transition={{ duration: 12 + i * 3, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(113,191,235,0.06) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      }} />

      {/* Rotating decorative rings */}
      {[{ size: 600, speed: 45 }, { size: 420, speed: -30 }, { size: 260, speed: 22 }].map((r, i) => (
        <motion.div key={i}
          animate={{ rotate: r.speed > 0 ? 360 : -360 }}
          transition={{ duration: Math.abs(r.speed), repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', width: r.size, height: r.size,
            top: '50%', left: '50%',
            marginTop: -r.size / 2, marginLeft: -r.size / 2,
            borderRadius: '50%',
            border: `1px ${i === 1 ? 'dashed' : 'solid'} rgba(113,191,235,${0.06 - i * 0.015})`,
            pointerEvents: 'none',
          }} />
      ))}

      <div style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 75, damping: 16 }}
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24, padding: '52px 44px',
            textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}>

          {/* SVG Progress Ring */}
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.1 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div style={{ position: 'relative', width: 124, height: 124 }}>
              <svg width="124" height="124" viewBox="0 0 124 124"
                style={{ position: 'absolute', top: 0, left: 0 }}>
                <circle cx="62" cy="62" r={R} fill="none"
                  stroke="rgba(113,191,235,0.1)" strokeWidth="5" />
                <motion.circle cx="62" cy="62" r={R} fill="none"
                  stroke="url(#analyzeGrad)" strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={CIRC}
                  animate={{ 
                    strokeDashoffset: [CIRC, CIRC * 0.2, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  style={{ transformOrigin: '62px 62px' }}
                />
                <defs>
                  <linearGradient id="analyzeGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3d6ea8" />
                    <stop offset="100%" stopColor="#71bfeb" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{
                position: 'absolute', inset: 14, borderRadius: '50%',
                background: 'linear-gradient(145deg, #3d6ea8, #2b598f)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 18px rgba(43,89,143,0.5)',
              }}>
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
                  <img src={iconPng} alt="PALS" style={{ width: 54, height: 54, objectFit: 'contain' }} />
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff',
              margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            {errorMessage ? "Pipeline Warning" : "Analyzing Your Results"}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.32 }}
            style={{
              color: errorMessage ? '#ef4444' : 'rgba(178,208,238,0.7)', fontSize: '0.9rem', lineHeight: 1.75,
              margin: '0 auto 32px', maxWidth: 360,
            }}>
            {errorMessage ? errorMessage : "We're processing your answers and learning patterns to create your personalized learning profile..."}
          </motion.p>

          {/* LIST GENERAL STEPS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {STEPS.map((s, i) => {
              const isDone = i < currentStepIndex;
              const isActive = i === currentStepIndex;
              
              return (
                <motion.div key={s}
                  initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 18px', borderRadius: 12, textAlign: 'left',
                    background: isDone ? 'rgba(122,158,110,0.08)' : (isActive ? 'rgba(113,191,235,0.08)' : 'rgba(255,255,255,0.03)'),
                    border: isActive ? '1px solid rgba(113,191,235,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    opacity: isDone || isActive ? 1 : 0.35
                  }}>
                  <div>
                    {isDone ? (
                      <CircleCheckBig size={20} color="#7a9e6e" />
                    ) : isActive ? (
                      <motion.div style={{ display: 'flex', alignItems: 'center' }}>
                        <Loader2 size={20} color="#71bfeb" style={{ animation: 'spin 1s linear infinite' }} />
                      </motion.div>
                    ) : (
                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }} />
                    )}
                  </div>
                  <span style={{ 
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.75)', 
                    fontSize: '0.9rem', 
                    fontWeight: isActive ? 600 : 500 
                  }}>{s}</span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}