import fs from "node:fs/promises";
import path from "node:path";
import dailyReadings from "../netlify/functions/daily-readings.js";

const outputDir = path.resolve("_site/data");
await fs.mkdir(outputDir, { recursive: true });

const readingsResponse = await dailyReadings();
const readings = await readingsResponse.json();
if (!readingsResponse.ok || readings.error || !readings.epistle?.arabic || !readings.gospel?.arabic) {
  throw new Error("OLM daily readings could not be generated: " + (readings.error || "Required readings are missing."));
}
await fs.writeFile(path.join(outputDir, "daily-readings.json"), JSON.stringify(readings, null, 2) + "\n", "utf8");

const beirutDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Beirut",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
}).format(new Date());

const explanationPath = path.resolve("data/gospel-explanation.json");
await fs.mkdir(path.dirname(explanationPath), { recursive: true });

let savedExplanation = null;
try {
  savedExplanation = JSON.parse(await fs.readFile(explanationPath, "utf8"));
} catch {}

if (savedExplanation?.date !== beirutDate && readings.date === beirutDate) {
  try {
    if (!readings.gospel?.english || !readings.gospel?.arabic) {
      throw new Error("Both Gospel language texts are required before generating an explanation.");
    }

    const prompt = `/no_think
You are preparing a careful, accessible daily Gospel reflection for Verbum Dei, a bilingual Christian Scripture website serving readers from Catholic, Eastern Orthodox, and Maronite backgrounds.

Use ONLY the Gospel passage and metadata supplied below. Explain what the passage says in simple language. Do not invent events, quotations, historical details, Church rules, or doctrinal claims. Do not claim that an interpretation is universally agreed if Christians may differ. Do not settle disputed theological questions; say briefly when the passage itself does not settle something. Do not present this reflection as official teaching of any Church. Focus on the shared Christian meaning of this particular Gospel.

Write four short sections in English and Arabic, with equivalent meaning in both languages:
- whatHappened: 2-3 simple sentences describing what happens in the passage.
- jesusTeaches: 2-3 simple sentences explaining the main message grounded in the passage.
- liveToday: 1-2 practical, gentle ways a person can live this message today.
- prayer: a short original prayer inspired by the passage, not presented as a traditional or official liturgical prayer.

Keep each section concise, warm, respectful, and understandable to a young reader. Avoid preaching, guilt, invented certainty, and denominational arguments. Return ONLY valid JSON with this exact shape:
{"english":{"whatHappened":"...","jesusTeaches":"...","liveToday":"...","prayer":"..."},"arabic":{"whatHappened":"...","jesusTeaches":"...","liveToday":"...","prayer":"..."}}

Date: ${beirutDate}
Liturgical day: ${readings.liturgicalDay || "Not supplied"}
OLM Gospel reference: ${readings.gospel.reference}
English Gospel text: ${readings.gospel.english}
Arabic Gospel text: ${readings.gospel.arabic}`;

    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: "qwen3:4b",
        prompt,
        stream: false,
        format: "json",
        options: { temperature: 0.2, num_predict: 1800 }
      })
    });
    if (!response.ok) throw new Error("Local model returned HTTP " + response.status);
    const result = await response.json();
    const generated = JSON.parse(result.response || "{}");
    const required = ["whatHappened", "jesusTeaches", "liveToday", "prayer"];
    for (const language of ["english", "arabic"]) {
      for (const field of required) {
        if (typeof generated[language]?.[field] !== "string" || !generated[language][field].trim()) {
          throw new Error("The model returned an incomplete " + language + " explanation.");
        }
      }
    }

    savedExplanation = {
      date: beirutDate,
      gospelReference: readings.gospel.reference,
      model: "Qwen3 4B · locally run",
      generatedAt: new Date().toISOString(),
      english: Object.fromEntries(required.map(key => [key, generated.english[key].trim()])),
      arabic: Object.fromEntries(required.map(key => [key, generated.arabic[key].trim()]))
    };
    await fs.writeFile(explanationPath, JSON.stringify(savedExplanation, null, 2) + "\n", "utf8");
    console.log("Generated and saved today's bilingual Gospel explanation.");
  } catch (error) {
    console.warn("Today's Gospel explanation was not generated; the readings site will still build:", error.message);
    savedExplanation = null;
  }
}

if (savedExplanation?.date === beirutDate && readings.date === beirutDate) {
  await fs.copyFile(explanationPath, path.join(outputDir, "gospel-explanation.json"));
}


const botDataSource = await fs.readFile("botData.js", "utf8");
const refsMatch = botDataSource.match(/randomVerses:\s*(\[[\s\S]*?\])/);
if (!refsMatch) throw new Error("Could not find random Bible references in botData.js.");
const references = JSON.parse(refsMatch[1]);

async function getPassage(reference, bible) {
  const url = new URL("https://api.biblesupersearch.com/api");
  url.searchParams.set("bible", bible);
  url.searchParams.set("reference", reference);
  url.searchParams.set("data_format", "minimal");
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error("Bible API returned " + response.status);
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(payload.errors.join("; "));
  const verses = payload.results?.[bible];
  if (!Array.isArray(verses) || !verses.length) throw new Error("No verses returned for " + reference);
  return verses.map(v => v.text || "").join(" ");
}

const verses = {};
for (const reference of references) {
  const [english, arabic] = await Promise.allSettled([
    getPassage(reference, "web"),
    getPassage(reference, "svd")
  ]);
  verses[reference] = {
    english: english.status === "fulfilled" ? english.value : "",
    arabic: arabic.status === "fulfilled" ? arabic.value : ""
  };
}
await fs.writeFile(path.join(outputDir, "bible-verses.json"), JSON.stringify({ generatedAt: new Date().toISOString(), verses }, null, 2) + "\n", "utf8");
console.log("Generated OLM readings and " + references.length + " bilingual Bible verse entries.");
