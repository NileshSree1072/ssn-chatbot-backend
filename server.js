require('dotenv').config();  // Load environment variables from .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'https://ssn-chatbot-jn14.vercel.app' })); // Replace with your UI URL

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://nilesh2312045:SreeDhana1603@ssn-chat-bot.xhpzv.mongodb.net/ssn_chatbot?retryWrites=true&w=majority&appName=ssn-chat-bot';

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      tls: true,
      tlsAllowInvalidCertificates: true  // Bypasses SSL error
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);  // Exit process on connection failure
  }
}
connectToMongoDB();

// Define Chat Schema & Model
const chatSchema = new mongoose.Schema({
  userId: String,
  text: String,
  isUser: Boolean,
  timestamp: { type: Date, default: Date.now }
});
const Chat = mongoose.model('Chat', chatSchema);

// Save chat message
app.post('/api/chat', async (req, res) => {
  const { userId, text, isUser, timestamp } = req.body;
  try {
    const chat = new Chat({ userId, text, isUser, timestamp });
    await chat.save();
    res.status(200).send('✅ Message saved');
  } catch (error) {
    res.status(500).json({ error: `❌ Error saving message: ${error.message}` });
  }
});

// Load chat history
app.get('/api/chat/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const history = await Chat.find({ userId }).sort({ timestamp: 1 }).limit(100);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: `❌ Error loading history: ${error.message}` });
  }
});

// Clear chat history
app.delete('/api/chat/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    await Chat.deleteMany({ userId });
    res.status(200).send('✅ Chat history cleared');
  } catch (error) {
    res.status(500).json({ error: `❌ Error clearing history: ${error.message}` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
