<div align="center">

<br />

<img src="https://img.shields.io/badge/PALS-Personalized%20Adaptive%20Learning%20System-2b598f?style=for-the-badge&logo=bookopen&logoColor=white" alt="PALS" />

<br /><br />

# PALS — Personalized Adaptive Learning System

**An intelligent English (tenses) proficiency platform that assesses a learner, captures rich per-question behaviour, and adapts to their unique learning style.**

<br />

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite)](https://vite.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-ffca28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express)](https://expressjs.com)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12-ff0080?style=flat-square&logo=framer)](https://www.framer.com/motion)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<br />

</div>

---

## Overview

PALS is a full-stack web application that delivers an animated, multi-screen English **tenses** assessment experience. Learners sign in with Google, work through a diagnostic and a practice quiz drawn from a 12-tense question bank, and receive a personalized learning profile. While they answer, PALS records detailed per-question **behaviour telemetry** (timing, hint usage, answer changes, confidence, focus loss) that can be exported as CSV for downstream analysis.

The project is split into two parts:

- **`frontend/`** — React 19 + Vite single-page app (the learner experience).
- **`backend/`** — Express 5 API that verifies Firebase ID tokens with the Firebase Admin SDK.

---

## Features

- **Google Sign-In** — Authentication via Firebase Authentication (Google popup); the ID token is verified server-side by the backend.
- **Diagnostic Assessment** — A 12-question diagnostic covering the major English tenses, with 3 progressive hint levels per question.
- **Practice Quiz** — A 12-question follow-up session with previous/next navigation and a quick-access question panel.
- **Behaviour Telemetry** — Per-question tracking of duration, visit count, hint read time, max hint unlocked, answer-change sequence, confidence (first/final), struggle indicators, and window focus loss — persisted to `localStorage` and exportable as CSV.
- **Confidence Picker** — After each answer the learner rates how sure they are (*Yakin* / *Ragu-ragu*), feeding the confidence telemetry.
- **Learning Style Detection** — Classifies users based on response time and hint usage, and generates accuracy, average response time, strengths, growth areas, and recommendations.
- **Score Completion** — Animated SVG arc score with canvas-confetti celebration and one-click `behaviour-<session>.csv` download.

---

## Tech Stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| Frontend         | React 19, Vite 8                    |
| Animations       | Framer Motion 12                    |
| Styling          | Tailwind CSS v4, inline styles      |
| Icons / Confetti | Lucide React, canvas-confetti       |
| Auth (client)    | Firebase Authentication (Google)    |
| Backend          | Node.js, Express 5                  |
| Auth (server)    | Firebase Admin SDK (token verify)   |

---

## Project Structure

```
.
├── frontend/
│   └── src/
│       ├── screens/
│       │   ├── Login.jsx            # Google sign-in entry screen
│       │   ├── DiagnosticIntro.jsx  # Assessment overview
│       │   ├── DiagnosticQuiz.jsx   # 12-question diagnostic (+ telemetry)
│       │   ├── Analyzing.jsx        # Animated results processing
│       │   ├── LearningProfile.jsx  # Personalized skill profile
│       │   ├── Dashboard.jsx        # Home with stats and categories
│       │   ├── PracticeQuiz.jsx     # 12-question practice (+ telemetry)
│       │   └── QuizComplete.jsx     # Score reveal, confetti, CSV export
│       ├── components/
│       │   └── ConfidencePicker.jsx # Yakin / Ragu-ragu rating
│       ├── lib/
│       │   └── telemetry.js         # useQuizTelemetry hook + CSV export
│       ├── hooks/useCountUp.js      # Animated number counter
│       ├── data/questions.js        # Tense question bank (12 tenses × 15)
│       ├── firebase.js              # Firebase client config
│       └── App.jsx                  # Screen router with AnimatePresence
│
└── backend/
    ├── server.js                    # Express app, port 3000
    ├── routes/authRoutes.js         # POST /api/auth/login
    ├── middleware/authMiddleware.js # Verifies Firebase ID token
    ├── controllers/authController.js
    └── config/firebase.js           # Firebase Admin init (serviceAccountKey)
```

---

## Screen Flow

```
Login (Google) → Diagnostic Intro → Diagnostic Quiz (12 questions)
              → Analyzing → Learning Profile → Dashboard
              → Practice Quiz (12 questions) → Quiz Complete → Dashboard
```

---

## Question Bank

Questions are generated from the *PALS PIJAK capstone* dataset and cover **12 English tenses** with **15 questions each (5 easy / 5 medium / 5 hard)** — 180 questions in total. The diagnostic and practice quizzes each draw 12 questions across the tenses.

Exports from `frontend/src/data/questions.js`:

| Export                | Description                                  |
| --------------------- | -------------------------------------------- |
| `diagnosticQuestions` | 12-question diagnostic set                   |
| `practiceQuestions`   | 12-question practice set                     |
| `questionsByTense`    | Full bank grouped by tense (12 × 15)         |
| `allQuestions`        | Flat list of every question in the bank      |

Each question carries `questionId`, `topic`, `difficulty`/`difficultyLabel`, `idealDuration`, `answer`, and three Indonesian `hints`.

---

## Behaviour Telemetry

`useQuizTelemetry` (in `frontend/src/lib/telemetry.js`) records one summary row per question:

| Column                                | Meaning                                         |
| ------------------------------------- | ----------------------------------------------- |
| `total_duration_sec`                  | Total time spent on the question                |
| `visit_count`                         | How many times the question was visited         |
| `final_is_correct`                    | Whether the final answer was correct            |
| `final_is_ideal_duration`             | Answered within the question's ideal time       |
| `max_hint_unlocked`                   | Highest hint level opened (0–3)                 |
| `total_hint_read_sec`                 | Time spent with hints visible                   |
| `first_confidence` / `final_confidence` | Confidence rating (yakin / ragu)              |
| `total_answer_changes`                | Number of distinct answer switches              |
| `ever_selected_correct_answer`        | Correct option was selected at some point       |
| `changed_mind_after_correct`          | Switched away after choosing the correct option |
| `focus_loss_total`                    | Times the window lost focus                     |

Data is stored under the `pals_telemetry` key in `localStorage` and can be downloaded as `behaviour-<session>.csv` from the Quiz Complete screen.

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm
- A Firebase project with **Authentication → Google** enabled

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

The Firebase **client** config lives in `frontend/src/firebase.js`. Update it to point at your own Firebase project if needed.

### 2. Backend

```bash
cd backend
npm install
npm start          # http://localhost:3000
```

The backend verifies Firebase ID tokens, so it needs a **service account key** from the *same* Firebase project the frontend uses:

1. Firebase Console → ⚙️ **Project Settings → Service accounts → Generate new private key**.
2. Save it as `backend/config/serviceAccountKey.json`.

> `serviceAccountKey.json`, `node_modules/`, and `.env` are git-ignored and must never be committed.

### Build for Production

```bash
cd frontend
npm run build
npm run preview
```

---

## API

| Method | Endpoint          | Auth                     | Description                          |
| ------ | ----------------- | ------------------------ | ------------------------------------ |
| `GET`  | `/`               | —                        | Health check (`PALS Backend Running`) |
| `POST` | `/api/auth/login` | `Authorization: Bearer <idToken>` | Verifies the Firebase ID token and returns the decoded user |

---

## License

This project is released under the **MIT License**.

© 2026 **PALS Team — PJK-GM099**. See [LICENSE](LICENSE) for details.
