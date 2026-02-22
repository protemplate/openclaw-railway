# SearXNG Web Search (Railway)

You have access to a SearXNG meta-search engine for web searches. SearXNG is **already running** as a separate Railway service — no installation, Docker setup, or configuration is needed.

## How to Search

Read the `SEARXNG_URL` environment variable to get the base URL, then make HTTP requests to the JSON API:

```
GET ${SEARXNG_URL}/search?q=YOUR_QUERY&format=json
```

### Example: Basic Web Search

```bash
curl "${SEARXNG_URL}/search?q=railway+deployment+best+practices&format=json"
```

### Example: Search with Category

```bash
# Search only IT-related results
curl "${SEARXNG_URL}/search?q=docker+compose+volumes&format=json&categories=it"

# Search for images
curl "${SEARXNG_URL}/search?q=architecture+diagram&format=json&categories=images"
```

### Example: Search with Language

```bash
curl "${SEARXNG_URL}/search?q=kubernetes+tutorial&format=json&language=en"
```

## Response Format

The JSON response contains a `results` array. Each result has:

- `title` — Page title
- `url` — Direct link to the page
- `content` — Text snippet / description
- `engine` — Which search engine provided this result
- `category` — Result category (general, it, images, etc.)

### Example Response

```json
{
  "query": "railway deployment",
  "results": [
    {
      "title": "Railway Documentation",
      "url": "https://docs.railway.com",
      "content": "Railway is an infrastructure platform...",
      "engine": "google",
      "category": "general"
    }
  ]
}
```

## Important Notes

- **Do NOT** attempt to install SearXNG, run Docker commands, or configure SearXNG — it is already deployed and running.
- **Do NOT** use `localhost` or `127.0.0.1` — SearXNG runs on a separate Railway service accessible via private networking.
- Always read `$SEARXNG_URL` from the environment to get the correct address.
- The `format=json` query parameter is **required** — without it, SearXNG returns HTML.
- No authentication is needed. The SearXNG service is on Railway's private network.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Connection refused | SearXNG service not running | Check Railway dashboard — the SearXNG service may need a redeploy |
| Empty results | Query too specific | Try broader search terms or remove category filter |
| `SEARXNG_URL` is empty | Environment variable not set | Check Railway service variables — `SEARXNG_URL` should reference the SearXNG service |
