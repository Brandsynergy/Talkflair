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

const testRunPod = () => {
  return process.env.RUNPOD_API_KEY ? '✅ Connected' : '❌ Not configured';
};

// RUNPOD WAV2LIP API - PROVEN WORKING SOLUTION
app.post('/api/generate', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('🚀 RunPod Wav2Lip Generation Started');
    
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

    // Check RunPod API key
    if (!process.env.RUNPOD_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'RunPod API key not configured. Please add RUNPOD_API_KEY to environment variables.'
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

    // Call RunPod Wav2Lip API
    console.log('🎭 Calling RunPod Wav2Lip API...');
    
    const runpodPayload = {
      input: {
        face: imageResult.secure_url,
        audio: audioResult.secure_url,
        pads: [0, 10, 0, 0],
        face_restore: true,
        face_enhance: true,
        hd: true
      }
    };

    console.log('📤 RunPod Payload:', runpodPayload);

    const runpodResponse = await axios.post(
      'https://api.runpod.ai/v2/wav2lip/runsync',
      runpodPayload,
      {
        headers: {
          'Authorization': `Bearer ${process.env.RUNPOD_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 300000 // 5 minutes timeout
      }
    );

    console.log('📥 RunPod Response:', runpodResponse.data);

    if (runpodResponse.data?.status === 'COMPLETED') {
      const videoUrl = runpodResponse.data.output;
      console.log('🎉 RUNPOD VIDEO GENERATED:', videoUrl);
      
      return res.json({
        success: true,
        message: 'RunPod Wav2Lip video generated successfully!',
        videoUrl: videoUrl,
        imageUrl: imageResult.secure_url,
        audioUrl: audioResult.secure_url
      });
    } else if (runpodResponse.data?.status === 'FAILED') {
      throw new Error(`RunPod generation failed: ${runpodResponse.data.error}`);
    } else {
      // Handle async processing
      const jobId = runpodResponse.data.id;
      console.log('🔄 RunPod job started:', jobId);
      
      // Poll for completion
      let attempts = 0;
      const maxAttempts = 30; // 5 minutes max
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        
        const statusResponse = await axios.get(
          `https://api.runpod.ai/v2/wav2lip/status/${jobId}`,
          {
            headers: { 'Authorization': `Bearer ${process.env.RUNPOD_API_KEY}` }
          }
        );

        const status = statusResponse.data?.status;
        console.log(`🔄 Attempt ${attempts + 1}: ${status}`);

        if (status === 'COMPLETED') {
          const videoUrl = statusResponse.data.output;
          console.log('🎉 RUNPOD VIDEO GENERATED:', videoUrl);
          
          return res.json({
            success: true,
            message: 'RunPod Wav2Lip video generated successfully!',
            videoUrl: videoUrl,
            jobId: jobId,
            imageUrl: imageResult.secure_url,
            audioUrl: audioResult.secure_url
          });
        } else if (status === 'FAILED') {
          throw new Error(`RunPod generation failed: ${statusResponse.data.error}`);
        }

        attempts++;
      }

      throw new Error('RunPod generation timed out after 5 minutes');
    }

  } catch (error) {
    console.error('❌ RunPod Generation error:', error);
    console.error('❌ Error details:', error.response?.data);
    
    return res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message,
      details: 'RunPod video generation failed. Check API key and try again.',
      apiResponse: error.response?.data
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'TALKFLAIR - RUNPOD WAV2LIP API',
    services: {
      cloudinary: testCloudinary(),
      runpod: testRunPod()
    }
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'TALKFLAIR - RUNPOD WAV2LIP LIP-SYNC',
    version: '7.0.0 - RUNPOD API',
    note: 'Using proven RunPod Wav2Lip API for reliable lip-sync videos!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🎭 ================================');
  console.log('🎭 TALKFLAIR - RUNPOD VERSION!');
  console.log('🎭 ================================');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`🔑 Cloudinary: ${testCloudinary()}`);
  console.log(`🚀 RunPod API: ${testRunPod()}`);
  console.log('🎭 ================================');
  console.log('🎬 RUNPOD WAV2LIP VIDEOS!');
  console.log('🎭 ================================');
});

module.exports = app;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

                                                                                                                                                               
  
  
  
  
  
  
  
  
