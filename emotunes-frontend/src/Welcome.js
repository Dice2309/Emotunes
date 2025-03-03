import React from 'react';
import './App.css';

function Welcome({ user }) {
  return (
    <div className="container welcome">
      <h2>Welcome, {user.name}!</h2>
      <p>You’re logged in to Emotunes.</p>
    </div>
  );
}

export default Welcome;