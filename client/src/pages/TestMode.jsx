// client/src/pages/TestMode.jsx
import React, { useState, useEffect } from "react";

const TestMode = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [difficulty, setDifficulty] = useState("Easy"); // default Easy
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState({ Easy: 0, Medium: 0, Hard: 0 });

  useEffect(() => {
    // ✅ get flashcards from localStorage
    const stored = JSON.parse(localStorage.getItem("flashcards")) || [];
    setFlashcards(stored);
  }, []);

  // ✅ filter flashcards by selected difficulty
  const filteredCards = flashcards.filter(
    (f) => f.difficulty === difficulty
  );

  const currentCard = filteredCards[currentIndex];

  const handleNext = () => {
    if (!currentCard) return;

    // ✅ update progress only for current difficulty
    setProgress((prev) => {
      // avoid going beyond 100%
      if (prev[difficulty] >= 100) return prev;

      const total = filteredCards.length;
      const perCard = 100 / total;
      let newValue = prev[difficulty] + perCard;
      if (newValue > 100) newValue = 100; // cap at 100
      return { ...prev, [difficulty]: newValue };
    });

    // move to next question if available
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(filteredCards.length - 1); // stay on last
    }
  };

  const handleChangeDifficulty = (level) => {
    setDifficulty(level);
    setCurrentIndex(0); // reset index for new category
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Test Mode: Hear the Answer</h2>

      {/* ✅ Difficulty Buttons */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => handleChangeDifficulty("Easy")}>Easy</button>
        <button onClick={() => handleChangeDifficulty("Medium")}>Medium</button>
        <button onClick={() => handleChangeDifficulty("Hard")}>Hard</button>
      </div>

      {currentCard ? (
        <div style={{ marginBottom: "20px" }}>
          <p><b>Q:</b> {currentCard.question}</p>
          <button
            onClick={() =>
              window.speechSynthesis.speak(
                new SpeechSynthesisUtterance(currentCard.answer)
              )
            }
          >
            🔊 Hear the Answer
          </button>
          <br /><br />
          <button onClick={handleNext}>Next</button>
        </div>
      ) : (
        <p>No questions available for {difficulty}.</p>
      )}

      {/* ✅ Progress */}
      <h3>Progress</h3>
      <p>Easy: {progress.Easy.toFixed(0)}%</p>
      <p>Medium: {progress.Medium.toFixed(0)}%</p>
      <p>Hard: {progress.Hard.toFixed(0)}%</p>
    </div>
  );
};

export default TestMode;
