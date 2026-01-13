const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const Calculation = require('../models/Calculation');
const Chat = require('../models/Chat');

const genAI = new GoogleGenerativeAI("AIzaSyAAGO5g6OuGyEthm2Cl4vI7YOlilqK-98Q");

 
const calculate = async (req, res) => {
  const { query, type } = req.body;
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Solve this math problem step-by-step: ${query}. Include explanations.` }] }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;

    const newCalc = new Calculation({ query, result: responseText, steps: responseText, type });
    await newCalc.save();

    res.json({ success: true, result: responseText });
  } catch (err) {
    console.error("Calculate fetch error:", err);
    res.status(500).json({ error: 'Calculation failed: ' + err.message });
  }
};

const convertCurrency = async (req, res) => {
  const { from, to, amount } = req.body;   
  try {
    const url = `https://api.exchangeratesapi.io/v1/convert?access_key=${process.env.CURRENCY_API_KEY}&from=${from}&to=${to}&amount=${amount}`;
    const { data } = await axios.get(url);
    const result = `${amount} ${from} = ${data.result} ${to}`;

    const query = `${amount} ${from} to ${to}`;
    const newCalc = new Calculation({ query, result, type: 'currency' });
    await newCalc.save();

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: 'Currency conversion failed: ' + err.message });
  }
};

// Handle AI chat 
const aiChat = async (req, res) => {
  console.log("📥 Incoming request body:", req.body);

  const { message, chatId } = req.body;

  // Safety check
  if (!message || typeof message !== 'string') {
    console.log("❌ Invalid message:", message);
    return res.status(400).json({ error: 'Message is required and must be a string' });
  }

  try {
    let chat;

    if (chatId) {
      console.log("🔍 Finding chat with ID:", chatId);
      chat = await Chat.findById(chatId);

      if (!chat) {
        console.log("❌ Chat not found:", chatId);
        return res.status(404).json({ error: 'Chat not found' });
      }
    } else {
      console.log("🆕 Creating new chat");
      chat = new Chat({ messages: [] });
    }

    // Add user message
    chat.messages.push({ role: 'user', content: message });
    console.log("🧑 User message added:", message);

    const apiKey = process.env.GEMINI_API_KEY;
    console.log("🔑 Gemini API Key loaded:", apiKey ? "YES" : "NO");

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

    console.log("🌐 Calling Gemini API...");

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `You are a helpful math AI. Respond veary simply, clearly and step-by-step to this: ${message}` }
            ]
          }
        ]
      })
    });

    console.log("Gemini API status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error body:", errorText);
      throw new Error(`Gemini API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("📦 Gemini raw response:", JSON.stringify(data, null, 2));

    const aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      console.error(" No AI response found in Gemini data");
      throw new Error('No valid response from Gemini');
    }

    console.log("🤖 AI response:", aiResponse);

    chat.messages.push({ role: 'ai', content: aiResponse });
    await chat.save();

    console.log("Chat saved with ID:", chat._id.toString());

    res.json({
      success: true,
      response: aiResponse,
      chatId: chat._id.toString()
    });

  } catch (err) {
    console.error(" AI Chat full error:", err);
    res.status(500).json({ error: 'AI chat failed: ' + err.message });
  }
};


module.exports = { calculate, convertCurrency, aiChat };