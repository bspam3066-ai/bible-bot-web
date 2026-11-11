const API = "https://api.biblesupersearch.com/api";

async function getPassage(reference, bible) {
  const url = new URL(API);
  url.searchParams.set("bible", bible);
  url.searchParams.set("reference", reference);
  url.searchParams.set("data_format", "minimal");

  const response = await fetch(url, { headers: { "accept": "application/json" } });
  if (!response.ok) throw new Error(`Bible API returned ${response.status}`);
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(payload.errors.join("; "));
  const verses = payload.results?.[bible];
  if (!Array.isArray(verses) || !verses.length) {
    throw new Error(`No verses were returned for ${reference} (${bible}).`);
  }
  return verses.map(v => v.text).join(" ");
}

export default async (request) => {
  const url = new URL(request.url);
  const reference = (url.searchParams.get("reference") || "").trim();
  if (!reference || reference.length > 100) {
    return Response.json({ error: "Please provide a valid Bible reference." }, { status: 400 });
  }
  try {
    const [english, arabic] = await Promise.all([
      getPassage(reference, "web"),
      getPassage(reference, "svd")
    ]);
    return Response.json({
      reference,
      english,
      arabic,
      translations: { english: "World English Bible (WEB)", arabic: "Smith & Van Dyke (SVD)" }
    }, { headers: { "cache-control": "public, max-age=3600" } });
  } catch (error) {
    return Response.json({ error: error.message || "Unable to retrieve Bible passage." }, { status: 502 });
  }
};