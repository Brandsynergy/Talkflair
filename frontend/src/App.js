import React, { useState } from 'react';

function App() {
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultVideo, setResultVideo] = useState(null);
  const [message, setMessage] = useState('Welcome to TALKFLAIR!');

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
            setTimeout(pollStatus, 5000);
          }
        } catch (error) {
          setMessage('Status check error: ' + error.message);
          setTimeout(pollStatus, 10000);
        }
      };

      pollStatus();

    } catch (error) {
      setMessage('Generation error: ' + error.message);
      setIsGenerating(false);
    }
  };

  const appStyle = {
    textAlign: 'center',
    backgroundColor: '#1a1a1a',
    color: 'white',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const headerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px'
  };

  const titleStyle = {
    fontSize: '3rem',
    marginBottom: '10px',
    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  const uploadSectionStyle = {
    background: '#2d2d2d',
    padding: '30px',
    borderRadius: '15px',
    marginBottom: '30px'
  };

  const uploadGroupStyle = {
    marginBottom: '25px',
    textAlign: 'left'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '1.1rem',
    marginBottom: '8px',
    color: '#ffffff',
    fontWeight: '600'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '2px solid #444',
    borderRadius: '8px',
    background: '#1a1a1a',
    color: 'white',
    fontSize: '1rem'
  };

  const buttonStyle = {
    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
    color: 'white',
    border: 'none',
    padding: '15px 40px',
    fontSize: '1.2rem',
    fontWeight: '600',
    borderRadius: '50px',
    cursor: 'pointer',
    marginTop: '20px'
  };

  const messageStyle = {
    margin: '20px 0',
    padding: '15px',
    background: '#2d2d2d',
    borderRadius: '8px',
    borderLeft: '4px solid #4ecdc4'
  };

  const progressStyle = {
    width: '100%',
    height: '20px',
    background: '#444',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '10px'
  };

  const progressFillStyle = {
    height: '100%',
    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
    width: `${progress}%`,
    transition: 'width 0.5s ease'
  };

  return (
    <div style={appStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>🎭 TALKFLAIR</h1>
        <p style={{fontSize: '1.2rem', marginBottom: '40px', color: '#cccccc'}}>
          Professional AI Lip-Sync Generator
        </p>
        
        <div style={uploadSectionStyle}>
          <div style={uploadGroupStyle}>
            <label style={labelStyle}>📸 Upload Image:</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              disabled={isGenerating}
              style={inputStyle}
            />
            {image && <p style={{marginTop: '8px', color: '#4ecdc4'}}>✅ Image ready</p>}
          </div>

          <div style={uploadGroupStyle}>
            <label style={labelStyle}>🎵 Upload Audio:</label>
            <input 
              type="file" 
              accept="audio/*" 
              onChange={handleAudioUpload}
              disabled={isGenerating}
              style={inputStyle}
            />
            {audio && <p style={{marginTop: '8px', color: '#4ecdc4'}}>✅ Audio ready</p>}
          </div>

          <div style={uploadGroupStyle}>
            <label style={labelStyle}>🎬 Aspect Ratio:</label>
            <select 
              value={aspectRatio} 
              onChange={(e) => setAspectRatio(e.target.value)}
              disabled={isGenerating}
              style={inputStyle}
            >
              <option value="16:9">16:9 (Landscape)</option>
              <option value="9:16">9:16 (Portrait)</option>
            </select>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={!image || !audio || isGenerating}
            style={{
              ...buttonStyle,
              opacity: (!image || !audio || isGenerating) ? 0.6 : 1,
              cursor: (!image || !audio || isGenerating) ? 'not-allowed' : 'pointer'
            }}
          >
            {isGenerating ? '⏳ Generating...' : '🚀 Generate Video'}
          </button>
        </div>

        {isGenerating && (
          <div style={{margin: '30px 0', padding: '20px', background: '#2d2d2d', borderRadius: '10px'}}>
            <div style={progressStyle}>
              <div style={progressFillStyle}></div>
            </div>
            <p>{progress}% Complete</p>
          </div>
        )}

        {message && (
          <div style={messageStyle}>
            <p style={{margin: 0}}>{message}</p>
          </div>
        )}

        {resultVideo && (
          <div style={{marginTop: '40px', padding: '30px', background: '#2d2d2d', borderRadius: '15px'}}>
            <h3 style={{color: '#4ecdc4', marginBottom: '20px'}}>🎉 Your Generated Video:</h3>
            <video 
              src={resultVideo} 
              controls 
              width="400"
              style={{maxWidth: '100%', borderRadius: '10px', marginBottom: '20px'}}
            >
              Your browser does not support video playback.
            </video>
            <br />
            <a 
              href={resultVideo} 
              download="talkflair-video.mp4"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(45deg, #4ecdc4, #45b7aa)',
                color: 'white',
                textDecoration: 'none',
                padding: '12px 30px',
                borderRadius: '25px',
                fontWeight: '600'
              }}
            >
              📥 Download Video
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
