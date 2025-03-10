// server.js
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const uri = process.env.MONGODB_URI || 'mongodb+srv://nilesh2312045:SreeDhana1603@ssn-chat-bot.xhpzv.mongodb.net/?retryWrites=true&w=majority&appName=ssn-chat-bot'; // Replace with your MongoDB Atlas connection string
const client = new MongoClient(uri);

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    return client.db('ssn_chatbot');
  } catch (error) {
    console.error('MongoDB Atlas connection error:', error);
    throw error;
  }
}

let db;

connectToMongoDB().then(database => {
  db = database;
}).catch(console.error);

// Save chat message
app.post('/api/chat', async (req, res) => {
  const { userId, text, isUser, timestamp } = req.body;
  try {
    const collection = db.collection('chat_history');
    await collection.insertOne({ userId, text, isUser, timestamp });
    res.status(200).send({ message: 'Message saved successfully' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to save message' });
  }
});

// Load chat history
app.get('/api/chat/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const collection = db.collection('chat_history');
    const history = await collection.find({ userId }).sort({ timestamp: 1 }).limit(100).toArray();
    res.status(200).send(history);
  } catch (error) {
    res.status(500).send({ error: 'Failed to load chat history' });
  }
});

// Clear chat history
app.delete('/api/chat/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const collection = db.collection('chat_history');
    await collection.deleteMany({ userId });
    res.status(200).send({ message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to clear chat history' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});