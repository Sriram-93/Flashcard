import React, { useEffect, useState } from "react";

const QnSpeakPage = () => {
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
    return "easy"; // default fallback
  };

  const loadFlashcards = () => {
    const cards = JSON.parse(localStorage.getItem("flashcards")) || [];
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
    window.addEventListener("storage", loadFlashcards);
    return () => window.removeEventListener("storage", loadFlashcards);
  }, []);

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
      alert("🎉 You have completed all flashcards!");
      setCurrentIndex(0);
    }
  };

  if (flashcards.length === 0) {
    return <p style={styles.noFlashcards}>No flashcards available.</p>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📚 QnSpeak Flashcards</h2>

      <div style={styles.cardBox}>
        <div style={styles.question}><strong>Q:</strong> {currentCard.question}</div>

        {showAnswer && (
          <div style={styles.answer}><strong>A:</strong> {currentCard.answer}</div>
        )}

        <div style={styles.buttons}>
          <button style={styles.speakBtn} onClick={speakAnswer}>🎤 Voice Answer</button>
          <button style={styles.stopBtn} onClick={stopSpeech}>⏹ Stop</button>
          <button style={styles.nextBtn} onClick={nextQuestion}>➡ Next</button>
        </div>

        <div style={styles.progressContainer}>
          <h4>Progress by Difficulty:</h4>
          {["easy", "medium", "hard"].map((level) => (
            <div key={level} style={styles.progressRow}>
              <strong>{level.charAt(0).toUpperCase() + level.slice(1)}</strong>
              <div style={styles.progressBarBg}>
                <div
                  style={{
                    ...styles.progressBarFill,
                    width: `${difficultyProgress[level]}%`,
                    backgroundColor: level === "easy" ? "#4caf50" : level === "medium" ? "#ff9800" : "#f44336",
                  }}
                ></div>
              </div>
              <span style={styles.progressText}>{difficultyProgress[level]}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    flexDirection: "column",
    backgroundColor: "#e8f5e8",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "2rem",
  },
  title: { 
    marginBottom: "20px", 
    color: "#00695c",
    fontSize: "24px",
    fontWeight: "600",
  },
  cardBox: {
    border: "1px solid #b0bec5",
    borderRadius: "12px",
    padding: "2rem",
    width: "450px",
    backgroundColor: "#ffffff",
    boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
    textAlign: "center",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  cardBoxHover: {
    transform: "translateY(-3px)",
    boxShadow: "0 12px 20px rgba(0,0,0,0.16)",
  },
  question: { 
    marginBottom: "1rem", 
    fontSize: "17px",
    fontWeight: "500",
    color: "#2e2e2e",
  },
  answer: { 
    marginBottom: "1rem", 
    color: "#1976d2", 
    fontSize: "16px",
    fontStyle: "italic",
    fontWeight: "500",
  },
  buttons: { 
    display: "flex", 
    justifyContent: "center", 
    gap: "12px", 
    marginBottom: "1rem", 
    flexWrap: "wrap" 
  },
  speakBtn: { 
    padding: "10px 18px", 
    borderRadius: "8px", 
    backgroundColor: "#43a047", 
    color: "white", 
    border: "none", 
    cursor: "pointer",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
  },
  stopBtn: { 
    padding: "10px 18px", 
    borderRadius: "8px", 
    backgroundColor: "#e53935", 
    color: "white", 
    border: "none", 
    cursor: "pointer",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
  },
  nextBtn: { 
    padding: "10px 18px", 
    borderRadius: "8px", 
    backgroundColor: "#1e88e5", 
    color: "white", 
    border: "none", 
    cursor: "pointer",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
  },
  progressContainer: { 
    marginTop: "1.5rem", 
    textAlign: "left",
    padding: "1rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
  },
  progressRow: { 
    marginBottom: "0.7rem", 
    display: "flex", 
    alignItems: "center" 
  },
  progressBarBg: { 
    display: "inline-block", 
    width: "250px", 
    height: "12px", 
    backgroundColor: "#e0e0e0", 
    borderRadius: "6px", 
    marginLeft: "10px", 
    overflow: "hidden" 
  },
  progressBarFill: { 
    height: "100%", 
    transition: "width 0.4s ease-in-out",
    borderRadius: "6px",
  },
  progressText: { 
    marginLeft: "0.5rem",
    fontSize: "14px",
    fontWeight: "500",
    color: "#555",
  },
  noFlashcards: { 
    textAlign: "center", 
    marginTop: "2rem", 
    fontSize: "18px",
    color: "#666",
    fontWeight: "500",
  },
};
export default QnSpeakPage;
