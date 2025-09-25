import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InputPage.css";

const InputPage = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setMessage("❌ Please select a PDF file.");

    const formData = new FormData();
    formData.append("pdf", file);

    const userId = localStorage.getItem("userId") || "";
    formData.append("userId", userId);

    try {
      const res = await fetch("http://localhost:5000/api/flashcards/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!data?.flashcards || !Array.isArray(data.flashcards)) {
        setMessage("❌ Failed to generate flashcards");
        return;
      }

      // Prepare upload entry for history
      const uploadEntry = {
        filename: data.filename || file.name,
        uploadDate: data.uploadDate || new Date(),
        cards: data.flashcards,
      };

      // Load existing history from localStorage
      const history = JSON.parse(localStorage.getItem("flashcardHistory")) || [];

      // Add new upload to history
      history.push(uploadEntry);

      // Save back to localStorage
      localStorage.setItem("flashcardHistory", JSON.stringify(history));

      // Also save the latest upload for quick access
      localStorage.setItem("flashcards", JSON.stringify(data.flashcards));

      setMessage(`✅ Flashcards generated: ${data.flashcards.length}`);
      setTimeout(() => navigate("/review"), 1000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed");
    }
  };

  return (
    <div
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1950&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="input-container">
        <h2>Upload PDF to Generate Flashcards</h2>
        <form onSubmit={handleUpload} className="input-form">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
          <button type="submit">Upload</button>
        </form>
        {message && <p className="upload-message">{message}</p>}
      </div>
    </div>
  );
};

export default InputPage;
