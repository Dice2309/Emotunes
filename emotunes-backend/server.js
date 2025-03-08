const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(cors());
const upload = multer({ dest: 'uploads/' });

mongoose.connect('mongodb://localhost:27017/emotunes')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB error:', err));

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  emotions: [{ emotion: String, timestamp: Date }],
});
const User = mongoose.model('User', userSchema);

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

app.post('/detect-emotion', upload.single('image'), async (req, res) => {
  const { text, email } = req.body;
  try {
    let detectedEmotion = 'neutral';
    const user = await User.findOne({ email });

    if (text) {
      const emotions = {
        happy: ['happy', 'great', 'awesome', 'joy'],
        sad: ['sad', 'bad', 'terrible', 'cry'],
        angry: ['angry', 'mad', 'furious'],
      };
      const words = text.toLowerCase().split(' ');
      for (const [emotion, keywords] of Object.entries(emotions)) {
        if (keywords.some(keyword => words.includes(keyword))) {
          detectedEmotion = emotion;
          break;
        }
      }
      console.log(`Detected emotion from text: ${detectedEmotion} for input: "${text}"`);
    } else if (req.file) {
      const imagePath = path.join(__dirname, req.file.path);
      const pythonScript = 'F:\\Documents\\Assignment\\5\\Emotunes\\detect_face_emotion.py';
      const pythonEnv = 'F:\\Documents\\Assignment\\5\\Emotunes\\emotunes-ai-env\\Scripts\\python.exe';
      const command = `"${pythonEnv}" "${pythonScript}" "${imagePath}"`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Python error: ${stderr}`);
          return res.status(500).json({ error: 'Image processing failed' });
        }
        detectedEmotion = stdout.trim();
        console.log(`Detected emotion from image: ${detectedEmotion} for file: ${req.file.originalname}`);
        if (user) {
          user.emotions.push({ emotion: detectedEmotion, timestamp: new Date() });
          user.save();
        }
        res.json({ emotion: detectedEmotion });
      });
      return;
    } else {
      return res.status(400).json({ error: 'No text or image provided' });
    }

    if (user) {
      user.emotions.push({ emotion: detectedEmotion, timestamp: new Date() });
      await user.save();
    }
    res.json({ emotion: detectedEmotion });
  } catch (error) {
    console.error(`Emotion detection error: ${error.message}`);
    res.status(500).json({ error: 'Emotion detection failed' });
  }
});

app.post('/recommend', async (req, res) => {
  const { emotion } = req.body;
  const spotifyToken = 'BQA5GBw4UBowMeIV0G7TMcAuzJZb_x3-nkVknIagtsj9kMx0nraME97ybEkipe6w9zEIUT4-PpEEnshOQR1_Q3_ogIUvForDEgGrc8Q6X4kMjlO-qsVs3aYLFE1y0VgGgqw36JUsHm7oIU5VQ2j-8FeAOHF7m-9aEapchz_Xy2AUyfHTs8RlfHvmnsAYM4DtDSgpz_6WwhzjMveEu-YGGWi81nAV6dClLg';
  const moodMap = { happy: 'pop', sad: 'blues', angry: 'rock', neutral: 'chillout' };
  const genre = moodMap[emotion] || 'chillout';

  console.log(`Searching Spotify with genre: ${genre}`);
  try {
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { 'Authorization': `Bearer ${spotifyToken}` },
      params: { q: `genre:${genre}`, type: 'track', limit: 5, market: 'US' },
    });
    const tracks = response.data.tracks.items.map(track => ({
      title: track.name,
      artist: track.artists[0].name,
      url: track.external_urls.spotify,
    }));
    res.json({ tracks });
  } catch (error) {
    console.error('Spotify error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    res.status(500).json({
      error: 'Failed to fetch tracks',
      details: error.response?.data || error.message,
    });
  }
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));