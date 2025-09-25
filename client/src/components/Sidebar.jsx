import React, { useEffect, useState } from "react";
import axios from "axios";

function Sidebar({ userId, onSelect }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (userId) {
      axios.get(`/api/history/${userId}`).then(res => setHistory(res.data));
    }
  }, [userId]);

  return (
    <div style={{ width: "250px", background: "#f5f5f5", padding: "10px", height: "100vh" }}>
      <h3>Recent</h3>
      <ul>
        <li onClick={() => onSelect("today")}>Today</li>
        <li onClick={() => onSelect("yesterday")}>Yesterday</li>
      </ul>

      <h3>Search History</h3>
      <ul>
        {history.map((item, index) => (
          <li
            key={index}
            style={{ cursor: "pointer", marginBottom: "5px" }}
            onClick={() => onSelect(item)}
          >
            {item.query}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
