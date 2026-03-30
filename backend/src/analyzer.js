const { MICROSOFT_KEYWORDS } = require('./utils/keywords');

function analyzeTender(tenderData) {
  const { title = '', description = '', fullText = '', category = '' } = tenderData;
  const textToAnalyze = `${title} ${description} ${fullText} ${category}`.toLowerCase();

  let score = 0;
  const matchedKeywords = [];

  for (const [group, keywords] of Object.entries(MICROSOFT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (textToAnalyze.includes(keyword.toLowerCase())) {
        const weight = getKeywordWeight(group);
        score += weight;
        matchedKeywords.push({ keyword, group, weight });
      }
    }
  }

  const normalizedScore = Math.min(100, Math.round(score));
  const relevanceLevel = getRelevanceLevel(normalizedScore);

  return {
    score: normalizedScore,
    relevanceLevel,
    matchedKeywords,
    recommendation: getRecommendation(normalizedScore, matchedKeywords),
    opportunities: identifyOpportunities(matchedKeywords),
  };
}

function getKeywordWeight(group) {
  const weights = {
    cloudServices: 15,
    software: 12,
    itServices: 10,
    enterpriseSolutions: 10,
    infrastructure: 8,
    general: 5,
  };
  return weights[group] || 5;
}

function getRelevanceLevel(score) {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 15) return 'low';
  return 'none';
}

function getRecommendation(score, matchedKeywords) {
  if (score >= 70) {
    return 'High priority opportunity. Immediate action recommended. Microsoft solutions are directly relevant.';
  }
  if (score >= 40) {
    return 'Medium priority opportunity. Review tender details. Microsoft solutions may be applicable.';
  }
  if (score >= 15) {
    return 'Low priority. Monitor this tender. Some Microsoft solutions could be relevant.';
  }
  return 'Low relevance to Microsoft solutions at this time.';
}

function identifyOpportunities(matchedKeywords) {
  const opportunities = new Set();
  for (const { group } of matchedKeywords) {
    switch (group) {
      case 'cloudServices':
        opportunities.add('Azure Cloud Services');
        break;
      case 'software':
        opportunities.add('Microsoft 365 / Office Licensing');
        break;
      case 'itServices':
        opportunities.add('Microsoft Consulting & Professional Services');
        break;
      case 'enterpriseSolutions':
        opportunities.add('Dynamics 365 / Enterprise Solutions');
        break;
      case 'infrastructure':
        opportunities.add('Azure Infrastructure / Server Solutions');
        break;
    }
  }
  return Array.from(opportunities);
}

module.exports = { analyzeTender };
