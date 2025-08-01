const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const path = require('path');

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

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Test Cloudinary connection
const testCloudinary = () => {
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      return '✅ Connected';
    } else {
      return '❌ Not configured';
    }
  } catch (error) {
    return '❌ Error: ' + error.message;
  }
};

// Test VisionStory connection
const testVisionStory = () => {
  try {
    if (process.env.VISIONSTORY_API_KEY) {
      return '✅ Connected';
    } else {
      return '❌ Not configured';
    }
  } catch (error) {
    return '❌ Error: ' + error.message;
  }
};

// Generate lip-sync video route
app.post('/api/generate', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('🚀 Generate request received');
    
    if (!req.files || !req.files.image || !req.files.audio) {
      return res.status(400).json({
        success: false,
        error: 'Both image and audio files are required'
      });
    }

    const { aspectRatio } = req.body;
    const imageFile = req.files.image[0];
    const audioFile = req.files.audio[0];

    console.log('📸 Image uploaded:', imageFile.originalname);
    console.log('🎵 Audio uploaded:', audioFile.originalname);
    console.log('🎬 Aspect ratio:', aspectRatio);

    // Upload image to Cloudinary
    const imageUpload = new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'talkflair/images'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(imageFile.buffer);
    });

    // Upload audio to Cloudinary
    const audioUpload = new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'talkflair/audio'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(audioFile.buffer);
    });

    const [imageResult, audioResult] = await Promise.all([imageUpload, audioUpload]);

    console.log('☁️ Image uploaded to Cloudinary:', imageResult.secure_url);
    console.log('☁️ Audio uploaded to Cloudinary:', audioResult.secure_url);

    // Call VisionStory AI for real lip-sync generation
    console.log('🎭 Calling VisionStory AI for lip-sync generation...');

    // Convert audio file to base64
    const audioBase64 = audioFile.buffer.toString('base64');

    const visionStoryPayload = {
      model_id: 'vs_talk_v1',
      avatar_id: '4321918387609092991', // Default avatar - can be customized
      audio_script: {
        inline_data: {
          mime_type: 'audio/mp3',
          data: audioBase64
        },
        voice_change: false, // Keep original voice
        denoise: true
      },
      aspect_ratio: aspectRatio === '9:16' ? '9:16' : '16:9',
      resolution: '720p',
      background_color: '#000000'
    };

    const visionStoryResponse = await axios.post(
      'https://openapi.visionstory.ai/api/v1/video',
      visionStoryPayload,
      {
        headers: {
          'X-API-Key': process.env.VISIONSTORY_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('🎭 VisionStory API response:', visionStoryResponse.data);

    if (visionStoryResponse.data && visionStoryResponse.data.data && visionStoryResponse.data.data.video_id) {
      const videoId = visionStoryResponse.data.data.video_id;

      // Poll for completion with longer timeout
let attempts = 0;
const maxAttempts = 60; // 5 minutes max
const pollInterval = 10000; // 10 seconds between checks

while (attempts < maxAttempts) {
  await new Promise(resolve => setTimeout(resolve, pollInterval));

  const statusResponse = await axios.get(
    'https://openapi.visionstory.ai/api/v1/video',
    {
      params: { video_id: videoId },
      headers: {
        'X-API-Key': process.env.VISIONSTORY_API_KEY
      }
    }
  );

  console.log(`🔄 Attempt ${attempts + 1}: Status = ${statusResponse.data.data.status}`);

  if (statusResponse.data.data.status === 'created') {
    return res.json({
      success: true,
      message: 'Video generated successfully!',
      videoUrl: statusResponse.data.data.video_url,
      videoId: videoId
    });
  } else if (statusResponse.data.data.status === 'failed') {
    return res.status(500).json({
      success: false,
      error: 'Video generation failed'
    });
  }

  attempts++;
}

// Timeout after 10 minutes
return res.status(408).json({
  success: false,
  error: 'Video generation timed out after 10 minutes. Please try again with shorter audio.'
});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
  
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to start video generation'
      });
    }

  } catch (error) {
    console.error('❌ Generate error:', error);
    
    if (error.response) {
      console.error('API Error Response:', error.response.data);
      return res.status(500).json({
        success: false,
        error: `API Error: ${error.response.data.message || error.message}`
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'TALKFLAIR Backend is running!',
    timestamp: new Date().toISOString(),
    services: {
      cloudinary: testCloudinary(),
      visionStory: testVisionStory()
    }
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'TALKFLAIR Backend API',
    version: '3.0.0',
    endpoints: {
      health: '/api/health',
      generate: '/api/generate (POST)'
    },
    services: {
      cloudinary: testCloudinary(),
      visionStory: testVisionStory()
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Global error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong with TALKFLAIR'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🎭 ================================');
  console.log('🎭 TALKFLAIR Backend Started!');
  console.log('🎭 ================================');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`🎨 Frontend: http://localhost:3000`);
  console.log(`🔑 Cloudinary: ${testCloudinary()}`);
  console.log(`🎭 VisionStory AI: ${testVisionStory()}`);
  console.log('🎭 ================================');
});

module.exports = app;                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

                                                                                                                                                               
  
  
  
  
  
  
  
  
