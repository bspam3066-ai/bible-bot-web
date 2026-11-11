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
