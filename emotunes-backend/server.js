const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/emotunes', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB error:', err));

app.get('/', (req, res) => {
  res.send('Hello from the Emotunes back-end!');
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  email: String,
}));

app.get('/add-user', async (req, res) => {
  const user = new User({ name: 'Test User', email: 'test@example.com' });
  await user.save();
  res.send('User added!');
});