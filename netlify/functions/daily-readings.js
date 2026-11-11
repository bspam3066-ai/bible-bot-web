
import * as cheerio from "cheerio";

const OLM_URL = "https://www.olm.org.lb/ar/liturgical-calendar";
const BIBLE_API = "https://api.biblesupersearch.com/api";

const BOOKS = {
  "تك": "Genesis", "خر": "Exodus", "لا": "Leviticus",
  "عد": "Numbers", "تث": "Deuteronomy",
  "يش": "Joshua", "قض": "Judges", "را": "Ruth",
  "1 صم": "1 Samuel", "2 صم": "2 Samuel",
  "1 مل": "1 Kings", "2 مل": "2 Kings",
  "1 أخ": "1 Chronicles", "2 أخ": "2 Chronicles",
  "عز": "Ezra", "نح": "Nehemiah", "طو": "Tobit",
  "يه": "Judith", "اس": "Esther", "أي": "Job",
  "مز": "Psalms", "أم": "Proverbs",
  "جا": "Ecclesiastes", "نش": "Song of Solomon",
  "حك": "Wisdom", "سي": "Sirach",
  "أش": "Isaiah", "إش": "Isaiah", "إر": "Jeremiah",
  "مرا": "Lamentations", "با": "Baruch",
  "حز": "Ezekiel", "دا": "Daniel", "هو": "Hosea",
  "يوئ": "Joel", "عا": "Amos", "عو": "Obadiah",
  "يون": "Jonah", "مي": "Micah", "نا": "Nahum",
  "حب": "Habakkuk", "صف": "Zephaniah",
  "حج": "Haggai", "زك": "Zechariah", "ملا": "Malachi",
  "مت": "Matthew", "متى": "Matthew", "مر": "Mark",
  "لو": "Luke", "يو": "John", "أع": "Acts",
  "رو": "Romans", "1 قور": "1 Corinthians",
  "2 قور": "2 Corinthians", "غل": "Galatians",
  "أف": "Ephesians", "في": "Philippians",
  "كو": "Colossians", "1 تس": "1 Thessalonians",
  "2 تس": "2 Thessalonians", "1 تم": "1 Timothy",
  "2 تم": "2 Timothy", "تي": "Titus",
  "فل": "Philemon", "عب": "Hebrews", "يع": "James",
  "1 بط": "1 Peter", "2 بط": "2 Peter",
  "1 يو": "1 John", "2 يو": "2 John",
  "3 يو": "3 John", "يهود": "Jude", "يه": "Jude",
  "رؤ": "Revelation"
};

const BOOK_PATTERN = Object.keys(BOOKS)
  .sort((a, b) => b.length - a.length)
  .map(book => book.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");

function normalizeDigits(value) {
  return String(value).replace(/[٠-٩]/g, digit =>
    "٠١٢٣٤٥٦٧٨٩".indexOf(digit)
  );
}

function preparePage(html) {
  const formattedHtml = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(
      /<\/(p|div|li|h[1-6]|section|article|tr)>/gi,
      "\n"
    );

  const $ = cheerio.load(formattedHtml);

  $("script, style, noscript, svg").remove();

  return {
    $,
    text: $("body").text()
      .replace(/\u00a0/g, " ")
      .replace(/\r/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n+/g, "\n")
      .trim()
  };
}

function makeReferenceRegex() {
  return new RegExp(
    `(^|[^\\p{L}])(${BOOK_PATTERN})\\s*(\\d+)\\s*[/／]\\s*(\\d+)\\s*(?:[-–—]\\s*(\\d+))?`,
    "giu"
  );
}

function findReference(text) {
  const normalized = normalizeDigits(text)
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ");

  const regex = makeReferenceRegex();
  const match = regex.exec(normalized);

  if (!match) return null;

  const book = BOOKS[match[2]];

  if (!book) return null;

  const start = match.index + match[1].length;
  const end = regex.lastIndex;

  return {
    raw: match[0].slice(match[1].length).trim(),
    english: `${book} ${match[3]}:${match[4]}${
      match[5] ? "-" + match[5] : ""
    }`,
    start,
    end
  };
}

function findReadingSection(text, labels, nextLabels) {
  const positions = [];

  for (const label of labels) {
    let position = 0;

    while ((position = text.indexOf(label, position)) !== -1) {
      positions.push(position);
      position += label.length;
    }
  }

  positions.sort((a, b) => a - b);

  for (const start of positions) {
    const nextPosition = nextLabels
      .flatMap(label => {
        const position = text.indexOf(label, start + 1);
        return position === -1 ? [] : [position];
      })
      .sort((a, b) => a - b)[0];

    const end = nextPosition ?? text.length;
    const section = text.slice(start, end);

    const reference = findReference(section);

    if (reference) {
      const localReferenceEnd = reference.end;
      let reading = section.slice(localReferenceEnd).trim();

      // Remove OLM's quoted title, which repeats the reference.
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
  }

  return null;
}

function findMetadata(text, labels) {
  for (const label of labels) {
    const index = text.indexOf(label);

    if (index === -1) continue;

    const rest = text.slice(index + label.length);
    const value = rest.split("\n")[0].trim();

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

  return verses.map(verse => verse.text).join(" ");
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
    console.error(`English translation failed for ${type}:`, error);
  }

  return item;
}

export default async () => {
  try {
    const response = await fetch(OLM_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VerbumDei/1.0)",
        "Accept": "text/html,application/xhtml+xml"
      }
    });

    if (!response.ok) {
      throw new Error(`OLM returned HTTP ${response.status}`);
    }

    const html = await response.text();
    const { $, text } = preparePage(html);

    const epistleSection = findReadingSection(
      text,
      ["الرسالة", "رسالة"],
      ["الإنجيل", "إنجيل", "اللون الليتورجي"]
    );

    const gospelSection = findReadingSection(
      text,
      ["الإنجيل", "إنجيل"],
      ["اللون الليتورجي", "الرسالة", "رسالة"]
    );

    if (!epistleSection || !gospelSection) {
      console.error("OLM parsing failed", {
        title: $("title").text(),
        pageLength: text.length,
        preview: text.slice(0, 1500)
      });

      throw new Error(
        "OLM readings were not found in the downloaded page. The page may require JavaScript or its layout may have changed."
      );
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
    console.error("Daily readings function error:", error);

    return Response.json({
      error: error.message || "Unable to load OLM readings."
    }, {
      status: 502
    });
  }
};
