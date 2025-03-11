const express = require('express');
const Chat = require('../models/chat.model');
const router = express.Router();

// Save chat message
router.post('/saveChat', async (req, res) => {
  try {
    const { userId, conversationId, messages } = req.body;

    let chat = await Chat.findOne({ userId, conversationId });

    if (chat) {
      // Append new messages to existing conversation
      chat.messages.push(...messages);
    } else {
      // Create new conversation
      chat = new Chat({ userId, conversationId, messages });
    }

    await chat.save();
    res.json({ success: true, message: 'Chat saved successfully' });
  } catch (error) {
    console.error('Error saving chat:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Fetch user chat history
router.get('/getChats/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const chats = await Chat.find({ userId });
  
      res.json(chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
  

module.exports = router;
