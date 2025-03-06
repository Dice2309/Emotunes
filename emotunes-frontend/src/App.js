import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Welcome from './Welcome';
import EmotionInput from './EmotionInput';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  // Log to console and localStorage
  const logMessage = (message) => {
    console.log(message);
    const currentLogs = localStorage.getItem('emotunesLogs') || '';
    localStorage.setItem('emotunesLogs', currentLogs + `${new Date().toISOString()} - ${message}\n`);
  };

  logMessage('App rendered, user: ' + JSON.stringify(user));

  return (
    <Router>
      <div>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap" rel="stylesheet" />
        <h1 className="header">Emotunes</h1>
        <Routes>
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/welcome" element={user ? <Welcome user={user} /> : <Navigate to="/login" />} />
          <Route path="/emotion" element={user ? <EmotionInput user={user} /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;