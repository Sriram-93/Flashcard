import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import "./QuizPage.css";

const QuizPage = () => {
  const location = useLocation();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const passedCards = location.state?.selectedCards;
    
    if (!passedCards || passedCards.length === 0) {
      return; 
    }

    const formattedQuestions = passedCards.map((flashcard) => {
      const fakeOptions = [
        "Backpropagation is an algorithm used to train a neural network by minimizing errors.",
        "CNNs understand image data by extracting features from small regions.",
        "A monitor is a higher-level synchronization construct with more functionality than semaphores."
      ];

      const options = [...fakeOptions, flashcard.answer].sort(() => Math.random() - 0.5);

      return {
        question: flashcard.question,
        correctAnswer: flashcard.answer,
        options,
      };
    });

    let limitedQuestions = formattedQuestions;
    if (formattedQuestions.length > 15) {
      limitedQuestions = formattedQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, 15);
    }

    setQuestions(limitedQuestions);
  }, []);

  const saveAnswer = () => {
    const currentQ = questions[currentQuestion];
    const isCorrect = selectedOption === currentQ.correctAnswer;

    setAnswers((prev) => [
      ...prev,
      {
        question: currentQ.question,
        correctAnswer: currentQ.correctAnswer,
        userAnswer: selectedOption,
        isCorrect,
      },
    ]);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    saveAnswer();
    setSelectedOption(null);

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleFinish = () => {
    saveAnswer();
    setFinished(true);
  };

  if (!location.state?.selectedCards || location.state.selectedCards.length === 0) {
    return (
      <div className="quiz-page">
        <div className="quiz-container glass-panel" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>No Context Selected</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
            Please select a document from your Library to begin a quiz.
          </p>
          <div style={{ marginTop: "2rem" }}>
            <Link to="/review" className="btn btn-primary">Return to Library</Link>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-page">
        <h2 className="loading-text">Generating Quiz...</h2>
      </div>
    );
  }

  return (
    <div className="quiz-page">

      <div className="quiz-container glass-panel">
        {finished ? (
          <div className="score-section">
            <div className="score-header">
              <h2>Quiz Complete</h2>
              <p className="score-text">
                Your Score: <span className="score-highlight">{score} / {questions.length}</span>
              </p>
            </div>

            <div className="review-section">
              <h3>Review Your Answers</h3>
              <ul className="review-list">
                {answers.map((ans, index) => (
                  <li key={index} className={ans.isCorrect ? "correct" : "wrong"}>
                    <div className="review-q">
                      <strong>Q{index + 1}:</strong> {ans.question}
                    </div>
                    <div className="review-ans">
                      <strong>Correct Answer:</strong> {ans.correctAnswer}
                    </div>
                    <div className={`review-user-ans ${ans.isCorrect ? "correct-text" : "wrong-text"}`}>
                      <strong>Your Answer:</strong> {ans.userAnswer}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="quiz-card">
            <div className="quiz-header">
              <h2 className="quiz-title">Knowledge Check</h2>
              <span className="quiz-progress-text">Question {currentQuestion + 1} of {questions.length}</span>
            </div>

            <div className="quiz-question">
              {questions[currentQuestion].question}
            </div>

            <div className="options">
              {questions[currentQuestion].options.map((option, index) => (
                <label
                  key={index}
                  className={`option ${selectedOption === option ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="option"
                    value={option}
                    checked={selectedOption === option}
                    onChange={() => setSelectedOption(option)}
                  />
                  {option}
                </label>
              ))}
            </div>

            <div className="buttons">
              <button 
                className="btn btn-secondary" 
                onClick={handlePrev} 
                disabled={currentQuestion === 0}
              >
                Previous
              </button>
              
              {currentQuestion + 1 === questions.length ? (
                <button 
                  className="btn btn-primary" 
                  onClick={handleFinish} 
                  disabled={!selectedOption}
                >
                  Finish
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={handleNext} 
                  disabled={!selectedOption}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
