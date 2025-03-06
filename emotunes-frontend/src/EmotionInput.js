import React, { useState } from 'react';
import './App.css';

function EmotionInput({ user }) {
  const [text, setText] = useState('');
  const [emotion, setEmotion] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:3001/detect-emotion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, email: user.email }), // Pass user's email if available
    });
    const data = await response.json();
    if (response.ok) {
      setEmotion(data.emotion);
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="container">
      <h2>Detect Your Emotion</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="How are you feeling?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: '100%', height: '100px', padding: '10px', margin: '10px 0', borderRadius: '8px', border: '1px solid #ccc' }}
        />
        <button type="submit">Detect Emotion</button>
      </form>
      {emotion && <p className="welcome">Detected Emotion: {emotion}</p>}
    </div>
  );
}

export default EmotionInput;