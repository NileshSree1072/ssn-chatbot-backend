const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'https://ssn-chatbot-jn14.vercel.app' })); // Replace with your UI URL

const uri = 'mongodb+srv://nilesh2312045:SreeDhana1603@ssn-chat-bot.xhpzv.mongodb.net/?retryWrites=true&w=majority&appName=ssn-chat-bot'; // Replace with your MongoDB Atlas URI
const client = new MongoClient(uri);

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('ssn_chatbot');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

(async () => {
  const db = await connectToMongoDB();

  // Save chat message
  app.post('/api/chat', async (req, res) => {
    const { userId, text, isUser, timestamp } = req.body;
    try {
      await db.collection('chat_history').insertOne({ userId, text, isUser, timestamp });
      res.status(200).send('Message saved');
    } catch (error) {
      res.status(500).send(`Error saving message: ${error.message}`);
    }
  });

  // Load chat history
  app.get('/api/chat/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const history = await db.collection('chat_history')
        .find({ userId })
        .sort({ timestamp: 1 })
        .limit(100)
        .toArray();
      res.json(history);
    } catch (error) {
      res.status(500).send(`Error loading history: ${error.message}`);
    }
  });

  // Clear chat history
  app.delete('/api/chat/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      await db.collection('chat_history').deleteMany({ userId });
      res.status(200).send('Chat history cleared');
    } catch (error) {
      res.status(500).send(`Error clearing history: ${error.message}`);
    }
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();