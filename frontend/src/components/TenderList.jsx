import React from 'react';
import './TenderList.css';

function ScoreBadge({ score }) {
  const level = score >= 70 ? 'high' : score >= 40 ? 'medium' : score >= 15 ? 'low' : 'none';
  const labels = { high: 'High', medium: 'Medium', low: 'Low', none: 'None' };
  return (
    <span className={`score-badge score-${level}`}>
      {score} – {labels[level]}
    </span>
  );
}

function TenderList({ tenders, onSelectTender, loading, error }) {
  if (loading) {
    return (
      <div className="tender-list-status">
        <div className="spinner" />
        <p>Loading tenders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tender-list-status error">
        <span>⚠️</span>
        <p>{error}</p>
      </div>
    );
  }

  if (!tenders || tenders.length === 0) {
    return (
      <div className="tender-list-status">
        <span>📋</span>
        <p>No tenders found.</p>
      </div>
    );
  }

  return (
    <div className="tender-list">
      {tenders.map((tender) => {
        const score = tender.analysis?.score ?? null;
        return (
          <div
            key={tender.id || tender.url}
            className="tender-card"
            onClick={() => onSelectTender(tender)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && onSelectTender(tender)}
          >
            <div className="tender-card-header">
              <h3 className="tender-title">{tender.title}</h3>
              {score !== null && <ScoreBadge score={score} />}
            </div>
            <div className="tender-card-meta">
              <span className="meta-item">🏢 {tender.organization}</span>
              <span className="meta-item">📅 {tender.date}</span>
              <span className="meta-item category-tag">{tender.category}</span>
            </div>
            {tender.description && (
              <p className="tender-description">
                {tender.description.substring(0, 180)}
                {tender.description.length > 180 ? '...' : ''}
              </p>
            )}
            {tender.analysis?.opportunities?.length > 0 && (
              <div className="opportunity-tags">
                {tender.analysis.opportunities.map((opp) => (
                  <span key={opp} className="opportunity-tag">
                    {opp}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default TenderList;
