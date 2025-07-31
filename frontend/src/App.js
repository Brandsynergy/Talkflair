import React, { useState } from 'react';

function App() {
  const [message, setMessage] = useState('TALKFLAIR is loading...');

  // Test backend connection
  React.useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setMessage('✅ TALKFLAIR Backend Connected: ' + data.message);
      })
      .catch(err => {
        setMessage('❌ Backend Connection Failed: ' + err.message);
      });
  }, []);

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      color: 'white',
      minHeight: '100vh',
      padding: '40px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{
        fontSize: '4rem',
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '20px'
      }}>
        🎭 TALKFLAIR
      </h1>
      
      <p style={{
        fontSize: '1.5rem',
        marginBottom: '40px',
        color: '#cccccc'
      }}>
        Professional AI Lip-Sync Generator
      </p>

      <div style={{
        background: '#2d2d2d',
        padding: '30px',
        borderRadius: '15px',
        maxWidth: '600px',
        margin: '0 auto',
        marginBottom: '30px'
      }}>
        <h2 style={{color: '#4ecdc4', marginBottom: '20px'}}>System Status</h2>
        <p style={{
          fontSize: '1.2rem',
          padding: '15px',
          background: '#1a1a1a',
          borderRadius: '8px',
          border: '2px solid #4ecdc4'
        }}>
          {message}
        </p>
      </div>

      <div style={{
        background: '#2d2d2d',
        padding: '30px',
        borderRadius: '15px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h3 style={{color: '#ff6b6b', marginBottom: '20px'}}>🚀 Coming Soon</h3>
        <p style={{fontSize: '1.1rem', lineHeight: '1.6'}}>
          Full AI lip-sync interface will be available once backend connection is confirmed.
          <br /><br />
          <strong>Features:</strong>
          <br />• Upload images and audio
          <br />• Generate professional lip-sync videos
          <br />• Powered by Hedra Character-2 AI
          <br />• 2-3 minute generation time
        </p>
      </div>
    </div>
  );
}

export default App;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
