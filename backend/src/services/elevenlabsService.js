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

            const formData = new FormData();
            formData.append('audio', audioBuffer, {
                filename: filename,
                contentType: 'audio/mpeg'
            });

            const response = await axios.post(
                `${this.baseURL}/audio-enhancement`,
                formData,
                {
                    headers: {
                        'xi-api-key': this.apiKey,
                        ...formData.getHeaders()
                    },
                    responseType: 'arraybuffer',
                    timeout: 60000 // 60 seconds timeout
                }
            );

            console.log('✅ Audio enhanced successfully with ElevenLabs');
            return {
                enhanced: true,
                audioBuffer: Buffer.from(response.data)
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

    /**
     * Get available voices from ElevenLabs
     */
    async getVoices() {
        if (!this.apiKey) {
            return [];
        }

        try {
            const response = await axios.get(`${this.baseURL}/voices`, {
                headers: {
                    'xi-api-key': this.apiKey
                }
            });

            return response.data.voices || [];
        } catch (error) {
            console.error('ElevenLabs get voices error:', error.message);
            return [];
        }
    }

    /**
     * Convert text to speech (if needed for future features)
     */
    async textToSpeech(text, voiceId = 'default') {
        if (!this.apiKey) {
            throw new Error('ElevenLabs API key not configured');
        }

        try {
            const response = await axios.post(
                `${this.baseURL}/text-to-speech/${voiceId}`,
                {
                    text: text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5
                    }
                },
                {
                    headers: {
                        'xi-api-key': this.apiKey,
                        'Content-Type': 'application/json'
                    },
                    responseType: 'arraybuffer'
                }
            );

            return Buffer.from(response.data);
        } catch (error) {
            console.error('ElevenLabs TTS error:', error.message);
            throw new Error('Failed to convert text to speech');
        }
    }

    /**
     * Check API usage and limits
     */
    async getUsage() {
        if (!this.apiKey) {
            return null;
        }

        try {
            const response = await axios.get(`${this.baseURL}/user`, {
                headers: {
                    'xi-api-key': this.apiKey
                }
            });

            return {
                charactersUsed: response.data.subscription?.character_count || 0,
                charactersLimit: response.data.subscription?.character_limit || 0,
                canUseAPI: response.data.subscription?.status === 'active'
            };
        } catch (error) {
            console.error('ElevenLabs usage check error:', error.message);
            return null;
        }
    }
}

module.exports = new ElevenLabsService();
