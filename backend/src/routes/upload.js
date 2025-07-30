const express = require('express');
const multer = require('multer');
const cloudinaryService = require('../services/cloudinaryService');
const elevenlabsService = require('../services/elevenlabsService');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow images and audio files
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image and audio files are allowed!'), false);
        }
    }
});

/**
 * Upload image endpoint
 */
router.post('/image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        console.log('📸 Processing image upload:', req.file.originalname);

        // Validate image file
        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({ error: 'File must be an image' });
        }

        // Upload to Cloudinary
        const result = await cloudinaryService.uploadImage(
            req.file.buffer,
            req.file.originalname
        );

        console.log('✅ Image uploaded successfully');

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: result.url,
                publicId: result.publicId,
                width: result.width,
                height: result.height,
                filename: req.file.originalname
            }
        });

    } catch (error) {
        console.error('❌ Image upload error:', error);
        res.status(500).json({
            error: 'Failed to upload image',
            message: error.message
        });
    }
});

/**
 * Upload audio endpoint
 */
router.post('/audio', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        console.log('🎵 Processing audio upload:', req.file.originalname);

        // Validate audio file
        if (!req.file.mimetype.startsWith('audio/')) {
            return res.status(400).json({ error: 'File must be an audio file' });
        }

        // Enhance audio with ElevenLabs (optional)
        const enhancementResult = await elevenlabsService.enhanceAudio(
            req.file.buffer,
            req.file.originalname
        );

        // Upload to Cloudinary (use enhanced audio if available)
        const result = await cloudinaryService.uploadAudio(
            enhancementResult.audioBuffer,
            req.file.originalname
        );

        console.log('✅ Audio uploaded successfully');

        res.json({
            success: true,
            message: 'Audio uploaded successfully',
            data: {
                url: result.url,
                publicId: result.publicId,
                duration: result.duration,
                filename: req.file.originalname,
                enhanced: enhancementResult.enhanced
            }
        });

    } catch (error) {
        console.error('❌ Audio upload error:', error);
        res.status(500).json({
            error: 'Failed to upload audio',
            message: error.message
        });
    }
});

/**
 * Upload multiple files endpoint
 */
router.post('/multiple', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
]), async (req, res) => {
    try {
        const results = {};

        // Process image if provided
        if (req.files.image && req.files.image[0]) {
            const imageFile = req.files.image[0];
            console.log('📸 Processing image:', imageFile.originalname);
            
            const imageResult = await cloudinaryService.uploadImage(
                imageFile.buffer,
                imageFile.originalname
            );
            
            results.image = {
                url: imageResult.url,
                publicId: imageResult.publicId,
                width: imageResult.width,
                height: imageResult.height,
                filename: imageFile.originalname
            };
        }

        // Process audio if provided
        if (req.files.audio && req.files.audio[0]) {
            const audioFile = req.files.audio[0];
            console.log('🎵 Processing audio:', audioFile.originalname);
            
            // Enhance audio
            const enhancementResult = await elevenlabsService.enhanceAudio(
                audioFile.buffer,
                audioFile.originalname
            );
            
            // Upload enhanced audio
            const audioResult = await cloudinaryService.uploadAudio(
                enhancementResult.audioBuffer,
                audioFile.originalname
            );
            
            results.audio = {
                url: audioResult.url,
                publicId: audioResult.publicId,
                duration: audioResult.duration,
                filename: audioFile.originalname,
                enhanced: enhancementResult.enhanced
            };
        }

        console.log('✅ Multiple files uploaded successfully');

        res.json({
            success: true,
            message: 'Files uploaded successfully',
            data: results
        });

    } catch (error) {
        console.error('❌ Multiple upload error:', error);
        res.status(500).json({
            error: 'Failed to upload files',
            message: error.message
        });
    }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large',
                message: 'File size must be less than 50MB'
            });
        }
    }
    
    res.status(500).json({
        error: 'Upload failed',
        message: error.message
    });
});

module.exports = router;
