(() => {
  const $ = (selector) => document.querySelector(selector);
  const output = $("#output");
  const panelTitle = $("#panelTitle");
  // Choose a different Jesus artwork whenever the site is opened.
  const jesusArtwork = [
    { file: "Eugène_Delacroix_(1798-1863)_-_Christ_on_the_Cross_-_NG6433_-_National_Gallery.jpg", credit: "Eugène Delacroix · Christ on the Cross · Public Domain" },
    
    { file: "Jesuschrist.jpg", credit: "Hanna Asfours · Public Domain" },
    { file: "Jesus_ascending_to_heaven.jpg", credit: "John Singleton Copley · Public Domain" }
  ];
  const heroImage = document.querySelector(".hero-art img");
  if (heroImage) {
    let previous = "";
    try { previous = localStorage.getItem("verbum-hero-artwork") || ""; } catch {}
    const choices = jesusArtwork.filter(item => item.file !== previous);
    const selected = choices[Math.floor(Math.random() * choices.length)] || jesusArtwork[0];
    heroImage.src = "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(selected.file) + "?width=1000";
    heroImage.alt = "Artwork depicting Jesus Christ";
    const credit = document.querySelector(".hero-art .image-caption small");
    if (credit) credit.textContent = selected.credit + " · Wikimedia Commons";
    try { localStorage.setItem("verbum-hero-artwork", selected.file); } catch {}
  }

  const settingsDialog = $("#settingsDialog");
  const defaults = { language: "both", fontSize: "normal", theme: "midnight" };
  let settings = { ...defaults, ...readSettings() };
  if (!["midnight", "daylight"].includes(settings.theme)) settings.theme = "midnight";
  let lastVerse = "";
  let lastReflection = -1;

  const translations = {
    en: {
      quickVerse:"New Bible Verse", quickMessage:"Message from God", navHome:"Home", navReadings:"Daily readings", navVerse:"Random verse", navReflection:"Reflection", navSaints:"Saints", navPriest:"Church life", navPrayers:"Prayers", prayersTitle:"Prayer library", prayersDescription:"Traditional prayers and daily devotions in Arabic and English.", openPrayers:"Open the prayer library ↗", heroEyebrow:"A QUIETER PLACE FOR WHAT MATTERS", heroButton:"Read today’s Word", saintsButton:"Meet the saints",
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
      fontLabel:"Website text size", themeLabel:"Color theme", saveSettings:"Save settings"
    },
    ar: {
      quickVerse:"آية جديدة من الكتاب المقدّس", quickMessage:"رسالة من الله", navHome:"الرئيسية", navReadings:"قراءات اليوم", navVerse:"آية عشوائية", navReflection:"تأمّل", navSaints:"القديسون", navPriest:"الحياة الكنسية", navPrayers:"الصلوات", prayersTitle:"مكتبة الصلوات", prayersDescription:"صلوات كنسيّة وتأمّلات يومية بالعربية والإنجليزية.", openPrayers:"افتح مكتبة الصلوات ←", heroEyebrow:"مساحة هادئة لما هو أساسي", heroButton:"اقرأ كلمة اليوم", saintsButton:"تعرّف إلى القديسين",
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
      fontLabel:"حجم خط الموقع", themeLabel:"ألوان الموقع", saveSettings:"حفظ الإعدادات"
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
    const sizes = { small: ".9", normal: "1", large: "1.15", xlarge: "1.3" };
    document.documentElement.style.setProperty("--reading-scale", sizes[settings.fontSize] || "1");
    document.documentElement.style.setProperty("--site-scale", sizes[settings.fontSize] || "1");
    document.documentElement.lang = settings.language === "ar" ? "ar" : "en";
    document.documentElement.dir = "ltr";
    const t = settings.language === "ar" ? translations.ar : translations.en;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      if (!translations.en[key] || !translations.ar[key]) return;
      el.innerHTML = settings.language === "both"
        ? `<span class="bilingual-label bilingual-en">${translations.en[key]}</span><span class="bilingual-label bilingual-ar arabic" lang="ar" dir="rtl">${translations.ar[key]}</span>`
        : t[key];
    });
    document.querySelectorAll("[data-bilingual-en][data-bilingual-ar]").forEach(el => {
      const en = el.dataset.bilingualEn, ar = el.dataset.bilingualAr;
      el.innerHTML = settings.language === "ar" ? `<span class="arabic" lang="ar" dir="rtl">${ar}</span>`
        : settings.language === "both" ? `<span class="bilingual-label">${en}</span><span class="bilingual-label bilingual-ar arabic" lang="ar" dir="rtl">${ar}</span>` : en;
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
  function interfaceTitle(en, ar) {
    return settings.language === "ar" ? ar : settings.language === "en" ? en : `${en} · ${ar}`;
  }
  function interfaceLabel(en, ar) {
    if (settings.language === "ar") return `<span class="arabic" lang="ar" dir="rtl">${ar}</span>`;
    if (settings.language === "en") return en;
    return `${en} · <span class="arabic" lang="ar" dir="rtl">${ar}</span>`;
  }
  function chooseDifferent(list, previous) {
    if (list.length < 2) return 0;
    let index = Math.floor(Math.random() * list.length);
    while (index === previous) index = Math.floor(Math.random() * list.length);
    return index;
  }
  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
    return payload;
  }

  async function showRandomVerse() {
    const refs = window.BOT_DATA.randomVerses;
    let reference = refs[Math.floor(Math.random() * refs.length)];
    if (refs.length > 1) while (reference === lastVerse) reference = refs[Math.floor(Math.random() * refs.length)];
    lastVerse = reference;
    setPanel(interfaceTitle("A verse from Scripture","آية من الكتاب المقدّس"), `<p class="loading">✝ Loading Scripture… / جارٍ تحميل الآية…</p>`);
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
      setPanel(reference, `<article class="reading-block"><div class="reference">${escapeHtml(reference)}</div>${scripture}</article><h3>Meaning & reflection / المعنى والتأمّل</h3>${meaningHtml}<div class="inline-refresh-wrap"><button class="primary-button" data-action="verse">${settings.language === "ar" ? "آية جديدة" : "Another Bible verse"} ↻</button></div>`);
    } catch (error) {
      setPanel("Bible verse", `<p class="error-message">Could not load the complete verse. ${escapeHtml(error.message)}</p><p>${escapeHtml(reference)}</p><button class="primary-button" data-action="verse">Try another verse</button>`);
    }
  }

  async function showDailyReadings() {
    setPanel(interfaceTitle("Today's Maronite readings","قراءات اليوم"), `<p class="loading">⏳ Fetching OLM readings… / جارٍ جلب القراءات الليتورجية…</p>`);
    try {
      const beirutDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Beirut", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
      const data = await fetchJson(`./data/daily-readings.json?day=${beirutDate}`);
      let explanation = null;
      try {
        const candidate = await fetchJson("./data/gospel-explanation.json");
        if (candidate.date === data.date && candidate.gospelReference === data.gospel?.reference) {
          explanation = candidate;
        }
      } catch {}

      const explanationSection = (key, titleEn, titleAr) => {
        if (!explanation) return "";
        const en = explanation.english?.[key] || "";
        const ar = explanation.arabic?.[key] || "";
        if (!en && !ar) return "";
        if (settings.language === "en") return `<article class="reading-block"><h3>${titleEn}</h3><p class="feature-copy">${escapeHtml(en)}</p></article>`;
        if (settings.language === "ar") return `<article class="reading-block" dir="rtl"><h3>${titleAr}</h3><p class="feature-copy arabic" lang="ar" dir="rtl">${escapeHtml(ar)}</p></article>`;
        return `<article class="reading-block"><h3>${titleEn} · ${titleAr}</h3><div class="two-language"><p class="feature-copy">${escapeHtml(en)}</p><p class="feature-copy arabic" lang="ar" dir="rtl">${escapeHtml(ar)}</p></div></article>`;
      };
      const explanationHtml = explanation
        ? `<section class="daily-gospel-explanation"><div class="feature-hero"><span class="feature-kicker">UNDERSTANDING GOD'S WORD · فَهْم كَلِمَةِ الله</span><h3>Today's Gospel, explained simply</h3><p class="arabic" lang="ar" dir="rtl">شرح مبسّط لإنجيل اليوم</p></div>
            ${explanationSection("whatHappened","What happens in the Gospel?","ماذا يحدث في الإنجيل؟")}
            ${explanationSection("jesusTeaches","What is Jesus teaching us?","ماذا يعلّمنا يسوع؟")}
            ${explanationSection("liveToday","How can we live this today?","كيف نعيش هذا الإنجيل اليوم؟")}
            ${explanationSection("prayer","A short prayer","صلاة قصيرة")}
            <p class="meaning">AI-assisted devotional explanation based on today's Gospel. It is not an official Church document. · <span class="arabic" lang="ar" dir="rtl">تأمّل روحي بمساعدة الذكاء الاصطناعي، يستند إلى إنجيل اليوم، وليس وثيقة كنسيّة رسميّة.</span></p></section>`
        : "";
      const blocks = [];
      for (const item of [data.epistle, data.gospel]) {
        if (!item) continue;
        const heading = item.type === "epistle" ? (settings.language === "ar" ? "الرسالة" : "Epistle") : (settings.language === "ar" ? "الإنجيل" : "Gospel");
        const text = settings.language === "ar" ? item.arabic : settings.language === "en" ? item.english : null;
        let body = "";
        if (settings.language === "both") {
          body = `<div class="two-language"><div class="language-column"><div class="reference">ENGLISH${item.englishVersion ? " · " + escapeHtml(item.englishVersion) : ""} · ${escapeHtml(item.englishReference || item.reference)}</div><div class="scripture">${escapeHtml(item.english || "English text unavailable for this reference.")}</div></div><div class="language-column" dir="rtl"><div class="reference">العربية · ${escapeHtml(item.reference)}</div><div class="scripture arabic" dir="rtl">${escapeHtml(item.arabic || "النص العربي غير متاح لهذا المرجع.")}</div></div></div>`;
        } else {
          body = `<div class="reference">${escapeHtml(settings.language === "ar" ? item.reference : (item.englishVersion || "English") + " · " + (item.englishReference || item.reference))}</div><div class="scripture ${settings.language === "ar" ? "arabic" : ""}" ${settings.language === "ar" ? 'dir="rtl"' : ""}>${escapeHtml(text || (settings.language === "ar" ? "النص غير متاح." : "Text unavailable."))}</div>`;
        }
        blocks.push(`<article class="reading-block"><h3>${heading}</h3>${body}</article>`);
      }
      if (!blocks.length) throw new Error("The OLM page did not return the daily reading references.");
      const color = data.liturgicalColor || "Not detected";
      setPanel(data.liturgicalDay || "Today's readings", `<p class="reference">${escapeHtml(data.date || "")}</p>${explanationHtml}${blocks.join("")}<p class="meaning">✦ ${interfaceLabel("Liturgical color","اللون الليتورجيّ")}: ${escapeHtml(color)}</p><p class="meaning">${interfaceLabel("Source: <a href=\"https://www.olm.org.lb/ar/liturgical-calendar\" target=\"_blank\" rel=\"noopener\">OLM Maronite Liturgical Calendar</a>","المصدر: <a href=\"https://www.olm.org.lb/ar/liturgical-calendar\" target=\"_blank\" rel=\"noopener\">الروزنامة الليتورجية المارونية OLM</a>")}</p>`);
    } catch (error) {
      setPanel(settings.language === "ar" ? "تعذّر تحميل القراءات" : "Readings unavailable", `<p class="error-message">${escapeHtml(error.message)}</p><p class="meaning">${interfaceLabel("The latest readings could not be loaded. Please try again later.","تعذّر تحميل أحدث القراءات. يُرجى المحاولة مجددًا لاحقًا.")}</p>`);
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
    setPanel(interfaceTitle("A reflection for today","تأمّل اليوم"), `<article class="reading-block">${body}</article><p class="meaning">${interfaceLabel("🙏 Take a quiet moment to reflect and pray.","🙏 خذ لحظة هادئة للتأمّل والصلاة.")}</p><div class="inline-refresh-wrap"><button class="primary-button" data-action="reflection">${interfaceLabel("Another message from God","رسالة أخرى من الله")} ↻</button></div>`);
  }


  function showPrayers(category = "all") {
    const library = window.PRAYER_DATA;
    if (!library?.items?.length) {
      setPanel(settings.language === "ar" ? "مكتبة الصلوات" : "Prayer library", '<p class="error-message">Prayer content could not be loaded.</p>');
      return;
    }
    const isArabic = settings.language === "ar";
    const title = interfaceTitle("Prayer Library","مكتبة الصلوات");
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


  // Verbum Dei community features — all content is local/static; no notification system.
  const featureText = (en, ar) => settings.language === "ar"
    ? `<p class="feature-copy arabic" lang="ar" dir="rtl">${escapeHtml(ar)}</p>`
    : settings.language === "en"
      ? `<p class="feature-copy">${escapeHtml(en)}</p>`
      : `<div class="two-language"><p class="feature-copy">${escapeHtml(en)}</p><p class="feature-copy arabic" lang="ar" dir="rtl">${escapeHtml(ar)}</p></div>`;
  const rosaryMysteries = {
    joyful: {en:"Joyful Mysteries",ar:"الأسرار الفَرَحيّة",days:"Monday · Saturday",items:[["The Annunciation","البشارة"],["The Visitation","الزيارة"],["The Nativity of Jesus","ميلاد يسوع"],["The Presentation","تقدمة يسوع في الهيكل"],["The Finding of Jesus in the Temple","وجود يسوع في الهيكل"]]},
    luminous:{en:"Luminous Mysteries",ar:"الأسرار النورانيّة",days:"Thursday",items:[["The Baptism of Jesus","معمودية يسوع"],["The Wedding at Cana","عرس قانا الجليل"],["The Proclamation of the Kingdom","إعلان ملكوت الله"],["The Transfiguration","التجلّي"],["The Institution of the Eucharist","تأسيس سرّ الإفخارستيا"]]},
    sorrowful:{en:"Sorrowful Mysteries",ar:"الأسرار الحُزنيّة",days:"Tuesday · Friday",items:[["The Agony in the Garden","صلاة يسوع في البستان"],["The Scourging at the Pillar","جلد يسوع"],["The Crowning with Thorns","إكليل الشوك"],["The Carrying of the Cross","حمل الصليب"],["The Crucifixion","صلب يسوع"]]},
    glorious:{en:"Glorious Mysteries",ar:"الأسرار المجيدة",days:"Wednesday · Sunday",items:[["The Resurrection","القيامة"],["The Ascension","الصعود"],["The Descent of the Holy Spirit","حلول الروح القدس"],["The Assumption of Mary","انتقال العذراء"],["The Coronation of Mary","إكليل العذراء"]]}
  };
  const rosaryPrayers = [
    {en:"Begin with the Sign of the Cross",ar:"ابدأ بإشارة الصليب"},
    {en:"The Apostles’ Creed",ar:"قانون الإيمان"},
    {en:"Our Father",ar:"أبانا الذي"},
    {en:"Hail Mary — for faith",ar:"السلام عليك يا مريم — من أجل الإيمان"},
    {en:"Hail Mary — for hope",ar:"السلام عليك يا مريم — من أجل الرجاء"},
    {en:"Hail Mary — for charity",ar:"السلام عليك يا مريم — من أجل المحبّة"},
    {en:"Glory Be",ar:"المجد للآب"}
  ];
  let rosaryState = { mystery:"joyful", phase:0, decade:0, bead:0 };
  function rosaryStepList() {
    const steps = [...rosaryPrayers];
    const m = rosaryMysteries[rosaryState.mystery];
    for(let d=0;d<5;d++){
      steps.push({en:`Decade ${d+1}: ${m.items[d][0]} — Our Father`,ar:`العشرة ${d+1}: ${m.items[d][1]} — أبانا الذي`});
      for(let n=1;n<=10;n++) steps.push({en:`Decade ${d+1}, Hail Mary ${n} of 10`,ar:`العشرة ${d+1}، السلام عليك يا مريم ${n} من 10`});
      steps.push({en:`Decade ${d+1}: Glory Be and the Fatima Prayer`,ar:`العشرة ${d+1}: المجد للآب وصلاة فاطيما`});
    }
    steps.push({en:"Conclude with the Hail Holy Queen and the Sign of the Cross",ar:"اختم بصلاة السلام عليكِ يا ملكة، ثم إشارة الصليب"});
    return steps;
  }

  function rosaryPrayerWords(step){
    const s=step.en;
    if(s.includes("Our Father"))return {en:"Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",ar:"أبانا الذي في السماوات، ليتقدّس اسمك، ليأتِ ملكوتك، لتكن مشيئتك كما في السماء كذلك على الأرض. خبزنا كفافنا أعطنا اليوم، واغفر لنا ذنوبنا كما نحن نغفر لمن أخطأ إلينا، ولا تدخلنا في التجربة، لكن نجّنا من الشرير. آمين."};
    if(s.includes("Hail Mary")||s.includes("السلام عليك يا مريم"))return {en:"Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",ar:"السلام عليك يا مريم، يا ممتلئة نعمة، الرب معك. مباركة أنتِ في النساء، ومباركة ثمرة بطنكِ يسوع. يا قديسة مريم، يا والدة الله، صلّي لأجلنا نحن الخطأة، الآن وفي ساعة موتنا. آمين."};
    if(s.includes("Glory Be"))return {en:"Glory be to the Father, and to the Son, and to the Holy Spirit; as it was in the beginning, is now, and ever shall be, world without end. Amen.",ar:"المجد للآب والابن والروح القدس، كما كان في البدء والآن وكلّ أوان وإلى دهر الداهرين. آمين."};
    if(s.includes("Fatima Prayer"))return {en:"O my Jesus, forgive us our sins, save us from the fires of hell, and lead all souls to Heaven, especially those most in need of your mercy. Amen.",ar:"يا يسوعي، اغفر لنا خطايانا، ونجّنا من نار جهنّم، وخذ إلى السماء جميع النفوس، ولا سيّما أكثرها احتياجًا إلى رحمتك. آمين."};
    if(s.includes("Apostles’ Creed"))return {en:"I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; he descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from there he will come to judge the living and the dead. I believe in the Holy Spirit, the holy Catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.",ar:"أؤمن بالله، الآب القدير، خالق السماء والأرض، وبابنه الوحيد يسوع المسيح ربّنا، الذي حُبل به من الروح القدس، ووُلد من مريم العذراء، وتألم على عهد بيلاطس البنطي، وصُلب ومات ودُفن، ونزل إلى الجحيم، وقام في اليوم الثالث من بين الأموات، وصعد إلى السماوات، وجلس عن يمين الله الآب القدير، ومن هناك يأتي ليدين الأحياء والأموات. أؤمن بالروح القدس، والكنيسة المقدسة الجامعة، وشركة القديسين، ومغفرة الخطايا، وقيامة الجسد، والحياة الأبدية. آمين."};
    if(s.includes("Hail Holy Queen"))return {en:"Hail, holy Queen, Mother of mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious Advocate, thine eyes of mercy toward us; and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Pray for us, O holy Mother of God, that we may be made worthy of the promises of Christ. Amen.",ar:"السلام عليكِ يا ملكة، يا أمّ الرحمة، يا حياتنا وحلاوتنا ورجاءنا. إليكِ نصرخ نحن أبناء حواء المنفيّين. إليكِ نرفع زفراتنا نائحين وباكين في هذا الوادي من الدموع. فالتفتي إلينا يا شفيعتنا الحنونة، وأرينا بعد هذا المنفى يسوع ثمرة بطنكِ المباركة. يا حنونة، يا رؤوفة، يا عذراء مريم الحلوة. صلّي لأجلنا يا والدة الله القديسة، لكي نستحق مواعيد المسيح. آمين."};
    if(s.includes("Sign of the Cross"))return {en:"In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",ar:"باسم الآب والابن والروح القدس، الإله الواحد. آمين."};
    return {en:"Take a moment to pray and meditate on this mystery.",ar:"خذ لحظة للصلاة والتأمّل في هذا السرّ."};
  }
  async function showGospelFeature(){
    setPanel("Gospel of the Day · إنجيل اليوم",'<p class="loading">Loading today’s Gospel… / جارٍ تحميل إنجيل اليوم…</p>');
    try{
      const data=await fetchJson("./data/daily-readings.json"),g=data.gospel;
      if(!g||(!g.english&&!g.arabic))throw new Error("The Gospel text is not available right now.");
      const body=settings.language==="en"?`<div class="reference">${escapeHtml(g.englishVersion||"English")} · ${escapeHtml(g.englishReference||g.reference||"Gospel")}</div><p class="scripture">${escapeHtml(g.english||"English text unavailable.")}</p>`:settings.language==="ar"?`<div class="reference">${escapeHtml(g.reference||"الإنجيل")}</div><p class="scripture arabic" dir="rtl">${escapeHtml(g.arabic||"النص العربي غير متاح.")}</p>`:`<div class="two-language"><div><div class="reference">ENGLISH${g.englishVersion ? " · " + escapeHtml(g.englishVersion) : ""} · ${escapeHtml(g.englishReference||g.reference||"Gospel")}</div><p class="scripture">${escapeHtml(g.english||"English text unavailable.")}</p></div><div dir="rtl"><div class="reference">العربية · ${escapeHtml(g.reference||"الإنجيل")}</div><p class="scripture arabic" dir="rtl">${escapeHtml(g.arabic||"النص العربي غير متاح.")}</p></div></div>`;

      let explanation = null;
      try {
        const candidate = await fetchJson("./data/gospel-explanation.json");
        if (candidate.date === data.date && candidate.gospelReference === g.reference) explanation = candidate;
      } catch {}

      const section = (key, titleEn, titleAr) => {
        if (!explanation) return "";
        const en = explanation.english?.[key] || "";
        const ar = explanation.arabic?.[key] || "";
        if (settings.language === "en") return `<article class="reading-block"><h3>${titleEn}</h3><p class="feature-copy">${escapeHtml(en)}</p></article>`;
        if (settings.language === "ar") return `<article class="reading-block" dir="rtl"><h3>${titleAr}</h3><p class="feature-copy arabic" lang="ar" dir="rtl">${escapeHtml(ar)}</p></article>`;
        return `<article class="reading-block"><h3>${titleEn} · ${titleAr}</h3><div class="two-language"><p class="feature-copy">${escapeHtml(en)}</p><p class="feature-copy arabic" lang="ar" dir="rtl">${escapeHtml(ar)}</p></div></article>`;
      };

      const explanationHtml = explanation
        ? `<div class="feature-hero"><span class="feature-kicker">UNDERSTANDING GOD'S WORD · فَهْم كَلِمَةِ الله</span><h3>Let's understand today's Gospel</h3><p class="arabic" lang="ar" dir="rtl">لنفهم إنجيل اليوم</p></div>
          ${section("whatHappened","What happens in the Gospel?","ماذا يحدث في الإنجيل؟")}
          ${section("jesusTeaches","What is Jesus teaching us?","ماذا يعلّمنا يسوع؟")}
          ${section("liveToday","How can we live this today?","كيف نعيش هذا الإنجيل اليوم؟")}
          ${section("prayer","A short prayer","صلاة قصيرة")}
          <p class="meaning">AI-assisted devotional explanation based on today's Gospel. It is not an official Church document. If a question is disputed or unclear, ask a priest or trusted catechist. · <span class="arabic" lang="ar" dir="rtl">تأمّل روحي بمساعدة الذكاء الاصطناعي، يستند إلى إنجيل اليوم، وليس وثيقة كنسيّة رسميّة. عند وجود سؤال خلافي أو غير واضح، استشر كاهنًا أو معلّمًا موثوقًا في الإيمان.</span></p>`
        : `<div class="feature-hero"><h3>Today's explanation is being prepared.</h3><p class="arabic" lang="ar" dir="rtl">يجري إعداد شرح إنجيل اليوم.</p><p>The Gospel text is available above. The explanation will appear after the daily preparation succeeds.</p></div>`;

      setPanel("Gospel of the Day · إنجيل اليوم",`<p class="meaning">${escapeHtml(data.liturgicalDay||"Today's liturgy")} · ${escapeHtml(data.date||"")}</p><article class="reading-block">${body}</article>${explanationHtml}<div class="feature-hero"><h3>${interfaceLabel("Pause and reflect","توقّف وتأمّل")}</h3><p class="arabic" dir="rtl">توقّف وتأمّل</p><ol class="reflection-questions"><li>What word or moment in this Gospel stays with you?</li><li>What might Jesus be inviting you to do today?</li><li>Who could you treat with greater kindness because of this Gospel?</li></ol><ol class="reflection-questions arabic" dir="rtl"><li>ما الكلمة أو اللحظة التي بقيت في قلبك من هذا الإنجيل؟</li><li>إلى ماذا يدعوك يسوع اليوم؟</li><li>كيف يمكنك أن تعامل أحدًا بمحبّة أكبر؟</li></ol></div><button class="text-button" data-action="daily">${interfaceLabel("Read the Epistle too ↗","اقرأ الرسالة أيضًا ←")}</button><p class="meaning">Daily reading source: OLM Maronite Liturgical Calendar. · مصدر القراءات: الروزنامة الليتورجية المارونية OLM.</p>`);
    }catch(error){setPanel("Gospel unavailable · تعذّر تحميل الإنجيل",`<p class="error-message">${escapeHtml(error.message)}</p><button class="text-button" data-action="daily">Try daily readings ↗</button>`);}
  }

  function showRosary() {
    const m=rosaryMysteries[rosaryState.mystery], steps=rosaryStepList();
    const index=Math.min(rosaryState.phase,steps.length-1), step=steps[index], words=rosaryPrayerWords(step);
    const progress=Math.round((index/(steps.length-1))*100);
    setPanel("Pray the Rosary · صلِّ المسبحة",`
      <div class="feature-hero"><span class="feature-kicker">VERBUM DEI · PRAYER GUIDE</span><h3>${interfaceLabel("Walk through the Rosary","صلِّ المسبحة خطوةً خطوة")}</h3><p>${interfaceLabel("Take your time. You can pause or restart whenever you wish.","خذ وقتك، ويمكنك التوقّف أو البدء من جديد متى شئت.")}</p></div>
      <div class="feature-toolbar"><label for="rosaryMystery">Choose the mysteries / اختر الأسرار</label><select id="rosaryMystery">${Object.entries(rosaryMysteries).map(([id,x])=>`<option value="${id}" ${id===rosaryState.mystery?"selected":""}>${x.en} · ${x.ar}</option>`).join("")}</select></div>
      <p class="meaning">${m.days} · ${m.en} / ${m.ar}</p>
      <div class="progress-track"><span style="width:${progress}%"></span></div><p class="reference">${interfaceLabel("PRAYER "+(index+1)+" OF "+steps.length,"الصلاة "+(index+1)+" من "+steps.length)}</p>
      <article class="prayer-entry rosary-current"><h3>${escapeHtml(step.en)}</h3><p class="meaning">${escapeHtml(step.ar)}</p><div class="two-language"><p class="prayer-text">${escapeHtml(words.en)}</p><p class="prayer-text arabic" lang="ar" dir="rtl">${escapeHtml(words.ar)}</p></div><p class="meaning">${interfaceLabel("Mystery "+Math.min(5,Math.max(1,Math.ceil(Math.max(0,index-7)/12)))+" of 5 · Take a quiet moment.","السرّ "+Math.min(5,Math.max(1,Math.ceil(Math.max(0,index-7)/12)))+" من 5 · خذ لحظة هادئة.")}</p></article>
      <div class="feature-actions"><button class="quiet-button" data-rosary-reset>${interfaceLabel("Restart","إعادة البدء")}</button><button class="primary-button" data-rosary-next>${index===steps.length-1?interfaceLabel("Finish","إنهاء"):interfaceLabel("Next prayer →","الصلاة التالية ←")}</button></div>
      <p class="meaning">The guide helps you keep your place; pray the full traditional texts aloud or from your own prayer book. / هذا الدليل يساعدك على متابعة ترتيب الصلاة.</p>`);
  }
  // Quiz bank: add carefully checked, individually written questions here.
  // A visitor's used-question history is saved locally on their device.
  const quizQuestions=[
    {id:"b001",q:"Where was Jesus born?",a:["Nazareth","Bethlehem","Jerusalem"],correct:1,why:"The Gospels of Matthew and Luke name Bethlehem as the place of Jesus’ birth.",ar:"تذكر إنجيلا متّى ولوقا أنّ يسوع وُلد في بيت لحم."},
    {id:"b002",q:"Who baptised Jesus in the Jordan?",a:["Peter","John the Baptist","James"],correct:1,why:"John the Baptist baptised Jesus in the Jordan River.",ar:"عمّد يوحنّا المعمدان يسوع في نهر الأردن."},
    {id:"b003",q:"What is the first book of the Bible?",a:["Genesis","Psalms","Exodus"],correct:0,why:"Genesis is the opening book of the Bible.",ar:"سفر التكوين هو السفر الأوّل في الكتاب المقدّس."},
    {id:"b004",q:"Which apostle is traditionally associated with the keys of the Kingdom?",a:["Peter","Thomas","Andrew"],correct:0,why:"Jesus speaks of giving Peter the keys of the Kingdom in Matthew 16:19.",ar:"يتحدّث يسوع عن إعطاء بطرس مفاتيح الملكوت في متّى 16:19."},
    {id:"b005",q:"What is the central celebration of the Eucharist?",a:["The Mass / Divine Liturgy","The baptismal service","The funeral rite"],correct:0,why:"Catholics celebrate the Eucharist in the Mass; Eastern Catholics also call it the Divine Liturgy.",ar:"يحتفل الكاثوليك بالقربان المقدّس في القداس الإلهي."},
    {id:"b006",q:"Which Lebanese saint is known as the hermit of Annaya?",a:["Saint Rafqa","Saint Charbel","Saint Nimatullah"],correct:1,why:"Saint Charbel lived as a monk and hermit at Annaya in Lebanon.",ar:"عاش القديس شربل راهبًا وناسكًا في عنايا في لبنان."},
    {id:"b007",q:"How many Gospels are in the New Testament?",a:["Two","Four","Seven"],correct:1,why:"The four canonical Gospels are Matthew, Mark, Luke and John.",ar:"الأناجيل الأربعة هي متّى ومرقس ولوقا ويوحنّا."},
    {id:"b008",q:"What season prepares the Church for Christmas?",a:["Lent","Advent","Easter"],correct:1,why:"Advent is the season of preparation and expectation before Christmas.",ar:"زمن المجيء هو زمن الاستعداد وانتظار عيد الميلاد."},
    {id:"b009",q:"Where is the Qadisha Valley?",a:["North Lebanon","South Lebanon","Beirut"],correct:0,why:"The Qadisha Valley is in northern Lebanon and is deeply connected with Maronite monastic history.",ar:"يقع وادي قاديشا في شمال لبنان ويرتبط بتاريخ الرهبنة المارونية."},
    {id:"b010",q:"What does ‘Alleluia’ mean?",a:["Peace be with you","Praise the Lord","Go in peace"],correct:1,why:"Alleluia comes from Hebrew and means ‘Praise the Lord’.",ar:"هللويا كلمة من أصل عبري تعني سبّحوا الرب."},
    {id:"b011",q:"Who led the Israelites out of Egypt?",a:["Moses","David","Solomon"],correct:0,why:"In Exodus, God calls Moses to lead the Israelites out of slavery in Egypt.",ar:"في سفر الخروج، دعا الله موسى ليقود بني إسرائيل من العبودية في مصر."},
    {id:"b012",q:"Which disciple betrayed Jesus?",a:["John","Judas Iscariot","Philip"],correct:1,why:"The Gospel accounts identify Judas Iscariot as the disciple who handed Jesus over.",ar:"تذكر الأناجيل يهوذا الإسخريوطي بوصفه التلميذ الذي أسلم يسوع."},
    {id:"b013",q:"What is the last book of the Bible?",a:["Acts","Revelation","Hebrews"],correct:1,why:"The Book of Revelation is the final book in the Christian Bible.",ar:"سفر الرؤيا هو السفر الأخير في الكتاب المقدّس المسيحي."},
    {id:"b014",q:"Who was the mother of Jesus?",a:["Martha","Mary","Elizabeth"],correct:1,why:"The Gospels identify Mary as the mother of Jesus.",ar:"تذكر الأناجيل مريم أمًّا ليسوع."},
    {id:"b015",q:"Which giant did David defeat?",a:["Goliath","Saul","Absalom"],correct:0,why:"First Samuel 17 tells the story of David and Goliath.",ar:"يروي سفر صموئيل الأول 17 قصّة داود وجليات."},
    {id:"b016",q:"Which Lebanese saint was born in Himlaya in 1832?",a:["Saint Rafqa","Saint Charbel","Saint Maron"],correct:0,why:"Saint Rafqa, born Boutrossieh, was born in Himlaya, Lebanon, in 1832.",ar:"وُلدت القديسة رفقا، واسمها عند الولادة بطرسية، في حميلة سنة 1832."},
    {id:"b017",q:"In which Lebanese village was Saint Nimatullah al-Hardini born?",a:["Annaya","Hardine","Jrabta"],correct:1,why:"Saint Nimatullah al-Hardini was born in Hardine in northern Lebanon in 1808.",ar:"وُلد القديس نعمة الله الحرديني في بلدة حردين في شمال لبنان سنة 1808."},
    {id:"b018",q:"Which Lebanese saint was born Youssef Makhlouf?",a:["Saint Charbel","Saint Nimatullah","Saint Rafqa"],correct:0,why:"Saint Charbel was born Youssef Antoun Makhlouf in Bekaa Kafra in 1828.",ar:"وُلد القديس شربل باسم يوسف أنطون مخلوف في بقاعكفرا سنة 1828."},
    {id:"b019",q:"Which saint was the teacher of Saint Charbel at the Lebanese Maronite Order?",a:["Saint Nimatullah al-Hardini","Saint Francis of Assisi","Saint Anthony of Padua"],correct:0,why:"Saint Nimatullah al-Hardini taught at Kfifan, where Saint Charbel studied.",ar:"علّم القديس نعمة الله الحرديني في كفيفان، حيث درس القديس شربل."},
    {id:"b020",q:"Where is Saint Rafqa's shrine and monastery associated with her final years?",a:["Jrabta","Annaya","Kfifan"],correct:0,why:"Saint Rafqa spent her final years at the monastery of Saint Joseph in Jrabta.",ar:"أمضت القديسة رفقا سنواتها الأخيرة في دير مار يوسف في جربتا."},
    {id:"b021",q:"Which Lebanese saint is known as the hermit of Annaya?",a:["Saint Charbel","Saint Rafqa","Saint Nimatullah"],correct:0,why:"Saint Charbel lived as a monk and hermit in Annaya.",ar:"عاش القديس شربل راهبًا وناسكًا في عنايا."},
    {id:"b022",q:"Which Lebanese saint is remembered for her patience and deep faith?",a:["Saint Rafqa","Saint Charbel","Saint Nimatullah"],correct:0,why:"Saint Rafqa is remembered for her prayer, faith and patience.",ar:"تُذكر القديسة رفقا بصلاتها وإيمانها وصبرها."},
    {id:"b023",q:"Which Lebanese saint was a monk and teacher at Kfifan?",a:["Saint Nimatullah al-Hardini","Saint Charbel","Saint Maron"],correct:0,why:"Saint Nimatullah al-Hardini was a monk and teacher of the Lebanese Maronite Order.",ar:"كان القديس نعمة الله الحرديني راهبًا ومعلّمًا في الرهبانية اللبنانية المارونية."},
    {id:"b024",q:"Which saint gave his name to the Maronite Church?",a:["Saint Maron","Saint Charbel","Saint Nimatullah"],correct:0,why:"The Maronite Church takes its name from Saint Maron.",ar:"تحمل الكنيسة المارونية اسم القديس مارون."},
    {id:"b025",q:"Which young martyr is especially honoured in the Christian tradition of Byblos?",a:["Saint Aquilina","Saint Charbel","Saint Nimatullah"],correct:0,why:"Saint Aquilina is traditionally honoured as a young martyr of Byblos.",ar:"تُكرّم القديسة أكويلينا في التقليد كشهيدة شابّة من جبيل."},
    {id:"b026",q:"Which Lebanese blessed was a famous Maronite patriarch and scholar from Ehden?",a:["Blessed Stephen Douaihy","Saint Charbel","Saint Nimatullah"],correct:0,why:"Blessed Stephen Douaihy was a Maronite patriarch, historian and scholar from Ehden.",ar:"كان الطوباوي اسطفان الدويهي بطريركًا مارونيًا ومؤرّخًا وعالمًا من إهدن."},
    {id:"b027",q:"Which saint is often invoked for difficult or impossible situations?",a:["Saint Rita of Cascia","Saint Charbel","Saint Nimatullah"],correct:0,why:"Saint Rita of Cascia is widely known as the saint of impossible causes.",ar:"تُعرف القديسة ريتا الكاشية بشفيعة الأمور المستحيلة."},
    {id:"b028",q:"Which saint is known as the patron of lost things?",a:["Saint Anthony of Padua","Saint Charbel","Saint Nimatullah"],correct:0,why:"Many Catholics pray to Saint Anthony of Padua when searching for lost things.",ar:"يلجأ كثيرون إلى القديس أنطونيوس البادواني عندما يفقدون شيئًا."},
    {id:"b029",q:"Which saint is famous for his love of animals and care for creation?",a:["Saint Francis of Assisi","Saint Charbel","Saint Nimatullah"],correct:0,why:"Saint Francis of Assisi is remembered for his love of creation and all creatures.",ar:"يُذكر القديس فرنسيس الأسيزي بمحبّته للخليقة ولكل المخلوقات."},
    {id:"b030",q:"Which saint is known as the Little Flower?",a:["Saint Thérèse of Lisieux","Saint Charbel","Saint Nimatullah"],correct:0,why:"Saint Thérèse of Lisieux is widely known as the Little Flower.",ar:"تُعرف القديسة تريزيا الطفل يسوع بلقب الوردة الصغيرة."},
    {id:"b031",q:"Which saint was a Capuchin priest known as Padre Pio?",a:["Saint Pio of Pietrelcina","Saint Charbel","Saint Nimatullah"],correct:0,why:"Saint Pio of Pietrelcina, known as Padre Pio, was a Capuchin priest.",ar:"كان القديس بيو من بيتريلتشينا، المعروف بالأب بيو، كاهنًا كبوشيًا."},
    {id:"b032",q:"Which saint founded the Missionaries of Charity and served the poor in India?",a:["Saint Teresa of Calcutta","Saint Charbel","Saint Nimatullah"],correct:0,why:"Saint Teresa of Calcutta founded the Missionaries of Charity and served people in need.",ar:"أسّست القديسة تريزا الكلكوتية جمعية مرسلات المحبة وخدمت الفقراء والمحتاجين."},
    {id:"b033",q:"Which saint was pope from 1978 to 2005 and was born in Poland?",a:["Saint John Paul II","Saint Charbel","Saint Nimatullah"],correct:0,why:"Saint John Paul II was pope from 1978 until 2005.",ar:"كان القديس يوحنا بولس الثاني بابا من سنة 1978 حتى سنة 2005."},
    {id:"b034",q:"Who was the foster father of Jesus?",a:["Saint Joseph","Saint Charbel","Saint Nimatullah"],correct:0,why:"Saint Joseph was the husband of Mary and the earthly foster father of Jesus.",ar:"كان القديس يوسف خطيب مريم ومربّي يسوع على الأرض."},
    {id:"b035",q:"Who is the mother of Jesus?",a:["The Blessed Virgin Mary","Saint Charbel","Saint Nimatullah"],correct:0,why:"Mary is honoured by Christians as the mother of Jesus.",ar:"تكرّم الكنيسة مريم العذراء بوصفها أمّ يسوع."},
    {id:"b036",q:"Which apostle is traditionally regarded as the first pope?",a:["Saint Peter","Saint Charbel","Saint Nimatullah"],correct:0,why:"Catholic tradition regards Saint Peter as the first pope.",ar:"يعتبر التقليد الكاثوليكي القديس بطرس أول بابا."},
    {id:"b037",q:"Which apostle travelled widely to preach Christ and wrote many New Testament letters?",a:["Saint Paul","Saint Charbel","Saint Nimatullah"],correct:0,why:"Saint Paul travelled widely to preach Christ and wrote several New Testament letters.",ar:"سافر القديس بولس إلى بلدان كثيرة ليبشّر بالمسيح وكتب عددًا من رسائل العهد الجديد."}
  ];

  const extraQuizQuestions = [
    ["Who built the ark?","Noah","Abraham","Moses",0,"Genesis describes Noah building the ark before the flood.","يصف سفر التكوين بناء نوح للفلك قبل الطوفان."],
    ["Who was the first woman in Genesis?","Sarah","Eve","Rebekah",1,"Genesis presents Eve as the first woman.","يقدّم سفر التكوين حواء بوصفها المرأة الأولى."],
    ["What sign did God give Noah after the flood?","A rainbow","A dove","A burning bush",0,"In Genesis 9, God sets the rainbow as the sign of the covenant.","في التكوين 9 جعل الله قوس قزح علامة العهد."],
    ["Who was Abraham's wife?","Rachel","Leah","Sarah",2,"Sarah is named as Abraham's wife in Genesis.","سارة هي زوجة إبراهيم في سفر التكوين."],
    ["What new name was given to Jacob?","Israel","Judah","Benjamin",0,"God gives Jacob the name Israel in Genesis 32.","أعطى الله يعقوب اسم إسرائيل في التكوين 32."],
    ["Which son of Jacob received a special robe?","Joseph","Reuben","Levi",0,"Genesis 37 tells how Jacob gave Joseph a special robe.","يروي التكوين 37 كيف أعطى يعقوب يوسف قميصًا مميّزًا."],
    ["Who interpreted Pharaoh's dreams in Egypt?","Aaron","Joseph","Joshua",1,"Joseph interpreted Pharaoh's dreams in Genesis 41.","فسّر يوسف أحلام فرعون في التكوين 41."],
    ["What was the name of Moses' brother?","Aaron","Caleb","Eleazar",0,"Aaron was Moses' brother and served as his spokesman.","كان هارون أخا موسى وتكلّم باسمه أمام فرعون."],
    ["What sea did the Israelites cross during the Exodus?","Dead Sea","Red Sea","Sea of Galilee",1,"The Exodus account describes the Israelites crossing the Red Sea.","يروي سفر الخروج عبور بني إسرائيل البحر الأحمر."],
    ["Who succeeded Moses as leader of Israel?","Joshua","Samuel","Gideon",0,"Joshua led Israel after Moses.","قاد يشوع بني إسرائيل بعد موسى."],
    ["What city did the Israelites march around before its walls fell?","Jericho","Ai","Hebron",0,"Joshua 6 recounts the fall of Jericho.","يروي يشوع 6 سقوط أريحا."],
    ["Who was the strong judge whose hair was cut?","Samson","Gideon","Samuel",0,"Judges 16 tells how Samson lost his strength after his hair was cut.","يروي القضاة 16 كيف فقد شمشون قوّته بعد قصّ شعره."],
    ["Who was Ruth's mother-in-law?","Naomi","Hannah","Miriam",0,"Ruth stayed with her mother-in-law Naomi.","رافقت راعوث حماتها نعمي."],
    ["Who was the mother of Samuel?","Hannah","Deborah","Abigail",0,"Hannah prayed for a child and became Samuel's mother.","صلّت حنّة طالبةً ولدًا وأصبحت أم صموئيل."],
    ["Which prophet confronted the prophets of Baal on Mount Carmel?","Elijah","Isaiah","Jeremiah",0,"First Kings 18 describes Elijah's challenge on Mount Carmel.","يصف سفر الملوك الأول 18 مواجهة إيليا على جبل الكرمل."],
    ["Which king asked God for wisdom?","Solomon","Saul","Hezekiah",0,"Solomon asked God for an understanding heart in 1 Kings 3.","طلب سليمان من الله قلبًا حكيمًا في الملوك الأول 3."],
    ["Who was thrown into the lions' den?","Daniel","Ezekiel","Nehemiah",0,"Daniel 6 tells the story of Daniel in the lions' den.","يروي دانيال 6 قصّة دانيال في جب الأسود."],
    ["Which prophet was swallowed by a great fish?","Jonah","Amos","Micah",0,"The Book of Jonah tells how a great fish swallowed Jonah.","يروي سفر يونان كيف ابتلعه حوت عظيم."],
    ["Which queen visited Solomon to test his wisdom?","Queen of Sheba","Queen Esther","Queen Jezebel",0,"First Kings 10 describes the Queen of Sheba visiting Solomon.","يصف سفر الملوك الأول 10 زيارة ملكة سبأ لسليمان."],
    ["Who rebuilt Jerusalem's walls after the exile?","Nehemiah","Ezra","Job",0,"Nehemiah led the rebuilding of Jerusalem's walls.","قاد نحميا إعادة بناء أسوار أورشليم."],
    ["Who was the mother of John the Baptist?","Elizabeth","Martha","Salome",0,"Luke 1 identifies Elizabeth as John the Baptist's mother.","يذكر لوقا 1 أليصابات أمًّا ليوحنا المعمدان."],
    ["Who announced to Mary that she would give birth to Jesus?","The angel Gabriel","The angel Michael","The angel Raphael",0,"Luke 1 describes Gabriel bringing the announcement to Mary.","يصف لوقا 1 بشارة الملاك جبرائيل لمريم."],
    ["In which town did Jesus grow up?","Nazareth","Bethany","Capernaum",0,"The Gospels describe Jesus being raised in Nazareth.","تذكر الأناجيل أنّ يسوع نشأ في الناصرة."],
    ["What was Jesus' first recorded sign in John's Gospel?","Changing water into wine","Healing a blind man","Walking on water",0,"John 2 recounts the wedding at Cana, where Jesus changed water into wine.","يروي يوحنا 2 عرس قانا حيث حوّل يسوع الماء إلى خمر."],
    ["At which lake did Jesus call fishermen to follow him?","Sea of Galilee","Dead Sea","Mediterranean Sea",0,"Jesus called fishermen by the Sea of Galilee.","دعا يسوع صيادين عند بحيرة الجليل."],
    ["How many days did Jesus fast in the wilderness?","40","12","7",0,"The Gospels describe Jesus fasting for forty days in the wilderness.","تذكر الأناجيل أنّ يسوع صام أربعين يومًا في البرية."],
    ["Which prayer did Jesus teach his disciples?","The Lord's Prayer","The Magnificat","The Benedictus",0,"Jesus taught his disciples the prayer beginning 'Our Father'.","علّم يسوع تلاميذه الصلاة التي تبدأ بعبارة «أبانا»."],
    ["Who climbed a tree to see Jesus in Jericho?","Zacchaeus","Bartimaeus","Nicodemus",0,"Luke 19 tells how Zacchaeus climbed a sycamore tree.","يروي لوقا 19 كيف صعد زكّا إلى جمّيزة ليرى يسوع."],
    ["Which sisters welcomed Jesus into their home at Bethany?","Martha and Mary","Mary and Elizabeth","Joanna and Susanna",0,"Luke 10 describes Jesus visiting Martha and Mary.","يصف لوقا 10 زيارة يسوع لمرتا ومريم."],
    ["Who was raised by Jesus after four days in the tomb?","Lazarus","Jairus","Stephen",0,"John 11 recounts the raising of Lazarus.","يروي يوحنا 11 إقامة لعازر."],
    ["Which disciple doubted the resurrection until he saw Jesus?","Thomas","Andrew","Matthew",0,"John 20 describes Thomas asking to see Jesus' wounds.","يصف يوحنا 20 توما الذي أراد أن يرى آثار جراح يسوع."],
    ["Who carried the cross of Jesus on the way to Golgotha?","Simon of Cyrene","Joseph of Arimathea","Nicodemus",0,"The Synoptic Gospels name Simon of Cyrene as the man who carried Jesus' cross.","تذكر الأناجيل الإزائية سمعان القيرواني حامل صليب يسوع."],
    ["What was written above Jesus on the cross?","Jesus of Nazareth, King of the Jews","The Good Shepherd","Son of David",0,"The Gospel accounts report the inscription identifying Jesus as King of the Jews.","تذكر الأناجيل الكتابة التي أعلنت يسوع ملك اليهود."],
    ["Who asked Pilate for Jesus' body?","Joseph of Arimathea","Simon Peter","John Mark",0,"The Gospels describe Joseph of Arimathea asking for Jesus' body.","تصف الأناجيل يوسف الرامي طالبًا جسد يسوع."],
    ["On what day of the week did the women find the tomb empty?","The first day of the week","The Sabbath","The fifth day",0,"The Gospel accounts say the women came to the tomb on the first day of the week.","تذكر الأناجيل أنّ النساء أتين إلى القبر في اليوم الأول من الأسبوع."],
    ["Which apostle was a tax collector before following Jesus?","Matthew","Peter","James",0,"Matthew 9 describes Jesus calling Matthew from the tax booth.","يصف متّى 9 دعوة يسوع لمتّى من مكان جباية الضرائب."],
    ["Which apostle was known as the physician?","Luke","Andrew","Bartholomew",0,"Colossians 4:14 refers to Luke as the beloved physician.","تشير كولوسي 4:14 إلى لوقا بوصفه الطبيب الحبيب."],
    ["Who is traditionally associated with the Gospel of the eagle symbol?","John","Mark","Luke",0,"In Christian iconography, the eagle is traditionally associated with John.","في الرموز المسيحية يرتبط النسر تقليديًا بالقديس يوحنا."],
    ["Which apostle is traditionally associated with the symbol of a winged lion?","Mark","Matthew","Luke",0,"Christian tradition associates the winged lion with Mark.","يربط التقليد المسيحي الأسد المجنّح بالقديس مرقس."],
    ["Which apostle is traditionally associated with the symbol of a winged ox?","Luke","John","Matthew",0,"Christian tradition associates the winged ox with Luke.","يربط التقليد المسيحي الثور المجنّح بالقديس لوقا."],
    ["Which apostle is traditionally associated with the symbol of a winged human or angel?","Matthew","Mark","Peter",0,"Christian tradition associates the human or angel symbol with Matthew.","يربط التقليد المسيحي رمز الإنسان أو الملاك بالقديس متّى."],
    ["What is the name of the prayer in Luke 1 that begins 'My soul magnifies the Lord'?","The Magnificat","The Benedictus","The Nunc Dimittis",0,"The Magnificat is Mary's song of praise in Luke 1.","نشيد التعظيم هو نشيد مريم في لوقا 1."],
    ["Who said, 'Here am I; send me' in the Book of Isaiah?","Isaiah","Jeremiah","Ezekiel",0,"Isaiah 6 records the prophet's response to God's call.","يسجّل إشعيا 6 جواب النبي على دعوة الله."],
    ["Which New Testament letter contains the famous chapter about love in chapter 13?","First Corinthians","Romans","James",0,"First Corinthians 13 describes the qualities of love.","تصف الرسالة الأولى إلى أهل كورنثوس 13 صفات المحبة."],
    ["What fruit of the Spirit is listed first in Galatians 5?","Love","Patience","Kindness",0,"Galatians 5:22 begins the fruit of the Spirit with love.","تبدأ غلاطية 5:22 ثمر الروح بالمحبة."],
    ["Which book tells about the early Church after Jesus' Ascension?","Acts of the Apostles","Hebrews","Revelation",0,"Acts recounts the early Christian community and the apostles' mission.","يروي سفر أعمال الرسل حياة الجماعة المسيحية الأولى ورسالة الرسل."],
    ["At Pentecost, what appeared above the disciples?","Tongues as of fire","A bright star","A rainbow",0,"Acts 2 describes tongues as of fire resting on the disciples.","يصف أعمال 2 ألسنة كأنها من نار حلّت على التلاميذ."],
    ["Who was the first Christian martyr according to Acts?","Stephen","James","Barnabas",0,"Acts 7 recounts the martyrdom of Stephen.","يروي أعمال 7 استشهاد اسطفانوس."],
    ["On which road did Saul encounter the risen Jesus?","The road to Damascus","The road to Emmaus","The road to Jericho",0,"Acts 9 describes Saul's encounter with Jesus on the way to Damascus.","يصف أعمال 9 لقاء شاول بيسوع في طريق دمشق."],
    ["What was Paul's name before he became known as Paul?","Saul","Silas","Timothy",0,"Acts refers to him as Saul before also using the name Paul.","يدعو سفر الأعمال الرسول شاول قبل استعمال اسم بولس أيضًا."],
    ["Which apostle was the brother of Andrew?","Peter","Thomas","Philip",0,"The Gospels identify Simon Peter and Andrew as brothers.","تذكر الأناجيل أنّ سمعان بطرس وأندراوس أخوان."],
    ["Which Gospel begins with the words about the Word being with God?","John","Matthew","Mark",0,"John 1 opens with the teaching about the Word.","يفتتح يوحنا 1 بالتعليم عن الكلمة."],
    ["Which Lebanese saint is associated with the monastery of Saint Joseph in Jrabta?","Saint Rafqa","Saint Charbel","Saint Nimatullah",0,"Saint Rafqa spent her final years at the monastery of Saint Joseph in Jrabta.","أمضت القديسة رفقا سنواتها الأخيرة في دير مار يوسف في جربتا."],
    ["Which Lebanese saint belonged to the Lebanese Maronite Order and taught at Kfifan?","Saint Nimatullah al-Hardini","Saint Rafqa","Saint Aquilina",0,"Saint Nimatullah was a monk and teacher of the Lebanese Maronite Order at Kfifan.","كان القديس نعمة الله راهبًا ومعلّمًا في الرهبانية اللبنانية المارونية في كفيفان."],
    ["Which Lebanese village is the birthplace of Saint Charbel?","Bekaa Kafra","Ehden","Hardine",0,"Saint Charbel was born in Bekaa Kafra in northern Lebanon.","وُلد القديس شربل في بقاعكفرا في شمال لبنان."],
    ["Which Lebanese saint is closely associated with the monastery of Annaya?","Saint Charbel","Saint Rafqa","Saint Aquilina",0,"Saint Charbel lived and is venerated at the monastery of Saint Maron in Annaya.","عاش القديس شربل ويُكرّم في دير مار مارون في عنايا."],
    ["Which Lebanese saint was born in Himlaya?","Saint Rafqa","Saint Charbel","Saint Nimatullah",0,"Saint Rafqa was born in Himlaya in 1832.","وُلدت القديسة رفقا في حميلة سنة 1832."],
    ["Which Lebanese saint is known by the title 'al-Hardini'?","Saint Nimatullah","Saint Charbel","Saint Maron",0,"The title al-Hardini refers to Saint Nimatullah's birthplace, Hardine.","تشير تسمية الحرديني إلى بلدة حردين، مسقط رأس القديس نعمة الله."],
    ["Which early Christian monk is especially associated with the beginnings of desert monasticism?","Saint Anthony the Great","Saint Augustine","Saint Thomas Aquinas",0,"Saint Anthony the Great is widely regarded as a foundational figure in Christian desert monasticism.","يُعدّ القديس أنطونيوس الكبير من أبرز مؤسسي الرهبنة الصحراوية المسيحية."],
    ["Which saint is traditionally called the 'Little Flower'?","Saint Thérèse of Lisieux","Saint Catherine of Siena","Saint Clare of Assisi",0,"Saint Thérèse of Lisieux is widely known as the Little Flower.","تُعرف القديسة تريزيا الطفل يسوع بلقب الوردة الصغيرة."],
    ["Which saint founded the Franciscan Order?","Saint Francis of Assisi","Saint Dominic","Saint Benedict",0,"Saint Francis of Assisi founded the Franciscan movement.","أسّس القديس فرنسيس الأسيزي الحركة الفرنسيسكانية."],
    ["Which saint is known for writing the Rule for monasteries in the Western Church?","Saint Benedict","Saint Ignatius of Loyola","Saint Patrick",0,"Saint Benedict's Rule became highly influential in Western monastic life.","أصبح قانون القديس بندكتس مؤثرًا جدًا في الحياة الرهبانية الغربية."],
    ["Which saint is associated with the Spiritual Exercises and the Society of Jesus?","Saint Ignatius of Loyola","Saint Francis Xavier","Saint Philip Neri",0,"Ignatius of Loyola founded the Society of Jesus and developed the Spiritual Exercises.","أسّس إغناطيوس دي لويولا الرهبانية اليسوعية ووضع الرياضات الروحية."]
  ];
  extraQuizQuestions.forEach((x,i)=>quizQuestions.push({id:"x"+String(i+1).padStart(3,"0"),q:x[0],a:x.slice(1,4),correct:x[4],why:x[5],ar:x[6]}));


  // Expanded, individually authored quiz items. Each entry includes its biblical or
  // historical reference; answer choices are randomized for every round.
  const finalQuizExpansion = [["Who was the father of Isaac?","Abraham","Jacob","Moses","Genesis 21"],["Who was Isaac's wife?","Rebekah","Rachel","Leah","Genesis 24"],["Who were the twin sons of Isaac and Rebekah?","Jacob and Esau","Cain and Abel","Joseph and Benjamin","Genesis 25"],["Which son sold his birthright for stew?","Esau","Jacob","Reuben","Genesis 25"],["What did Jacob see in his dream at Bethel?","A ladder reaching to heaven","A burning bush","A river of fire","Genesis 28"],["What was the name of Jacob's first wife?","Leah","Rachel","Bilhah","Genesis 29"],["How many years did Jacob work to marry Rachel the first time?","Seven","Three","Twelve","Genesis 29"],["Which son of Jacob was born to Rachel first?","Joseph","Benjamin","Judah","Genesis 30"],["What did Joseph's brothers do with him before he was taken to Egypt?","Sold him to traders","Made him king","Sent him to Jerusalem","Genesis 37"],["What did Joseph interpret for Pharaoh?","Two dreams","A military map","A letter from Moses","Genesis 41"],["How many years of plenty did Joseph predict?","Seven","Four","Ten","Genesis 41"],["How many years of famine followed the years of plenty in Joseph's interpretation?","Seven","Two","Forty","Genesis 41"],["What did Joseph's brothers bring to Egypt to buy during the famine?","Grain","Gold crowns","Olive oil only","Genesis 42"],["Which brother stayed behind in Egypt as the others returned home?","Simeon","Benjamin","Reuben","Genesis 42"],["What did Joseph put in Benjamin's sack?","A silver cup","A golden crown","A scroll","Genesis 44"],["What was the name of Moses' sister?","Miriam","Deborah","Zipporah","Exodus 2"],["Who found baby Moses in the river?","Pharaoh's daughter","Miriam's friend","Zipporah","Exodus 2"],["In what land did Moses flee after leaving Egypt?","Midian","Canaan","Assyria","Exodus 2"],["What was Moses doing when he saw the burning bush?","Tending sheep","Building a boat","Working in Pharaoh's palace","Exodus 3"],["What name did God reveal to Moses at the burning bush?","I AM WHO I AM","The Great King of Egypt","The Lord of the Nile","Exodus 3"],["What did Moses' staff become as a sign before Pharaoh?","A serpent","A dove","A branch of olive","Exodus 4"],["What was the final plague in Egypt?","Death of the firstborn","Locusts","Darkness","Exodus 12"],["What meal did the Israelites celebrate before leaving Egypt?","The Passover","The Feast of Booths","The Day of Atonement","Exodus 12"],["What marked the Israelite homes during the first Passover?","Blood of the lamb","Water from the Nile","Ashes on the door","Exodus 12"],["What guided Israel by day in the wilderness?","A pillar of cloud","A pillar of fire","A bright star","Exodus 13"],["What guided Israel by night in the wilderness?","A pillar of fire","A pillar of cloud","A rainbow","Exodus 13"],["What food did God provide in the wilderness like flakes on the ground?","Manna","Grapes","Barley loaves","Exodus 16"],["What bird did God send for the Israelites to eat in the wilderness?","Quail","Doves","Eagles","Exodus 16"],["On which mountain did Moses receive the Ten Commandments?","Mount Sinai","Mount Carmel","Mount Zion","Exodus 19–20"],["What did Moses receive on the stone tablets?","The commandments","A map of Canaan","The names of the tribes only","Exodus 31"],["Who made the golden calf while Moses was on the mountain?","Aaron","Joshua","Caleb","Exodus 32"],["What did Moses do when he saw the golden calf?","Broke the tablets","Built an altar to it","Crowned Aaron","Exodus 32"],["What was placed inside the Ark of the Covenant?","The tablets of the covenant","David's crown","Solomon's harp","Deuteronomy 10"],["Who was appointed high priest after the Exodus?","Aaron","Joshua","Eleazar's son Phinehas","Exodus 28"],["What covered the Tabernacle when the glory of the Lord filled it?","A cloud","A rainbow","A pillar of smoke from a furnace","Exodus 40"],["How many spies explored Canaan?","Twelve","Seven","Forty","Numbers 13"],["Which two spies trusted that Israel could enter the land?","Joshua and Caleb","Moses and Aaron","Eldad and Medad","Numbers 14"],["What happened to the Israelites who complained in the wilderness?","They wandered for forty years","They returned immediately to Egypt","They crossed the Jordan that day","Numbers 14"],["What bronze object did Moses lift up so people bitten by snakes could look at it?","A bronze serpent","A bronze dove","A bronze lamp","Numbers 21"],["Who spoke to Balaam through a donkey?","God","Moses","Joshua","Numbers 22"],["Who succeeded Moses as leader?","Joshua","Caleb","Aaron","Deuteronomy 31"],["What river did Israel cross to enter the Promised Land under Joshua?","Jordan River","Nile River","Euphrates River","Joshua 3"],["What did the priests carry as Israel crossed the Jordan?","The Ark of the Covenant","The golden calf","The bronze serpent","Joshua 3"],["How many times did Israel march around Jericho on the seventh day?","Seven","Three","Twelve","Joshua 6"],["Who hid the Israelite spies in Jericho?","Rahab","Ruth","Deborah","Joshua 2"],["What sign did Rahab place in her window?","A scarlet cord","A white flag","A branch of cedar","Joshua 2"],["Which judge defeated the Midianites with only three hundred men?","Gideon","Samson","Jephthah","Judges 7"],["What sign did Gideon ask for using a fleece?","Dew on the fleece","A burning tree","A river turning red","Judges 6"],["Who was Samson's mother?","An unnamed woman from Zorah","Hannah","Naomi","Judges 13"],["What was the source of Samson's special strength in the story?","His uncut hair as part of his Nazirite vow","A magic ring","A sword from an angel","Judges 13–16"],["Who betrayed Samson by revealing the secret of his strength?","Delilah","Jezebel","Athaliah","Judges 16"],["Which woman judged Israel and was a prophetess?","Deborah","Ruth","Esther","Judges 4"],["Who was the commander of Deborah's army?","Barak","Gideon","Joab","Judges 4"],["Who killed Sisera with a tent peg?","Jael","Deborah","Miriam","Judges 4"],["From which people was Ruth originally?","Moabites","Philistines","Egyptians","Ruth 1"],["What did Ruth say she would do with Naomi's people and God?","Make them her people and God","Return to Pharaoh","Become queen of Israel","Ruth 1"],["Who was Ruth's husband after Boaz married her?","Boaz","Elimelech","Mahlon","Ruth 4"],["Who was the son of Ruth and Boaz?","Obed","Jesse","David","Ruth 4"],["Who was Samuel's mother?","Hannah","Peninnah","Abigail","1 Samuel 1"],["Where did Hannah pray for a child?","At the sanctuary in Shiloh","In the palace at Jerusalem","On Mount Carmel","1 Samuel 1"],["Who was the priest who thought Hannah was drunk while she prayed?","Eli","Samuel","Nathan","1 Samuel 1"],["What did young Samuel hear during the night?","The Lord calling him","A trumpet from Jericho","A storm outside","1 Samuel 3"],["Who was Israel's first king?","Saul","David","Solomon","1 Samuel 10"],["Which tribe was Saul from?","Benjamin","Judah","Levi","1 Samuel 9"],["Who anointed David as king?","Samuel","Nathan","Elijah","1 Samuel 16"],["What was David doing when Samuel came to anoint him?","Tending sheep","Serving in the army","Studying in the temple","1 Samuel 16"],["What instrument did David play for Saul?","Lyre","Flute","Trumpet","1 Samuel 16"],["Who was David's close friend, the son of Saul?","Jonathan","Abner","Joab","1 Samuel 18"],["What did David take from Goliath after defeating him?","His sword","His crown","His shield only","1 Samuel 17"],["Which prophet confronted David after his sin with Bathsheba?","Nathan","Samuel","Elisha","2 Samuel 12"],["What was the name of David and Bathsheba's son who became king?","Solomon","Absalom","Adonijah","2 Samuel 12; 1 Kings 1"],["Which son of David rebelled against him?","Absalom","Solomon","Nathan","2 Samuel 15"],["Who was the commander of David's army?","Joab","Uriah","Zadok","2 Samuel 8"],["What city did David make the capital of his kingdom?","Jerusalem","Hebron","Samaria","2 Samuel 5"],["What did David bring into Jerusalem with celebration?","The Ark of the Covenant","The bronze serpent","The tablets from Sinai","2 Samuel 6"],["Who built the first Temple in Jerusalem?","Solomon","David","Hezekiah","1 Kings 6"],["What did Solomon ask God to give him?","Wisdom","Long life only","Victory over every nation","1 Kings 3"],["Which queen visited Solomon after hearing of his fame?","Queen of Sheba","Queen Esther","Queen Vashti","1 Kings 10"],["What did Solomon build on Mount Moriah in Jerusalem?","The Temple","The Tower of Babel","The walls of Jericho","2 Chronicles 3"],["Which prophet challenged the prophets of Baal on Mount Carmel?","Elijah","Elisha","Isaiah","1 Kings 18"],["What did Elijah hear at Horeb after the wind, earthquake and fire?","A gentle whisper","A loud trumpet","A marching army","1 Kings 19"],["Who succeeded Elijah as prophet?","Elisha","Isaiah","Jeremiah","1 Kings 19"],["What did Elisha multiply for a widow?","Oil","Wine","Wheat","2 Kings 4"],["Which Syrian commander was healed after washing in the Jordan?","Naaman","Ben-hadad","Hazael","2 Kings 5"],["How many times did Naaman wash in the Jordan?","Seven","Three","Twelve","2 Kings 5"],["Which king found the Book of the Law during Temple repairs?","Josiah","Ahab","Manasseh","2 Kings 22"],["Which prophet was taken up in a whirlwind?","Elijah","Elisha","Jonah","2 Kings 2"],["Who was the mother of King Hezekiah?","Abi","Jezebel","Huldah","2 Kings 18"],["Which king prayed when Jerusalem was threatened by Assyria?","Hezekiah","Saul","Ahab","2 Kings 19"],["Who interpreted the handwriting on the wall for King Belshazzar?","Daniel","Ezekiel","Jeremiah","Daniel 5"],["What was the name of Daniel's three companions in Babylon?","Hananiah, Mishael and Azariah","Peter, James and John","Shadrach, Meshach and Cyrus","Daniel 1"],["What Babylonian names were given to Daniel's three companions?","Shadrach, Meshach and Abednego","Belteshazzar, Darius and Cyrus","Mordecai, Haman and Ezra","Daniel 1"],["Which king threw Daniel into the lions' den?","Darius","Nebuchadnezzar","Cyrus","Daniel 6"],["Which prophet married Gomer?","Hosea","Amos","Micah","Hosea 1"],["Which prophet saw a valley of dry bones?","Ezekiel","Isaiah","Joel","Ezekiel 37"],["Which prophet was called while still a young man?","Jeremiah","Malachi","Nahum","Jeremiah 1"],["Which prophet spoke of a child called Immanuel?","Isaiah","Obadiah","Haggai","Isaiah 7"],["To which city was Jonah sent to preach?","Nineveh","Babylon","Jericho","Jonah 1"],["Which prophet saw the Lord seated on a throne in the Temple?","Isaiah","Amos","Hosea","Isaiah 6"],["Which prophet described the Lord as a shepherd who gathers lambs?","Isaiah","Joel","Micah","Isaiah 40"],["Which prophet foretold that a ruler would come from Bethlehem?","Micah","Nahum","Zechariah","Micah 5"],["Which prophet encouraged the rebuilding of the Temple after the exile?","Haggai","Jonah","Obadiah","Haggai 1"],["Which prophet saw a vision of a golden lampstand and olive trees?","Zechariah","Malachi","Amos","Zechariah 4"],["Which prophet is the last book in the Old Testament in many Christian arrangements?","Malachi","Zechariah","Haggai","Malachi"],["Who wrote many of the Psalms according to their headings and tradition?","David","Moses only","Solomon only","Psalms"],["Which Psalm begins with 'The Lord is my shepherd'?","Psalm 23","Psalm 1","Psalm 51","Psalm 23"],["Which Psalm begins 'Blessed is the man who walks not in the counsel of the wicked'?","Psalm 1","Psalm 8","Psalm 150","Psalm 1"],["Which book contains the saying 'There is a time for everything'?","Ecclesiastes","Proverbs","Job","Ecclesiastes 3"],["Which book tells the story of a righteous man who suffers great trials?","Job","Ruth","Esther","Job"],["Which book is a collection of wise sayings traditionally associated with Solomon?","Proverbs","Lamentations","Numbers","Proverbs"],["Which book celebrates love in poetic form?","Song of Songs","Judges","Leviticus","Song of Songs"],["Who was the Jewish queen who risked her life to save her people?","Esther","Ruth","Deborah","Esther 4–7"],["Who raised Esther?","Mordecai","Haman","Ezra","Esther 2"],["Who plotted to destroy the Jews in the Book of Esther?","Haman","Mordecai","Nehemiah","Esther 3"],["Which feast commemorates the deliverance in the Book of Esther?","Purim","Passover","Pentecost","Esther 9"],["Who led the rebuilding of Jerusalem's walls?","Nehemiah","Ezra","Zerubbabel","Nehemiah 2–6"],["Which scribe read the Law to the people after the return from exile?","Ezra","Nehemiah","Haggai","Nehemiah 8"],["What did the people do when Ezra read the Law?","They listened and wept","They left the city","They crowned a new king","Nehemiah 8"],["What language did many people need help understanding when the Law was read?","The meaning of the Hebrew reading was explained","Greek poetry","Egyptian hieroglyphs","Nehemiah 8"],["Which book begins with the creation of the heavens and the earth?","Genesis","Exodus","Leviticus","Genesis 1"],["On which day did God rest from the work of creation?","The seventh day","The fifth day","The first day","Genesis 2"],["What did God create on the fourth day according to Genesis?","The sun, moon and stars","Fish and birds","Human beings","Genesis 1"],["What did God create on the fifth day according to Genesis?","Sea creatures and birds","Trees and plants","Human beings","Genesis 1"],["What did God create on the sixth day according to Genesis?","Land animals and human beings","The sun and moon","The sea only","Genesis 1"],["Which river is named in the Garden of Eden story along with the Tigris and Euphrates?","Pishon","Jordan","Nile","Genesis 2"],["What did Noah send out first from the ark?","A raven","A dove","A sparrow","Genesis 8"],["What did Noah send out after the raven?","A dove","An eagle","A swallow","Genesis 8"],["What did the dove bring back to Noah?","An olive leaf","A piece of bread","A flower","Genesis 8"],["What was the name of Abraham's nephew?","Lot","Laban","Ishmael","Genesis 12"],["Which city was Lot living in when it was destroyed?","Sodom","Jericho","Nineveh","Genesis 19"],["What happened to Lot's wife when she looked back?","She became a pillar of salt","She became a tree","She disappeared into the sea","Genesis 19"],["What was the name of Hagar's son?","Ishmael","Isaac","Esau","Genesis 16"],["What was the name of Isaac's son who became father of the twelve tribes?","Jacob","Esau","Ishmael","Genesis 25"],["What did Jacob's name become after wrestling through the night?","Israel","Judah","Joseph","Genesis 32"],["Which son of Jacob received the blessing associated with the royal line?","Judah","Dan","Naphtali","Genesis 49"],["What did Joseph's brothers dip his robe in?","The blood of a goat","Olive oil","Wine","Genesis 37"],["Which Egyptian official bought Joseph?","Potiphar","Pharaoh","Jethro","Genesis 39"],["Who imprisoned Joseph after a false accusation?","Potiphar","Pharaoh's daughter","Moses","Genesis 39"],["Who remembered Joseph when Pharaoh had troubling dreams?","The chief cupbearer","The chief baker","The royal guard","Genesis 41"],["What did Joseph name his firstborn son?","Manasseh","Ephraim","Benjamin","Genesis 41"],["What did Joseph name his second son?","Ephraim","Manasseh","Judah","Genesis 41"],["What did Jacob give Joseph's younger brother Benjamin when he sent him to Egypt?","A larger portion of food","A crown","A sword","Genesis 43"],["Which book follows Genesis in the Bible?","Exodus","Leviticus","Numbers","Bible order"],["Which book follows Exodus?","Leviticus","Numbers","Deuteronomy","Bible order"],["Which book follows Leviticus?","Numbers","Joshua","Judges","Bible order"],["Which book follows Numbers?","Deuteronomy","Joshua","Ruth","Bible order"],["Which book begins the New Testament?","Matthew","Mark","Luke","Bible order"],["Which book follows the Gospel of John?","Acts","Romans","Revelation","Bible order"],["Which book follows Acts?","Romans","First Corinthians","Hebrews","Bible order"],["Which book is the final book of the New Testament?","Revelation","Jude","Hebrews","Bible order"],["Who was the father of John the Baptist?","Zechariah","Joseph","Simeon","Luke 1"],["What happened to Zechariah when he doubted the angel's message?","He became unable to speak","He lost his sight","He left the Temple","Luke 1"],["What name did Elizabeth insist their son should have?","John","Zechariah","Elijah","Luke 1"],["What did Mary sing after visiting Elizabeth?","The Magnificat","The Benedictus","The Gloria","Luke 1"],["What did Zechariah proclaim after his speech returned?","The Benedictus","The Magnificat","The Sanctus","Luke 1"],["Who recognized the infant Jesus in the Temple and praised God?","Simeon","Nicodemus","Joseph of Arimathea","Luke 2"],["Which elderly prophetess spoke about Jesus in the Temple?","Anna","Elizabeth","Martha","Luke 2"],["Where did Mary and Joseph present Jesus as an infant?","The Temple in Jerusalem","The synagogue in Nazareth","The Temple in Bethlehem","Luke 2"],["Who visited Jesus after following a star?","Magi from the East","Roman soldiers","Shepherds from Jerusalem","Matthew 2"],["What gifts did the Magi bring?","Gold, frankincense and myrrh","Silver, wheat and oil","Bread, wine and salt","Matthew 2"],["Which ruler sought to kill the child Jesus?","Herod","Pilate","Caesar Augustus","Matthew 2"],["To which country did Joseph take Mary and Jesus to escape Herod?","Egypt","Syria","Greece","Matthew 2"],["Who prepared the way for Jesus by preaching in the wilderness?","John the Baptist","Peter","Stephen","Matthew 3"],["What did John the Baptist eat in the wilderness?","Locusts and wild honey","Fish and bread","Dates and figs","Matthew 3"],["What did John say he was unworthy to do for Jesus?","Carry his sandals","Build his house","Write his teachings","Matthew 3"],["What descended like a dove at Jesus' baptism?","The Spirit of God","An angel with a sword","A bright star","Matthew 3"],["What did the voice from heaven call Jesus at his baptism?","My beloved Son","The new king of Rome","The prophet Elijah","Matthew 3"],["Which Gospel records the Sermon on the Mount?","Matthew","Mark","John","Matthew 5–7"],["Where did Jesus deliver the Sermon on the Mount?","On a mountain","In the Temple courtyard","On a ship","Matthew 5"],["What are the opening blessings of the Sermon on the Mount called?","The Beatitudes","The Magnificat","The Parables","Matthew 5"],["According to Jesus, who are the peacemakers?","Children of God","Rulers of the world","The richest people","Matthew 5"],["What does Jesus call his followers in the Sermon on the Mount?","Salt of the earth and light of the world","Lions of Judah and stars","Kings and judges","Matthew 5"],["Which prayer begins with 'Our Father'?","The Lord's Prayer","The Hail Mary","The Apostles' Creed","Matthew 6"],["What does Jesus say about storing treasures?","Store treasures in heaven","Store them only in barns","Give them to Caesar","Matthew 6"],["Which birds does Jesus mention as an example of God's care?","Birds of the air","Doves in the Temple only","Ravens in Noah's ark only","Matthew 6"],["Which parable tells of a man who built his house on rock?","The wise and foolish builders","The lost sheep","The talents","Matthew 7"],["What did Jesus calm while he was in a boat with his disciples?","A storm","An earthquake","A fire","Matthew 8"],["What did Jesus say to the storm before it became calm?","Peace, be still","Rise and walk","Your sins are forgiven","Mark 4"],["Which disciple walked on water toward Jesus?","Peter","John","Andrew","Matthew 14"],["What happened when Peter became afraid while walking on the water?","He began to sink","He flew above the waves","He reached the shore alone","Matthew 14"],["How many baskets of leftovers were collected after Jesus fed the five thousand?","Twelve","Seven","Three","Matthew 14"],["How many loaves were used when Jesus fed the five thousand?","Five","Seven","Two","Matthew 14"],["How many fish were used when Jesus fed the five thousand?","Two","Five","Twelve","Matthew 14"],["How many baskets were left after Jesus fed the four thousand?","Seven","Twelve","Five","Matthew 15"],["What did Jesus ask his disciples at Caesarea Philippi?","Who do you say that I am?","Where shall we buy bread?","Who will sit at my right hand?","Matthew 16"],["Who answered that Jesus is the Christ, the Son of the living God?","Peter","Thomas","Philip","Matthew 16"],["Which three disciples witnessed the Transfiguration with Jesus?","Peter, James and John","Matthew, Mark and Luke","Andrew, Philip and Thomas","Matthew 17"],["Which two figures appeared with Jesus at the Transfiguration?","Moses and Elijah","Abraham and David","Isaiah and Jeremiah","Matthew 17"],["What did the voice from the cloud say at the Transfiguration?","Listen to him","Build a city","Return to Galilee","Matthew 17"],["Which tax collector climbed a sycamore tree to see Jesus?","Zacchaeus","Matthew","Bartimaeus","Luke 19"],["What did Jesus say he came to seek and save?","The lost","The powerful","The wealthy","Luke 19"],["Which parable features a Samaritan helping an injured traveller?","The Good Samaritan","The Prodigal Son","The Sower","Luke 10"],["In the parable of the Good Samaritan, who passed by before the Samaritan helped?","A priest and a Levite","A king and a soldier","Two fishermen","Luke 10"],["Which parable tells of a son who returns home and is welcomed by his father?","The Prodigal Son","The Mustard Seed","The Ten Virgins","Luke 15"],["In the parable of the lost sheep, how many sheep does the shepherd leave behind?","Ninety-nine","Fifty","Ten","Luke 15"],["Which woman listened to Jesus while her sister served?","Mary of Bethany","Martha","Salome","Luke 10"],["Which sister complained that she was left to serve alone?","Martha","Mary","Elizabeth","Luke 10"],["What did Jesus do at the wedding in Cana?","Changed water into wine","Multiplied oil","Raised a child","John 2"],["Who told Jesus that the wine had run out at Cana?","His mother","Peter","The bridegroom","John 2"],["How many stone water jars were at the wedding in Cana?","Six","Four","Twelve","John 2"],["What did Jesus tell Nicodemus a person must experience to see God's kingdom?","Be born anew / from above","Become a Roman citizen","Travel to Jerusalem","John 3"],["Which Pharisee came to Jesus at night?","Nicodemus","Gamaliel","Caiaphas","John 3"],["What famous verse says God so loved the world that he gave his only Son?","John 3:16","Matthew 5:9","Luke 2:14","John 3"],["At which well did Jesus speak with a Samaritan woman?","Jacob's well","The Pool of Siloam","The Pool of Bethesda","John 4"],["What did Jesus offer the Samaritan woman?","Living water","A royal crown","A new fishing net","John 4"],["What was the Samaritan woman's response after speaking with Jesus?","She told people in her town about him","She became a Roman official","She left the region","John 4"],["Which man had been ill for thirty-eight years near the Pool of Bethesda?","An unnamed disabled man","Lazarus","Jairus","John 5"],["What did Jesus tell the man healed at Bethesda to do?","Pick up his mat and walk","Go to Egypt","Build a boat","John 5"],["Which feast was taking place when Jesus taught about being the bread of life in John 6?","Passover was near","Pentecost was near","The Feast of Booths was over","John 6"],["What did Jesus call himself in John 6?","The bread of life","The gate of the sheepfold","The true vine","John 6"],["Which man was blind from birth and healed by Jesus?","The man in John 9","Bartimaeus","The servant of the centurion","John 9"],["What did Jesus use when healing the man born blind in John 9?","Mud made with saliva","A piece of cloth","Oil from a lamp","John 9"],["What pool did the blind man wash in?","Siloam","Bethesda","Jordan","John 9"],["What did Jesus call himself in John 10?","The good shepherd","The true vine","The light of the Temple","John 10"],["Who were the sisters of Lazarus?","Martha and Mary","Mary and Salome","Joanna and Susanna","John 11"],["In which village did Lazarus live?","Bethany","Cana","Nazareth","John 11"],["How many days had Lazarus been in the tomb when Jesus arrived?","Four","Two","Seven","John 11"],["What did Jesus say before calling Lazarus out of the tomb?","Lazarus, come out","Talitha koum","Ephphatha","John 11"],["Which disciple cut off the ear of the high priest's servant?","Peter","John","James","John 18"],["What was the name of the high priest's servant whose ear was cut off?","Malchus","Barabbas","Simon","John 18"],["Who questioned Jesus before the crucifixion and asked what truth is?","Pontius Pilate","Herod Agrippa","Felix","John 18"],["Which prisoner was released instead of Jesus?","Barabbas","Simon of Cyrene","Joseph of Arimathea","John 18"],["Who helped Jesus carry the cross according to the Synoptic Gospels?","Simon of Cyrene","Joseph of Arimathea","Nicodemus","Mark 15"],["Which women are named among those who watched the crucifixion in Mark?","Mary Magdalene and Mary the mother of James","Martha and Elizabeth","Ruth and Naomi","Mark 15"],["What was the name of the place of crucifixion?","Golgotha","Bethlehem","Emmaus","Mark 15"],["What does Golgotha mean?","Place of a skull","Garden of peace","Hill of olives","Mark 15"],["What happened to the curtain of the Temple when Jesus died?","It was torn in two","It turned blue","It was carried away","Mark 15"],["Who was the Roman centurion who declared Jesus God's Son at the cross in Mark?","The centurion at the cross","Cornelius","Julius","Mark 15"],["Who first announced the resurrection to the disciples in John's Gospel?","Mary Magdalene","Martha","Joanna","John 20"],["Which disciple entered the tomb after Peter and saw the burial cloths?","The beloved disciple","Thomas","Andrew","John 20"],["What did Jesus say to Mary Magdalene when she recognized him?","Do not hold on to me","Go and build a church","Return to Galilee at once","John 20"],["What did Jesus show Thomas to help him believe?","His hands and side","A scroll from Moses","A crown of thorns only","John 20"],["What confession did Thomas make to Jesus?","My Lord and my God","You are the prophet","You are the king of Rome","John 20"],["At which sea did the risen Jesus appear to disciples while they were fishing?","Sea of Tiberias","Dead Sea","Red Sea","John 21"],["How many large fish did the disciples catch in John 21?","153","120","500","John 21"],["What question did Jesus ask Peter three times after the resurrection?","Do you love me?","Where is your sword?","Will you build my house?","John 21"],["Which Gospel includes the parable of the ten virgins?","Matthew","Mark","John","Matthew 25"],["In the parable of the ten virgins, how many were wise?","Five","Three","Seven","Matthew 25"],["Which parable describes servants entrusted with different amounts of money?","The talents","The lost coin","The persistent widow","Matthew 25"],["What does Jesus say the Son of Man will separate like a shepherd?","Sheep from goats","Wheat from barley","Fish from birds","Matthew 25"],["Which Gospel records the visit of the shepherds to the newborn Jesus?","Luke","John","Matthew","Luke 2"],["Who announced Jesus' birth to the shepherds?","An angel of the Lord","King Herod","A Roman soldier","Luke 2"],["What sign were the shepherds given to identify the child?","A baby wrapped in swaddling cloths and lying in a manger","A child in a palace","A star above the Temple","Luke 2"],["Where did Jesus read from the scroll of Isaiah in the synagogue?","Nazareth","Jerusalem","Capernaum","Luke 4"],["What did Jesus say about the Scripture he read in Nazareth?","Today this Scripture is fulfilled","It will be fulfilled in a thousand years","It is only for priests","Luke 4"],["Which prophet's scroll did Jesus read in the synagogue at Nazareth?","Isaiah","Jeremiah","Ezekiel","Luke 4"],["Which disciple was called from the tax booth named Levi?","Matthew","Peter","James","Mark 2"],["What was the occupation of Peter and Andrew before following Jesus?","Fishermen","Carpenters","Tax collectors","Matthew 4"],["What were James and John doing when Jesus called them?","Mending nets with their father","Collecting taxes","Preparing a meal","Matthew 4"],["What nickname did Jesus give James and John?","Sons of Thunder","Sons of Light","Sons of Peace","Mark 3"],["Which disciple brought Nathanael to Jesus?","Philip","Andrew","Thomas","John 1"],["What did Nathanael say about Nazareth before meeting Jesus?","Can anything good come out of Nazareth?","Nazareth is the holy city","I have never heard of it","John 1"],["Which apostle is also called Didymus?","Thomas","Peter","Matthew","John 11"],["Which apostle was called the Zealot?","Simon","Judas Iscariot","Philip","Luke 6"],["Which disciple replaced Judas among the Twelve?","Matthias","Barnabas","Silas","Acts 1"],["Who proposed the selection of a replacement for Judas?","Peter","Paul","Stephen","Acts 1"],["How many people were gathered when Matthias was chosen?","About one hundred and twenty","About five hundred","About three thousand","Acts 1"],["Where were the disciples gathered when the Holy Spirit came at Pentecost?","In one place in Jerusalem","At the Sea of Galilee","In the Temple courtyard at night only","Acts 2"],["What sound accompanied the coming of the Holy Spirit at Pentecost?","A sound like a mighty rushing wind","A sound like a trumpet army","A sound like waves","Acts 2"],["How many people were baptized after Peter's Pentecost sermon?","About three thousand","About five hundred","About twelve thousand","Acts 2"],["Who healed the man lame from birth at the Temple gate with Peter?","Peter and John","Paul and Barnabas","Philip and Stephen","Acts 3"],["What was the name of the gate where the lame man was laid?","Beautiful Gate","Golden Gate","Sheep Gate","Acts 3"],["Who was chosen with six others to help serve the community and was later martyred?","Stephen","Timothy","Titus","Acts 6–7"],["Who approved of Stephen's execution before his conversion?","Saul","Cornelius","Lydia","Acts 7–8"],["Who baptized the Ethiopian official?","Philip","Peter","Paul","Acts 8"],["What book of Scripture was the Ethiopian official reading?","Isaiah","Psalms","Genesis","Acts 8"],["Who sent Saul to restore his sight in Damascus?","Ananias","Barnabas","Silas","Acts 9"],["What happened to Saul on the road to Damascus?","A light from heaven flashed around him","He fell into a river","He was arrested by Herod","Acts 9"],["Who introduced Saul to the apostles in Jerusalem?","Barnabas","Timothy","Titus","Acts 9"],["Who was the Roman centurion whose household received the Holy Spirit?","Cornelius","Julius","Felix","Acts 10"],["Who had a vision of a sheet filled with animals?","Peter","Paul","John","Acts 10"],["Which woman in Philippi was a seller of purple goods and became a believer?","Lydia","Priscilla","Tabitha","Acts 16"],["What happened to Paul and Silas while they were praying in prison at Philippi?","An earthquake opened the doors","A fire destroyed the prison","A storm flooded the city","Acts 16"],["What question did the Philippian jailer ask Paul and Silas?","What must I do to be saved?","Where is the governor?","How can I become a Roman soldier?","Acts 16"],["Who was Paul's companion on his first missionary journey?","Barnabas","Luke","Timothy","Acts 13"],["Which young disciple joined Paul and Silas after being recommended by believers?","Timothy","Titus","Apollos","Acts 16"],["In which city did Paul speak at the Areopagus?","Athens","Rome","Ephesus","Acts 17"],["Which city was known for the riot connected with the silversmith Demetrius?","Ephesus","Corinth","Philippi","Acts 19"],["What was Demetrius' occupation?","Silversmith","Fisherman","Roman governor","Acts 19"],["Who fell from a window while Paul was speaking late into the night?","Eutychus","Tychicus","Onesimus","Acts 20"],["On which island was Paul shipwrecked?","Malta","Crete","Cyprus","Acts 28"],["What happened when a viper fastened on Paul's hand on Malta?","He suffered no harm","He immediately fainted","He was taken to a hospital in Rome","Acts 28"],["To which city was Paul taken as a prisoner at the end of Acts?","Rome","Jerusalem","Antioch","Acts 28"],["Who wrote the Acts of the Apostles according to ancient Christian tradition?","Luke","Mark","Peter","Acts"],["Which letter contains the passage about the armour of God?","Ephesians","Romans","Philemon","Ephesians 6"],["Which letter says that faith without works is dead?","James","Galatians","Philippians","James 2"],["Which letter includes the hymn about Christ emptying himself?","Philippians","Colossians","Titus","Philippians 2"],["Which letter describes the Church as one body with many members?","First Corinthians","Second Peter","Jude","1 Corinthians 12"],["Which letter includes the teaching about the fruit of the Spirit?","Galatians","Hebrews","Second Timothy","Galatians 5"],["Which letter speaks of the 'full armour of God'?","Ephesians","Romans","First John","Ephesians 6"],["Which letter is addressed to Philemon about Onesimus?","Philemon","Titus","Jude","Philemon"],["Which letter names faith, hope and love, and says the greatest is love?","First Corinthians","First Thessalonians","Hebrews","1 Corinthians 13"],["Which letter describes Jesus as the image of the invisible God?","Colossians","Romans","James","Colossians 1"],["Which letter speaks of the great cloud of witnesses?","Hebrews","Jude","Galatians","Hebrews 12"],["Which letter encourages believers to be doers of the word and not hearers only?","James","Romans","Second John","James 1"],["Which letter warns against the love of money as a root of all kinds of evil?","First Timothy","Ephesians","First Peter","1 Timothy 6"],["Which letter says to pray without ceasing?","First Thessalonians","Colossians","Titus","1 Thessalonians 5"],["Which letter describes the Church as God's household and a pillar of truth?","First Timothy","Philemon","Second Peter","1 Timothy 3"],["Which letter begins by calling Jesus the radiance of God's glory?","Hebrews","Romans","Jude","Hebrews 1"],["Which letter says God is love?","First John","James","Second Timothy","1 John 4"],["Which letter describes the new heaven and new earth?","Revelation","Romans","Acts","Revelation 21"],["How many churches are addressed in the opening chapters of Revelation?","Seven","Five","Twelve","Revelation 2–3"],["What is the name of the holy city coming down from heaven in Revelation?","New Jerusalem","New Bethlehem","New Antioch","Revelation 21"],["What tree is described beside the river of life in Revelation?","The tree of life","The tree of knowledge","The cedar of Lebanon","Revelation 22"],["What is the first word of the Bible in many English translations?","In","The","God","Genesis 1:1"],["Which Gospel is the shortest?","Mark","Matthew","Luke","Gospel length"],["Which Gospel contains the most chapters?","Matthew","Mark","John","Gospel length"],["Which Gospel is especially known for its parables and detailed travel narrative?","Luke","Mark","John","Luke"],["Which Gospel begins with a genealogy of Jesus?","Matthew","Mark","John","Matthew 1"],["Which Gospel begins with 'In the beginning was the Word'?","John","Luke","Mark","John 1"],["Which Gospel ends with Jesus commissioning the disciples to make disciples of all nations?","Matthew","Luke","John","Matthew 28"],["Which Gospel includes the story of the road to Emmaus?","Luke","Mark","John","Luke 24"],["Which Gospel includes the raising of Lazarus?","John","Matthew","Mark","John 11"],["Which Gospel contains the parable of the Good Samaritan?","Luke","Matthew","John","Luke 10"],["Which Gospel contains the parable of the prodigal son?","Luke","Mark","John","Luke 15"],["Which Gospel records the visit of the Magi?","Matthew","Mark","Luke","Matthew 2"],["Which Gospel records the shepherds visiting the newborn Jesus?","Luke","Matthew","John","Luke 2"],["Which Gospel records the wedding at Cana?","John","Matthew","Mark","John 2"],["Which Gospel includes the story of the widow's two small coins?","Mark","John","Matthew","Mark 12"],["Which Gospel includes the healing of Bartimaeus near Jericho?","Mark","John","Matthew","Mark 10"],["Which Gospel records Jesus washing the disciples' feet?","John","Luke","Matthew","John 13"],["Which Gospel records the Sermon on the Plain?","Luke","Matthew","John","Luke 6"],["Which Gospel records the visit of Nicodemus at night?","John","Mark","Luke","John 3"],["Which Gospel includes the parable of the ten minas?","Luke","Matthew","Mark","Luke 19"],["Which Gospel includes the parable of the sower in all three Synoptic accounts?","Matthew, Mark and Luke","John only","Matthew and John only","Synoptic Gospels"],["What is the traditional name for the first five books of the Bible?","The Pentateuch","The Gospels","The Prophets","Bible structure"],["What is another name for the Pentateuch?","The Torah","The Psalter","The Apocalypse","Bible structure"],["How many books are in the Catholic Old Testament?","46","39","27","Catholic canon"],["How many books are in the New Testament?","27","24","39","New Testament canon"],["How many books are in the Catholic Bible in total?","73","66","72","Catholic canon"],["What is the name of the first four books of the New Testament collectively?","The Gospels","The Catholic Epistles","The Prophets","New Testament"],["Which Old Testament book tells of the rebuilding of the Temple after the exile with Zerubbabel?","Ezra","Ruth","Job","Ezra"],["Which prophet encouraged the people to rebuild the Temple alongside Haggai?","Zechariah","Jonah","Amos","Zechariah"],["Which book contains the lamentations over Jerusalem's destruction?","Lamentations","Proverbs","Joshua","Lamentations"],["Which book tells the story of a woman who became queen and saved her people?","Esther","Judges","Ruth","Esther"],["Which book tells of a Moabite woman who became an ancestor of David?","Ruth","Esther","Judith","Ruth"],["Which book tells of Judith saving her people by defeating Holofernes?","Judith","Tobit","Esther","Judith"],["Which book tells of Tobit, his son Tobias and the angel Raphael?","Tobit","Judith","Wisdom","Tobit"],["Which angel accompanies Tobias on his journey in the Book of Tobit?","Raphael","Gabriel","Michael","Tobit 5"],["Which book tells of the seven brothers and their mother who remained faithful under persecution?","Second Maccabees","First Samuel","Nehemiah","2 Maccabees 7"],["Which book includes the story of the wise king Solomon's judgment between two women?","First Kings","Genesis","Esther","1 Kings 3"],["Which book describes the dedication of Solomon's Temple?","First Kings","Exodus","Daniel","1 Kings 8"],["Which book recounts the rebuilding of Jerusalem's walls?","Nehemiah","Leviticus","Amos","Nehemiah"],["Which book contains the vision of the valley of dry bones?","Ezekiel","Isaiah","Hosea","Ezekiel 37"],["Which book describes the vision of the four beasts?","Daniel","Jonah","Ruth","Daniel 7"],["Which book contains the story of the fiery furnace?","Daniel","Exodus","Judges","Daniel 3"],["Which book tells of the prophet who was fed by ravens?","First Kings","Second Kings","Jeremiah","1 Kings 17"],["Which book tells of the widow of Zarephath who provided food for Elijah?","First Kings","Ruth","Judith","1 Kings 17"],["Which book tells of Elisha raising the Shunammite woman's son?","Second Kings","First Kings","Genesis","2 Kings 4"],["Which book tells of Naaman being healed from leprosy?","Second Kings","Leviticus","Numbers","2 Kings 5"],["Which book tells of the prophet who anointed Jehu king?","Second Kings","Daniel","Ezra","2 Kings 9"],["Which book contains the story of the prophet Micaiah and King Ahab?","First Kings","Second Samuel","Nehemiah","1 Kings 22"],["Which book describes the contest between Elijah and the prophets of Baal?","First Kings","Second Kings","Judges","1 Kings 18"],["Which book tells of the prophet Nathan confronting David?","Second Samuel","First Kings","Psalms","2 Samuel 12"],["Which book describes David bringing the Ark to Jerusalem?","Second Samuel","Exodus","Joshua","2 Samuel 6"],["Which book tells of the covenant God made with Noah?","Genesis","Exodus","Deuteronomy","Genesis 9"],["Which book describes the covenant with Abraham?","Genesis","Leviticus","Judges","Genesis 15; 17"],["Which book tells of the call of Moses at the burning bush?","Exodus","Numbers","Joshua","Exodus 3"],["Which book contains the Ten Commandments in the wilderness narrative?","Exodus","Ruth","Esther","Exodus 20"],["Which book describes the people crossing the Jordan under Joshua?","Joshua","Judges","Numbers","Joshua 3"],["Which book tells of Samson and Delilah?","Judges","Ruth","First Samuel","Judges 16"],["Which book tells of Deborah and Barak?","Judges","Joshua","Second Kings","Judges 4"],["Which book tells of Gideon's three hundred men?","Judges","Numbers","First Chronicles","Judges 7"],["Which book tells of Samuel hearing God's call as a boy?","First Samuel","Second Samuel","First Kings","1 Samuel 3"],["Which book tells of David defeating Goliath?","First Samuel","Second Samuel","First Chronicles","1 Samuel 17"],["Which book tells of Saul's conversion on the road to Damascus?","Acts","Romans","Galatians","Acts 9"],["Which book tells of the first Christian community sharing possessions?","Acts","Hebrews","Revelation","Acts 2"],["Which book tells of Peter's escape from prison with an angel's help?","Acts","Matthew","Second Peter","Acts 12"],["Which book tells of Paul's shipwreck on Malta?","Acts","Romans","Second Corinthians","Acts 27–28"],["Which book describes Paul's speech in Athens?","Acts","First Corinthians","Philippians","Acts 17"],["Which book describes the Council of Jerusalem?","Acts","Galatians","Hebrews","Acts 15"],["Which book describes the conversion of Cornelius and his household?","Acts","Luke","First Peter","Acts 10"],["Which book records the calling of the first disciples by the Sea of Galilee?","Matthew","Revelation","Philemon","Matthew 4"],["Which book contains the parable of the mustard seed?","Matthew","Ruth","Tobit","Matthew 13"],["Which book contains the parable of the pearl of great price?","Matthew","Acts","James","Matthew 13"],["Which book contains the parable of the ten bridesmaids?","Matthew","Luke","John","Matthew 25"],["Which book contains the parable of the unforgiving servant?","Matthew","Mark","John","Matthew 18"],["Which book tells of the wise men bringing gifts to Jesus?","Matthew","Luke","John","Matthew 2"],["Which book tells of Jesus' temptation in the wilderness?","Matthew, Mark and Luke","John only","Acts only","Synoptic Gospels"],["Which book records Jesus' prayer in Gethsemane in detail?","Matthew","Ruth","Titus","Matthew 26"],["Which book records Jesus saying 'It is finished'?","John","Luke","Mark","John 19"],["Which book records the pierced side of Jesus after his death?","John","Matthew","Luke","John 19"],["Which book records Jesus appearing to Mary Magdalene in the garden?","John","Acts","Hebrews","John 20"],["Which book records the miraculous catch of 153 fish after the resurrection?","John","Matthew","Mark","John 21"],["Which book records the ascension of Jesus at its conclusion?","Luke","Romans","James","Luke 24"],["Which book records the ascension and the promise of the Holy Spirit?","Acts","Jude","Philemon","Acts 1"],["Which book includes Paul's teaching on the resurrection of the dead in chapter 15?","First Corinthians","Ephesians","Titus","1 Corinthians 15"],["Which book contains the passage about the fruit of the Spirit?","Galatians","Colossians","Hebrews","Galatians 5"],["Which book includes the teaching that Christians are saved by grace through faith?","Ephesians","Jude","Second John","Ephesians 2"],["Which book contains the phrase 'Rejoice in the Lord always'?","Philippians","Romans","James","Philippians 4"],["Which book says that Christ is our peace and has broken down the dividing wall?","Ephesians","Titus","First Peter","Ephesians 2"],["Which book describes the Church as the body of Christ?","First Corinthians","Second Timothy","Jude","1 Corinthians 12"],["Which book contains the teaching about the helmet of salvation?","Ephesians","Romans","Colossians","Ephesians 6"],["Which book says that all Scripture is inspired by God?","Second Timothy","James","Philemon","2 Timothy 3"],["Which book calls Jesus the great high priest?","Hebrews","Acts","Jude","Hebrews 4"],["Which book says that Jesus Christ is the same yesterday, today and forever?","Hebrews","Galatians","Second Peter","Hebrews 13"],["Which book describes love as patient and kind?","First Corinthians","Romans","Colossians","1 Corinthians 13"],["Which book says that perfect love casts out fear?","First John","James","Second Timothy","1 John 4"],["Which book describes the new Jerusalem with gates of pearls?","Revelation","Ezekiel","Isaiah","Revelation 21"],["Which book mentions the river of the water of life?","Revelation","Genesis","Psalms","Revelation 22"],["Which book contains the vision of the Lamb opening seven seals?","Revelation","Daniel","Acts","Revelation 6"],["Which book contains the letters to the seven churches?","Revelation","Romans","James","Revelation 2–3"],["Which book ends with the prayer 'Come, Lord Jesus'?","Revelation","Matthew","Acts","Revelation 22"],["Which Lebanese saint was born in Bekaa Kafra in 1828?","Saint Charbel Makhlouf","Saint Nimatullah al-Hardini","Saint Rafqa","Saint Charbel biography"],["Which Lebanese saint was born in Hardine in 1808?","Saint Nimatullah al-Hardini","Saint Charbel","Saint Rafqa","Saint Nimatullah biography"],["Which Lebanese saint is associated with the monastery of Saint Maron in Annaya?","Saint Charbel","Saint Rafqa","Saint Nimatullah","Saint Charbel biography"],["Which Lebanese saint spent her final years at the monastery of Saint Joseph in Jrabta?","Saint Rafqa","Saint Aquilina","Saint Mariam Baouardy","Saint Rafqa biography"],["Which Lebanese saint taught at the monastery of Kfifan?","Saint Nimatullah al-Hardini","Saint Charbel","Saint Rafqa","Saint Nimatullah biography"],["Which Lebanese saint was born Youssef Antoun Makhlouf?","Saint Charbel","Saint Nimatullah","Saint Stephen Douaihy","Saint Charbel biography"],["Which Lebanese saint was born Boutrossieh Ar-Rayès?","Saint Rafqa","Saint Charbel","Saint Aquilina","Saint Rafqa biography"],["Which Lebanese saint is known as the 'Monk of Kfifan'?","Saint Nimatullah al-Hardini","Saint Charbel","Saint Maron","Saint Nimatullah biography"],["Which Lebanese saint is associated with the village of Ehden and was a Maronite patriarch and scholar?","Saint Stephen Douaihy","Saint Charbel","Saint Nimatullah","Stephen Douaihy biography"],["Which Lebanese saint is known as the 'Little Flower of Lebanon' in some devotional references?","Saint Rafqa","Saint Charbel","Saint Nimatullah","Saint Rafqa biography"],["Which Lebanese saint's feast is celebrated on 24 July in the Maronite calendar?","Saint Charbel","Saint Rafqa","Saint Nimatullah","Maronite calendar"],["Which Lebanese saint's feast is celebrated on 23 March?","Saint Rafqa","Saint Charbel","Saint Nimatullah","Maronite calendar"],["Which Lebanese saint's feast is celebrated on 14 December?","Saint Nimatullah al-Hardini","Saint Charbel","Saint Rafqa","Maronite calendar"],["Which Lebanese saint is especially associated with the Qadisha Valley and Maronite monastic tradition?","Saint Nimatullah al-Hardini","Saint Thomas Aquinas","Saint Patrick","Lebanese Maronite history"]];
  finalQuizExpansion.splice(-17);
  finalQuizExpansion.forEach((x,i)=>quizQuestions.push({
    id:"z"+String(i+1).padStart(4,"0"), q:x[0], a:[x[1],x[2],x[3]], correct:0,
    why:"Reference: "+x[4]+".", ar:"المرجع: "+x[4]+". الإجابة الصحيحة هي: "+x[1]+"."
  }));
  const QUIZ_ROUND_SIZE=10, QUIZ_HISTORY_KEY="verbum-quiz-used-v1";
  let quizRound=[],quizIndex=0,quizScore=0,quizAnswered=false;
  function readUsedQuizIds(){
    try { const ids=JSON.parse(localStorage.getItem(QUIZ_HISTORY_KEY)||"[]"); return new Set(Array.isArray(ids)?ids:[]); }
    catch { return new Set(); }
  }
  function startQuizRound(){
    let used=readUsedQuizIds();
    let available=quizQuestions.filter(q=>!used.has(q.id));
    // Begin a fresh cycle only after every question in the bank has been used.
    if(available.length<QUIZ_ROUND_SIZE){used=new Set();available=quizQuestions.slice();}
    // Keep rounds approachable: most questions come from the familiar core bank.
    const familiarIds=new Set(quizQuestions.filter(q=>/^b\\d{3}$/.test(q.id)||/^x\\d{3}$/.test(q.id)||(/^z\\d{4}$/.test(q.id)&&Number(q.id.slice(1))<=150)).map(q=>q.id));
    const familiar=available.filter(q=>familiarIds.has(q.id));
    const variety=available.filter(q=>!familiarIds.has(q.id));
    const shuffle=list=>{for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;};
    shuffle(familiar);shuffle(variety);
    const selected=familiar.slice(0,Math.min(8,familiar.length));
    selected.push(...variety.slice(0,Math.max(0,QUIZ_ROUND_SIZE-selected.length)));
    if(selected.length<QUIZ_ROUND_SIZE)selected.push(...familiar.slice(selected.length,QUIZ_ROUND_SIZE));
    shuffle(selected);
    quizRound=selected.slice(0,Math.min(QUIZ_ROUND_SIZE,selected.length)).map(q=>{
      const choices=q.a.map((value,index)=>({value,correct:index===q.correct}));
      for(let i=choices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}
      return {...q,a:choices.map(x=>x.value),correct:choices.findIndex(x=>x.correct)};
    });
    quizRound.forEach(q=>used.add(q.id));
    try { localStorage.setItem(QUIZ_HISTORY_KEY,JSON.stringify([...used])); } catch {}
    quizIndex=0;quizScore=0;quizAnswered=false;
  }
  async function translateQuizText(value){
    const key="verbum-quiz-ar-v2";
    let cache={};try{cache=JSON.parse(localStorage.getItem(key)||"{}");}catch{}
    if(cache[value]) return cache[value];
    // Try Google's lightweight translator first, then MyMemory as a fallback.
    try{
      const url="https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q="+encodeURIComponent(value);
      const response=await fetch(url);
      if(response.ok){
        const data=await response.json();
        const translated=(data[0]||[]).map(part=>part[0]||"").join("").trim();
        if(translated){
          cache[value]=translated;try{localStorage.setItem(key,JSON.stringify(cache));}catch{}
          return translated;
        }
      }
    }catch{}
    try{
      const url="https://api.mymemory.translated.net/get?q="+encodeURIComponent(value)+"&langpair=en%7Car";
      const response=await fetch(url);
      if(!response.ok)throw new Error("Translation unavailable");
      const data=await response.json();
      const translated=String(data.responseData?.translatedText||"").trim();
      if(!translated||data.responseStatus!==200)throw new Error("Empty translation");
      cache[value]=translated;try{localStorage.setItem(key,JSON.stringify(cache));}catch{}
      return translated;
    }catch{return "";}
  }
  async function showQuiz(){
    if(!quizRound.length) startQuizRound();
    if(quizIndex>=quizRound.length){
      const used=readUsedQuizIds().size;
      const ar=settings.language!=="en";
      setPanel("Bible Quiz · مسابقة الكتاب المقدّس",`<div class="feature-hero"><h3>${settings.language==="ar"?"اكتملت المسابقة!":"Quiz complete!"}</h3><p class="arabic" dir="rtl">انتهت المسابقة!</p><div class="quiz-score">${quizScore} / ${quizRound.length}</div><p>${settings.language==="ar"?"أجبت إجابة صحيحة عن":"You got"} ${quizScore} ${settings.language==="ar"?"من أصل":"out of"} ${quizRound.length}.</p><p class="meaning">${used} / ${quizQuestions.length} · ${ar?"سؤالًا استُخدم في هذه الدورة. لن تتكرّر الأسئلة حتى تُستعمل المجموعة كاملة.":"questions used in this cycle. Questions will not repeat until the full bank has been played."}</p><button class="primary-button" data-quiz-restart>${settings.language==="ar"?"مسابقة جديدة ↻":"New quiz ↻"}</button></div>`);return;
    }
    const q=quizRound[quizIndex], lang=settings.language;
    let qAr="", answersAr=[];
    if(lang!=="en"){
      setPanel("Bible Quiz · مسابقة الكتاب المقدّس",`<p class="loading">Preparing Arabic questions… / جارٍ تحضير الأسئلة العربية…</p>`);
      const translated=await Promise.all([translateQuizText(q.q),...q.a.map(translateQuizText)]);
      qAr=translated[0];answersAr=translated.slice(1);
    }
    const question=lang==="ar"?(qAr||"تعذّرت ترجمة هذا السؤال. يُرجى إعادة المحاولة بعد التأكّد من الاتصال بالإنترنت."):lang==="both"?`${escapeHtml(q.q)}${qAr?`<p class="arabic" lang="ar" dir="rtl">${escapeHtml(qAr)}</p>`:""}`:q.q;
    const answerLabel=(v,i)=>lang==="ar"?(answersAr[i]||"تعذّرت ترجمة هذا الخيار"):lang==="both"?`${escapeHtml(v)}${answersAr[i]?`<span class="arabic" lang="ar" dir="rtl">${escapeHtml(answersAr[i])}</span>`:""}`:escapeHtml(v);
    setPanel("Bible Quiz · مسابقة الكتاب المقدّس",`<p class="reference">${interfaceLabel("QUESTION","السؤال")} ${quizIndex+1} / ${quizRound.length} · ${interfaceLabel("SCORE","النتيجة")} ${quizScore}</p><div class="progress-track"><span style="width:${quizIndex/quizRound.length*100}%"></span></div><article class="quiz-card"><h3 ${lang==="ar"?'class="arabic" dir="rtl"':""}>${question}</h3><div class="quiz-options">${q.a.map((v,i)=>`<button class="quiz-option" data-quiz-answer="${i}" ${quizAnswered?"disabled":""}>${answerLabel(v,i)}</button>`).join("")}</div><div id="quizFeedback" class="quiz-feedback">${quizAnswered?(lang==="en"?escapeHtml(q.why):lang==="ar"?escapeHtml(q.ar||"أحسنت! راجع الإجابة الصحيحة أعلاه."):`${escapeHtml(q.why)}<p class="arabic" lang="ar" dir="rtl">${escapeHtml(q.ar||"أحسنت! راجع الإجابة الصحيحة أعلاه.")}</p>`): ""}</div><button class="primary-button" data-quiz-next ${quizAnswered?"":"disabled"}>${quizIndex===quizRound.length-1?interfaceLabel("See result","عرض النتيجة"):interfaceLabel("Next question →","السؤال التالي ←")}</button></article>`);
    if(quizAnswered){const options=output.querySelectorAll("[data-quiz-answer]");options.forEach((b,i)=>{if(i===q.correct)b.classList.add("correct")});}
  }
  const featuredSaints=[
    {en:"Saint Charbel Makhlouf",ar:"القديس شربل مخلوف",date:"July 24",story:"A Maronite monk and hermit from Lebanon, remembered for a life of prayer, simplicity and devotion to the Eucharist.",storyAr:"راهب وناسك ماروني من لبنان، يُذكر بحياة الصلاة والبساطة والتعبّد للقربان المقدّس."},
    {en:"Saint Rafqa",ar:"القديسة رفقا",date:"March 23",story:"A Lebanese Maronite nun whose life is remembered for prayer, faith and patient hope.",storyAr:"راهبة مارونية لبنانية تُذكر بحياة الصلاة والإيمان والرجاء."},
    {en:"Saint Nimatullah Al-Hardini",ar:"القديس نعمة الله الحرديني",date:"December 14",story:"A Lebanese Maronite monk and teacher known for a life centred on prayer, study and service.",storyAr:"راهب ومعلّم ماروني لبناني عُرف بحياة تتمحور حول الصلاة والدراسة والخدمة."},
    {en:"Saint Aquilina of Byblos",ar:"القديسة أكويلينا من جبيل",date:"June 13",story:"A young martyr honoured in the Christian tradition of Byblos.",storyAr:"شهيدة شابّة تُكرّم في التقليد المسيحي في مدينة جبيل."},
    {en:"Saint Anthony the Great",ar:"القديس أنطونيوس الكبير",date:"January 17",story:"An early Christian monk whose example helped shape the tradition of monastic life.",storyAr:"راهب مسيحي من القرون الأولى، أسهم مثاله في نشأة الحياة الرهبانية."},
    {en:"Saint Josephine Bakhita",ar:"القديسة جوزفين بخيتا",date:"February 8",story:"A Sudanese-born Canossian sister whose life became a witness to dignity, forgiveness and hope.",storyAr:"راهبة كانوسيّة وُلدت في السودان، وأصبحت حياتها شهادة للكرامة والمغفرة والرجاء."},
    {en:"Saint Francis of Assisi",ar:"القديس فرنسيس الأسيزي",date:"October 4",story:"Remembered for simplicity, care for creation and joyful service to the poor.",storyAr:"يُذكر بالبساطة والعناية بالخليقة والخدمة المفرحة للفقراء."}
  ];
  function showSaintOfDay(){
    const day=Math.floor(Date.now()/86400000), saint=featuredSaints[((day%featuredSaints.length)+featuredSaints.length)%featuredSaints.length];
    setPanel("Saint of the Day · قديس اليوم",`<div class="feature-hero"><span class="feature-kicker">TODAY’S SAINT · ${saint.date.toUpperCase()}</span><h3>${escapeHtml(saint.en)}</h3><p class="arabic" lang="ar" dir="rtl">${escapeHtml(saint.ar)}</p></div><div class="saint-detail">${featureText(saint.story,saint.storyAr)}<p class="meaning">This is a featured daily profile, not a claim that this is the saint listed in the official liturgical calendar today. / هذه نبذة يومية مختارة وليست تأكيدًا أنّ هذا هو قديس التقويم الليتورجي اليوم.</p><button class="text-button" data-view="saints">Explore all saints ↗</button></div>`);
  }
  let calendarMonth=new Date().getMonth(),calendarYear=new Date().getFullYear();
  const feastDays={"01-01":"Mary, Mother of God · مريم والدة الإله","01-06":"Epiphany · عيد الدنح","03-19":"Saint Joseph · مار يوسف","03-25":"Annunciation · عيد البشارة","06-29":"Saints Peter and Paul · مار بطرس وبولس","08-15":"Assumption of Mary · انتقال العذراء","09-08":"Nativity of Mary · مولد العذراء","11-01":"All Saints · عيد جميع القديسين","12-08":"Immaculate Conception · الحبل بلا دنس","12-25":"Christmas · عيد الميلاد"};
  function showCalendar(){
    const first=new Date(calendarYear,calendarMonth,1),count=new Date(calendarYear,calendarMonth+1,0).getDate(),offset=first.getDay(),today=new Date();
    const cells=Array.from({length:offset},()=>'<span class="calendar-empty"></span>');
    for(let d=1;d<=count;d++){const key=`${String(calendarMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;cells.push(`<button class="calendar-day ${d===today.getDate()&&calendarMonth===today.getMonth()&&calendarYear===today.getFullYear()?"today":""} ${feastDays[key]?"feast":""}" data-calendar-day="${d}" title="${escapeHtml(feastDays[key]||"")}">${d}</button>`);}
    const dataNote="The calendar below highlights selected major Catholic feast days. Moveable feasts and the official Maronite daily calendar are shown in the daily readings from OLM.";
    setPanel("Catholic Calendar · التقويم الكاثوليكي",`<div class="calendar-head"><button class="quiet-button" data-calendar-prev aria-label="Previous month">←</button><h3>${first.toLocaleDateString(undefined,{month:"long",year:"numeric"})}</h3><button class="quiet-button" data-calendar-next aria-label="Next month">→</button></div><div class="calendar-grid calendar-weekdays">${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(x=>`<span>${x}</span>`).join("")}</div><div class="calendar-grid">${cells.join("")}</div><div class="calendar-detail" id="calendarDetail"><p class="meaning">${dataNote}</p></div><button class="text-button" data-action="daily">Open today’s Maronite readings ↗</button>`);
  }
  function showHeritage(){
    setPanel("Lebanese Catholic Heritage · التراث الكاثوليكي اللبناني",`<div class="feature-hero heritage-hero"><span class="feature-kicker">FAITH ROOTED IN LEBANON</span><h3>Mountains, monasteries & a living tradition.</h3><p class="arabic" lang="ar" dir="rtl">إيمان متجذّر في لبنان: جبال وأديار وتقاليد حيّة.</p></div><div class="heritage-grid"><article><h3>${interfaceLabel("The Maronite Church","الكنيسة المارونية")}</h3><p>The Maronite Church is an Eastern Catholic Church in full communion with the Bishop of Rome. Its Syriac Antiochene liturgical tradition has deep roots in Lebanon.</p><p class="arabic" dir="rtl">الكنيسة المارونية كنيسة شرقية كاثوليكية في شركة كاملة مع أسقف روما، وتحمل تقليدًا ليتورجيًا سريانيًا أنطاكيًا متجذّرًا في لبنان.</p></article><article><h3>${interfaceLabel("Qadisha Valley","وادي قاديشا")}</h3><p>The Holy Valley in northern Lebanon preserves a remarkable landscape of monasteries, hermitages and centuries of Christian monastic life.</p><p class="arabic" dir="rtl">يحفظ الوادي المقدّس في شمال لبنان أديرة ومحابس وآثارًا من قرون طويلة من الحياة الرهبانية المسيحية.</p></article><article><h3>${interfaceLabel("Our saints & blesseds","قديسونا وطوباويّونا")}</h3><p>Saint Charbel, Saint Rafqa and Saint Nimatullah are among Lebanon’s best-known Maronite saints. Blessed Estephan El Douaihy and other witnesses also belong to this story.</p><p class="arabic" dir="rtl">من أشهر قديسي لبنان الموارنة شربل ورفقا ونعمة الله، كما ينتمي الطوباوي اسطفان الدويهي وشهود آخرون إلى هذا التاريخ.</p></article><article><h3>${interfaceLabel("Living heritage","تراث حيّ")}</h3><p>Faith is carried through parish life, family prayer, the Divine Liturgy, hymns, feast days and the care of neighbours.</p><p class="arabic" dir="rtl">يستمرّ الإيمان في حياة الرعايا وصلاة العائلة والقداس الإلهي والترانيم والأعياد وخدمة القريب.</p></article></div><p class="meaning">${interfaceLabel("Explore the saint biographies and daily readings for more. This introduction is educational and does not replace parish or Church sources.","اكتشف المزيد في سير القديسين وقراءات اليوم. هذا التعريف تثقيفي ولا يحلّ محلّ مصادر الرعية أو الكنيسة.")}</p><button class="text-button" data-view="saints">${interfaceLabel("Discover Lebanese saints ↗","اكتشف القديسين اللبنانيين ←")}</button>`);
  }
  function showIntentions(){
    let saved=[];try{saved=JSON.parse(localStorage.getItem("verbum-intentions")||"[]");if(!Array.isArray(saved))saved=[];}catch{saved=[];}
    const rows=saved.map((x,i)=>`<article class="intention-item"><p>${escapeHtml(x.text)}</p><small>${new Date(x.date).toLocaleDateString()}</small><button class="quiet-button" data-intention-delete="${i}" aria-label="Delete intention">${interfaceLabel("Remove","إزالة")}</button></article>`).join("");
    setPanel("Prayer Intentions · نيات الصلاة",`<div class="feature-hero"><h3>${interfaceLabel("What shall we pray for?","بماذا نصلّي اليوم؟")}</h3><p class="arabic" dir="rtl">بماذا نصلّي اليوم؟</p><p>${interfaceLabel("Write a personal intention and keep it here as a reminder to pray.","اكتب نيّة صلاة شخصية واحتفظ بها هنا لتذكّر نفسك بالصلاة.")}</p></div><form id="intentionForm" class="intention-form"><label for="intentionText">Your intention / نيّة الصلاة</label><textarea id="intentionText" maxlength="500" required placeholder="Write a short intention… / اكتب نيّة قصيرة…"></textarea><button class="primary-button" type="submit">${interfaceLabel("Save on this device","احفظ على هذا الجهاز")}</button></form><p class="meaning">${interfaceLabel("Privacy: intentions are stored only in this browser on this device. They are not sent to the website or shared with anyone. Avoid entering private details about yourself or others.","الخصوصية: تُحفَظ النيّات على هذا الجهاز وفي هذا المتصفّح فقط، ولا تُرسل إلى الموقع أو تُشارك مع أحد. تجنّب إدخال معلومات شخصية أو خاصة عنك أو عن الآخرين.")}</p><div class="intentions-list">${rows||'<p class="meaning">Your saved intentions will appear here.</p>'}</div>`);
  }

  function go(view) {
    document.querySelectorAll(".nav-link").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
    if (view === "readings" || view === "daily") return showDailyReadings();
    if (view === "verse") return showRandomVerse();
    if (view === "prayers") return showPrayers();
    if (view === "rosary") return showRosary();
    if (view === "gospel") return showGospelFeature();
    if (view === "saint-day") return showSaintOfDay();
    if (view === "quiz") { quizIndex=0; quizScore=0; quizAnswered=false; return showQuiz(); }
    if (view === "calendar") return showCalendar();
    if (view === "intentions") return showIntentions();
    if (view === "heritage") return showHeritage();
    if (view === "saints" || view === "priest") { window.dispatchEvent(new CustomEvent("verbum:view", { detail: view })); return; }
    if (view === "reflection") return showReflection();
    panelTitle.textContent = "Begin with Scripture";
    output.innerHTML = `<p class="empty-state">${escapeHtml(translations[settings.language === "ar" ? "ar" : "en"].emptyPrompt)}</p>`;
  }

  document.addEventListener("click", event => {
    const prayerCategory = event.target.closest("[data-prayer-category]");
    if (prayerCategory) { showPrayers(prayerCategory.dataset.prayerCategory); return; }

    const rosarySelect=event.target.closest("#rosaryMystery");
    if(rosarySelect){rosaryState={mystery:rosarySelect.value,phase:0,decade:0,bead:0};showRosary();return;}
    if(event.target.closest("[data-rosary-reset]")){rosaryState.phase=0;showRosary();return;}
    if(event.target.closest("[data-rosary-next]")){const total=rosaryStepList().length;rosaryState.phase=rosaryState.phase>=total-1?0:rosaryState.phase+1;showRosary();return;}
    const quizAnswer=event.target.closest("[data-quiz-answer]");
    if(quizAnswer&&!quizAnswered){const q=quizRound[quizIndex];quizAnswered=true;if(Number(quizAnswer.dataset.quizAnswer)===q.correct)quizScore++;showQuiz();return;}
    if(event.target.closest("[data-quiz-next]")&&quizAnswered){quizIndex++;quizAnswered=false;showQuiz();return;}
    if(event.target.closest("[data-quiz-restart]")){startQuizRound();showQuiz();return;}
    if(event.target.closest("[data-calendar-prev]")){calendarMonth--;if(calendarMonth<0){calendarMonth=11;calendarYear--;}showCalendar();return;}
    if(event.target.closest("[data-calendar-next]")){calendarMonth++;if(calendarMonth>11){calendarMonth=0;calendarYear++;}showCalendar();return;}
    const calendarDay=event.target.closest("[data-calendar-day]");
    if(calendarDay){const key=`${String(calendarMonth+1).padStart(2,"0")}-${String(Number(calendarDay.dataset.calendarDay)).padStart(2,"0")}`;$("#calendarDetail").innerHTML=feastDays[key]?`<p><strong>${escapeHtml(feastDays[key])}</strong></p>`:'<p class="meaning">No major fixed feast is highlighted for this date. / لا يوجد عيد ثابت بارز محدّد لهذا التاريخ.</p>';return;}
    if(event.target.closest("[data-intention-delete]")){let saved=[];try{saved=JSON.parse(localStorage.getItem("verbum-intentions")||"[]");}catch{}saved.splice(Number(event.target.closest("[data-intention-delete]").dataset.intentionDelete),1);localStorage.setItem("verbum-intentions",JSON.stringify(saved));showIntentions();return;}
    const action = event.target.closest("[data-action]");
    if (action) go(action.dataset.action);
    const nav = event.target.closest("[data-view]");
    if (nav) go(nav.dataset.view);
  });
  output.addEventListener("submit",event=>{if(event.target.id!=="intentionForm")return;event.preventDefault();const field=$("#intentionText");const value=field.value.trim();if(!value)return;let saved=[];try{saved=JSON.parse(localStorage.getItem("verbum-intentions")||"[]");}catch{}saved.unshift({text:value,date:new Date().toISOString()});localStorage.setItem("verbum-intentions",JSON.stringify(saved.slice(0,50)));showIntentions();});
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
  const dateOptions = { weekday:"long", year:"numeric", month:"long", day:"numeric" };
  const englishDate = now.toLocaleDateString("en", dateOptions);
  const arabicDate = now.toLocaleDateString("ar-LB", dateOptions);
  $("#todayDate").textContent = settings.language === "ar" ? arabicDate : settings.language === "en" ? englishDate : `${englishDate} · ${arabicDate}`;
  applySettings();
})();