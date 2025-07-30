const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryService {
    /**
     * Upload image to Cloudinary
     */
    async uploadImage(fileBuffer, filename) {
        try {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'image',
                        folder: 'talkflair/images',
                        public_id: `image_${Date.now()}_${filename}`,
                        transformation: [
                            { width: 1024, height: 1024, crop: 'limit' },
                            { quality: 'auto:good' },
                            { format: 'jpg' }
                        ]
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary image upload error:', error);
                            reject(error);
                        } else {
                            console.log('✅ Image uploaded to Cloudinary:', result.secure_url);
                            resolve({
                                url: result.secure_url,
                                publicId: result.public_id,
                                width: result.width,
                                height: result.height
                            });
                        }
                    }
                ).end(fileBuffer);
            });
        } catch (error) {
            console.error('Cloudinary service error:', error);
            throw new Error('Failed to upload image to Cloudinary');
        }
    }

    /**
     * Upload audio to Cloudinary
     */
    async uploadAudio(fileBuffer, filename) {
        try {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'video', // Audio files use 'video' resource type
                        folder: 'talkflair/audio',
                        public_id: `audio_${Date.now()}_${filename}`,
                        format: 'mp3'
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary audio upload error:', error);
                            reject(error);
                        } else {
                            console.log('✅ Audio uploaded to Cloudinary:', result.secure_url);
                            resolve({
                                url: result.secure_url,
                                publicId: result.public_id,
                                duration: result.duration
                            });
                        }
                    }
                ).end(fileBuffer);
            });
        } catch (error) {
            console.error('Cloudinary service error:', error);
            throw new Error('Failed to upload audio to Cloudinary');
        }
    }
}

module.exports = new CloudinaryService();
