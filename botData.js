<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Catholic Bible & Daily Readings Bot</title>
  <style>
    :root {
      --bg-color: #0b0f19;
      --card-bg: #131c2e;
      --text-main: #f1f5f9;
      --text-muted: #94a3b8;
      --accent: #d97706; /* Liturgical Gold */
      --accent-hover: #b45309;
      --secondary: #38bdf8;
      --border: #1e293b;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      margin: 0;
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      box-sizing: border-box;
    }

    .container {
      width: 100%;
      max-width: 750px;
    }

    .card {
      background-color: var(--card-bg);
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      border: 1px solid var(--border);
    }

    h1 {
      font-size: 24px;
      margin-top: 0;
      color: var(--accent);
      text-align: center;
      margin-bottom: 8px;
    }

    .subtitle {
      text-align: center;
      color: var(--text-muted);
      font-size: 14px;
      margin-bottom: 25px;
    }

    .button-group {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      margin-bottom: 25px;
    }

    @media(min-width: 500px) {
      .button-group {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    button {
      background-color: var(--accent);
      color: #ffffff;
      border: none;
      padding: 12px 15px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.2s, transform 0.1s;
    }

    button:hover {
      background-color: var(--accent-hover);
    }

    button:active {
      transform: scale(0.98);
    }

    .output-box {
      background-color: #080c14;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 20px;
      min-height: 250px;
      max-height: 480px;
      overflow-y: auto;
      white-space: pre-wrap;
      line-height: 1.7;
      font-size: 15px;
      color: #e2e8f0;
      direction: rtl; /* Supports proper Arabic text layout */
      text-align: right;
    }

    .output-box.ltr {
      direction: ltr;
      text-align: left;
    }

    .placeholder {
      color: var(--text-muted);
      text-align: center;
      margin-top: 80px;
      font-style: italic;
    }
  </style>
</head>
<body>

  <div class="container">
    <div class="card">
      <h1>✝️ Catholic Bible & Daily Readings</h1>
      <div class="subtitle">Your 24/7 Spiritual Web Companion • Maronite Liturgical Calendar</div>
      
      <div class="button-group">
        <button onclick="handleDailyReading()">📅 Today's Reading (.test)</button>
        <button onclick="handleRandomVerse()">📖 Random Verse (.verse)</button>
        <button onclick="handleMessageFromGod()">❤️ Message From God</button>
      </div>

      <div id="output" class="output-box placeholder">
        اختر زرًا من الأعلى لعرض القراءات والآيات المقدسة...<br>Select an option above to load scripture and reflections.
      </div>
    </div>
  </div>

  <script src="botData.js"></script>
</body>
</html>
