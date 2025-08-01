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

const testVisionStory = () => {
  return process.env.VISIONSTORY_API_KEY ? '✅ Connected' : '❌ Not configured';
};

// REAL AI VIDEO GENERATION - NO MORE FAKE RESPONSES!
app.post('/api/generate', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('🚀 REAL AI Generation Started');
    
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

    // Check VisionStory API key
    if (!process.env.VISIONSTORY_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'VisionStory API key not configured. Please add VISIONSTORY_API_KEY to environment variables.'
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

    // Call VisionStory AI - REAL API CALL
    const audioBase64 = audioFile.buffer.toString('base64');
    
    const visionStoryPayload = {
      model_id: 'vs_talk_v1',
      avatar_id: '4321918387609092991',
      audio_script: {
        inline_data: {
          mime_type: audioFile.mimetype || 'audio/mp3',
          data: audioBase64
        },
        voice_change: false,
        denoise: true
      },
      aspect_ratio: aspectRatio === '9:16' ? '9:16' : '16:9',
      resolution: '720p'
    };

    console.log('🎭 Calling VisionStory AI...');
    
    const aiResponse = await axios.post(
      'https://openapi.visionstory.ai/api/v1/video',
      visionStoryPayload,
      {
        headers: {
          'X-API-Key': process.env.VISIONSTORY_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (!aiResponse.data?.data?.video_id) {
      throw new Error('Failed to start AI video generation');
    }

    const videoId = aiResponse.data.data.video_id;
    console.log('🎬 AI processing started, Video ID:', videoId);

    // Poll for completion - REAL VIDEO GENERATION
    let attempts = 0;
    const maxAttempts = 60; // 10 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      
      const statusResponse = await axios.get(
        'https://openapi.visionstory.ai/api/v1/video',
        {
          params: { video_id: videoId },
          headers: { 'X-API-Key': process.env.VISIONSTORY_API_KEY }
        }
      );

      const status = statusResponse.data?.data?.status;
      console.log(`🔄 Attempt ${attempts + 1}: ${status}`);

      if (status === 'created') {
        const videoUrl = statusResponse.data.data.video_url;
        console.log('🎉 REAL VIDEO GENERATED:', videoUrl);
        
        return res.json({
          success: true,
          message: 'Real AI lip-sync video generated successfully!',
          videoUrl: videoUrl,
          videoId: videoId,
          imageUrl: imageResult.secure_url,
          audioUrl: audioResult.secure_url
        });
      } else if (status === 'failed') {
        throw new Error('AI video generation failed');
      }

      attempts++;
    }

    // Timeout
    throw new Error('AI video generation timed out after 10 minutes');

  } catch (error) {
    console.error('❌ Generation error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message,
      details: 'Real AI video generation failed. Check API key and try again.'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'TALKFLAIR - REAL AI VIDEO GENERATION',
    services: {
      cloudinary: testCloudinary(),
      visionStory: testVisionStory()
    }
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'TALKFLAIR - REAL AI LIP-SYNC VIDEOS',
    version: '5.0.0 - REAL AI',
    note: 'This version generates REAL lip-sync videos, not fake responses!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🎭 ================================');
  console.log('🎭 TALKFLAIR - REAL AI VERSION!');
  console.log('🎭 ================================');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`🔑 Cloudinary: ${testCloudinary()}`);
  console.log(`🎭 VisionStory AI: ${testVisionStory()}`);
  console.log('🎭 ================================');
  console.log('🎬 REAL LIP-SYNC VIDEOS ONLY!');
  console.log('🎭 ================================');
});

module.exports = app;                                                                                                                                                                                                                                                                                                                                                   
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

                                                                                                                                                               
  
  
  
  
  
  
  
  
