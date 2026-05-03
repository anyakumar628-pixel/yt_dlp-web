'use client';

import { useState } from 'react';
import { Search, Download, Youtube, Music, Video, Loader2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [error, setError] = useState(null);

  const fetchInfo = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setVideoInfo(null);
    
    try {
      const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.detail || 'Failed to fetch video info');
      
      setVideoInfo(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            YT-DLP Web
          </h1>
          <p style={{ color: '#888' }}>Download your favorite videos with ease</p>
        </header>

        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Paste YouTube or video link here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchInfo()}
          />
          <button className="btn" onClick={fetchInfo} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
            {loading ? 'Fetching...' : 'Analyze'}
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1.5rem' }}
            >
              {error}
            </motion.div>
          )}

          {videoInfo && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="video-info"
            >
              <div className="thumbnail-container">
                <img src={videoInfo.thumbnail} alt={videoInfo.title} className="thumbnail" />
              </div>
              
              <div>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{videoInfo.title}</h2>
                <div style={{ display: 'flex', gap: '1rem', color: '#888', fontSize: '0.9rem' }}>
                  <span>{videoInfo.uploader}</span>
                  <span>•</span>
                  <span>{Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}</span>
                  <span>•</span>
                  <span>{videoInfo.view_count?.toLocaleString()} views</span>
                </div>
              </div>

              <div className="formats-grid">
                {videoInfo.formats.slice(0, 24).map((format, idx) => (
                  <div key={idx} className="format-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="format-title">{format.resolution}</span>
                      {format.kind === 'both' ? <Video size={16} color="#3b82f6" /> : 
                       format.kind === 'audio' ? <Music size={16} color="#10b981" /> : 
                       <Video size={16} color="#8b5cf6" style={{ opacity: 0.5 }} />}
                    </div>
                    <div className="format-meta">
                      {format.ext.toUpperCase()} • {format.kind.replace('_', ' ')}
                      <br />
                      {format.filesize ? `${(format.filesize / (1024 * 1024)).toFixed(1)} MB` : 'Size Unknown'}
                    </div>
                    <a 
                      href={format.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn" 
                      style={{ padding: '0.5rem', fontSize: '0.8rem', marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
                    >
                      <Download size={14} /> Download
                    </a>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <footer style={{ marginTop: '2rem', color: '#444', fontSize: '0.8rem' }}>
        Powered by yt-dlp & Vercel Python Runtime
      </footer>

      <style jsx global>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
