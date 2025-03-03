const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/emotunes')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  emotions: [{ emotion: String, timestamp: Date }], // Add this for history
});
const User = mongoose.model('User', userSchema);

// Register Endpoint
app.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', name });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login Endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    res.json({ message: 'Login successful', name: user.name });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Emotion Detection Endpoint (Simple Keyword-Based)
app.post('/detect-emotion', async (req, res) => {
  const { text, email } = req.body; // Email to link to user
  try {
    const emotions = {
      happy: ['happy', 'great', 'awesome', 'joy'],
      sad: ['sad', 'bad', 'terrible', 'cry'],
      angry: ['angry', 'mad', 'furious'],
    };
    let detectedEmotion = 'neutral';
    const words = text.toLowerCase().split(' ');
    for (const [emotion, keywords] of Object.entries(emotions)) {
      if (keywords.some(keyword => words.includes(keyword))) {
        detectedEmotion = emotion;
        break;
      }
    }

    // Save to user's emotion history
    const user = await User.findOne({ email });
    if (user) {
      user.emotions.push({ emotion: detectedEmotion, timestamp: new Date() });
      await user.save();
    }

    res.json({ emotion: detectedEmotion });
  } catch (error) {
    res.status(500).json({ error: 'Emotion detection failed' });
  }
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));