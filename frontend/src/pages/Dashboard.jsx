import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import TenderList from '../components/TenderList';
import TenderDetail from '../components/TenderDetail';
import './Dashboard.css';

const API_BASE = process.env.REACT_APP_API_URL || '';

const FILTERS = [
  { label: 'All Tenders', value: 'all' },
  { label: 'High Relevance', value: 'high' },
  { label: 'Medium Relevance', value: 'medium' },
  { label: 'Low Relevance', value: 'low' },
];

function Dashboard() {
  const [tenders, setTenders] = useState([]);
  const [filteredTenders, setFilteredTenders] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, high: 0, medium: 0, low: 0 });

  const fetchTenders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/api/tenders`);
      const data = res.data?.data || [];
      const analyzed = await Promise.all(
        data.map(async (tender) => {
          try {
            const r = await axios.post(`${API_BASE}/api/tenders/analyze`, { url: tender.url });
            return { ...tender, ...r.data?.data };
          } catch {
            return tender;
          }
        })
      );
      setTenders(analyzed);
      updateStats(analyzed);
    } catch (err) {
      setError('Failed to load tenders. Make sure the backend server is running on port 5000.');
      setTenders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  useEffect(() => {
    applyFilters(tenders, activeFilter, searchQuery);
  }, [tenders, activeFilter, searchQuery]);

  function updateStats(data) {
    const stats = { total: data.length, high: 0, medium: 0, low: 0 };
    data.forEach((t) => {
      const score = t.analysis?.score ?? 0;
      if (score >= 70) stats.high++;
      else if (score >= 40) stats.medium++;
      else if (score >= 15) stats.low++;
    });
    setStats(stats);
  }

  function applyFilters(data, filter, query) {
    let result = [...data];
    if (filter === 'high') result = result.filter((t) => (t.analysis?.score ?? 0) >= 70);
    else if (filter === 'medium')
      result = result.filter((t) => {
        const s = t.analysis?.score ?? 0;
        return s >= 40 && s < 70;
      });
    else if (filter === 'low')
      result = result.filter((t) => {
        const s = t.analysis?.score ?? 0;
        return s >= 15 && s < 40;
      });

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.organization?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => (b.analysis?.score ?? 0) - (a.analysis?.score ?? 0));
    setFilteredTenders(result);
  }

  async function handleSelectTender(tender) {
    setDetailLoading(true);
    setSelectedTender({ ...tender });
    try {
      const res = await axios.get(`${API_BASE}/api/tenders/${tender.id}`);
      setSelectedTender(res.data?.data || tender);
    } catch {
      setSelectedTender(tender);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleAnalyzeUrl(url) {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/api/tenders/analyze`, { url });
      const result = res.data?.data;
      if (result) {
        setSelectedTender(result);
      }
    } catch (err) {
      setError('Failed to analyze URL. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard">
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total Tenders</span>
        </div>
        <div className="stat-card high">
          <span className="stat-number">{stats.high}</span>
          <span className="stat-label">High Relevance</span>
        </div>
        <div className="stat-card medium">
          <span className="stat-number">{stats.medium}</span>
          <span className="stat-label">Medium Relevance</span>
        </div>
        <div className="stat-card low">
          <span className="stat-number">{stats.low}</span>
          <span className="stat-label">Low Relevance</span>
        </div>
      </div>

      <SearchBar
        onSearch={setSearchQuery}
        onAnalyzeUrl={handleAnalyzeUrl}
        loading={loading}
      />

      <div className="filter-row">
        <div className="filter-buttons">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`filter-btn ${activeFilter === f.value ? 'active' : ''}`}
              onClick={() => setActiveFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button className="refresh-btn" onClick={fetchTenders} disabled={loading}>
          {loading ? '⟳ Refreshing...' : '⟳ Refresh'}
        </button>
      </div>

      <div className="results-count">
        {!loading && (
          <p>
            Showing <strong>{filteredTenders.length}</strong> of{' '}
            <strong>{tenders.length}</strong> tenders
          </p>
        )}
      </div>

      <TenderList
        tenders={filteredTenders}
        onSelectTender={handleSelectTender}
        loading={loading}
        error={error}
      />

      {selectedTender && (
        <TenderDetail
          tender={selectedTender}
          onClose={() => setSelectedTender(null)}
          loading={detailLoading}
        />
      )}
    </div>
  );
}

export default Dashboard;
