# Verbum Dei — Catholic Bible Companion

A traditional Catholic-themed bilingual Bible website for Netlify.

## Included

- Traditional parchment, burgundy and gold design
- English and Arabic display modes
- Random Bible verses with complete WEB and Smith & Van Dyke text
- Daily Maronite readings sourced from the OLM liturgical calendar
- Epistle, Gospel and liturgical color display
- Faith-inspired daily reflections
- Settings for language, text size and theme
- Netlify Functions to keep API requests server-side

## Deploy to Netlify

1. Download and unzip the project.
2. Upload the project files to your GitHub repository, replacing the old `index.html` and `botData.js` and adding the new files/folders.
3. Make sure the Netlify site is connected to that GitHub repository.
4. In Netlify, open **Site configuration → Build & deploy → Build settings**.
5. Set the publish directory to `.` (or leave it to read `netlify.toml`) and make sure the functions directory is `netlify/functions`.
6. Trigger a deploy.

No API key or environment variables are required for the included public endpoints.

## Test locally

Requires Node.js 18 or later.

```bash
npm install
npm run dev
```

Netlify CLI will show a local URL. Use that URL rather than opening `index.html` directly, because the API functions need Netlify's local function runtime.

## Important notes

- Bible text is retrieved from Bible SuperSearch using the World English Bible (`web`) and Smith & Van Dyke (`svd`) modules. Bible SuperSearch documents a free API limit of 1,000 hits/day and non-commercial usage terms. Check its current terms before public or commercial use.
- The daily readings function fetches the OLM Arabic liturgical-calendar page and attempts to identify the Epistle, Gospel and liturgical color. It maps common Arabic book abbreviations to English Bible references to retrieve the full text. If OLM changes its page structure or uses an abbreviation not in the map, that reading may show a reference without full text; check the Netlify function logs and update the parser/mapping.
- This starter project does not store visitor data or require accounts.
- The reflections are general faith-inspired reflections, not quotations from Scripture or official Church teaching.
