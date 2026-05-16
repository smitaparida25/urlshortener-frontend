import { useState } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [shortCode, setShortCode] = useState('');

  const isValidUrl = (str) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShortUrl('');
    setCopied(false);

    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidUrl(trimmed)) {
      setError('Please enter a valid URL (include http:// or https://)');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: trimmed,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || `Server error (${response.status})`);
      }

      const data = await response.text();
      setShortUrl(data);
      setShortCode(data.split('/').pop());
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

 const handleStats = async () => {
  const res = await fetch(`${API_URL}/stats/${shortCode}`);
   const data = await res.json();
   setStats(data);
 };
 const fetchStats = async () => {
   setLoadingStats(true);
   try {
     const res = await fetch(`${API_URL}/stats/${shortCode}`);
     const data = await res.json();
     setStats(data);
   } catch (err) {
     setError("Failed to load stats");
   } finally {
     setLoadingStats(false);
   }
 };


  return (
    <div className="app">
      <header className="header">
        <h1>LinkShrink</h1>
        <p className="subtitle">Paste a long URL to get a shortened link</p>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError('');
            }}
            placeholder="https://example.com/very-long-url"
            className="input"
            aria-label="URL to shorten"
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            className="button"
            disabled={loading}
          >
            {loading ? 'Shortening…' : 'Shorten'}
          </button>
        </div>
      </form>

      {error && (
        <div className="message error" role="alert">
          {error}
        </div>
      )}

      {shortUrl && (
        <div className="result-card">
          <div className="result-header">Your shortened URL</div>
          <div className="result-body">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="short-url"
            >
              {shortUrl}
            </a>
            <button
              type="button"
              className={`copy-button ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              type="button"
              className="copy-button"
              onClick={fetchStats}
              disabled={loadingStats}
            >
              {stats ? "Refresh Stats" : "View Stats"}
            </button>
          </div>
        </div>
      )}

    {stats && (
      <div className="result-card">
        <p>Total Clicks: {stats["Total clicks: "]}</p>
        <p>Unique Visitors: {stats["Unique visitors: "]}</p>
      </div>
    )}
    </div>
  );
}

export default App;
