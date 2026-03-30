import React from 'react';
import './SearchBar.css';

function SearchBar({ onSearch, onAnalyzeUrl, loading }) {
  const [query, setQuery] = React.useState('');
  const [url, setUrl] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('search');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyzeUrl(url.trim());
    }
  };

  return (
    <div className="search-bar">
      <div className="search-tabs">
        <button
          className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          🔍 Search Tenders
        </button>
        <button
          className={`tab-btn ${activeTab === 'analyze' ? 'active' : ''}`}
          onClick={() => setActiveTab('analyze')}
        >
          🔗 Analyze URL
        </button>
      </div>

      {activeTab === 'search' && (
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search tenders by keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      )}

      {activeTab === 'analyze' && (
        <form className="search-form" onSubmit={handleAnalyze}>
          <input
            type="url"
            placeholder="https://diariodarepublica.pt/dr/detalhe/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn analyze" disabled={loading || !url.trim()}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>
      )}
    </div>
  );
}

export default SearchBar;
