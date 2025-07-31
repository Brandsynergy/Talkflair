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
            lipSync: process.env.REPLICATE_API_TOKEN ? '✅ AI Ready' : '⚠️ AI Not configured'
        }
    });
});

// Upload routes
app.use('/api/upload', uploadRoutes);

// REAL AI Lip-sync generation endpoint
app.post('/api/generate-lipsync', async (req, res) => {
    try {
        const { imageUrl, audioUrl, aspectRatio = '16:9' } = req.body;

        if (!imageUrl || !audioUrl) {
            return res.status(400).json({
                error: 'Missing required parameters',
                message: 'Both imageUrl and audioUrl are required'
            });
        }

        if (!process.env.REPLICATE_API_TOKEN) {
            return res.status(500).json({
                error: 'AI service not configured',
                message: 'Replicate API token is missing'
            });
        }

        console.log('🎭 Starting REAL AI lip-sync generation...');
        console.log('📸 Image:', imageUrl);
        console.log('🎵 Audio:', audioUrl);
        console.log('🎬 Aspect Ratio:', aspectRatio);

   // Generate lip-sync video with HEDRA API
app.post('/api/generate', async (req, res) => {
    try {
        const { imageUrl, audioUrl, aspectRatio } = req.body;

        console.log('🎭 Starting HEDRA AI lip-sync generation...');
        console.log('📸 Image:', imageUrl);
        console.log('🎵 Audio:', audioUrl);
        console.log('🎬 Aspect Ratio:', aspectRatio);

        // Create Hedra generation request
        const hedraResponse = await fetch('https://mercury.dev.hedra.com/api/v1/characters', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.HEDRA_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                audioSource: audioUrl,
                imageSource: imageUrl,
                voiceEmbedding: "premade",
                aspectRatio: aspectRatio === '16:9' ? '16:9' : '9:16'
            })
        });

        if (!hedraResponse.ok) {
            const errorData = await hedraResponse.json();
            console.error('❌ Hedra API error:', errorData);
            throw new Error(`Hedra API error: ${errorData.message || 'Unknown error'}`);
        }

        const hedraData = await hedraResponse.json();
        console.log('✅ Hedra generation started:', hedraData.jobId);

        res.json({
            success: true,
            jobId: hedraData.jobId,
            message: 'HEDRA AI generation started successfully!'
        });

    } catch (error) {
        console.error('❌ HEDRA generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Generation failed',
            message: error.message
        });
    }
});

// Check HEDRA generation status
app.get('/api/status/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;
        console.log('🔍 Checking HEDRA status for:', jobId);

        const statusResponse = await fetch(`https://mercury.dev.hedra.com/api/v1/characters/${jobId}`, {
            headers: {
                'Authorization': `Bearer ${process.env.HEDRA_API_KEY}`,
            }
        });

        if (!statusResponse.ok) {
            throw new Error('Failed to check status');
        }

        const statusData = await statusResponse.json();
        console.log('📊 HEDRA Status:', statusData.status);

        if (statusData.status === 'completed') {
            console.log('🎉 HEDRA generation completed!');
            console.log('🎬 Video URL:', statusData.videoUrl);
        }

        res.json({
            status: statusData.status,
            videoUrl: statusData.videoUrl,
            progress: statusData.status === 'completed' ? 100 : 
                     statusData.status === 'processing' ? 75 : 
                     statusData.status === 'queued' ? 25 : 0
        });

    } catch (error) {
        console.error('❌ Status check error:', error);
        res.status(500).json({
            error: 'Status check failed',
            message: error.message
        });
    }
});                                                                                                                                                                                    
  
// Check AI generation status
app.get('/api/status/:predictionId', async (req, res) => {
    try {
        const { predictionId } = req.params;
        
        if (!process.env.REPLICATE_API_TOKEN) {
            return res.status(500).json({
                error: 'AI service not configured',
                message: 'Replicate API token is missing'
            });
        }

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
                message: 'Video generation failed. Please try again.',
                error: prediction.error
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
  
  
  
  
  
  
  
  
