const express = require('express');
const router = express.Router();
const { scrapeTenderListings, scrapeTenderDetails } = require('../scraper');
const { analyzeTender } = require('../analyzer');

let cachedTenders = [];

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const tenders = await scrapeTenderListings(page);
    cachedTenders = tenders;
    res.json({ success: true, data: tenders, total: tenders.length, page });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/microsoft-relevant', async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 30;
    let tenders = cachedTenders.length > 0 ? cachedTenders : await scrapeTenderListings(1);
    cachedTenders = tenders;

    const analyzed = await Promise.all(
      tenders.map(async (tender) => {
        const analysis = analyzeTender(tender);
        return { ...tender, analysis };
      })
    );

    const relevant = analyzed
      .filter((t) => t.analysis.score >= threshold)
      .sort((a, b) => b.analysis.score - a.analysis.score);

    res.json({ success: true, data: relevant, total: relevant.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }
    const tenderDetails = await scrapeTenderDetails(url);
    const analysis = analyzeTender(tenderDetails);
    res.json({ success: true, data: { ...tenderDetails, analysis } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tender = cachedTenders.find((t) => String(t.id) === String(id));
    if (!tender) {
      return res.status(404).json({ success: false, error: 'Tender not found' });
    }
    const details = await scrapeTenderDetails(tender.url);
    const analysis = analyzeTender(details);
    res.json({ success: true, data: { ...details, id, analysis } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
