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

// Test Hedra connection
const testHedra = () => {
  try {
    if (process.env.HEDRA_API_KEY) {
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

   // Call Hedra API for real lip-sync generation
console.log('🎭 Calling Hedra API for lip-sync generation...');

const hedraResponse = await axios.post('https://api.hedra.com/v1/characters', {
  audioSource: audioResult.secure_url,
  imageSource: imageResult.secure_url,
  aspectRatio: aspectRatio === '9:16' ? 'vertical' : 'horizontal'
}, {
  headers: {
    'Authorization': `Bearer ${process.env.HEDRA_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

console.log('🎭 Hedra API response:', hedraResponse.data);

if (hedraResponse.data && hedraResponse.data.jobId) {
  res.json({
    success: true,
    message: 'AI is generating your lip-sync video... This may take 2-5 minutes.',
    jobId: hedraResponse.data.jobId,
    status: 'processing'
  });
} else {
  res.json({
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
      hedra: testHedra()
    }
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'TALKFLAIR Backend API',
    version: '2.0.0',
    endpoints: {
      health: '/api/health',
      generate: '/api/generate (POST)'
    },
    services: {
      cloudinary: testCloudinary(),
      hedra: testHedra()
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
  console.log(`🎵 ElevenLabs: ❌ Not configured`);
  console.log(`🎭 Hedra Character-2: ${testHedra()}`);
  console.log('🎭 ================================');
});

module.exports = app;                                                                                                                                                                                                                                                                                                                                                                                          
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

                                                                                                                                                               
  
  
  
  
  
  
  
  
