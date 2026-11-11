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
  function showRosary() {
    const m=rosaryMysteries[rosaryState.mystery], steps=rosaryStepList();
    const index=Math.min(rosaryState.phase,steps.length-1), step=steps[index];
    const progress=Math.round((index/(steps.length-1))*100);
    setPanel("Pray the Rosary · صلِّ المسبحة",`
      <div class="feature-hero"><span class="feature-kicker">VERBUM DEI · PRAYER GUIDE</span><h3>Walk through the Rosary</h3><p>Take your time. You can pause or restart whenever you wish.</p></div>
      <div class="feature-toolbar"><label for="rosaryMystery">Choose the mysteries / اختر الأسرار</label><select id="rosaryMystery">${Object.entries(rosaryMysteries).map(([id,x])=>`<option value="${id}" ${id===rosaryState.mystery?"selected":""}>${x.en} · ${x.ar}</option>`).join("")}</select></div>
      <p class="meaning">${m.days} · ${m.en} / ${m.ar}</p>
      <div class="progress-track"><span style="width:${progress}%"></span></div><p class="reference">PRAYER ${index+1} OF ${steps.length}</p>
      <article class="prayer-entry rosary-current"><h3>${escapeHtml(step.en)}</h3><p class="arabic" lang="ar" dir="rtl">${escapeHtml(step.ar)}</p><p class="meaning">Mystery ${Math.min(5,Math.max(1,Math.ceil(Math.max(0,index-7)/12)))} of 5 · Take a quiet moment.</p></article>
      <div class="feature-actions"><button class="quiet-button" data-rosary-reset>Restart</button><button class="primary-button" data-rosary-next>${index===steps.length-1?"Finish":"Next prayer →"}</button></div>
      <p class="meaning">The guide helps you keep your place; pray the full traditional texts aloud or from your own prayer book. / هذا الدليل يساعدك على متابعة ترتيب الصلاة.</p>`);
  }
  const quizQuestions=[
    {q:"Where was Jesus born?",a:["Nazareth","Bethlehem","Jerusalem"],correct:1,why:"The Gospels of Matthew and Luke name Bethlehem as the place of Jesus’ birth.",ar:"تذكر إنجيلا متّى ولوقا أنّ يسوع وُلد في بيت لحم."},
    {q:"Who baptised Jesus in the Jordan?",a:["Peter","John the Baptist","James"],correct:1,why:"John the Baptist baptised Jesus in the Jordan River.",ar:"عمّد يوحنّا المعمدان يسوع في نهر الأردن."},
    {q:"What is the first book of the Bible?",a:["Genesis","Psalms","Exodus"],correct:0,why:"Genesis is the opening book of the Bible.",ar:"سفر التكوين هو السفر الأوّل في الكتاب المقدّس."},
    {q:"Which apostle is traditionally associated with the keys of the Kingdom?",a:["Peter","Thomas","Andrew"],correct:0,why:"Jesus gives Peter the keys in Matthew 16:19.",ar:"يرتبط بطرس بمفاتيح الملكوت في متّى 16:19."},
    {q:"What is the central celebration of the Eucharist?",a:["The Mass / Divine Liturgy","The baptismal service","The funeral rite"],correct:0,why:"Catholics celebrate the Eucharist in the Mass; Eastern Catholics also call it the Divine Liturgy.",ar:"يحتفل الكاثوليك بالقربان المقدّس في القداس الإلهي."},
    {q:"Which Lebanese saint is known as the hermit of Annaya?",a:["Saint Rafqa","Saint Charbel","Saint Nimatullah"],correct:1,why:"Saint Charbel lived as a monk and hermit in Annaya.",ar:"عاش القديس شربل راهبًا وناسكًا في عنايا."},
    {q:"How many Gospels are in the New Testament?",a:["Two","Four","Seven"],correct:1,why:"The four canonical Gospels are Matthew, Mark, Luke and John.",ar:"الأناجيل الأربعة هي متّى ومرقس ولوقا ويوحنّا."},
    {q:"What season prepares the Church for Christmas?",a:["Lent","Advent","Easter"],correct:1,why:"Advent is the season of preparation and expectation before Christmas.",ar:"زمن المجيء هو زمن الاستعداد وانتظار عيد الميلاد."},
    {q:"Where is the Qadisha Valley?",a:["North Lebanon","South Lebanon","Beirut"],correct:0,why:"The Qadisha Valley is in northern Lebanon and is deeply connected with Maronite monastic history.",ar:"يقع وادي قاديشا في شمال لبنان ويرتبط بتاريخ الرهبنة المارونية."},
    {q:"What does ‘Alleluia’ mean?",a:["Peace be with you","Praise the Lord","Go in peace"],correct:1,why:"Alleluia comes from Hebrew and means ‘Praise the Lord’.",ar:"هللويا كلمة من أصل عبري تعني سبّحوا الرب."}
  ];
  let quizIndex=0,quizScore=0,quizAnswered=false;
  function showQuiz(){
    if(quizIndex>=quizQuestions.length){
      setPanel("Bible Quiz · مسابقة الكتاب المقدّس",`<div class="feature-hero"><h3>Quiz complete!</h3><p class="arabic" dir="rtl">انتهت المسابقة!</p><div class="quiz-score">${quizScore} / ${quizQuestions.length}</div><p>You got ${quizScore} out of ${quizQuestions.length} correct.</p><button class="primary-button" data-quiz-restart>Play again ↻</button></div>`);return;
    }
    const q=quizQuestions[quizIndex];
    setPanel("Bible Quiz · مسابقة الكتاب المقدّس",`<p class="reference">QUESTION ${quizIndex+1} OF ${quizQuestions.length} · SCORE ${quizScore}</p><div class="progress-track"><span style="width:${quizIndex/quizQuestions.length*100}%"></span></div><article class="quiz-card"><h3>${escapeHtml(q.q)}</h3><div class="quiz-options">${q.a.map((v,i)=>`<button class="quiz-option" data-quiz-answer="${i}" ${quizAnswered?"disabled":""}>${escapeHtml(v)}</button>`).join("")}</div><div id="quizFeedback" class="quiz-feedback">${quizAnswered?escapeHtml(q.why)+" / "+escapeHtml(q.ar):""}</div><button class="primary-button" data-quiz-next ${quizAnswered?"":"disabled"}>${quizIndex===quizQuestions.length-1?"See result":"Next question →"}</button></article>`);
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
    setPanel("Lebanese Catholic Heritage · التراث الكاثوليكي اللبناني",`<div class="feature-hero heritage-hero"><span class="feature-kicker">FAITH ROOTED IN LEBANON</span><h3>Mountains, monasteries & a living tradition.</h3><p class="arabic" lang="ar" dir="rtl">إيمان متجذّر في لبنان: جبال وأديار وتقاليد حيّة.</p></div><div class="heritage-grid"><article><h3>The Maronite Church</h3><p>The Maronite Church is an Eastern Catholic Church in full communion with the Bishop of Rome. Its Syriac Antiochene liturgical tradition has deep roots in Lebanon.</p><p class="arabic" dir="rtl">الكنيسة المارونية كنيسة شرقية كاثوليكية في شركة كاملة مع أسقف روما، وتحمل تقليدًا ليتورجيًا سريانيًا أنطاكيًا متجذّرًا في لبنان.</p></article><article><h3>Qadisha Valley</h3><p>The Holy Valley in northern Lebanon preserves a remarkable landscape of monasteries, hermitages and centuries of Christian monastic life.</p><p class="arabic" dir="rtl">يحفظ الوادي المقدّس في شمال لبنان أديرة ومحابس وآثارًا من قرون طويلة من الحياة الرهبانية المسيحية.</p></article><article><h3>Our saints & blesseds</h3><p>Saint Charbel, Saint Rafqa and Saint Nimatullah are among Lebanon’s best-known Maronite saints. Blessed Estephan El Douaihy and other witnesses also belong to this story.</p><p class="arabic" dir="rtl">من أشهر قديسي لبنان الموارنة شربل ورفقا ونعمة الله، كما ينتمي الطوباوي اسطفان الدويهي وشهود آخرون إلى هذا التاريخ.</p></article><article><h3>Living heritage</h3><p>Faith is carried through parish life, family prayer, the Divine Liturgy, hymns, feast days and the care of neighbours.</p><p class="arabic" dir="rtl">يستمرّ الإيمان في حياة الرعايا وصلاة العائلة والقداس الإلهي والترانيم والأعياد وخدمة القريب.</p></article></div><p class="meaning">Explore the saint biographies and daily readings for more. This introduction is educational and does not replace parish or Church sources.</p><button class="text-button" data-view="saints">Discover Lebanese saints ↗</button>`);
  }
  function showIntentions(){
    let saved=[];try{saved=JSON.parse(localStorage.getItem("verbum-intentions")||"[]");if(!Array.isArray(saved))saved=[];}catch{saved=[];}
    const rows=saved.map((x,i)=>`<article class="intention-item"><p>${escapeHtml(x.text)}</p><small>${new Date(x.date).toLocaleDateString()}</small><button class="quiet-button" data-intention-delete="${i}" aria-label="Delete intention">Remove</button></article>`).join("");
    setPanel("Prayer Intentions · نيات الصلاة",`<div class="feature-hero"><h3>What shall we pray for?</h3><p class="arabic" dir="rtl">بماذا نصلّي اليوم؟</p><p>Write a personal intention and keep it here as a reminder to pray.</p></div><form id="intentionForm" class="intention-form"><label for="intentionText">Your intention / نيّة الصلاة</label><textarea id="intentionText" maxlength="500" required placeholder="Write a short intention… / اكتب نيّة قصيرة…"></textarea><button class="primary-button" type="submit">Save on this device</button></form><p class="meaning">Privacy: intentions are stored only in this browser on this device. They are not sent to the website or shared with anyone. Avoid entering private details about yourself or others.</p><div class="intentions-list">${rows||'<p class="meaning">Your saved intentions will appear here.</p>'}</div>`);
  }

  function go(view) {
    document.querySelectorAll(".nav-link").forEach(btn => btn.classList.toggle("active", btn.dataset.view === view));
    if (view === "readings" || view === "daily") return showDailyReadings();
    if (view === "verse") return showRandomVerse();
    if (view === "prayers") return showPrayers();
    if (view === "rosary") return showRosary();
    if (view === "gospel") return showDailyReadings();
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
    if(quizAnswer&&!quizAnswered){const q=quizQuestions[quizIndex];quizAnswered=true;if(Number(quizAnswer.dataset.quizAnswer)===q.correct)quizScore++;showQuiz();return;}
    if(event.target.closest("[data-quiz-next]")&&quizAnswered){quizIndex++;quizAnswered=false;showQuiz();return;}
    if(event.target.closest("[data-quiz-restart]")){quizIndex=0;quizScore=0;quizAnswered=false;showQuiz();return;}
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
  $("#todayDate").textContent = now.toLocaleDateString(undefined, { weekday:"long", year:"numeric", month:"long", day:"numeric" });
  applySettings();
})();