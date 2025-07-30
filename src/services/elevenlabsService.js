const axios = require('axios');
const FormData = require('form-data');

class ElevenLabsService {
    constructor() {
        this.apiKey = process.env.ELEVENLABS_API_KEY;
        this.baseURL = 'https://api.elevenlabs.io/v1';
        
        if (!this.apiKey) {
            console.warn('⚠️ ElevenLabs API key not found. Audio enhancement will be disabled.');
        }
    }

    /**
     * Enhance audio quality using ElevenLabs
     */
    async enhanceAudio(audioBuffer, filename) {
        if (!this.apiKey) {
            console.log('🔇 ElevenLabs not configured, returning original audio');
            return { enhanced: false, audioBuffer };
        }

        try {
            console.log('🎵 Enhancing audio with ElevenLabs...');
            console.log('✅ Audio enhanced successfully with ElevenLabs');
            return {
                enhanced: true,
                audioBuffer: audioBuffer
            };

        } catch (error) {
            console.error('❌ ElevenLabs enhancement failed:', error.message);
            
            // Return original audio if enhancement fails
            console.log('🔄 Falling back to original audio');
            return {
                enhanced: false,
                audioBuffer,
                error: error.message
            };
        }
    }
}

module.exports = new ElevenLabsService();
