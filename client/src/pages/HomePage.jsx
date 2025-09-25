import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="home-container">
      {/* Left side image */}
      <div
        className="home-image"
        style={{
          backgroundImage:
            "url('https://wallpaperaccess.com/full/1209397.jpg')",
        }}
      ></div>

      {/* Right side colored background */}
      <div className="home-content">
        <h1>Welcome to Flashcard Generator 📚</h1>
        <p>Create and review flashcards from your study PDFs!</p>
        <Link to="/signup">
          <button className="home-btn">Get Started</button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
