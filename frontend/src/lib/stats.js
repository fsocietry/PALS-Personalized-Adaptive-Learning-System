// Per-user quiz history → powers the dashboard stat cards with real data.
// Stored in localStorage so it survives logout/login on the same device.

const KEY = (email) => `pals_quiz_history_${email || 'anon'}`

// Local calendar date as YYYY-MM-DD (timezone-aware).
function todayISO() {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export function loadQuizHistory(email) {
  try {
    return JSON.parse(localStorage.getItem(KEY(email))) || []
  } catch {
    return []
  }
}

// Append one completed quiz: { score 0–100, type, topic }.
export function recordQuizResult(email, { score, type, topic } = {}) {
  try {
    const hist = loadQuizHistory(email)
    hist.push({
      date: todayISO(),
      score: Math.round(score || 0),
      type: type || 'practice',
      topic: topic || null,
    })
    localStorage.setItem(KEY(email), JSON.stringify(hist))
    return hist
  } catch {
    return []
  }
}

// Run length of the most recent consecutive run of active days.
function computeStreak(history) {
  if (!history.length) return 0
  const days = [...new Set(history.map((h) => h.date))].sort().reverse() // newest first
  let streak = 1
  let prev = new Date(days[0])
  for (let i = 1; i < days.length; i++) {
    const cur = new Date(days[i])
    const diff = Math.round((prev - cur) / 86400000)
    if (diff === 1) { streak++; prev = cur }
    else if (diff === 0) continue
    else break
  }
  return streak
}

export function computeStats(history) {
  const quizzesTaken = history.length
  const avgScore = quizzesTaken
    ? Math.round(history.reduce((s, h) => s + (h.score || 0), 0) / quizzesTaken)
    : 0
  return { quizzesTaken, avgScore, streakDays: computeStreak(history) }
}
