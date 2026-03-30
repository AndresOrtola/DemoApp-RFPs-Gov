# Tender Analyzer - Backend

Node.js/Express backend for scraping and analyzing Portuguese government tenders from [Diário da República](https://diariodarepublica.pt/dr/pesquisa).

## Setup

```bash
npm install
cp .env.example .env
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tenders` | List all tenders (paginated) |
| GET | `/api/tenders/:id` | Get tender details by ID |
| GET | `/api/tenders/microsoft-relevant` | Get high-relevance tenders |
| POST | `/api/tenders/analyze` | Analyze a tender URL |

### POST /api/tenders/analyze

```json
{
  "url": "https://diariodarepublica.pt/dr/detalhe/portaria/178-2026-1078211109"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
