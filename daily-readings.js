import * as cheerio from "cheerio";

const OLM_URL = "https://www.olm.org.lb/ar/liturgical-calendar";
const BIBLE_API = "https://api.biblesupersearch.com/api";

// Common OLM Arabic book abbreviations mapped to English names accepted by Bible SuperSearch.
const BOOKS = {
  "تك":"Genesis","خر":"Exodus","لا":"Leviticus","عد":"Numbers","تث":"Deuteronomy",
  "يش":"Joshua","قض":"Judges","را":"Ruth","1 صم":"1 Samuel","2 صم":"2 Samuel",
  "1 مل":"1 Kings","2 مل":"2 Kings","1 أخ":"1 Chronicles","2 أخ":"2 Chronicles",
  "عز":"Ezra","نح":"Nehemiah","طو":"Tobit","يه":"Judith","اس":"Esther",
  "أي":"Job","مز":"Psalms","أم":"Proverbs","جا":"Ecclesiastes","نش":"Song of Solomon",
  "حك":"Wisdom","سي":"Sirach","أش":"Isaiah","إش":"Isaiah","إر":"Jeremiah",
  "مرا":"Lamentations","با":"Baruch","حز":"Ezekiel","دا":"Daniel","هو":"Hosea",
  "يوئ":"Joel","عا":"Amos","عو":"Obadiah","يون":"Jonah","مي":"Micah","نا":"Nahum",
  "حب":"Habakkuk","صف":"Zephaniah","حج":"Haggai","زك":"Zechariah","ملا":"Malachi",
  "مت":"Matthew","متى":"Matthew","مر":"Mark","لو":"Luke","يو":"John","أع":"Acts",
  "رو":"Romans","1 قور":"1 Corinthians","2 قور":"2 Corinthians","غل":"Galatians",
  "أف":"Ephesians","في":"Philippians","كو":"Colossians","1 تس":"1 Thessalonians",
  "2 تس":"2 Thessalonians","1 تم":"1 Timothy","2 تم":"2 Timothy","تي":"Titus",
  "فل":"Philemon","عب":"Hebrews","يع":"James","1 بط":"1 Peter","2 بط":"2 Peter",
  "1 يو":"1 John","2 يو":"2 John","3 يو":"3 John","يهود":"Jude","رؤ":"Revelation"
};

function normalizeDigits(text) {
  return text.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
}
function cleanLines(html) {
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|section|article|tr)>/gi, "\n");
  const $ = cheerio.load(withBreaks);
  return $("body").text().split(/\r?\n/).map(s => s.replace(/\s+/g, " ").trim()).filter(Boolean);
}
function findLine(lines, patterns) {
  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match?.[1]) return match[1].trim();
    }
  }
  return "";
}
function extractReference(value) {
  const normalized = normalizeDigits(value)
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  const match = normalized.match(/^(.+?)\s+(\d+)\s*[/：:]\s*(\d+)\s*(?:-\s*(\d+))?$/);
  if (!match) return { raw: normalized, english: null };
  const bookRaw = match[1].trim();
  const book = BOOKS[bookRaw] || BOOKS[bookRaw.replace(/\./g, "")];
  if (!book) return { raw: normalized, english: null };
  return {
    raw: normalized,
    english: `${book} ${match[2]}:${match[3]}${match[4] ? "-" + match[4] : ""}`
  };
}
async function getPassage(reference, bible) {
  const url = new URL(BIBLE_API);
  url.searchParams.set("bible", bible);
  url.searchParams.set("reference", reference);
  url.searchParams.set("data_format", "minimal");
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Bible API returned ${response.status}`);
  const payload = await response.json();
  const verses = payload.results?.[bible];
  if (!Array.isArray(verses) || !verses.length) return "";
  return verses.map(v => v.text).join(" ");
}

export default async () => {
  try {
    const response = await fetch(OLM_URL, {
      headers: { "user-agent": "VerbumDeiCatholicWebsite/1.0 (daily liturgical readings)" }
    });
    if (!response.ok) throw new Error(`OLM returned ${response.status}`);
    const html = await response.text();
    const lines = cleanLines(html);

    const epistleLine = findLine(lines, [/^(?:الرسالة|رسالة)\s*[:：]?\s*(.+)$/]);
    const gospelLine = findLine(lines, [/^(?:الإنجيل|إنجيل)\s*[:：]?\s*(.+)$/]);
    const colorLine = findLine(lines, [/^اللون\s*الليتورجيّ?\s*[:：]?\s*(.+)$/]);
    const dayLine = findLine(lines, [/^(?:الروزنامة الليتورجيّة|الروزنامة الليتورجية)\s*[-–:]?\s*(.+)$/]);
    const dateLine = lines.find(line => /(?:الأحد|الإثنين|الثلاثاء|الأربعاء|الخميس|الجمعة|السبت).*\d{1,2}/.test(line)) || "";

    if (!epistleLine || !gospelLine) {
      throw new Error("Could not identify the Epistle and Gospel references on the OLM page. The page layout may have changed.");
    }

    const epistleRef = extractReference(epistleLine);
    const gospelRef = extractReference(gospelLine);

    const enrich = async (type, ref) => {
      const item = { type, reference: ref.raw, englishReference: ref.english, arabic: "", english: "" };
      if (!ref.english) return item;
      const results = await Promise.allSettled([
        getPassage(ref.english, "svd"),
        getPassage(ref.english, "web")
      ]);
      if (results[0].status === "fulfilled") item.arabic = results[0].value;
      if (results[1].status === "fulfilled") item.english = results[1].value;
      return item;
    };

    const [epistle, gospel] = await Promise.all([
      enrich("epistle", epistleRef),
      enrich("gospel", gospelRef)
    ]);

    return Response.json({
      source: OLM_URL,
      date: dateLine,
      liturgicalDay: dayLine,
      liturgicalColor: colorLine,
      epistle,
      gospel
    }, { headers: { "cache-control": "public, max-age=1800" } });
  } catch (error) {
    return Response.json({ error: error.message || "Unable to load OLM readings." }, { status: 502 });
  }
};