
import * as cheerio from "cheerio";

const OLM_URL = "https://olm.org.lb/ar/liturgical-calendar";
const BIBLE_API = "https://api.biblesupersearch.com/api";

const BOOKS = {
  "تك": "Genesis", "خر": "Exodus", "لا": "Leviticus",
  "عد": "Numbers", "تث": "Deuteronomy",
  "يش": "Joshua", "قض": "Judges", "را": "Ruth",
  "عز": "Ezra", "نح": "Nehemiah", "طو": "Tobit",
  "اس": "Esther", "أي": "Job", "مز": "Psalms",
  "أم": "Proverbs", "جا": "Ecclesiastes",
  "نش": "Song of Solomon", "حك": "Wisdom", "سي": "Sirach",
  "أش": "Isaiah", "إش": "Isaiah", "إر": "Jeremiah",
  "مرا": "Lamentations", "با": "Baruch", "حز": "Ezekiel",
  "دا": "Daniel", "هو": "Hosea", "يوئ": "Joel",
  "عا": "Amos", "عو": "Obadiah", "يون": "Jonah",
  "مي": "Micah", "نا": "Nahum", "حب": "Habakkuk",
  "صف": "Zephaniah", "حج": "Haggai", "زك": "Zechariah",
  "ملا": "Malachi", "مت": "Matthew", "متى": "Matthew",
  "مر": "Mark", "لو": "Luke", "يو": "John",
  "أع": "Acts", "رو": "Romans", "غل": "Galatians",
  "أف": "Ephesians", "في": "Philippians",
  "كو": "Colossians", "عب": "Hebrews",
  "يع": "James", "رؤ": "Revelation",
  "يهود": "Jude"
};

function normalizeDigits(value) {
  return String(value).replace(/[٠-٩]/g, d =>
    "٠١٢٣٤٥٦٧٨٩".indexOf(d)
  );
}

