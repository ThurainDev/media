const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:5173", // Force local development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
}));

// Additional CORS headers for preflight requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
    
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
    
    if (req.method === 'OPTIONS') {
        console.log('Handling OPTIONS preflight request');
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));

// MongoDB Connection
const mongoURL = process.env.MONGODB_URI || "mongodb+srv://thuraindev:712127@thuraindev.ulnnx.mongodb.net/?retryWrites=true&w=majority&appName=ThurainDev";

mongoose.connect(mongoURL)
    .then(() => {
        console.log('✅ Connected to MongoDB')
        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
    });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/schedules', require('./routes/schedules'));

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Ministry Schedule API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
