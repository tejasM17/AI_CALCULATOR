const axios = require('axios');
const Calculation = require('../models/Calculation');
const Chat = require('../models/Chat');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const calculate = async (req, res) => {
  const { query, type } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query is required and must be a string' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Solve this math problem step-by-step: ${query}. Include explanations.` }] }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('No valid response text from Gemini');
    }

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
    console.error("Currency conversion error:", err);
    res.status(500).json({ error: 'Currency conversion failed: ' + err.message });
  }
};

const aiChat = async (req, res) => {
  const { message, chatId } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required and must be a string' });
  }

  try {
    let chat;
    if (chatId) {
      chat = await Chat.findById(chatId);
      if (!chat) return res.status(404).json({ error: 'Chat not found' });
    } else {
      chat = new Chat({ messages: [] });
    }

    chat.messages.push({ role: 'user', content: message });

    // Tell client we're streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // or 2.5-flash

    const prompt = `You are a helpful math AI. Respond clearly and step-by-step to: ${message}`;

    const stream = await model.generateContentStream(prompt);

    let fullResponse = '';

    for await (const chunk of stream.stream) {
      const text = chunk.text();
      fullResponse += text;
      res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
    }

    // Finish stream
    res.write(`data: ${JSON.stringify({ done: true, full: fullResponse })}\n\n`);
    res.end();

    // Save to DB after streaming complete
    chat.messages.push({ role: 'ai', content: fullResponse });
    await chat.save();

  } catch (err) {
    console.error('AI stream error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'AI chat failed: ' + err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
};

module.exports = { calculate, convertCurrency, aiChat };