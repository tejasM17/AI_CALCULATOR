const express = require('express');
const { calculate, convertCurrency, aiChat } = require('../controllers/calcController');
const { getCalcHistory, getChatHistory, updateCalc, deleteCalc, updateChat, deleteChat } = require('../controllers/historyController');

const router = express.Router();

router.post('/calculate', calculate);   
router.post('/currency', convertCurrency);  
router.post('/chat', aiChat);   
router.get('/history/calcs', getCalcHistory);  
router.get('/history/chats', getChatHistory); 

router.put('/history/calcs/:id', updateCalc);   
router.delete('/history/calcs/:id', deleteCalc);  

router.put('/history/chats/:id', updateChat); 
router.delete('/history/chats/:id', deleteChat); 

module.exports = router;