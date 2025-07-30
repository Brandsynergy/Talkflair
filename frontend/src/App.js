import React, { useState } from 'react';
import { 
    ThemeProvider, 
    createTheme, 
    CssBaseline,
    Container,
    Box,
    Typography,
    Button,
    Alert,
    Snackbar,
    Paper
} from '@mui/material';
import { VideoCall, AutoAwesome, Upload, CloudUpload } from '@mui/icons-material';

// TALKFLAIR Dark Theme
const talkflairTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#FF6B6B',
            light: '#FF8A80',
            dark: '#E53935',
        },
        secondary: {
            main: '#4ECDC4',
            light: '#80CBC4',
            dark: '#26A69A',
        },
        background: {
            default: '#0a0a0a',
            paper: '#1a1a1a',
        },
        text: {
            primary: '#ffffff',
            secondary: '#b0b0b0',
        },
    },
    typography: {
        fontFamily: 'Inter, sans-serif',
        h3: {
            fontWeight: 700,
            background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                },
            },
        },
    },
});

function App() {
    const [imageFile, setImageFile] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleFileUpload = (type, file) => {
        if (type === 'image') {
            setImageFile(file);
        } else {
            setAudioFile(file);
        }
    };

    const handleGenerate = async () => {
        if (!imageFile || !audioFile) {
            setError('Please upload both image and audio files');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            // This will connect to your backend API
            setSuccess('TALKFLAIR is processing your video! (This is a demo - connect your backend)');
        } catch (err) {
            setError('Processing failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <ThemeProvider theme={talkflairTheme}>
            <CssBaseline />
            <Box sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
                py: 4
            }}>
                <Container maxWidth="md">
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <VideoCall sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h3" component="h1" sx={{ mb: 2 }}>
                            TALKFLAIR
                        </Typography>
                        <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                            Professional AI Lip Synchronization
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Create amazing lip-sync videos like Hedra Character 3
                        </Typography>
                    </Box>

                    {/* Upload Section */}
                    <Paper sx={{ p: 4, mb: 4, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                        <Typography variant="h6" sx={{ mb: 3, color: 'text.primary' }}>
                            Upload Your Files
                        </Typography>
                        
                        {/* Image Upload */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                📸 Upload Image (Clear face photo)
                            </Typography>
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<CloudUpload />}
                                sx={{ mb: 1 }}
                            >
                                Choose Image
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload('image', e.target.files[0])}
                                />
                            </Button>
                            {imageFile && (
                                <Typography variant="body2" color="primary.main">
                                    ✅ {imageFile.name}
                                </Typography>
                            )}
                        </Box>

                        {/* Audio Upload */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                🎵 Upload Audio (Max 3 minutes)
                            </Typography>
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<Upload />}
                                sx={{ mb: 1 }}
                            >
                                Choose Audio
                                <input
                                    type="file"
                                    hidden
                                    accept="audio/*"
                                    onChange={(e) => handleFileUpload('audio', e.target.files[0])}
                                />
                            </Button>
                            {audioFile && (
                                <Typography variant="body2" color="secondary.main">
                                    ✅ {audioFile.name}
                                </Typography>
                            )}
                        </Box>
                    </Paper>

                    {/* Generate Button */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleGenerate}
                            disabled={!imageFile || !audioFile || processing}
                            startIcon={<AutoAwesome />}
                            sx={{
                                px: 6,
                                py: 2,
                                fontSize: '1.2rem',
                                background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #E53935 30%, #26A69A 90%)',
                                },
                                '&:disabled': {
                                    background: 'rgba(255, 255, 255, 0.1)',
                                }
                            }}
                        >
                            {processing ? 'Creating Magic...' : 'Generate Lip-Sync Video'}
                        </Button>
                    </Box>

                    {/* Features */}
                    <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                            ✨ TALKFLAIR Features
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="primary.main">🎯 Perfect Lip Sync</Typography>
                                <Typography variant="caption">AI-powered precision</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="secondary.main">🎵 Audio Enhancement</Typography>
                                <Typography variant="caption">Crystal clear sound</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="primary.main">📱 Dual Formats</Typography>
                                <Typography variant="caption">16:9 & 9:16 ratios</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="secondary.main">🎬 HD Quality</Typography>
                                <Typography variant="caption">Professional 720p</Typography>
                            </Box>
                        </Box>
                    </Paper>

                    {/* Notifications */}
                    <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
                        <Alert severity="error" onClose={() => setError('')}>
                            {error}
                        </Alert>
                    </Snackbar>

                    <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess('')}>
                        <Alert severity="success" onClose={() => setSuccess('')}>
                            {success}
                        </Alert>
                    </Snackbar>
                </Container>
            </Box>
        </ThemeProvider>
    );
}

export default App;
