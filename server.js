const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./controllers/authControllers');
const connectDB = require('./config/db');
const dotenv = require('dotenv').config();


const app = express();

connectDB();

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Configuration de CORS

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

