import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReviewPage.css';

const ReviewPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [filteredCards, setFilteredCards] = useState([]);
  const [selectedMark, setSelectedMark] = useState('all');
  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const [flippedCards, setFlippedCards] = useState(new Set());

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('flashcardHistory')) || [];
    setHistory(savedHistory);

    if (savedHistory.length > 0) {
      const latest = savedHistory[savedHistory.length - 1];
      setSelectedUpload(latest);
      setFilteredCards(latest.cards || []);
    }
  }, []);

  // Handle card flip animation
  const flipCard = (cardIndex) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(cardIndex)) {
      newFlipped.delete(cardIndex);
    } else {
      newFlipped.add(cardIndex);
    }
    setFlippedCards(newFlipped);
  };

  // Enhanced filter function with mark-wise classification
  const handleFilter = (marks) => {
    setSelectedMark(marks);
    if (!selectedUpload) return;
    
    if (marks === 'all') {
      setFilteredCards(selectedUpload.cards || []);
    } else {
      const filtered = selectedUpload.cards.filter(
        (c) => Number(c.marks || 1) === Number(marks)
      );
      setFilteredCards(filtered);
    }
    
    // Clear flipped cards when filtering
    setFlippedCards(new Set());
  };

  const handleSelectUpload = (upload) => {
    setSelectedUpload(upload);
    setSelectedMark('all');
    setFilteredCards(upload.cards || []);
    setFlippedCards(new Set());
  };

  const countByMarks = (marks) =>
    selectedUpload?.cards.filter((c) => Number(c.marks || 1) === Number(marks)).length || 0;

  // Delete upload from history
  const handleDeleteUpload = (idx) => {
    const uploadToDelete = history[idx];
    const newHistory = [...history];
    newHistory.splice(idx, 1);
    setHistory(newHistory);
    localStorage.setItem('flashcardHistory', JSON.stringify(newHistory));

    if (selectedUpload === uploadToDelete) {
      if (newHistory.length > 0) {
        const latest = newHistory[newHistory.length - 1];
        setSelectedUpload(latest);
        setFilteredCards(latest.cards || []);
        setSelectedMark('all');
      } else {
        setSelectedUpload(null);
        setFilteredCards([]);
        setSelectedMark('all');
      }
    }
    setMenuOpenIndex(null);
  };

  // Redirect to input page for adding new flashcard
  const redirectToInputPage = () => {
    navigate('/input');
  };

  // Get mark-specific styling
  const getMarkStyling = (marks) => {
    const markNum = Number(marks || 1);
    switch (markNum) {
      case 1:
        return {
          borderColor: '#17a2b8',
          bgGradient: 'linear-gradient(135deg, #e6f7ff, #d6f3ff)',
          badgeColor: '#17a2b8'
        };
      case 2:
        return {
          borderColor: '#28a745',
          bgGradient: 'linear-gradient(135deg, #e8f5e9, #d4edda)',
          badgeColor: '#28a745'
        };
      case 5:
        return {
          borderColor: '#ffc107',
          bgGradient: 'linear-gradient(135deg, #fff8e1, #fff3cd)',
          badgeColor: '#ffc107'
        };
      case 10:
        return {
          borderColor: '#dc3545',
          bgGradient: 'linear-gradient(135deg, #ffeaea, #f8d7da)',
          badgeColor: '#dc3545'
        };
      default:
        return {
          borderColor: '#28a745',
          bgGradient: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
          badgeColor: '#28a745'
        };
    }
  };

  return (
    <div className="review-page-container">
      {/* Left Sidebar */}
      <div className="history-sidebar">
        <h3>📜 Upload History</h3>
        {history.length === 0 && <p>No uploads yet.</p>}
        {history.map((upload, idx) => (
          <div key={idx} className="upload-item-container">
            <button
              className={`upload-item ${selectedUpload === upload ? 'selected' : ''}`}
              onClick={() => handleSelectUpload(upload)}
            >
              {upload.filename || `Upload ${idx + 1}`} <br />
              <small>{upload.date}</small>
            </button>

            <button
              className="menu-button"
              onClick={() => setMenuOpenIndex(menuOpenIndex === idx ? null : idx)}
            >
              ⋮
            </button>

            {menuOpenIndex === idx && (
              <button
                className="delete-button"
                onClick={() => handleDeleteUpload(idx)}
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Right/Main Area */}
      <div className="review-main">
        <div className="content-header">
          <span>📚</span>
          <h2>Review Flashcards</h2>
        </div>

        {/* Add New Flashcard Button */}
        <button className="add-card-btn" onClick={redirectToInputPage}>
          + Add New Flashcard
        </button>

        {/* Mark Filter Buttons */}
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${selectedMark === 'all' ? 'active' : ''}`}
            onClick={() => handleFilter('all')}
          >
            All ({selectedUpload?.cards.length || 0})
          </button>
          <button 
            className={`filter-btn ${selectedMark === '1' ? 'active' : ''}`}
            onClick={() => handleFilter(1)}
          >
            1 Mark ({countByMarks(1)})
          </button>
          <button 
            className={`filter-btn ${selectedMark === '2' ? 'active' : ''}`}
            onClick={() => handleFilter(2)}
          >
            2 Marks ({countByMarks(2)})
          </button>
          <button 
            className={`filter-btn ${selectedMark === '5' ? 'active' : ''}`}
            onClick={() => handleFilter(5)}
          >
            5 Marks ({countByMarks(5)})
          </button>
          <button 
            className={`filter-btn ${selectedMark === '10' ? 'active' : ''}`}
            onClick={() => handleFilter(10)}
          >
            10 Marks ({countByMarks(10)})
          </button>
        </div>

        {/* Enhanced Flashcards List with 3D Flip Animation */}
        <div className="flashcards-container">
          {filteredCards.length === 0 && (
            <div className="no-cards">
              <p>No flashcards for this selection.</p>
            </div>
          )}
          
          {filteredCards.map((card, idx) => {
            const isFlipped = flippedCards.has(idx);
            const styling = getMarkStyling(card.marks);
            
            return (
              <div key={idx} className="flashcard-container">
                <div 
                  className={`flashcard ${isFlipped ? 'flipped' : ''}`}
                  onClick={() => flipCard(idx)}
                  data-marks={card.marks || 1}
                >
                  {/* Front Face */}
                  <div 
                    className="flashcard-face flashcard-front"
                    style={{
                      background: styling.bgGradient,
                      borderLeft: `5px solid ${styling.borderColor}`
                    }}
                  >
                    <div className="question">
                      <strong>Q:</strong> {card.question}
                    </div>
                    <div className="marks">
                      <span 
                        className="marks-badge"
                        style={{ backgroundColor: styling.badgeColor }}
                      >
                        {card.marks || 1}
                      </span>
                      <span>Marks: {card.marks || 1}</span>
                    </div>
                    <div className="flip-indicator">Click to flip ↻</div>
                  </div>

                  {/* Back Face */}
                  <div 
                    className="flashcard-face flashcard-back"
                    style={{
                      background: 'linear-gradient(135deg, #e8f5e9, #d4edda)',
                      borderLeft: '5px solid #007bff'
                    }}
                  >
                    <div className="answer">
                      <strong>A:</strong> {card.answer}
                    </div>
                    <div className="marks">
                      <span 
                        className="marks-badge"
                        style={{ backgroundColor: styling.badgeColor }}
                      >
                        {card.marks || 1}
                      </span>
                      <span>Marks: {card.marks || 1}</span>
                    </div>
                    <div className="flip-indicator">Click to flip ↻</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;