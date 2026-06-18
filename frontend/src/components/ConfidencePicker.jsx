import { motion } from 'framer-motion'

const OPTIONS = [
  { value: 'yakin', label: 'Yakin', color: '#7a9e6e' },
  { value: 'ragu',  label: 'Ragu-ragu', color: '#f5c842' },
  { value: 'tidak', label: 'Tidak yakin', color: '#e05252' },
]

// Confidence rating shown once an answer is selected. Feeds first/final_confidence telemetry.
export default function ConfidencePicker({ value, onPick }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ color: 'rgba(178,208,238,0.6)', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 8px' }}>
        Seberapa yakin dengan jawabanmu?
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {OPTIONS.map(o => {
          const sel = value === o.value
          return (
            <motion.button key={o.value} type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => onPick(o.value)}
              style={{
                padding: '9px 18px', borderRadius: 99, cursor: 'pointer',
                fontWeight: 600, fontSize: '0.84rem',
                background: sel ? `${o.color}26` : 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${sel ? o.color : 'rgba(255,255,255,0.1)'}`,
                color: sel ? o.color : 'rgba(255,255,255,0.7)',
                transition: 'all 0.18s ease',
              }}>
              {o.label}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
