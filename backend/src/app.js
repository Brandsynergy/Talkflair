const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ 
        status: '🎭 TALKFLAIR API is running perfectly!', 
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        features: {
            imageUpload: '✅ Ready',
            audioUpload: '✅ Ready',
            audioEnhancement: process.env.ELEVENLABS_API_KEY ? '✅ Ready' : '⚠️ Not configured',
            cloudStorage: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Ready' : '⚠️ Not configured',
            lipSync: '🔄 Ready for AI integration'
        }
    });
});

// Upload routes
app.use('/api/upload', uploadRoutes);

// Lip-sync generation endpoint
app.post('/api/generate-lipsync', async (req, res) => {
    try {
        const { imageUrl, audioUrl, aspectRatio = '16:9' } = req.body;

        if (!imageUrl || !audioUrl) {
            return res.status(400).json({
                error: 'Missing required parameters',
                message: 'Both imageUrl and audioUrl are required'
            });
        }

        console.log('🎭 Starting lip-sync generation...');
        console.log('📸 Image:', imageUrl);
        console.log('🎵 Audio:', audioUrl);
        console.log('📱 Aspect Ratio:', aspectRatio);

        // TODO: Integrate with Wav2Lip or SadTalker AI models here
        // For now, return a success response
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));

        res.json({
            success: true,
            message: '🎉 TALKFLAIR video generated successfully!',
            data: {
                videoUrl: 'https://example.com/demo-video.mp4', // Replace with actual generated video
                aspectRatio: aspectRatio,
                duration: '30s',
                quality: '720p',
                processingTime: '2.5s',
                status: 'completed'
            },
            note: 'This is a demo response. Connect your AI models to generate real videos!'
        });

    } catch (error) {
        console.error('❌ Lip-sync generation error:', error);
        res.status(500).json({ 
            error: 'Generation failed',
            message: error.message 
        });
    }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../frontend/build')));
    
    // Handle React routing
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
    });
}

// Global error handling
app.use((error, req, res, next) => {
    console.error('🚨 Global error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong with TALKFLAIR'
    });
});

app.listen(PORT, () => {
    console.log('🎭 ================================');
    console.log('🎭 TALKFLAIR Backend Started!');
    console.log('🎭 ================================');
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`🎨 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`🔑 Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ Connected' : '❌ Not configured'}`);
    console.log(`🎵 ElevenLabs: ${process.env.ELEVENLABS_API_KEY ? '✅ Connected' : '❌ Not configured'}`);
    console.log('🎭 ================================');
});

module.exports = app;                                        
  
  
