import React, { useEffect, useState } from "react";
import "./QuizPage.css";

const QuizPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState([]); // ✅ store user answers

  useEffect(() => {
    const storedFlashcards = JSON.parse(localStorage.getItem("flashcards")) || [];

    // Prepare quiz questions with 1 correct + 3 fake options
    const formattedQuestions = storedFlashcards.map((flashcard) => {
      const fakeOptions = [
        "Backpropagation is an algorithm used to train a neural network by minimizing errors.",
        "CNNs understand image data by extracting features from small regions.",
        "A monitor is a higher-level synchronization construct with more functionality than semaphores."
      ];

      // shuffle options
      const options = [...fakeOptions, flashcard.answer].sort(() => Math.random() - 0.5);

      return {
        question: flashcard.question,
        correctAnswer: flashcard.answer,
        options,
      };
    });

    // ✅ Limit questions → 15 max
    let limitedQuestions = formattedQuestions;
    if (formattedQuestions.length > 15) {
      limitedQuestions = formattedQuestions
        .sort(() => Math.random() - 0.5) // shuffle questions
        .slice(0, 15); // pick first 15
    }

    setQuestions(limitedQuestions);
  }, []);

  const saveAnswer = () => {
    const currentQ = questions[currentQuestion];
    const isCorrect = selectedOption === currentQ.correctAnswer;

    // Save user’s response
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

  if (questions.length === 0) return <h2>Loading questions...</h2>;

  return (
    <div className="quiz-container">
      {finished ? (
        <div className="score-section">
          <h2>🎉 Quiz Finished!</h2>
          <p>
            Your Score: {score} / {questions.length}
          </p>

          <h3>📌 Review Your Answers</h3>
          <ul className="review-list">
            {answers.map((ans, index) => (
              <li key={index} className={ans.isCorrect ? "correct" : "wrong"}>
                <strong>Q{index + 1}: {ans.question}</strong>
                <br />
                ✅ Correct Answer: {ans.correctAnswer}
                <br />
                📝 Your Answer:{" "}
                <span style={{ color: ans.isCorrect ? "green" : "red" }}>
                  {ans.userAnswer}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="quiz-card">
          <h3>
            Q{currentQuestion + 1}. {questions[currentQuestion].question}
          </h3>

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
            <button onClick={handlePrev} disabled={currentQuestion === 0}>
              ⬅ Previous
            </button>
            {currentQuestion + 1 === questions.length ? (
              <button onClick={handleFinish} disabled={!selectedOption}>
                Finish ✅
              </button>
            ) : (
              <button onClick={handleNext} disabled={!selectedOption}>
                Next ➡
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
