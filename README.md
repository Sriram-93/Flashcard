# Flashcard App

A full-stack MERN application that leverages AI (Groq API) to automatically generate study flashcards from uploaded PDF documents. The application features a premium glassmorphic UI, text-to-speech functionality, and a quiz mode for comprehensive learning.

## Features

- 📄 **Smart PDF Processing**: Upload any PDF document and let the AI generate a personalized set of flashcards.
- 🧠 **AI-Powered Generation**: Uses Groq LLM to intelligently extract questions, answers, marks, and difficulty levels from the text.
- 🎨 **Premium UI/UX**: Modern, responsive design featuring glassmorphism, dynamic background blobs, and smooth animations.
- 🔐 **Secure Authentication**: User accounts to save and manage individual flashcard decks, with hashed passwords for security.
- 🗣️ **Text-to-Speech**: Built-in functionality to read out flashcard answers for auditory learners.
- 📊 **Progress Tracking**: See your mastery across different difficulty levels (Easy, Medium, Hard).
- 🧩 **Quiz Mode**: Test your knowledge with a dynamically generated multiple-choice quiz based on your flashcards.
- 🗂️ **History**: Keep track of all your previously uploaded PDFs for quick review.

## Tech Stack

### Frontend
- **React**: UI library for building the interactive single-page application.
- **Vanilla CSS**: Custom CSS with CSS variables to manage the premium glassmorphic design system.
- **PDF.js**: For client-side PDF parsing and validation.

### Backend
- **Node.js & Express**: Fast and scalable web server.
- **MongoDB & Mongoose**: NoSQL database for flexible data storage.
- **Groq API**: High-performance LLM (Llama 3) for lighting-fast flashcard generation.
- **bcryptjs**: Secure password hashing.
- **Multer**: Handling multipart/form-data for PDF uploads.
- **pdf-parse**: Server-side PDF text extraction.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB running locally or a MongoDB Atlas URI
- A Groq API Key

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd Flashcard
   \`\`\`

2. **Backend Setup**
   \`\`\`bash
   cd server
   npm install
   \`\`\`
   
   Create a \`.env\` file in the \`server\` directory:
   \`\`\`env
   PORT=5000
   GROQ_API_KEY=your_groq_api_key_here
   MONGO_URI=mongodb://localhost:27017/flashcardDB # Or your Atlas URI
   \`\`\`

3. **Frontend Setup**
   \`\`\`bash
   cd ../client
   npm install
   \`\`\`

   Create a \`.env\` file in the \`client\` directory (optional, but good for custom configuration):
   \`\`\`env
   REACT_APP_API_URL=http://localhost:5000/api
   \`\`\`

### Running the Application

1. **Start the backend server**
   \`\`\`bash
   cd server
   npm start
   \`\`\`
   *Server will run on http://localhost:5000*

2. **Start the React frontend**
   \`\`\`bash
   cd client
   npm start
   \`\`\`
   *Client will open on http://localhost:3000*

## Project Structure

\`\`\`
Flashcard/
├── client/                 # React Frontend
│   ├── public/             
│   └── src/                
│       ├── components/     # Reusable UI components (Navbar, ProtectedRoute)
│       ├── context/        # React Context for global state (AuthContext)
│       ├── pages/          # Main application views (HomePage, InputPage, etc.)
│       ├── index.css       # Global design system & theme variables
│       └── App.js          # Main routing setup
└── server/                 # Express Backend
    ├── models/             # Mongoose schemas (User, Flashcard, History)
    ├── routes/             # API endpoints (auth, flashcards, history)
    └── server.js           # Server entry point & configuration
\`\`\`

## Usage Workflow

1. **Sign Up / Log In**: Create an account to start managing your flashcards.
2. **Upload**: Navigate to the upload page and drop a PDF file.
3. **Review**: Check the generated flashcards in the Review page. Use the filter to sort by marks.
4. **Learn**: Go to the QnSpeak page to review flashcards one-by-one with text-to-speech assistance.
5. **Test**: Take a quiz on the Quiz page to evaluate your understanding.

## License
MIT