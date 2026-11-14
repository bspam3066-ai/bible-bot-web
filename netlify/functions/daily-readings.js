
import * as cheerio from "cheerio";

const OLM_BASE_URL = "https://olm.org.lb/ar/liturgical-calendar";
const BIBLE_API = "https://api.biblesupersearch.com/api";

// OLM's response is currently being decoded with the wrong character encoding.
function fixEncoding(value) {
  if (typeof value !== "string") return value;

  if (!/[ØÙÃ]/.test(value)) return value;

  try {
    const fixed = Buffer.from(value, "latin1").toString("utf8");
    return fixed.includes("\uFFFD") ? value : fixed;
  } catch {
    return value;
  }
}

function fixObjectEncoding(value) {
  if (typeof value === "string") return fixEncoding(value);

  if (Array.isArray(value)) {
    return value.map(fixObjectEncoding);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        fixObjectEncoding(item)
      ])
    );
  }

  return value;
}

function htmlToText(html) {
  return cheerio.load(html || "").text().replace(/\s+/g, " ").trim();
}

async function getEnglishPassage(reference) {
  // Prefer the World English Bible. If it has no text for a passage,
  // fall back to the public-domain King James Version.
  const versions = [
    { module: "web", name: "World English Bible" },
    { module: "kjv", name: "King James Version" }
  ];

  for (const version of versions) {
    try {
      const url = new URL(BIBLE_API);
      url.searchParams.set("bible", version.module);
      url.searchParams.set("reference", reference);
      url.searchParams.set("data_format", "minimal");

      const response = await fetch(url);
      if (!response.ok) continue;

      const payload = await response.json();
      if (payload.errors?.length) continue;

      const verses = payload.results?.[version.module];
      if (!Array.isArray(verses) || !verses.length) continue;

      const text = verses.map(verse => verse.text || "").filter(Boolean).join(" ").trim();
      if (text) return { text, version: version.name };
    } catch (error) {
      console.error(`Could not load ${version.name} for ${reference}:`, error);
    }
  }

  return { text: "", version: "" };
}

function getField(object, possibleKeys) {
  if (!object || typeof object !== "object") return "";

  for (const key of possibleKeys) {
    if (object[key] !== undefined && object[key] !== null) {
      return object[key];
    }
  }

  return "";
}

function findColor(object) {
  if (!object || typeof object !== "object") return "";

  const preferredKeys = [
    "liturgical_color",
    "liturgicalColor",
    "color_name",
    "color"
  ];

  for (const key of preferredKeys) {
    const value = object[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  for (const [key, value] of Object.entries(object)) {
    if (
      /liturgical.*color|color.*liturgical/i.test(key) &&
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return "";
}

function getDateFromUrl(url) {
  const match = String(url || "").match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}

async function formatReading(reading, type) {
  const reference = String(reading.reference || "").trim();

  const arabic = htmlToText(reading.body_ar || "");

  const excerpt = htmlToText(reading.excerpt_ar || "");

  const englishReference = reference
    .replace(/[٠-٩]/g, digit =>
      "٠١٢٣٤٥٦٧٨٩".indexOf(digit)
    )
    .replace(/عب\s*/g, "Hebrews ")
    .replace(/يو\s*/g, "John ")
    .replace(/مت\s*/g, "Matthew ")
    .replace(/مر\s*/g, "Mark ")
    .replace(/لو\s*/g, "Luke ")
    .replace(/رو\s*/g, "Romans ")
    .replace(/أع\s*/g, "Acts ")
    .replace(/غل\s*/g, "Galatians ")
    .replace(/أف\s*/g, "Ephesians ")
    .replace(/في\s*/g, "Philippians ")
    .replace(/كو\s*/g, "Colossians ")
    .replace(/\s*\/\s*/g, ":")
    .replace(/\s*-\s*/g, "-")
    .trim();

  let english = "";
  let englishVersion = "";

  try {
    const passage = await getEnglishPassage(englishReference);
    english = passage.text;
    englishVersion = passage.version;
  } catch (error) {
    console.error(`English translation failed for ${type}:`, error);
  }

  return {
    type,
    reference,
    englishReference,
    englishVersion,
    arabic,
    english
  };
}

export default async () => {
  try {
    const targetDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Beirut",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());
    const requestedUrl = `${OLM_BASE_URL}/${targetDate}`;
    const response = await fetch(requestedUrl, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ar,en-US;q=0.9,en;q=0.8"
      }
    });

    if (!response.ok) {
      throw new Error(`OLM returned HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const dataPage =
      $("#app").attr("data-page") ||
      $("[data-page]").first().attr("data-page");

    if (!dataPage) {
      throw new Error("OLM application data was not found.");
    }

    let appData;

    try {
      appData = JSON.parse(dataPage);
    } catch {
      throw new Error("Could not read OLM application data.");
    }

    appData = fixObjectEncoding(appData);

    const dayData = appData?.props?.day?.data;

    if (!dayData) {
      throw new Error("OLM day data was not found.");
    }

    const readings = dayData.readings;

    if (!Array.isArray(readings) || readings.length < 2) {
      throw new Error("OLM did not provide both daily readings.");
    }

    const orderedReadings = [...readings].sort(
      (a, b) => Number(a.pos ?? 0) - Number(b.pos ?? 0)
    );

    const epistleData = orderedReadings[0];
    const gospelData = orderedReadings[1];

    const [epistle, gospel] = await Promise.all([
      formatReading(epistleData, "epistle"),
      formatReading(gospelData, "gospel")
    ]);

    const pageUrl = dayData.web_url || response.url;
    const returnedDate = getDateFromUrl(response.url) || getDateFromUrl(pageUrl);
    if (returnedDate !== targetDate) {
      throw new Error(`OLM returned readings for ${returnedDate || "an unknown date"} instead of Beirut-local ${targetDate}.`);
    }

    const color = findColor(dayData);

    const liturgicalDay = getField(dayData, [
      "name_ar",
      "title_ar",
      "day_name_ar",
      "liturgical_day"
    ]);

    return Response.json({
      source: pageUrl,
      date: returnedDate,
      liturgicalDay,
      liturgicalColor: color,
      epistle,
      gospel
    }, {
      headers: {
        "Cache-Control": "public, max-age=1800"
      }
    });

  } catch (error) {
    console.error("Daily readings error:", error);

    return Response.json({
      error: error.message || "Unable to load daily readings."
    }, {
      status: 502
    });
  }
};
