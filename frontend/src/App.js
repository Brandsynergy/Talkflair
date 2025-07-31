import React, { useState } from 'react';

function App() {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [audio, setAudio] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultVideo, setResultVideo] = useState(null);
  const [message, setMessage] = useState('✅ TALKFLAIR is ready for uploads!');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      setImageFile(file);
      setMessage('✅ Image uploaded successfully!');
    }
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudio(url);
      setAudioFile(file);
      setMessage('✅ Audio uploaded successfully!');
    }
  };

  const handleGenerate = async () => {
    if (!imageFile || !audioFile) {
      setMessage('❌ Please upload both image and audio files');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setMessage('🚀 Uploading files to AI...');

    try {
      // Create form data
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('audio', audioFile);
      formData.append('aspectRatio', aspectRatio);

      // Start progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 2000);

      setMessage('🎭 AI is generating your lip-sync video...');

      // Call real backend
      const response = await fetch('https://talkflair-backend.onrender.com/api/generate', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      clearInterval(progressInterval);

      if (data.success) {
        setProgress(100);
        setResultVideo(data.videoUrl);
        setMessage('🎉 Video generated successfully! Click to download.');
      } else {
        setMessage('❌ Generation failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadVideo = () => {
    if (resultVideo) {
      const link = document.createElement('a');
      link.href = resultVideo;
      link.download = 'talkflair-video.mp4';
      link.click();
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
            {image && (
              <div style={{marginTop: '10px'}}>
                <p style={{color: '#4ecdc4'}}>✅ Image ready</p>
                <img src={image} alt="Preview" style={{maxWidth: '200px', borderRadius: '8px'}} />
              </div>
            )}
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
            {audio && (
              <div style={{marginTop: '10px'}}>
                <p style={{color: '#4ecdc4'}}>✅ Audio ready</p>
                <audio src={audio} controls style={{width: '100%'}} />
              </div>
            )}
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
            disabled={!imageFile || !audioFile || isGenerating}
            style={{
              ...buttonStyle,
              opacity: (!imageFile || !audioFile || isGenerating) ? 0.6 : 1,
              cursor: (!imageFile || !audioFile || isGenerating) ? 'not-allowed' : 'pointer'
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

        {resultVideo && (
          <div style={{margin: '30px 0', padding: '20px', background: '#2d2d2d', borderRadius: '10px'}}>
            <h3 style={{color: '#4ecdc4'}}>🎉 Your Video is Ready!</h3>
            <video 
              src={resultVideo} 
              controls 
              style={{width: '100%', maxWidth: '400px', borderRadius: '10px'}}
            />
            <br />
            <button 
              onClick={downloadVideo}
              style={{...buttonStyle, marginTop: '15px'}}
            >
              📥 Download Video
            </button>
          </div>
        )}

        <div style={messageStyle}>
          <p style={{margin: 0}}>{message}</p>
        </div>
      </div>
    </div>
  );
}

export default App;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
