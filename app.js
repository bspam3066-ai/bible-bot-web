(() => {
  const $ = (selector) => document.querySelector(selector);
  const output = $("#output");
  const panelTitle = $("#panelTitle");
  const settingsDialog = $("#settingsDialog");
  const defaults = { language: "both", fontSize: "normal", theme: "midnight" };
  let settings = { ...defaults, ...readSettings() };
  if (!["midnight", "daylight"].includes(settings.theme)) settings.theme = "midnight";
  let lastVerse = "";
  let lastReflection = -1;

  const translations = {
    en: {
      navHome:"Home", navReadings:"Daily readings", navVerse:"Random verse", navReflection:"Reflection", navSaints:"Saints", navPriest:"Church life", navPrayers:"Prayers", prayersTitle:"Prayer library", prayersDescription:"Traditional prayers and daily devotions in Arabic and English.", openPrayers:"Open the prayer library ↗", heroEyebrow:"A QUIETER PLACE FOR WHAT MATTERS", heroButton:"Read today’s Word", saintsButton:"Meet the saints",
      heroEyebrow:"A CATHOLIC SCRIPTURE COMPANION", heroTitle:'Rooted in the Word.<br><em>Guided by faith.</em>',
      heroSubtitle:"Read the Scriptures, reflect with the Church, and carry the Word into your day.",
      welcomeKicker:"YOUR DAILY TIME WITH GOD", welcomeTitle:"A moment in the Word",
      dailyTag:"LITURGY", dailyTitle:"Today's readings", dailyDescription:"The Gospel, Epistle and liturgical color from the Maronite calendar.",
      openReadings:'Open today’s readings <span>→</span>', verseTag:"SCRIPTURE", verseTitle:"A verse for you",
      verseDescription:"Discover a passage from the Bible in English and Arabic.", findVerse:'Find a verse <span>→</span>',
      reflectionTag:"PRAYER & REFLECTION", reflectionTitle:"Daily reflection",
      reflectionDescription:"A short faith-inspired thought to carry through your day.", readReflection:'Read reflection <span>→</span>',
      yourReading:"YOUR READING SPACE", welcomePanelTitle:"Begin with Scripture",
      emptyPrompt:"Choose a section above to begin your time in the Word.",
      quote:"Your word is a lamp to my feet and a light to my path.",
      footer:"Made to help you read, reflect and grow in faith.",
      disclaimer:"Scripture text is provided by Bible SuperSearch. Daily liturgical information is sourced from OLM.",
      settingsKicker:"PERSONALIZE YOUR EXPERIENCE", settingsTitle:"Settings", languageLabel:"Display language",
      fontLabel:"Reading text size", themeLabel:"Color theme", saveSettings:"Save settings"
    },
    ar: {
      navHome:"الرئيسية", navReadings:"قراءات اليوم", navVerse:"آية عشوائية", navReflection:"تأمّل", navSaints:"القديسون", navPriest:"الحياة الكنسية", navPrayers:"الصلوات", prayersTitle:"مكتبة الصلوات", prayersDescription:"صلوات كنسيّة وتأمّلات يومية بالعربية والإنجليزية.", openPrayers:"افتح مكتبة الصلوات ←", heroEyebrow:"مساحة هادئة لما هو أساسي", heroButton:"اقرأ كلمة اليوم", saintsButton:"تعرّف إلى القديسين",
      heroEyebrow:"رفيقك في قراءة الكتاب المقدّس", heroTitle:'متجذّرون في الكلمة.<br><em>ومسترشدون بالإيمان.</em>',
      heroSubtitle:"اقرأ الكتاب المقدّس، وتأمّل مع الكنيسة، واحمل الكلمة معك طوال يومك.",
      welcomeKicker:"وقتك اليومي مع الله", welcomeTitle:"لحظة مع الكلمة",
      dailyTag:"الليتورجيا", dailyTitle:"قراءات اليوم", dailyDescription:"الإنجيل والرسالة واللون الليتورجي من الروزنامة المارونية.",
      openReadings:'افتح قراءات اليوم <span>←</span>', verseTag:"الكتاب المقدّس", verseTitle:"آية لك",
      verseDescription:"اكتشف مقطعًا من الكتاب المقدّس بالعربية والإنجليزية.", findVerse:'اكتشف آية <span>←</span>',
      reflectionTag:"صلاة وتأمّل", reflectionTitle:"تأمّل اليوم",
      reflectionDescription:"فكرة قصيرة مستوحاة من الإيمان ترافقك في يومك.", readReflection:'اقرأ التأمّل <span>←</span>',
      yourReading:"مساحتك الروحية", welcomePanelTitle:"ابدأ بكلمة الله",
      emptyPrompt:"اختر قسمًا من الأعلى لتبدأ وقتك مع الكلمة.",
      quote:"كلامك مصباح لخطاي ونور لسبيلي.",
      footer:"صُمّم ليساعدك على القراءة والتأمّل والنمو في الإيمان.",
      disclaimer:"نصوص الكتاب المقدّس من Bible SuperSearch. معلومات الروزنامة الليتورجية من OLM.",
      settingsKicker:"خصّص تجربتك", settingsTitle:"الإعدادات", languageLabel:"لغة العرض",
      fontLabel:"حجم خط القراءة", themeLabel:"ألوان الموقع", saveSettings:"حفظ الإعدادات"
    }
  };

  function readSettings() {
    try { return JSON.parse(localStorage.getItem("verbum-settings") || "{}"); }
    catch { return {}; }
  }
  function saveSettings() { localStorage.setItem("verbum-settings", JSON.stringify(settings)); }
  function applySettings() {
    document.body.classList.toggle("theme-day", settings.theme === "daylight");
    document.body.classList.toggle("lang-ar", settings.language === "ar");
    const sizes = { small: ".88", normal: "1", large: "1.15", xlarge: "1.3" };
    document.documentElement.style.setProperty("--reading-scale", sizes[settings.fontSize] || "1");
    document.documentElement.lang = settings.language === "ar" ? "ar" : "en";
    document.documentElement.dir = "ltr";
    const t = settings.language === "ar" ? translations.ar : translations.en;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      if (t[key]) el.innerHTML = t[key];
    });
    $("#displayLanguage").value = settings.language;
    $("#fontSize").value = settings.fontSize;
    $("#colorTheme").value = settings.theme;
  }

  function setPanel(title, html) {
    panelTitle.textContent = title;
    output.innerHTML = html;
    $("#contentPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    })[c]);
  }
  function languageBlocks(en, ar, extraClass = "") {
    const lang = settings.language;
    if (lang === "en") return `<div class="${extraClass}">${escapeHtml(en)}</div>`;
    if (lang === "ar") return `<div class="${extraClass} arabic" lang="ar" dir="rtl">${escapeHtml(ar)}</div>`;
    return `<div class="two-language"><div class="language-column"><div class="reference">ENGLISH</div><div class="${extraClass}">${escapeHtml(en)}</div></div><div class="language-column" dir="rtl"><div class="reference">العربية</div><div class="${extraClass} arabic" lang="ar">${escapeHtml(ar)}</div></div></div>`;
  }
  function chooseDifferent(list, previous) {
    if (list.length < 2) return 0;
    let index = Math.floor(Math.random() * list.length);
    while (index === previous) index = Math.floor(Math.random() * list.length);
    return index;
  }
  async function fetchJson(url) {
    const response = await fetch(url);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
    return payload;
  }

  async function showRandomVerse() {
    const refs = window.BOT_DATA.randomVerses;
    let reference = refs[Math.floor(Math.random() * refs.length)];
    if (refs.length > 1) while (reference === lastVerse) reference = refs[Math.floor(Math.random() * refs.length)];
    lastVerse = reference;
    setPanel(settings.language === "ar" ? "آية من الكتاب المقدّس" : "A verse from Scripture", `<p class="loading">✝ Loading Scripture… / جارٍ تحميل الآية…</p>`);
    try {
      const bundle = await fetchJson("./data/bible-verses.json");
      const data = bundle.verses?.[reference];
      if (!data || (!data.english && !data.arabic)) throw new Error("This verse is not available in the latest Scripture data.");
      const meaning = window.BOT_DATA.meanings[reference] || {
        en: "Take a moment to pray with this passage and consider how it speaks to your day.",
        ar: "خذ لحظة للصلاة مع هذا المقطع، وتأمّل كيف يخاطب يومك."
      };
      const scripture = settings.language === "en"
        ? `<div class="scripture">${escapeHtml(data.english)}</div>`
        : settings.language === "ar"
          ? `<div class="scripture arabic" dir="rtl">${escapeHtml(data.arabic)}</div>`
          : `<div class="two-language"><div class="language-column"><div class="reference">WORLD ENGLISH BIBLE</div><div class="scripture">${escapeHtml(data.english)}</div></div><div class="language-column" dir="rtl"><div class="reference">سميث فان دايك</div><div class="scripture arabic" dir="rtl">${escapeHtml(data.arabic)}</div></div></div>`;
      const meaningHtml = settings.language === "en"
        ? `<p class="meaning">${escapeHtml(meaning.en)}</p>`
        : settings.language === "ar"
          ? `<p class="meaning arabic" dir="rtl">${escapeHtml(meaning.ar)}</p>`
          : `<div class="two-language"><p class="meaning">${escapeHtml(meaning.en)}</p><p class="meaning arabic" dir="rtl">${escapeHtml(meaning.ar)}</p></div>`;
      setPanel(reference, `<article class="reading-block"><div class="reference">${escapeHtml(reference)}</div>${scripture}</article><h3>Meaning & reflection / المعنى والتأمّل</h3>${meaningHtml}`);
    } catch (error) {
      setPanel("Bible verse", `<p class="error-message">Could not load the complete verse. ${escapeHtml(error.message)}</p><p>${escapeHtml(reference)}</p><button class="primary-button" data-action="verse">Try another verse</button>`);
    }
  }

  async function showDailyReadings() {
    setPanel(settings.language === "ar" ? "قراءات اليوم" : "Today's Maronite readings", `<p class="loading">⏳ Fetching OLM readings… / جارٍ جلب القراءات الليتورجية…</p>`);
    try {
      const data = await fetchJson("./data/daily-readings.json");
      const blocks = [];
      for (const item of [data.epistle, data.gospel]) {
        if (!item) continue;
        const heading = item.type === "epistle" ? (settings.language === "ar" ? "الرسالة" : "Epistle") : (settings.language === "ar" ? "الإنجيل" : "Gospel");
        const text = settings.language === "ar" ? item.arabic : settings.language === "en" ? item.english : null;
        let body = "";
        if (settings.language === "both") {
          body = `<div class="two-language"><div class="language-column"><div class="reference">ENGLISH · ${escapeHtml(item.englishReference || item.reference)}</div><div class="scripture">${escapeHtml(item.english || "English text unavailable for this reference.")}</div></div><div class="language-column" dir="rtl"><div class="reference">العربية · ${escapeHtml(item.reference)}</div><div class="scripture arabic" dir="rtl">${escapeHtml(item.arabic || "النص العربي غير متاح لهذا المرجع.")}</div></div></div>`;
        } else {
          body = `<div class="reference">${escapeHtml(settings.language === "ar" ? item.reference : (item.englishReference || item.reference))}</div><div class="scripture ${settings.language === "ar" ? "arabic" : ""}" ${settings.language === "ar" ? 'dir="rtl"' : ""}>${escapeHtml(text || (settings.language === "ar" ? "النص غير متاح." : "Text unavailable."))}</div>`;
        }
        blocks.push(`<article class="reading-block"><h3>${heading}</h3>${body}</article>`);
      }
      if (!blocks.length) throw new Error("The OLM page did not return the daily reading references.");
      const color = data.liturgicalColor || "Not detected";
      setPanel(data.liturgicalDay || "Today's readings", `<p class="reference">${escapeHtml(data.date || "")}</p>${blocks.join("")}<p class="meaning">✦ ${settings.language === "ar" ? "اللون الليتورجيّ" : "Liturgical color"}: ${escapeHtml(color)}</p><p class="meaning">Source: <a href="https://www.olm.org.lb/ar/liturgical-calendar" target="_blank" rel="noopener">OLM Maronite Liturgical Calendar</a></p>`);
    } catch (error) {
      setPanel(settings.language === "ar" ? "تعذّر تحميل القراءات" : "Readings unavailable", `<p class="error-message">${escapeHtml(error.message)}</p><p class="meaning">The latest readings could not be loaded. Please try again later.</p>`);
    }
  }

  function showReflection() {
    const list = window.BOT_DATA.reflections;
    lastReflection = chooseDifferent(list, lastReflection);
    const item = list[lastReflection];
    const body = settings.language === "en"
      ? `<p class="scripture">${escapeHtml(item.en)}</p>`
      : settings.language === "ar"
        ? `<p class="scripture arabic" dir="rtl">${escapeHtml(item.ar)}</p>`
        : `<div class="two-language"><p class="scripture">${escapeHtml(item.en)}</p><p class="scripture arabic" dir="rtl">${escapeHtml(item.ar)}</p></div>`;
    setPanel(settings.language === "ar" ? "تأمّل اليوم" : "A reflection for today", `<article class="reading-block">${body}</article><p class="meaning">🙏 Take a quiet moment to reflect and pray.</p><button class="text-button" data-action="reflection">Another reflection →</button>`);
  }


  function showPrayers(category = "all") {
    const library = window.PRAYER_DATA;
    if (!library?.items?.length) {
      setPanel(settings.language === "ar" ? "مكتبة الصلوات" : "Prayer library", '<p class="error-message">Prayer content could not be loaded.</p>');
      return;
    }
    const isArabic = settings.language === "ar";
    const title = isArabic ? "مكتبة الصلوات" : "Prayer Library";
    const categories = library.categories.map(item =>
      `<button class="prayer-filter ${item.id === category ? "active" : ""}" data-prayer-category="${item.id}">${isArabic ? item.ar : item.en}</button>`
    ).join("");
    const items = library.items.filter(item => category === "all" || item.category === category);
    const cards = items.map(item => {
      const body = languageBlocks(item.en, item.ar, "prayer-text");
      const note = isArabic ? item.noteAr : item.noteEn;
      return `<article class="prayer-entry"><div class="prayer-entry-heading"><span class="prayer-cross">✝</span><div><h3>${isArabic ? escapeHtml(item.arTitle) : escapeHtml(item.enTitle)}</h3><small>${escapeHtml(note)}</small></div></div>${body}</article>`;
    }).join("");
    const intro = isArabic
      ? "صلوات تساعدك على التقرّب من الله في كل يوم. اختر صلاة وخذ لحظة هادئة."
      : "A collection of traditional Catholic prayers and original daily devotions. Choose a prayer and take a quiet moment.";
    setPanel(title, `
      <div class="prayer-library-hero">
        <img src="https://upload.wikimedia.org/wikipedia/commons/3/35/Lord%27s_Prayer_and_a_crucifix.jpg" alt="A crucifix resting on an open Bible showing the Lord's Prayer" loading="lazy">
        <div class="prayer-library-overlay"><span>VERBUM DEI · ORA ET LABORA</span><h3>${isArabic ? "ارفع قلبك إلى الله" : "Lift your heart to God"}</h3><p>${intro}</p></div>
      </div>
      <div class="prayer-filters">${categories}</div>
      <div class="prayer-list">${cards}</div>
      <p class="prayer-credit">Image: James Chan (jclk8888) · CC0 Public Domain · <a href="https://commons.wikimedia.org/wiki/File:Lord%27s_Prayer_and_a_crucifix.jpg" target="_blank" rel="noopener">Image details</a></p>
      <p class="meaning">${isArabic ? "ملاحظة: الصلوات الأساسية هي صلوات كاثوليكية متوارثة. أما الصلوات التأمّلية وطلبات الشفاعة فهي صيغ تعبّدية أُعدّت للموقع وليست نصوصًا طقسية رسمية." : "Note: The traditional prayers are established Catholic prayers. The daily devotions and saint-intercession texts are original devotional wording for this site, not official liturgical texts."}</p>
    `);
  }

  function go(view) {
    document.querySelectorAll(".nav-link").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
    if (view === "readings" || view === "daily") return showDailyReadings();
    if (view === "verse") return showRandomVerse();
    if (view === "prayers") return showPrayers();
    if (view === "saints" || view === "priest") { window.dispatchEvent(new CustomEvent("verbum:view", { detail: view })); return; }
    if (view === "reflection") return showReflection();
    panelTitle.textContent = "Begin with Scripture";
    output.innerHTML = `<p class="empty-state">${escapeHtml(translations[settings.language === "ar" ? "ar" : "en"].emptyPrompt)}</p>`;
  }

  document.addEventListener("click", event => {
    const action = event.target.closest("[data-action]");
    if (action) go(action.dataset.action);
    const nav = event.target.closest("[data-view]");
    if (nav) go(nav.dataset.view);
  });
  $("#settingsButton").addEventListener("click", () => settingsDialog.showModal());
  $("#languageButton").addEventListener("click", () => {
    settings.language = settings.language === "both" ? "ar" : settings.language === "ar" ? "en" : "both";
    saveSettings(); applySettings();
  });
  $("#saveSettings").addEventListener("click", () => {
    settings.language = $("#displayLanguage").value;
    settings.fontSize = $("#fontSize").value;
    settings.theme = $("#colorTheme").value;
    saveSettings(); applySettings();
  });

  const now = new Date();
  $("#todayDate").textContent = now.toLocaleDateString(undefined, { weekday:"long", year:"numeric", month:"long", day:"numeric" });
  applySettings();
})();