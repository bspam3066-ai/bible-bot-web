
import * as cheerio from "cheerio";

const OLM_URL = "https://olm.org.lb/ar/liturgical-calendar";
const BIBLE_API = "https://api.biblesupersearch.com/api";

const BOOKS = {
  "تك": "Genesis", "خر": "Exodus", "لا": "Leviticus",
  "عد": "Numbers", "تث": "Deuteronomy",
  "يش": "Joshua", "قض": "Judges", "را": "Ruth",
  "صم": "Samuel", "مل": "Kings", "أخ": "Chronicles",
  "عز": "Ezra", "نح": "Nehemiah", "طو": "Tobit",
  "يه": "Jude", "اس": "Esther", "أي": "Job",
  "مز": "Psalms", "أم": "Proverbs", "جا": "Ecclesiastes",
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
  "أف": "Ephesians", "في": "Philippians", "كو": "Colossians",
  "تس": "Thessalonians", "تم": "Timothy",
  "تي": "Titus", "فل": "Philemon", "عب": "Hebrews",
  "يع": "James", "بط": "Peter", "رؤ": "Revelation"
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
    .trim();
}

function preparePage(html) {
  const formatted = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(
      /<\/(p|div|li|h[1-6]|section|article|tr)>/gi,
      "\n"
    );

  const $ = cheerio.load(formatted);

  $("script, style, noscript, svg").remove();

  const text = $("body").text()
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();

  return { $, text };
}

function findReference(text) {
  const normalized = normalizeArabic(text);

  const keys = Object.keys(BOOKS)
    .filter(key => !["صم", "مل", "أخ", "قور", "تس", "تم", "بط"].includes(key))
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
  const normalizedLabels = labels.map(normalizeArabic);
  const normalizedNext = nextLabels.map(normalizeArabic);

  const positions = [];

  for (const label of normalizedLabels) {
    let pos = 0;

    while ((pos = normalized.indexOf(label, pos)) !== -1) {
      positions.push(pos);
      pos += label.length;
    }
  }

  positions.sort((a, b) => a - b);

  for (const start of positions) {
    const possibleEnds = normalizedNext
      .map(label => normalized.indexOf(label, start + 1))
      .filter(pos => pos !== -1);

    const end = possibleEnds.length
      ? Math.min(...possibleEnds)
      : normalized.length;

    const section = normalized.slice(start, end);
    const reference = findReference(section);

    if (!reference) continue;

    let reading = section.slice(reference.end).trim();

    // Remove the quoted heading that repeats the reference.
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

  return verses.map(verse => verse.text || "").join(" ");
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
  let debug = {};

  try {
    const response = await fetch(OLM_URL, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ar,en-US;q=0.9,en;q=0.8"
      }
    });

    if (!response.ok) {
      throw new Error(`OLM returned HTTP ${response.status}`);
    }

    const html = await response.text();
    const { $, text } = preparePage(html);

    debug = {
      finalUrl: response.url,
      contentType: response.headers.get("content-type"),
      title: $("title").text(),
      pageLength: text.length,
      preview: text.slice(0, 2500),
      scripts: $("script[src]")
        .map((_, el) => $(el).attr("src"))
        .get()
        .slice(0, 15)
    };

    const epistleSection = findReadingSection(
      text,
      ["الرسالة", "رسالة"],
      ["الإنجيل", "انجيل", "اللون الليتورجي"]
    );

    const gospelSection = findReadingSection(
      text,
      ["الإنجيل", "انجيل"],
      ["اللون الليتورجي", "الرسالة", "رسالة"]
    );

    if (!epistleSection || !gospelSection) {
      console.error("OLM readings not found:", debug);

      return Response.json({
        error: "The readings were not found in the HTML downloaded from OLM.",
        diagnostic: debug
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
      "اللون الليتورجي"
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
      diagnostic: debug
    }, {
      status: 502
    });
  }
};
