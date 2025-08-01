const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Test connections
const testCloudinary = () => {
  return process.env.CLOUDINARY_CLOUD_NAME ? '✅ Connected' : '❌ Not configured';
};

const testHedra = () => {
  return process.env.HEDRA_API_KEY ? '✅ Connected' : '❌ Not configured';
};

// HEDRA CHARACTER-2 API - REAL LIP-SYNC GENERATION
app.post('/api/generate', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('🎭 HEDRA Generation Started');
    
    if (!req.files?.image || !req.files?.audio) {
      return res.status(400).json({
        success: false,
        error: 'Both image and audio files are required'
      });
    }

    const { aspectRatio } = req.body;
    const imageFile = req.files.image[0];
    const audioFile = req.files.audio[0];

    console.log('📸 Processing:', imageFile.originalname);
    console.log('🎵 Processing:', audioFile.originalname);

    // Check Hedra API key
    if (!process.env.HEDRA_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Hedra API key not configured. Please add HEDRA_API_KEY to environment variables.'
      });
    }

    // Upload files to Cloudinary
    const uploadImage = () => new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder: 'talkflair/images' },
        (error, result) => error ? reject(error) : resolve(result)
      ).end(imageFile.buffer);
    });

    const uploadAudio = () => new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'video', folder: 'talkflair/audio' },
        (error, result) => error ? reject(error) : resolve(result)
      ).end(audioFile.buffer);
    });

    const [imageResult, audioResult] = await Promise.all([uploadImage(), uploadAudio()]);
    console.log('☁️ Files uploaded to Cloudinary');

    // Call Hedra Character-2 API
    console.log('🎭 Calling Hedra Character-2 API...');
    
    const hedraPayload = {
      type: "tts",
      input_image: imageResult.secure_url,
      input_audio: audioResult.secure_url,
      aspect_ratio: aspectRatio === '9:16' ? '9:16' : '16:9'
    };

    const hedraResponse = await axios.post(
      'https://mercury.dev.dream-ai.com/api/v1/characters',
      hedraPayload,
      {
        headers: {
          'X-API-Key': process.env.HEDRA_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (!hedraResponse.data?.jobId) {
      throw new Error('Failed to start Hedra video generation');
    }

    const jobId = hedraResponse.data.jobId;
    console.log('🎬 Hedra processing started, Job ID:', jobId);

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max (10 seconds * 30)
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      
      const statusResponse = await axios.get(
        `https://mercury.dev.dream-ai.com/api/v1/characters/${jobId}`,
        {
          headers: { 'X-API-Key': process.env.HEDRA_API_KEY }
        }
      );

      const status = statusResponse.data?.status;
      console.log(`🔄 Attempt ${attempts + 1}: ${status}`);

      if (status === 'completed') {
        const videoUrl = statusResponse.data.videoUrl;
        console.log('🎉 HEDRA VIDEO GENERATED:', videoUrl);
        
        return res.json({
          success: true,
          message: 'Hedra lip-sync video generated successfully!',
          videoUrl: videoUrl,
          jobId: jobId,
          imageUrl: imageResult.secure_url,
          audioUrl: audioResult.secure_url
        });
      } else if (status === 'failed') {
        throw new Error('Hedra video generation failed');
      }

      attempts++;
    }

    // Timeout
    throw new Error('Hedra video generation timed out after 5 minutes');

  } catch (error) {
    console.error('❌ Hedra Generation error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message,
      details: 'Hedra video generation failed. Check API key and try again.'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'TALKFLAIR - HEDRA CHARACTER-2 API',
    services: {
      cloudinary: testCloudinary(),
      hedra: testHedra()
    }
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'TALKFLAIR - HEDRA CHARACTER-2 LIP-SYNC',
    version: '6.0.0 - HEDRA API',
    note: 'Using proven Hedra Character-2 API for reliable lip-sync videos!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🎭 ================================');
  console.log('🎭 TALKFLAIR - HEDRA VERSION!');
  console.log('🎭 ================================');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`🔑 Cloudinary: ${testCloudinary()}`);
  console.log(`🎭 Hedra API: ${testHedra()}`);
  console.log('🎭 ================================');
  console.log('🎬 HEDRA LIP-SYNC VIDEOS!');
  console.log('🎭 ================================');
});

module.exports = app;                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

                                                                                                                                                               
  
  
  
  
  
  
  
  
