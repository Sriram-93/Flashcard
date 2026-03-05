import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  MoreVertical, 
  Trash2, 
  Filter, 
  CheckSquare, 
  Square, 
  Play, 
  Mic, 
  HelpCircle,
  Calendar,
  Layers,
  ChevronLeft,
  Search
} from 'lucide-react';
import './ReviewPage.css';

const ReviewPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [filteredCards, setFilteredCards] = useState([]);
  const [selectedMark, setSelectedMark] = useState('all');
  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [selectedCards, setSelectedCards] = useState(new Set());
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const res = await fetch(`${API_URL}/api/flashcards`, {
          credentials: "include",
        });
        if (res.ok) {
          const cards = await res.json();
          
          // Group flat flashcards back into 'deck' structures by filename/date
          const deckMap = {};
          cards.forEach(card => {
            const key = card.filename || "Unknown Deck";
            if (!deckMap[key]) deckMap[key] = { filename: key, uploadDate: card.uploadDate, cards: [] };
            deckMap[key].cards.push(card);
          });
          const groupedHistory = Object.values(deckMap);
          setHistory(groupedHistory);

          if (groupedHistory.length > 0) {
            const latest = groupedHistory[0]; // Already sorted descending by backend
            setSelectedUpload(latest);
            setFilteredCards(latest.cards || []);
            setSelectedCards(new Set(latest.cards?.map((_, i) => i) || []));
          }
        }
      } catch (e) {
        console.error("Failed to fetch library", e);
      }
    };
    fetchFlashcards();
  }, [API_URL]);

  const flipCard = (cardIndex) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(cardIndex)) {
      newFlipped.delete(cardIndex);
    } else {
      newFlipped.add(cardIndex);
    }
    setFlippedCards(newFlipped);
  };

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
    
    setFlippedCards(new Set());
  };

  const handleSelectUpload = (upload) => {
    setSelectedUpload(upload);
    setSelectedMark('all');
    setFilteredCards(upload.cards || []);
    setFlippedCards(new Set());
    setSelectedCards(new Set((upload.cards || []).map((_, i) => i)));
  };

  const countByMarks = (marks) =>
    selectedUpload?.cards.filter((c) => Number(c.marks || 1) === Number(marks)).length || 0;

  const handleDeleteUpload = async (idx) => {
    // In a real database we would send a DELETE to the backend here.
    // For now we just remove from UI state.
    const uploadToDelete = history[idx];
    const newHistory = [...history];
    newHistory.splice(idx, 1);
    setHistory(newHistory);

    if (selectedUpload === uploadToDelete) {
      if (newHistory.length > 0) {
        const latest = newHistory[0];
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

  const redirectToInputPage = () => {
    navigate('/input');
  };

  const getMarkStyling = (marks) => {
    const markNum = Number(marks || 1);
    switch (markNum) {
      case 1:
        return { borderColor: '#3B82F6' }; // Blue
      case 2:
        return { borderColor: '#10B981' }; // Emerald
      case 5:
        return { borderColor: '#F59E0B' }; // Amber
      case 10:
        return { borderColor: '#EF4444' }; // Red
      default:
        return { borderColor: '#4F46E5' }; // Indigo
    }
  };

  const toggleSelectCard = (e, index) => {
    e.stopPropagation();
    const newSelected = new Set(selectedCards);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedCards(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedCards.size === filteredCards.length) {
      setSelectedCards(new Set()); // deselect all
    } else {
      setSelectedCards(new Set(filteredCards.map((_, i) => i))); // select all currently filtered
    }
  };

  const handleSendToActivity = (path) => {
    if (selectedCards.size === 0) {
      alert("Please select at least one flashcard first.");
      return;
    }
    const cardsToPass = filteredCards.filter((_, i) => selectedCards.has(i));
    navigate(path, { state: { selectedCards: cardsToPass } });
  };

  return (
    <div className="review-page">
      
      <div className="history-sidebar glass-panel">
        <div className="sidebar-header">
          <Layers size={18} />
          <h3 className="sidebar-title">Library</h3>
        </div>
        <button className="add-card-btn btn btn-primary flex-center" onClick={redirectToInputPage}>
          <Plus size={18} />
          <span>New Deck</span>
        </button>

        <div className="sidebar-list">
          {history.length === 0 && <p className="empty-text">No flashcards yet.</p>}
          {history.map((upload, idx) => (
            <div key={idx} className="upload-item-container">
              <button
                className={`upload-item ${selectedUpload === upload ? 'active' : ''}`}
                onClick={() => handleSelectUpload(upload)}
              >
                <span className="upload-name">{upload.filename || `Deck ${idx + 1}`}</span>
                <div className="upload-meta">
                  <Calendar size={12} />
                  <span className="upload-date">{new Date(upload.uploadDate || Date.now()).toLocaleDateString()}</span>
                </div>
              </button>

              <button
                className="menu-icon-btn"
                onClick={() => setMenuOpenIndex(menuOpenIndex === idx ? null : idx)}
              >
                <MoreVertical size={16} />
              </button>

              {menuOpenIndex === idx && (
                <button
                  className="delete-deck-btn"
                  onClick={() => handleDeleteUpload(idx)}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="review-main">
        <div className="content-header">
          <button className="back-btn" onClick={() => navigate('/home')}>
             <ChevronLeft size={20} />
          </button>
          <h2>{selectedUpload?.filename || "Review Flashcards"}</h2>
        </div>

        {selectedUpload && (
          <div className="filter-scroll-wrapper">
            <div className="filter-icon-label">
              <Filter size={16} />
              <span>Filter by Marks:</span>
            </div>
            <div className="filter-chips">
              <button 
                className={`chip ${selectedMark === 'all' ? 'active' : ''}`}
                onClick={() => handleFilter('all')}
              >
                All ({selectedUpload?.cards.length || 0})
              </button>
              {[1, 2, 5, 10].map(m => (
                <button 
                  key={m}
                  className={`chip ${selectedMark === m ? 'active' : ''}`}
                  onClick={() => handleFilter(m)}
                >
                  {m} Marks ({countByMarks(m)})
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredCards.length > 0 && (
          <div className="review-actions-bar">
            <button className="select-all-btn" onClick={toggleSelectAll}>
              {selectedCards.size === filteredCards.length ? <CheckSquare size={18} /> : <Square size={18} />}
              <span>{selectedCards.size === filteredCards.length ? "Deselect All" : "Select All"}</span>
            </button>
            <span className="selected-counter">
              {selectedCards.size} Selected
            </span>
            <div className="action-btns">
              <button className="btn btn-primary action-btn" onClick={() => handleSendToActivity('/quiz')}>
                <Play size={16} />
                <span>Take Quiz</span>
              </button>
              <button className="btn btn-primary action-btn" onClick={() => handleSendToActivity('/qnspeak')}>
                <Mic size={16} />
                <span>QnSpeak</span>
              </button>
            </div>
          </div>
        )}

        <div className="flashcards-layout">
          {filteredCards.length === 0 && (
            <div className="no-cards glass-panel">
              <Search size={40} className="no-cards-icon" />
              <p>No flashcards to display for this selection.</p>
            </div>
          )}
          
          {filteredCards.map((card, idx) => {
            const isFlipped = flippedCards.has(idx);
            const styling = getMarkStyling(card.marks);
            
            return (
              <div key={idx} className="fc-wrapper">
                <div 
                  className={`fc-inner ${isFlipped ? 'flipped' : ''}`}
                  onClick={() => flipCard(idx)}
                >
                  <div 
                    className="fc-face fc-front glass-panel"
                    style={{ borderTop: `4px solid ${styling.borderColor}` }}
                  >
                    <div className="fc-header">
                      <div className="fc-marks-badge" style={{ backgroundColor: styling.borderColor }}>
                        {card.marks || 1} Marks
                      </div>
                      <div 
                        className={`fc-checkbox-wrapper ${selectedCards.has(idx) ? 'selected' : ''}`}
                        onClick={(e) => toggleSelectCard(e, idx)}
                      >
                        {selectedCards.has(idx) ? <CheckSquare size={20} /> : <Square size={20} />}
                      </div>
                    </div>
                    
                    <div className="fc-content">
                      <div className="fc-label-wrapper">
                        <HelpCircle size={16} className="fc-icon" />
                        <span className="fc-label">Question</span>
                      </div>
                      <p className="fc-text">{card.question}</p>
                    </div>
                    <div className="fc-footer">Tap to reveal answer</div>
                  </div>

                  <div 
                    className="fc-face fc-back glass-panel"
                    style={{ borderTop: `4px solid ${styling.borderColor}` }}
                  >
                    <div className="fc-content">
                    <div className="fc-label-wrapper">
                        <CheckSquare size={16} className="fc-icon answer-icon" />
                        <span className="fc-label answer-label">Answer</span>
                      </div>
                      <p className="fc-text">{card.answer}</p>
                    </div>
                    <div className="fc-footer">Tap to hide</div>
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