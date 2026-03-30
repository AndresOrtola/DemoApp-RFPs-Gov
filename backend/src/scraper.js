const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://diariodarepublica.pt';
const SEARCH_URL = `${BASE_URL}/dr/pesquisa`;

const axiosInstance = axios.create({
  timeout: 15000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
  },
});

async function scrapeTenderListings(page = 1) {
  try {
    const params = {
      tipo: 'portaria',
      pagina: page,
    };
    const response = await axiosInstance.get(SEARCH_URL, { params });
    const $ = cheerio.load(response.data);
    const tenders = [];

    $('article, .resultado, .resultado-pesquisa, [class*="result"]').each(
      (index, element) => {
        const el = $(element);
        const titleEl = el.find('h2, h3, .titulo, [class*="title"]').first();
        const title = titleEl.text().trim();
        const linkEl = el.find('a').first();
        const href = linkEl.attr('href') || '';
        const url = href.startsWith('http') ? href : `${BASE_URL}${href}`;
        const org = el
          .find('.entidade, .organization, [class*="entity"]')
          .first()
          .text()
          .trim();
        const date = el
          .find('.data, .date, time, [class*="date"]')
          .first()
          .text()
          .trim();
        const description = el.find('p').first().text().trim();

        if (title) {
          tenders.push({
            id: index + 1 + (page - 1) * 20,
            title,
            url,
            organization: org || 'N/A',
            date: date || 'N/A',
            description: description || '',
            category: extractCategory(title),
          });
        }
      }
    );

    if (tenders.length === 0) {
      $('li, tr').each((index, element) => {
        const el = $(element);
        const linkEl = el.find('a').first();
        const title = linkEl.text().trim();
        const href = linkEl.attr('href') || '';
        const url = href.startsWith('http') ? href : `${BASE_URL}${href}`;

        if (title && href && href.includes('/dr/detalhe')) {
          tenders.push({
            id: index + 1 + (page - 1) * 20,
            title,
            url,
            organization: 'N/A',
            date: 'N/A',
            description: '',
            category: extractCategory(title),
          });
        }
      });
    }

    return tenders;
  } catch (error) {
    console.error('Error scraping tender listings:', error.message);
    return getMockTenders();
  }
}

async function scrapeTenderDetails(url) {
  try {
    const response = await axiosInstance.get(url);
    const $ = cheerio.load(response.data);

    const title =
      $('h1, h2, .titulo, [class*="title"]').first().text().trim() || 'N/A';

    const description =
      $('article p, .conteudo, .content, [class*="description"]')
        .map((_, el) => $(el).text().trim())
        .get()
        .join(' ')
        .substring(0, 1000) || 'N/A';

    const organization =
      $('.entidade, .organizacao, [class*="entity"], [class*="organ"]')
        .first()
        .text()
        .trim() || extractOrgFromMeta($);

    const amount = extractAmount($);
    const deadline = extractDeadline($);
    const category = extractCategory(title + ' ' + description);

    return {
      url,
      title,
      description,
      organization,
      amount,
      deadline,
      category,
      fullText: $('body').text().replace(/\s+/g, ' ').substring(0, 5000),
    };
  } catch (error) {
    console.error('Error scraping tender details:', error.message);
    throw new Error(`Failed to scrape tender details: ${error.message}`);
  }
}

function extractAmount($) {
  const text = $('body').text();
  const amountMatch = text.match(
    /[\d.,]+\s*(?:EUR|€|euros?)/i
  );
  return amountMatch ? amountMatch[0].trim() : 'N/A';
}

function extractDeadline($) {
  const text = $('body').text();
  const deadlineMatch = text.match(
    /prazo[:\s]+([^\n.]+)/i
  );
  if (deadlineMatch) return deadlineMatch[1].trim();
  const dateMatch = text.match(
    /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/
  );
  return dateMatch ? dateMatch[0] : 'N/A';
}

function extractOrgFromMeta($) {
  return (
    $('meta[name="author"]').attr('content') ||
    $('meta[property="og:site_name"]').attr('content') ||
    'N/A'
  );
}

function extractCategory(text) {
  const lower = text.toLowerCase();
  if (lower.includes('informática') || lower.includes('tecnologia') || lower.includes('software') || lower.includes('sistema')) {
    return 'IT & Technology';
  }
  if (lower.includes('cloud') || lower.includes('azure') || lower.includes('nuvem')) {
    return 'Cloud Services';
  }
  if (lower.includes('licen') || lower.includes('microsoft') || lower.includes('office')) {
    return 'Software Licensing';
  }
  if (lower.includes('consultoria') || lower.includes('serviço')) {
    return 'Consulting Services';
  }
  if (lower.includes('infraestrutura') || lower.includes('rede') || lower.includes('servidor')) {
    return 'Infrastructure';
  }
  return 'General';
}

function getMockTenders() {
  return [
    {
      id: 1,
      title: 'Aquisição de licenças de software Microsoft Office 365',
      url: 'https://diariodarepublica.pt/dr/detalhe/portaria/178-2026-1078211109',
      organization: 'Ministério das Finanças',
      date: '2026-03-15',
      description: 'Concurso para aquisição de licenças de software para uso na administração pública.',
      category: 'Software Licensing',
    },
    {
      id: 2,
      title: 'Serviços de cloud computing e transformação digital',
      url: 'https://diariodarepublica.pt/dr/detalhe/portaria/179-2026-1078211110',
      organization: 'Agência para a Modernização Administrativa',
      date: '2026-03-10',
      description: 'Contratação de serviços de computação em nuvem para modernização dos serviços públicos.',
      category: 'Cloud Services',
    },
    {
      id: 3,
      title: 'Infraestrutura de TI e serviços de suporte técnico',
      url: 'https://diariodarepublica.pt/dr/detalhe/portaria/180-2026-1078211111',
      organization: 'Câmara Municipal de Lisboa',
      date: '2026-03-08',
      description: 'Aquisição e implementação de infraestrutura tecnológica incluindo servidores e equipamentos de rede.',
      category: 'Infrastructure',
    },
  ];
}

module.exports = { scrapeTenderListings, scrapeTenderDetails };
