import React from "react";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  ArrowRight, 
  Terminal, 
  Zap, 
  CheckCircle2,
  BookOpen,
  Cpu
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardPage from "./DashboardPage";
import "./HomePage.css";

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <DashboardPage />;
  }

  return (
    <div className="home-container">
      {/* Structural ambient mesh (defined in CSS body) */}

      <div className="hero-layout">
        {/* Left side — text content */}
        <div className="hero-text">
          <div className="hero-badge">
            <Sparkles size={14} className="badge-icon" />
            AI-Powered Learning
          </div>
          <h1 className="hero-title">
            <span className="title-line">Study</span>
            <span className="title-gradient">Smarter</span>
          </h1>
          <p className="hero-subtitle">
            Upload any PDF and instantly generate intelligent flashcards, quizzes, and study sessions — powered by advanced AI.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary hero-btn">
              <span>Get Started Free</span>
              <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn btn-secondary hero-btn">
              Log In
            </Link>
          </div>
        </div>

        {/* Right side — structural visual */}
        <div className="hero-visual">
          <div className="bento-grid">
            <div className="bento-card card-main glass-panel">
              <div className="bento-header">
                <div className="bento-dots">
                  <span className="bento-dot red"></span>
                  <span className="bento-dot yellow"></span>
                  <span className="bento-dot green"></span>
                </div>
                <div className="bento-title">
                  <Terminal size={14} />
                  <span>StudyPipeline.v1</span>
                </div>
              </div>
              <div className="bento-body">
                <div className="code-line">
                  <Cpu size={14} className="icon-pulse" />
                  <span>Generating 20 flashcards...</span>
                </div>
                <div className="code-line indent">├─ 6x Basic Context</div>
                <div className="code-line indent">├─ 8x Detailed Analysis</div>
                <div className="code-line success">
                  <CheckCircle2 size={14} />
                  <span>Pipeline complete (0.8s)</span>
                </div>
              </div>
            </div>
            
            <div className="float-card float-card-1 glass-panel">
              <div className="float-icon blue">
                <BookOpen size={20} />
              </div>
              <div className="float-content">
                <span className="float-card-number">20+</span>
                <span className="float-card-label">Cards per PDF</span>
              </div>
            </div>
            <div className="float-card float-card-2 glass-panel">
              <div className="float-icon purple">
                <Zap size={20} />
              </div>
              <div className="float-content">
                <span className="float-card-number">100%</span>
                <span className="float-card-label">Automated</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
