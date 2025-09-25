import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import InputPage from './pages/InputPage';
import ReviewPage from './pages/ReviewPage';
import QnSpeakPage from "./pages/QnSpeakPage";
import QuizPage from "./pages/QuizPage";



function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/input" element={<InputPage />} />
         <Route path="/review" element={<ReviewPage />} />
          <Route path="/qnspeak" element={<QnSpeakPage />} />
          <Route path="/quiz" element={<QuizPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
