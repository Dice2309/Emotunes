import React from 'react';
import { Link } from 'react-router-dom'; // Add this
import './App.css';

function Welcome({ user }) {
  return (
    <div className="container welcome">
      <h2>Welcome, {user.name}!</h2>
      <p>You’re logged in to Emotunes.</p>
      <p><Link className="link" to="/emotion">Detect Your Emotion</Link></p> {/* Change to Link */}
    </div>
  );
}

export default Welcome;