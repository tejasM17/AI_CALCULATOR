const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const calcRoutes = require('./routes/calcRoutes');
const errorHandler = require('./middlewares/errorHandler');
const cors = require('cors');

dotenv.config();  

const app = express();
app.use(express.json());  

connectDB();  

app.use('/api', calcRoutes);  

app.use(errorHandler);  

app.use(cors({
  origin: [
    'http://localhost:5173',       
    'http://127.0.0.1:5173',
    'http://localhost:3000'       
  ],
  credentials: true,              
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));