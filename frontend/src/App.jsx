import { useState } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expiryDays, setExpiryDays] = useState(50);

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
    setStats(null);
    setCopied(false);

    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a URL');
      return;
    }
    if (!isValidUrl(trimmed)) {
      setError('Enter a valid URL starting with http:// or https://');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/shorten`, {
          method: 'POST',
        headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         originalUrl: trimmed,
         expiryDays,
       }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Server error (${res.status})`);
      }
      const data = await res.text();
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

  const fetchStats = async () => {
    setLoadingStats(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/stats/${shortCode}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStats(data);
    } catch {
      setError('Failed to load stats');
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-icon">
          <LinkIcon />
        </div>
        <h1>LinkShrink</h1>
        <p className="subtitle">Paste a long URL and instantly get a short, shareable link</p>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <div className="input-group">
          <div className="input-wrapper">
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
            <input
              type="number"
              min="1"
              max="100"
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
            />
            <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Shortening…' : 'Shorten'}
          </button>
        </div>
      </form>

      {error && (
        <div className="message error" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {shortUrl && (
        <div className="card">
          <div className="card-header">Your shortened URL</div>
          <div className="card-body">
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
              className={`btn-primary ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={fetchStats}
              disabled={loadingStats}
            >
              {loadingStats ? <div className="spinner" /> : <BarChartIcon />}
              {stats ? 'Refresh' : 'Stats'}
            </button>
          </div>
        </div>
      )}

      {stats && (
        <div className="card" style={{ animationDelay: '0.1s' }}>
          <div className="card-header">Click Analytics</div>
          <div className="stats-grid">
            <div className="stat">
              <div className="stat-value">{stats['Total clicks: '] ?? stats.totalClicks ?? 0}</div>
              <div className="stat-label">Total Clicks</div>
            </div>
            <div className="stat">
              <div className="stat-value">{stats['Unique visitors: '] ?? stats.uniqueVisitors ?? 0}</div>
              <div className="stat-label">Unique Visitors</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
