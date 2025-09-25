import React, { useState } from 'react';
import './ForgotPassword.css';  // ✅ import CSS

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleForgot = (e) => {
    e.preventDefault();
    alert(`Password reset link sent to ${email}`);
    // Later backend integration
  };

  return (
    <div className="forgot-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleForgot} className="forgot-form">
        <input
          type="email"
          placeholder="Enter your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
