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

        console.log('🎭 Starting REAL AI lip-sync generation...');
        console.log('📸 Image:', imageUrl);
        console.log('🎵 Audio:', audioUrl);

        // REAL AI INTEGRATION WITH SADTALKER
        const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                version: "3aa3dac9353cc4d6bd62a8f95957bd844003b401ca4e4a9b33baa574c549d376",
                input: {
                    source_image: imageUrl,
                    driven_audio: audioUrl,
                    enhancer: "gfpgan",
                    preprocess: "crop"
                }
            })
        });

        const prediction = await replicateResponse.json();

        if (replicateResponse.ok) {
            console.log('✅ AI prediction started:', prediction.id);
            
            // Return prediction ID for status checking
            res.json({
                success: true,
                message: '🎭 TALKFLAIR AI is creating your video!',
                data: {
                    predictionId: prediction.id,
                    status: 'processing',
                    estimatedTime: '30-60 seconds',
                    aspectRatio: aspectRatio,
                    quality: '720p'
                }
            });
        } else {
            throw new Error(`Replicate API error: ${prediction.detail || 'Unknown error'}`);
        }

    } catch (error) {
        console.error('❌ AI generation error:', error);
        res.status(500).json({ 
            error: 'AI generation failed',
            message: error.message 
        });
    }
});

// NEW: Check AI generation status
app.get('/api/status/:predictionId', async (req, res) => {
    try {
        const { predictionId } = req.params;
        
        const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: {
                'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
            },
        });

        const prediction = await response.json();

        if (prediction.status === 'succeeded') {
            res.json({
                success: true,
                status: 'completed',
                videoUrl: prediction.output,
                message: '🎉 Your TALKFLAIR video is ready!'
            });
        } else if (prediction.status === 'failed') {
            res.json({
                success: false,
                status: 'failed',
                message: 'Video generation failed. Please try again.'
            });
        } else {
            res.json({
                success: true,
                status: 'processing',
                progress: prediction.status === 'starting' ? 10 : 50,
                message: 'AI is working on your video...'
            });
        }
    } catch (error) {
        console.error('❌ Status check error:', error);
        res.status(500).json({ 
            error: 'Status check failed',
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
    console.log(`🤖 Replicate: ${process.env.REPLICATE_API_TOKEN ? '✅ Connected' : '❌ Not configured'}`);
    console.log('🎭 ================================');
});

module.exports = app;                                        
  
  
