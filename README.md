# ⚡ FlashcardAI

> AI-powered study platform that transforms PDFs into intelligent flashcards, quizzes, and voice-guided study sessions.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-LLama_3-F55036)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **Smart PDF Processing** | Upload any PDF and get AI-generated flashcards instantly |
| 🧠 **AI Generation** | Groq LLM extracts questions, answers, marks & difficulty levels |
| 🎨 **Premium UI** | Glassmorphic design with smooth animations and dark mode |
| 🔐 **Auth System** | Secure signup/login with hashed passwords and JWT tokens |
| 🗣️ **Text-to-Speech** | Voice-guided study sessions for auditory learners |
| 📊 **Progress Tracking** | Track mastery across Easy, Medium & Hard levels |
| 🧩 **Quiz Mode** | Auto-generated multiple-choice quizzes from your flashcards |
| 🗂️ **Upload History** | Quick access to all previously processed documents |

---

## 🛠️ Tech Stack

**Frontend** — React 18 · Vanilla CSS · Lucide Icons · PDF.js

**Backend** — Node.js · Express · MongoDB · Mongoose · Groq API

**AI/ML** — LangChain · HuggingFace Embeddings · MongoDB Atlas Vector Search

**Deploy** — Vercel (Serverless Functions + Static Hosting)

---

## 📁 Project Structure

```
Flashcard/
│
├── api/
│   └── index.js                 # Vercel serverless entry point
│
├── client/
│   ├── public/
│   │   ├── index.html           # HTML template
│   │   └── manifest.json        # PWA manifest
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx       # Navigation bar with icons
│       │   ├── Navbar.css
│       │   └── ProtectedRoute.jsx
│       ├── context/
│       │   ├── AuthContext.js   # Authentication state
│       │   └── ThemeContext.js  # Dark/light mode
│       ├── pages/
│       │   ├── HomePage.jsx     # Landing page
│       │   ├── LoginPage.jsx    # Authentication
│       │   ├── SignupPage.jsx
│       │   ├── InputPage.jsx    # PDF upload
│       │   ├── ReviewPage.jsx   # Flashcard review
│       │   ├── DashboardPage.jsx
│       │   ├── QnSpeakPage.jsx  # Voice study mode
│       │   ├── QuizPage.jsx     # Quiz mode
│       │   └── *.css            # Page-specific styles
│       ├── index.css            # Global design system
│       ├── index.js             # React entry point
│       └── App.js               # Router setup
│
├── server/
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Flashcard.js         # Flashcard schema
│   │   ├── History.js           # Upload history
│   │   ├── Upload.js            # Upload metadata
│   │   └── JobStatus.js         # Background job tracking
│   ├── routes/
│   │   ├── auth.js              # Signup, login, logout, /me
│   │   ├── flashcards.js        # CRUD + generation
│   │   ├── history.js           # Upload history
│   │   └── upload.js            # File upload handling
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   └── authMiddleware.js
│   ├── jobs/
│   │   └── queue.js             # Agenda background jobs
│   ├── utils/
│   │   └── LocalEmbeddings.js   # HuggingFace embeddings
│   ├── validations/
│   │   └── authValidation.js    # Zod input validation
│   └── server.js                # Express app entry point
│
├── vercel.json                  # Vercel deployment config
├── package.json                 # Root dependencies (serverless)
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local or [Atlas](https://cloud.mongodb.com))
- **Groq API Key** ([console.groq.com](https://console.groq.com))

### Installation

```bash
# Clone the repo
git clone https://github.com/Sriram-93/Flashcard.git
cd Flashcard

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Environment Variables

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://your-connection-string
GROQ_API_KEY=gsk_your_groq_api_key
JWT_SECRET=your_jwt_secret_here
```

### Run Locally

```bash
# Terminal 1 — Backend
cd server
npm start
# → http://localhost:5000

# Terminal 2 — Frontend
cd client
npm start
# → http://localhost:3000
```

---

## 🌐 Deploy to Vercel

1. Push this repo to GitHub
2. Import it at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in **Settings → Environment Variables**:
   - `MONGO_URI`
   - `GROQ_API_KEY`
   - `JWT_SECRET`
   - `NODE_ENV` = `production`
4. Deploy — Vercel auto-detects the `vercel.json` config

> **Note:** Whitelist `0.0.0.0/0` in MongoDB Atlas → Network Access for Vercel's dynamic IPs.

---

## 📖 Usage

1. **Sign Up** — Create your account
2. **Upload** — Drop a PDF on the upload page
3. **Review** — Browse generated flashcards, filter by marks
4. **Speak** — Use text-to-speech for voice-guided study
5. **Quiz** — Test your knowledge with auto-generated quizzes

---

## 📝 License

MIT