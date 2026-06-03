<div align="center">

<br />

<img src="https://img.shields.io/badge/PALS-Personalized%20Adaptive%20Learning%20System-2b598f?style=for-the-badge&logo=bookopen&logoColor=white" alt="PALS" />

<br /><br />

# PALS — Personalized Adaptive Learning System

**An intelligent English proficiency assessment platform that adapts to your unique learning style.**

<br />

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite)](https://vite.dev)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12-ff0080?style=flat-square&logo=framer)](https://www.framer.com/motion)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<br />

</div>

---

## Overview

PALS is a frontend web application that delivers a fully animated, multi-screen English language assessment experience. It evaluates a learner's proficiency through a diagnostic quiz, analyzes their response patterns, and generates a personalized learning profile with tailored recommendations — all without requiring a backend or user account.

---

## Features

- **Diagnostic Assessment** — 8 adaptive questions spanning Grammar, Vocabulary, and Idioms with 3 configurable hint levels per question
- **Learning Style Detection** — Classifies users as Quick Learner, Analytical, Methodical, or Visual/Structured based on response time and hint usage
- **Personalized Profile** — Generates accuracy scores, average response time, skill strengths, growth areas, and level-specific recommendations
- **Practice Quiz** — A 5-question follow-up quiz with previous/next navigation and a quick-access question panel
- **Score Completion** — Animated SVG arc score display with canvas-confetti celebration on success
- **Zero Backend** — Fully self-contained; all logic runs client-side with dummy data fallbacks

---

## Tech Stack

| Layer      | Technology       |
| ---------- | ---------------- |
| Framework  | React 19         |
| Build Tool | Vite 8           |
| Animations | Framer Motion 12 |
| CSS        | Tailwind CSS v4  |
| Icons      | Lucide React     |
| Confetti   | canvas-confetti  |

---

## Project Structure

```
src/
├── screens/
│   ├── Login.jsx             # Glassmorphism entry screen
│   ├── DiagnosticIntro.jsx   # Assessment overview and notes
│   ├── DiagnosticQuiz.jsx    # 8-question adaptive diagnostic
│   ├── Analyzing.jsx         # Animated results processing screen
│   ├── LearningProfile.jsx   # Personalized skill profile
│   ├── Dashboard.jsx         # User home with stats and categories
│   ├── PracticeQuiz.jsx      # 5-question practice session
│   └── QuizComplete.jsx      # Score reveal with confetti
├── hooks/
│   └── useCountUp.js         # Animated number counter hook
├── data/
│   └── questions.js          # Diagnostic and practice question bank
├── App.jsx                   # Screen router with AnimatePresence
└── index.css                 # Global styles and keyframe animations
```

---

## Screen Flow

```
Login → Diagnostic Intro → Diagnostic Quiz (8 questions)
      → Analyzing → Learning Profile → Dashboard
      → Practice Quiz (5 questions) → Quiz Complete → Dashboard
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Design System

| Token      | Value                 | Usage                         |
| ---------- | --------------------- | ----------------------------- |
| Dark       | `#0d1421`             | Login background, quiz header |
| Primary    | `#2b598f`             | Buttons, selected states      |
| Sky        | `#5aabde` / `#71bfeb` | Accents, progress bars, icons |
| Success    | `#7a9e6e`             | Correct answers, high scores  |
| Amber      | `#f5c842`             | Hint buttons, warnings        |
| Surface    | `#ffffff`             | Cards and panels              |
| Background | `#f0f4f8`             | Page backgrounds              |

**Animation Principles**

- Spring physics (`stiffness: 80–200, damping: 14–18`) for all entrances
- Staggered reveal with 60–80ms delay between children
- `AnimatePresence mode="wait"` for screen transitions
- SVG `strokeDashoffset` animation for progress arcs
- CSS shimmer sweep on all primary action buttons

---

## Question Bank

**Diagnostic** — 8 questions with difficulty ratings and 3 hints each:

| #   | Category   | Difficulty |
| --- | ---------- | ---------- |
| 1   | Grammar    | Easy       |
| 2   | Vocabulary | Medium     |
| 3   | Grammar    | Medium     |
| 4   | Vocabulary | Hard       |
| 5   | Grammar    | Easy       |
| 6   | Idioms     | Medium     |
| 7   | Grammar    | Hard       |
| 8   | Vocabulary | Medium     |

**Practice** — 5 questions covering Grammar, Idioms, and Vocabulary.

---

## Scoring Logic

| Score Range | Level        | Label                    |
| ----------- | ------------ | ------------------------ |
| 80–100%     | Advanced     | ⭐ Strong English skills |
| 55–79%      | Intermediate | 👍 Good effort           |
| 0–54%       | Beginner     | 💪 Keep going            |

Confetti triggers automatically when score ≥ 50%.

---

## License

MIT © 2026 PALS Team
