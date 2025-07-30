import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Box,
    Typography,
    Paper,
    Button,
    LinearProgress,
    Alert
} from '@mui/material';
import {
    CloudUpload,
    CheckCircle,
    Error,
    Image,
    AudioFile
} from '@mui/icons-material';

const FileUpload = ({ 
    type, 
    file, 
    onFileSelect, 
    uploading = false, 
    error = null 
}) => {
    const isImage = type === 'image';
    const accept = isImage 
        ? { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }
        : { 'audio/*': ['.mp3', '.wav', '.m4a', '.aac'] };

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        multiple: false,
        maxSize: isImage ? 10 * 1024 * 1024 : 50 * 1024 * 1024, // 10MB for images, 50MB for audio
    });

    const getFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                {isImage ? <Image /> : <AudioFile />}
                {isImage ? '📸 Upload Image' : '🎵 Upload Audio'}
                <Typography variant="caption" color="text.secondary">
                    ({isImage ? 'Clear face photo' : 'Max 3 minutes'})
                </Typography>
            </Typography>

            <Paper
                {...getRootProps()}
                sx={{
                    p: 3,
                    border: `2px dashed ${
                        error ? 'error.main' : 
                        file ? 'success.main' : 
                        isDragActive ? 'primary.main' : 'rgba(255,255,255,0.3)'
                    }`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    textAlign: 'center',
                    backgroundColor: isDragActive 
                        ? 'rgba(255, 107, 107, 0.1)' 
                        : 'rgba(255, 255, 255, 0.02)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 107, 107, 0.05)',
                        borderColor: 'primary.main',
                    }
                }}
            >
                <input {...getInputProps()} />
                
                {uploading ? (
                    <Box>
                        <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Uploading {isImage ? 'image' : 'audio'}...
                        </Typography>
                        <LinearProgress sx={{ width: '100%' }} />
                    </Box>
                ) : file ? (
                    <Box>
                        <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                        <Typography variant="body1" color="success.main" sx={{ mb: 1 }}>
                            ✅ {file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {getFileSize(file.size)} • Click to change
                        </Typography>
                    </Box>
                ) : (
                    <Box>
                        <CloudUpload sx={{ 
                            fontSize: 48, 
                            color: isDragActive ? 'primary.main' : 'text.secondary',
                            mb: 2 
                        }} />
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            {isDragActive 
                                ? `Drop your ${isImage ? 'image' : 'audio'} here!`
                                : `Drag & drop your ${isImage ? 'image' : 'audio'} file here`
                            }
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            or click to browse files
                        </Typography>
                        <Button variant="outlined" size="small">
                            Browse Files
                        </Button>
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            {isImage 
                                ? 'Supported: JPG, PNG, WebP (max 10MB)'
                                : 'Supported: MP3, WAV, M4A (max 50MB)'
                            }
                        </Typography>
                    </Box>
                )}
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }} icon={<Error />}>
                    {error}
                </Alert>
            )}
        </Box>
    );
};

export default FileUpload;
