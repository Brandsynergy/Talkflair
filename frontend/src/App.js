import React, { useState } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultVideo, setResultVideo] = useState(null);
  const [message, setMessage] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMessage('Uploading image...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setImage(data.url);
        setMessage('Image uploaded successfully!');
      } else {
        setMessage('Image upload failed: ' + data.message);
      }
    } catch (error) {
      setMessage('Image upload error: ' + error.message);
    }
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMessage('Uploading audio...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'audio');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setAudio(data.url);
        setMessage('Audio uploaded successfully!');
      } else {
        setMessage('Audio upload failed: ' + data.message);
      }
    } catch (error) {
      setMessage('Audio upload error: ' + error.message);
    }
  };

  const handleGenerate = async () => {
    if (!image || !audio) {
      setMessage('Please upload both image and audio files');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setResultVideo(null);
    setMessage('Starting HEDRA AI generation...');

    try {
      // Start generation
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: image,
          audioUrl: audio,
          aspectRatio: aspectRatio,
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Generation failed');
      }

      const jobId = data.jobId;
      setMessage('Generation started! Job ID: ' + jobId);

      // Poll for status
      const pollStatus = async () => {
        try {
          const statusResponse = await fetch(`/api/status/${jobId}`);
          const statusData = await statusResponse.json();

          setProgress(statusData.progress || 0);

          if (statusData.status === 'completed' && statusData.videoUrl) {
            setResultVideo(statusData.videoUrl);
            setMessage('🎉 Video generated successfully!');
            setIsGenerating(false);
          } else if (statusData.status === 'failed') {
            setMessage('❌ Generation failed');
            setIsGenerating(false);
          } else {
            setMessage(`⏳ Status: ${statusData.status}... (${statusData.progress}%)`);
            setTimeout(pollStatus, 5000); // Check every 5 seconds
          }
        } catch (error) {
          setMessage('Status check error: ' + error.message);
          setTimeout(pollStatus, 10000); // Retry in 10 seconds
        }
      };

      pollStatus();

    } catch (error) {
      setMessage('Generation error: ' + error.message);
      setIsGenerating(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎭 TALKFLAIR</h1>
        <p>Professional AI Lip-Sync Generator</p>
        
        <div className="upload-section">
          <div className="upload-group">
            <label>📸 Upload Image:</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              disabled={isGenerating}
            />
            {image && <p>✅ Image ready</p>}
          </div>

          <div className="upload-group">
            <label>🎵 Upload Audio:</label>
            <input 
              type="file" 
              accept="audio/*" 
              onChange={handleAudioUpload}
              disabled={isGenerating}
            />
            {audio && <p>✅ Audio ready</p>}
          </div>

          <div className="upload-group">
            <label>🎬 Aspect Ratio:</label>
            <select 
              value={aspectRatio} 
              onChange={(e) => setAspectRatio(e.target.value)}
              disabled={isGenerating}
            >
              <option value="16:9">16:9 (Landscape)</option>
              <option value="9:16">9:16 (Portrait)</option>
            </select>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={!image || !audio || isGenerating}
            className="generate-btn"
          >
            {isGenerating ? '⏳ Generating...' : '🚀 Generate Video'}
          </button>
        </div>

        {isGenerating && (
          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p>{progress}% Complete</p>
          </div>
        )}

        {message && (
          <div className="message">
            <p>{message}</p>
          </div>
        )}

        {resultVideo && (
          <div className="result-section">
            <h3>🎉 Your Generated Video:</h3>
            <video 
              src={resultVideo} 
              controls 
              width="400"
              style={{ maxWidth: '100%' }}
            >
              Your browser does not support video playback.
            </video>
            <br />
            <a 
              href={resultVideo} 
              download="talkflair-video.mp4"
              className="download-btn"
            >
              📥 Download Video
            </a>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;                                                                                                                                                                                                                                                                                                                                                                                           
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
