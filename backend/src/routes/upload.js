const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
});

// SINGLE Upload endpoint that handles both image and audio
router.post('/', upload.single('file'), async (req, res) => {
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

module.exports = router;                                                                                                    
  
  
  
  
  
