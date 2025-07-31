const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from frontend build
app.use(express.static('frontend/build'));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
});

// Upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const { type } = req.body;
        console.log(`🔄 Uploading ${type}:`, req.file.originalname);

        // Determine resource type and folder
        const resourceType = type === 'image' ? 'image' : 'video';
        const folder = `talkflair/${type}s`;

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: resourceType,
                    folder: folder,
                    public_id: `${Date.now()}_${req.file.originalname}`,
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        console.log(`✅ ${type} uploaded successfully:`, uploadResult.secure_url);

        res.json({
            success: true,
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            message: `${type} uploaded successfully`
        });

    } catch (error) {
        console.error(`❌ Upload error:`, error);
        res.status(500).json({
            success: false,
            error: 'Upload failed',
            message: error.message
        });
    }
});

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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        message: 'TALKFLAIR Backend is running!',
        timestamp: new Date().toISOString()
    });
});

// Catch all handler for frontend routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

// Global error handling
app.use((error, req, res, next) => {
    console.error('🚨 Global error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong with TALKFLAIR'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🎭 ================================');
    console.log('🎭 TALKFLAIR Backend Started!');
    console.log('🎭 ================================');
    console.log('🌐 Server: http://localhost:' + PORT);
    console.log('🎨 Frontend: http://localhost:3000');
    console.log('🔑 Cloudinary: ' + (process.env.CLOUDINARY_CLOUD_NAME ? '✅ Connected' : '❌ Not configured'));
    console.log('🎵 ElevenLabs: ' + (process.env.ELEVENLABS_API_KEY ? '✅ Connected' : '❌ Not configured'));
    console.log('🎭 Hedra Character-2: ' + (process.env.HEDRA_API_KEY ? '✅ Connected' : '❌ Not configured'));
    console.log('🎭 ================================');
});                                                                                                    
  
  
  
  
  

                                                                                                                                                               
  
  
  
  
  
  
  
  
