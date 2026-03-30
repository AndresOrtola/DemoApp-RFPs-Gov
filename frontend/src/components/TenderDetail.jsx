import React from 'react';
import './TenderDetail.css';

function ScoreGauge({ score }) {
  const level = score >= 70 ? 'high' : score >= 40 ? 'medium' : score >= 15 ? 'low' : 'none';
  const colors = { high: '#28a745', medium: '#ffc107', low: '#17a2b8', none: '#6c757d' };
  return (
    <div className="score-gauge">
      <div className="gauge-bar-bg">
        <div
          className="gauge-bar-fill"
          style={{ width: `${score}%`, background: colors[level] }}
        />
      </div>
      <span className="gauge-score" style={{ color: colors[level] }}>
        {score} / 100
      </span>
    </div>
  );
}

function TenderDetail({ tender, onClose, loading }) {
  if (loading) {
    return (
      <div className="tender-detail-overlay">
        <div className="tender-detail-modal">
          <div className="detail-loading">
            <div className="spinner" />
            <p>Loading tender details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tender) return null;

  const { title, organization, date, amount, deadline, category, description, url, analysis } = tender;

  return (
    <div className="tender-detail-overlay" onClick={onClose}>
      <div className="tender-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <h2>{title || 'Tender Details'}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="detail-body">
          <div className="detail-meta-grid">
            {organization && organization !== 'N/A' && (
              <div className="meta-block">
                <label>Organization</label>
                <span>{organization}</span>
              </div>
            )}
            {amount && amount !== 'N/A' && (
              <div className="meta-block">
                <label>Amount</label>
                <span>{amount}</span>
              </div>
            )}
            {(deadline && deadline !== 'N/A') && (
              <div className="meta-block">
                <label>Deadline</label>
                <span>{deadline}</span>
              </div>
            )}
            {date && date !== 'N/A' && (
              <div className="meta-block">
                <label>Date</label>
                <span>{date}</span>
              </div>
            )}
            {category && (
              <div className="meta-block">
                <label>Category</label>
                <span>{category}</span>
              </div>
            )}
          </div>

          {description && description !== 'N/A' && (
            <div className="detail-section">
              <h3>Description</h3>
              <p>{description}</p>
            </div>
          )}

          {analysis && (
            <div className="detail-section analysis-section">
              <h3>🎯 Microsoft Relevance Analysis</h3>
              <ScoreGauge score={analysis.score} />
              <p className="recommendation">{analysis.recommendation}</p>

              {analysis.opportunities?.length > 0 && (
                <div className="opportunities">
                  <h4>Identified Opportunities</h4>
                  <div className="opportunity-list">
                    {analysis.opportunities.map((opp) => (
                      <span key={opp} className="opp-tag">{opp}</span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.matchedKeywords?.length > 0 && (
                <div className="matched-keywords">
                  <h4>Matched Keywords ({analysis.matchedKeywords.length})</h4>
                  <div className="keyword-list">
                    {analysis.matchedKeywords.map(({ keyword, group }) => (
                      <span key={`${keyword}-${group}`} className="keyword-tag">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {url && (
            <div className="detail-footer">
              <a href={url} target="_blank" rel="noopener noreferrer" className="source-link">
                View on Diário da República ↗
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TenderDetail;
