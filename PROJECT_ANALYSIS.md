# Flashcard AI - Comprehensive Project Analysis

This document provides a detailed analysis of all the functionalities present in the **Flashcard** project. 

The project is a full-stack MERN (MongoDB, Express, React, Node.js) application designed to automatically generate study materials (flashcards and quizzes) from uploaded PDF documents using AI.

---

## 1. Core Architecture & Tech Stack

### Frontend (Client-side)
*   **Framework:** React (Single Page Application) with React Router for navigation.
*   **Styling:** Custom Vanilla CSS utilizing CSS variables for theme and glassmorphic premium UI.
*   **Global State Management:** React Context API (`AuthContext`) to manage user authentication state.
*   **Routing:** React Router v6 mapping specific components to routes (`/`, `/login`, `/signup`, `/input`, `/review`, `/qnspeak`, `/quiz`). 
*   **PDF Parsing:** `pdf.js` for client-side functionality.

### Backend (Server-side)
*   **Framework:** Node.js with Express.js.
*   **Database:** MongoDB configured with Mongoose for Object Data Modeling (ODM).
*   **LLM Integration:** Groq SDK (using Llama 3 models like `llama-3.3-70b-versatile`) for Intelligently generating flashcards.
*   **Data Parsing:** `pdf-parse` for server-side PDF text extraction and `multer` for memory storage and file handling.

---

## 2. Detailed Functionalities

### A. Authentication & User Management (auth.js)
*   **User Registration (Signup):** Users can create accounts using Name, Email, and Password. Passwords are securely hashed using `bcryptjs`.
*   **User Login:** Users log in using Email and Password. The system supports secure password comparison and gracefully handles legacy unhashed passwords vs. bcrypt-hashed ones.
*   **Protected Routes:** Client-side functionality (`ProtectedRoute` component) ensures that the core features (`/input`, `/review`, `/qnspeak`, `/quiz`) are explicitly locked behind an authenticated session.

### B. Intelligent PDF Processing & Flashcard Generation (flashcards.js)
*   **PDF Upload (`/upload`):** The system allows users to upload PDF documents using a multipart form (`multer`). The files are processed entirely in memory.
*   **Server-Side Text Extraction:** Extracts raw text from the uploaded PDF document combining sentences utilizing `pdf-parse`.
*   **AI Prompt Engineering:** The backend interacts with the Llama 3 LLM via the Groq API. It provides context to the AI model and strictly engineers it to output exactly **20 full-length flashcards**.
*   **Distribution Matrix:** The generation requests specific mark structures for the material:
    *   6 questions worth 1 mark (basic explanations)
    *   8 questions worth 2 marks (detailed context)
    *   4 questions worth 5 marks (comprehensive analyses)
    *   2 questions worth 10 marks (extensive, multi-aspect analyses)
*   **Algorithmic Difficulty Detection:** The backend runs an internal calculation comparing word counts, sentence complexity, and overall character length to classify every generated flashcard into a calculated difficulty (`Easy`, `Medium`, `Hard`).
*   **AI Output Verification & Fallback Healing System:** 
    *   Validates the AI's returned JSON response.
    *   Has auto-healing scripts to repair malformed structures (like trailing commas) dynamically.
    *   **Robust Generator Fallback Strategy:** If the AI model times out or hallucinate incorrect arrays, a `generateFallbackFlashcards()` algorithmic fallback generator activates. It splices consecutive strings and guarantees flashcard returns without API reliance.

### C. Data Persistence and Database Architecture (models/)
*   **Mongoose Models:** 
    *   **User Model** (Name, Email, Password).
    *   **Flashcard Model** (Question, Answer, Marks, Difficulty, Filename, and Creator User ID).
    *   **Upload/History Model** (Tracks previously parsed document metadata for tracking past study habits).
*   **Session Lifecycle & File Ingestion:** Removes previous flashcards belonging to the requesting user before populating the `Flashcard` schema with the freshly parsed content representing the submitted PDF.
*   **Filtering API:** Endpoint allowing filtering user-specific flashcards by complexity (e.g., `?difficulty=hard&marks=5`).

### D. User Interface & Feature Capabilities (client/src/pages)
*   **Input Page (Upload Portal):** Dropzone interface enabling users to ingest PDFs seamlessly.
*   **Review Page:**
    *   Provides a responsive grid layout of the retrieved data.
    *   Features UI filtering logic over Marks ranges and Difficulty tiers.
*   **QnSpeak Page (Text-to-Speech Accessibility):**
    *   Built for auditory learners, it isolates flashcards dynamically one-by-one.
    *   Integrates browser-native SpeechSynthesis capabilities to verbally perform and read out flashcards.
*   **Quiz Page:**
    *   Transforms static flashcard contexts into an active recall scenario by auto-generating tests dynamically and presenting them back to the user to gauge retention.

---

## 3. General Workflow Summary
1.  **Onboarding:** Navigate to `/signup` or `/login`. Authenticate session.
2.  **Ingestion & Processing:** User drags a PDF document to `/input`. The application parses the byte array, triggers Groq Llama 3, formats JSON structs, cleanses, inserts into MongoDB, and returns UI validations.
3.  **Visual Learn Phase:** User reviews static data matrices via `/review`. 
4.  **Auditory Learn Phase:** Web browser synthesizes AI output directly via `/qnspeak`.
5.  **Active Testing Phase:** User evaluates capabilities against generated quizzes in `/quiz`.
