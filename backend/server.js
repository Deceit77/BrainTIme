const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3001;

// MongoDB connection configuration
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'quizApp';
let db;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

// Route to validate answers
app.post('/api/validate-answers', (req, res) => {
  console.log('Received a request:', req.body);

  const correctAnswers = [0, 1, 2, 0, 2];

  const userAnswers = req.body.answers;
  if (!userAnswers || !Array.isArray(userAnswers) || userAnswers.length !== correctAnswers.length) {
    return res.status(400).json({ error: 'Invalid answers format' });
  }

  const correctAnswersCount = userAnswers.reduce((count, answer, index) => {
    return answer === correctAnswers[index] ? count + 1 : count;
  }, 0);

  console.log('Correct Answers Count:', correctAnswersCount);

  res.json({ correctAnswersCount });
});

// Route to save result
app.post('/api/save-result', (req, res) => {
  const { name, score } = req.body;
  if (!name || typeof name !== 'string' || typeof score !== 'number') {
    return res.status(400).json({ error: 'Name and score are required' });
  }

  const result = { name, score };

  db.collection('results')
    .insertOne(result)
    .then(result => {
      console.log('Result saved:', result);
      res.json({ message: 'Result saved successfully' });
    })
    .catch(err => {
      console.error('Error saving result:', err);
      res.status(500).json({ error: 'Error saving result' });
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
