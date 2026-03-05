import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InputPage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const InputPage = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const navigate = useNavigate();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setMessage("Error: Please select a PDF file.");

    setLoading(true);
    setProgress(0);
    setProgressText("Uploading PDF to Cloudinary...");
    setMessage("");

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      // 1. Initial POST to start Upload & Queue Job
      const res = await fetch(`${API_URL}/api/flashcards/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data.jobId) {
        throw new Error(data.message || "Upload Failed");
      }

      // 2. Listen to SSE for Job Status
      const eventSource = new EventSource(`${API_URL}/api/flashcards/status/${data.jobId}`, {
        withCredentials: true,
      });
      
      eventSource.onmessage = (event) => {
        const streamData = JSON.parse(event.data);

        // Map status to user-friendly messages
        if (streamData.status === "queued") setProgressText("Job queued. Waiting in line...");
        if (streamData.status === "downloading") setProgressText("Analyzing Document...");
        if (streamData.status === "chunking") setProgressText("Performing Semantic Chunking...");
        if (streamData.status === "generating") setProgressText("AI Generating Flashcards... (This may take 30s-1m)");
        if (streamData.status === "saving") setProgressText("Saving your flashcards...");

        setProgress(streamData.progress || 0);

        if (streamData.status === "completed") {
          eventSource.close();
          setProgressText("Processing Complete");
          setMessage("Flashcards successfully generated in the background.");
          setProgress(100);
          setTimeout(() => navigate("/review"), 1500);
        }

        if (streamData.status === "failed") {
          eventSource.close();
          setLoading(false);
          setMessage(`Error: Generation Failed: ${streamData.error}`);
        }
      };

      eventSource.onerror = (e) => {
        console.error("SSE Error:", e);
        eventSource.close();
        setLoading(false);
        setMessage("Error: Background connection lost. Please check your review page shortly.");
      };

    } catch (err) {
      console.error(err);
      setMessage("Error: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="input-page">
      
      <div className="input-container glass-panel">
        <h2>Upload Study Material</h2>
        <p className="input-subtitle">Select a PDF and let AI do the heavy lifting.</p>
        
        <form onSubmit={handleUpload} className="input-form">
          <div className="file-drop-area">
            <span className="file-msg">
              {file ? file.name : "Choose a PDF file or drag it here"}
            </span>
            <input
              className="file-input"
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
          </div>
          
          {loading && (
            <div className="upload-progress-container">
              <p className="upload-progress-text">{progressText} ({progress}%)</p>
              <div className="upload-progress-bar-bg">
                <div 
                  className="upload-progress-bar-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading || !file}>
            {loading ? "Processing..." : "Generate Flashcards"}
          </button>
        </form>
        
        {message && (
          <div className={`upload-message ${message.startsWith('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputPage;
