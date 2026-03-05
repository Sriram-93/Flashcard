import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import "./QnSpeakPage.css";

const QnSpeakPage = () => {
  const location = useLocation();
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [difficultyProgress, setDifficultyProgress] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [totalByDifficulty, setTotalByDifficulty] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [shownByDifficulty, setShownByDifficulty] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });

  const markToDifficulty = (marks) => {
    if (marks === 1 || marks === 2) return "easy";
    if (marks === 5) return "medium";
    if (marks === 10) return "hard";
    return "easy"; 
  };

  const loadFlashcards = () => {
    const passedCards = location.state?.selectedCards;
    
    if (!passedCards || passedCards.length === 0) {
      return; 
    }

    const cards = passedCards;
    setFlashcards(cards);

    const totals = { easy: 0, medium: 0, hard: 0 };
    cards.forEach((c) => {
      const level = markToDifficulty(Number(c.marks));
      totals[level] = (totals[level] || 0) + 1;
    });
    setTotalByDifficulty(totals);

    setShownByDifficulty({ easy: 0, medium: 0, hard: 0 });
    setDifficultyProgress({ easy: 0, medium: 0, hard: 0 });
    setCurrentIndex(0);

    if (cards.length > 0) incrementProgress(markToDifficulty(Number(cards[0].marks)));
  };

  useEffect(() => {
    loadFlashcards();
    
    // Only listen to storage events if we don't have passed state
    if (!location.state?.selectedCards) {
      window.addEventListener("storage", loadFlashcards);
      return () => window.removeEventListener("storage", loadFlashcards);
    }
  }, [location.state]);

  const currentCard = flashcards[currentIndex];

  const incrementProgress = (level) => {
    if (!level || !totalByDifficulty[level]) return;

    setShownByDifficulty((prev) => {
      const updatedShown = { ...prev };
      updatedShown[level] = Math.min(
        (updatedShown[level] || 0) + 1,
        totalByDifficulty[level]
      );

      setDifficultyProgress((prevProgress) => {
        const updatedProgress = { ...prevProgress };
        updatedProgress[level] = Math.round(
          (updatedShown[level] / totalByDifficulty[level]) * 100
        );
        return updatedProgress;
      });

      return updatedShown;
    });
  };

  const speakAnswer = () => {
    if (!currentCard) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentCard.answer);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
      setShowAnswer(true);
    }
  };

  const stopSpeech = () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  };

  const nextQuestion = () => {
    stopSpeech();
    setShowAnswer(false);
    if (currentIndex < flashcards.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      incrementProgress(markToDifficulty(Number(flashcards[nextIdx].marks)));
    } else {
      alert("You have completed all flashcards.");
      setCurrentIndex(0);
    }
  };

  if (!location.state?.selectedCards || location.state.selectedCards.length === 0) {
    return (
      <div className="qn-page">
        <div className="qn-container glass-panel" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>No Context Selected</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
            Please select a document from your Library to begin QnSpeak.
          </p>
          <div style={{ marginTop: "2rem" }}>
            <Link to="/review" className="btn btn-primary">Return to Library</Link>
          </div>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="qn-empty glass-panel">
        <p>Loading document context...</p>
      </div>
    );
  }

  return (
    <div className="qn-page">
      
      <div className="qn-container glass-panel">
        <h2 className="qn-title">QnSpeak Flashcards</h2>

        <div className="qn-card">
          <div className="qn-question">
            <span className="qn-label">Question</span>
            <p>{currentCard.question}</p>
          </div>

          <div className={`qn-answer-area ${showAnswer ? 'revealed' : ''}`}>
            {showAnswer ? (
              <div className="qn-answer">
                <span className="qn-label success-label">Answer</span>
                <p>{currentCard.answer}</p>
              </div>
            ) : (
              <div className="qn-placeholder">
                <p>Listen to the answer to reveal text</p>
              </div>
            )}
          </div>

          <div className="qn-actions">
            <button className="btn btn-primary" onClick={speakAnswer}>Listen</button>
            <button className="btn btn-secondary" onClick={stopSpeech}>Stop</button>
            <button className="btn btn-secondary next-btn" onClick={nextQuestion}>Next</button>
          </div>
        </div>

        <div className="qn-progress-container glass-panel">
          <h4 className="qn-progress-title">Completion Progress</h4>
          {["easy", "medium", "hard"].map((level) => (
            <div key={level} className="qn-progress-row">
              <span className="qn-level-name">{level}</span>
              <div className="qn-progress-bar-bg">
                <div
                  className={`qn-progress-bar-fill ${level}`}
                  style={{ width: `${difficultyProgress[level]}%` }}
                ></div>
              </div>
              <span className="qn-progress-text">{difficultyProgress[level]}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QnSpeakPage;
