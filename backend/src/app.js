const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../frontend/build')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
    });
}

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'TALKFLAIR API is running!', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Placeholder for lip-sync generation
app.post('/api/generate-lipsync', async (req, res) => {
    try {
        // This is where the magic happens!
        // Connect your AI models here
        res.json({
            success: true,
            message: 'TALKFLAIR is ready! Connect your AI models to start generating videos.',
            videoUrl: 'https://example.com/demo-video.mp4'
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Generation failed',
            message: error.message 
        });
    }
});

// Error handling
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

app.listen(PORT, () => {
    console.log(`🎭 TALKFLAIR Backend running on port ${PORT}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = app;