function normalizeArabic(value) {
  return normalizeDigits(value)
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

function flattenData(value, path = "") {
  if (value === null || value === undefined) return "";

  if (typeof value === "string" || typeof value === "number") {
    return `${path}: ${value}`;
  }

  if (Array.isArray(value)) {
    return value
      .map((item, index) => flattenData(item, `${path}[${index}]`))
      .filter(Boolean)
      .join("\n");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) =>
        flattenData(item, path ? `${path}.${key}` : key)
      )
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

function preparePage(html) {
  const $ = cheerio.load(html);

  const title = $("title").text();

  const appElement = $("#app").first();

  const dataPage =
    appElement.attr("data-page") ||
    $("[data-page]").first().attr("data-page") ||
    "";

  let appData = null;
  let appDataError = "";

  if (dataPage) {
    try {
      appData = JSON.parse(dataPage);
    } catch (error) {
      appDataError = error.message;
    }
  }

  const bodyText = $("body").text()
    .replace(/\u00a0/g, " ")
    .trim();

  const embeddedText = appData
    ? flattenData(appData)
    : "";

  const text = [bodyText, embeddedText]
    .filter(Boolean)
    .join("\n");

  const scripts = $("script[src]")
    .map((_, el) => $(el).attr("src"))
    .get();

  return {
    $,
    text,
    title,
    bodyText,
    appData,
    appDataError,
    scripts
  };
}

function findReference(text) {
  const normalized = normalizeArabic(text);

  const keys = Object.keys(BOOKS)
    .sort((a, b) => b.length - a.length);

  const alternatives = keys
    .map(key => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  const regex = new RegExp(
    `(^|[^\\p{L}])(${alternatives})\\s*(\\d+)\\s*/\\s*(\\d+)\\s*(?:-\\s*(\\d+))?`,
    "u"
  );

  const match = regex.exec(normalized);

  if (!match) return null;

  const book = BOOKS[match[2]];

  if (!book) return null;

  return {
    raw: match[0].slice(match[1].length).trim(),
    english: `${book} ${match[3]}:${match[4]}${
      match[5] ? "-" + match[5] : ""
    }`,
    end: regex.lastIndex
  };
}

function findReadingSection(text, labels, nextLabels) {
  const normalized = normalizeArabic(text);
  const positions = [];

  for (const label of labels) {
    const key = normalizeArabic(label);
    let position = 0;

    while ((position = normalized.indexOf(key, position)) !== -1) {
      positions.push(position);
      position += key.length;
    }
  }

  positions.sort((a, b) => a - b);

  for (const start of positions) {
    const possibleEnds = nextLabels
      .map(label =>
        normalized.indexOf(normalizeArabic(label), start + 1)
      )
      .filter(position => position !== -1);

    const end = possibleEnds.length
      ? Math.min(...possibleEnds)
      : normalized.length;

    const section = normalized.slice(start, end);
    const reference = findReference(section);

    if (!reference) continue;

    let reading = section.slice(reference.end).trim();

    reading = reading.replace(
      /^[“"«][^”"»]*[”"»]\s*/u,
      ""
    );

    reading = reading
      .replace(/^[\s:،؛.!؟]+/, "")
      .trim();

    return {
      reference,
      reading
    };
  }

  return null;
}

function findMetadata(text, labels) {
  const normalized = normalizeArabic(text);

  for (const label of labels) {
    const key = normalizeArabic(label);
    const index = normalized.indexOf(key);

    if (index === -1) continue;

    const value = normalized
      .slice(index + key.length)
      .split("\n")[0]
      .trim();

    if (value) return value;
  }

  return "";
}

async function getEnglishPassage(reference) {
  const url = new URL(BIBLE_API);

  url.searchParams.set("bible", "web");
  url.searchParams.set("reference", reference);
  url.searchParams.set("data_format", "minimal");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Bible API returned ${response.status}`);
  }

  const payload = await response.json();
  const verses = payload.results?.web;

  if (!Array.isArray(verses)) return "";

  return verses
    .map(verse => verse.text || "")
    .join(" ");
}

async function enrichReading(type, section) {
  const item = {
    type,
    reference: section.reference.raw,
    englishReference: section.reference.english,
    arabic: section.reading,
    english: ""
  };

  try {
    item.english = await getEnglishPassage(
      section.reference.english
    );
  } catch (error) {
    console.error(`English translation failed (${type}):`, error);
  }

  return item;
}

export default async () => {
  let diagnostic = {};

  try {
    const response = await fetch(OLM_URL, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ar,en-US;q=0.9,en;q=0.8"
      }
    });

    const html = await response.text();

    if (!response.ok) {
      throw new Error(`OLM returned HTTP ${response.status}`);
    }

    const page = preparePage(html);

    const {
      text,
      title,
      bodyText,
      appData,
      appDataError,
      scripts
    } = page;

    diagnostic = {
      status: response.status,
      finalUrl: response.url,
      contentType: response.headers.get("content-type"),
      rawHtmlLength: html.length,
      bodyTextLength: bodyText.length,
      embeddedDataFound: Boolean(appData),
      embeddedDataError: appDataError,
      embeddedDataKeys: appData
        ? Object.keys(appData)
        : [],
      embeddedDataPreview: appData
        ? JSON.stringify(appData).slice(0, 5000)
        : "",
      pageTextLength: text.length,
      pageTextPreview: text.slice(0, 5000),
      scripts
    };

    const epistleSection = findReadingSection(
      text,
      ["الرسالة", "رسالة", "Letter", "Epistle"],
      ["الإنجيل", "انجيل", "Gospel", "اللون الليتورجي"]
    );

    const gospelSection = findReadingSection(
      text,
      ["الإنجيل", "انجيل", "Gospel"],
      ["اللون الليتورجي", "الرسالة", "رسالة", "Letter", "Epistle"]
    );

    if (!epistleSection || !gospelSection) {
      console.error("OLM parsing failed:", diagnostic);

      return Response.json({
        error: "OLM readings could not be extracted.",
        diagnostic
      }, {
        status: 502
      });
    }

    const [epistle, gospel] = await Promise.all([
      enrichReading("epistle", epistleSection),
      enrichReading("gospel", gospelSection)
    ]);

    const liturgicalColor = findMetadata(text, [
      "اللون الليتورجيّ",
      "اللون الليتورجي",
      "Liturgical color"
    ]);

    return Response.json({
      source: OLM_URL,
      date: "",
      liturgicalDay: "",
      liturgicalColor,
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
      error: error.message || "Unable to load OLM readings.",
      diagnostic
    }, {
      status: 502
    });
  }
};
