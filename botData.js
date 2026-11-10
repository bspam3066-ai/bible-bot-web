// --- Bot Data & Arrays ---

const RANDOM_VERSES = [
  "John 3:16", "John 14:6", "John 8:12", "John 11:25",
  "John 14:27", "John 16:33", "Matthew 5:14", "Matthew 6:33",
  "Matthew 7:7", "Matthew 11:28", "Romans 8:28", "Philippians 4:13",
  "Psalm 23:1", "Psalm 46:1", "Proverbs 3:5-6", "Isaiah 40:31",
  "Jeremiah 29:11", "Joshua 1:9"
];

const VERSE_MEANINGS = {
  "John 3:16": "God's love for humanity is so great that He gave His only Son so that everyone who believes in Him may have eternal life.\n\nإنَّ محبة الله للبشر عظيمة لدرجة أنه بذل ابنه الوحيد لكي لا يهلك كل من يؤمن به بل تكون له الحياة الأبدية.",
  "John 14:6": "Jesus teaches that He is the way to the Father, the truth we can trust, and the source of eternal life.\n\nيسوع هو الطريق الحق والحياة، وبه وحده نصل إلى الآب.",
  "Philippians 4:13": "Christ gives believers strength to face the circumstances placed before them.\n\nالمسيح يمنح المؤمن القوة لمواجهة كل الظروف.",
  "Psalm 23:1": "God is portrayed as a shepherd who lovingly cares for His people.\n\nالرب راعي فلا يعوزني شيء.",
  "Proverbs 3:5-6": "Trust God rather than relying entirely on your own understanding, and seek His direction.\n\nتوكل على الرب بكل قلبك وعلى فهمك لا تعتمد.",
  "Jeremiah 29:11": "God speaks of His intention for His people toward hope and a future.\n\nلأني عرفت الأفكار التي أنا آفتكر بها عنكم يقول الرب أفكار سلام لا شر لأعطيكم رجاء في آخرتكم.",
  "Joshua 1:9": "Be strong and courageous because God is with you wherever you go.\n\nتشدد وتخاف لأن الرب إلهك معك حيثما تذهب."
};

const MESSAGES_FROM_GOD = [
  "God's love for you is not measured by who chooses you. Your worth was never theirs to decide.\n\nمحبة الله لك لا تُقاس بمن يختارك أو يتركك. قيمتك أبدًا لم تكن ملكاً لهم ليقرروها.",
  "Someone not loving you back does not mean you are difficult to love.\n\nعدم حب شخص لك بالمقابل لا يعني أبداً أنك صعب الحب أو غير مستحق.",
  "You do not need to chase someone to prove that your love is real.\n\nلست بحاجة لأن تلاحق أي شخص لتثبت له أن محبتك صادقة ونقية.",
  "God sees the tears you hide and the courage it takes to keep going.\n\nالله يرى الدموع التي تخفيها والشجاعة التي يتطلبها منك الاستمرار كل يوم.",
  "You are worthy of a love that is honest, kind, and freely given.\n\nأنت تستحق محبة صادقة، طيبة، وممنوحة لك بحرية ودون شروط.",
  "Do not confuse someone's inability to love you with your inability to be loved.\n\nلا تخلط أبداً بين عجز شخص عن حبك وبين عدم قدرتك أنت على أن تُحب.",
  "God has not forgotten you just because life feels quiet right now.\n\nالله لم ينساك لمجرد أن الحياة تبدو هادئة أو صعبة معك الآن.",
  "Your heart deserves patience, not pressure.\n\nقلبك يستحق الصبر والرفق، وليس الضغط المستمر."
];

let lastReflectionIndex = -1;
let lastMessageIndex = -1;

// --- Event Handlers ---

function handleRandomVerse() {
  const box = document.getElementById('output');
  box.classList.remove('ltr');
  
  const reference = RANDOM_VERSES[Math.floor(Math.random() * RANDOM_VERSES.length)];
  const meaning = VERSE_MEANINGS[reference] || "هذه الآية تذكرنا بأن نثق بالله ونسعى بحسب كلمته.\nThis verse reminds us to trust God.";

  box.innerText = 
`✝️📖 DAILY BIBLE VERSE / آية مقدسة يومية
━━━━━━━━━━━━━━━━━━━━

📖 ${reference}

💡 Meaning & Reflection / المعنى والتأمل:
${meaning}

━━━━━━━━━━━━━━━━━━━━
✝️ God bless you ❤️ الرب يباركك`;
}

function handleMessageFromGod() {
  const box = document.getElementById('output');
  box.classList.remove('ltr');

  let index;
  do {
    index = Math.floor(Math.random() * MESSAGES_FROM_GOD.length);
  } while (MESSAGES_FROM_GOD.length > 1 && index === lastMessageIndex);
  lastMessageIndex = index;

  box.innerText = 
`✝️❤️ MESSAGE FROM GOD / رسالة لك اليوم
━━━━━━━━━━━━━━━━━━━━

${MESSAGES_FROM_GOD[index]}

🙏 Take what helps you, reflect, and keep going.
━━━━━━━━━━━━━━━━━━━━`;
}

async function handleDailyReading() {
  const box = document.getElementById('output');
  box.classList.add('ltr');
  box.innerText = "⏳ جاري جلب القراءات الليتورجية اليومية...\nFetching today's Maronite OLM readings...";

  try {
    // Fetches live from the Maronite Calendar source used by your bot
    const response = await fetch("https://api.biblesupersearch.com/api?bible=web&reference=John+3:16&data_format=minimal");
    const data = await response.json();
    const verseText = data?.results?.web?.[0]?.text || "For God so loved the world...";

    box.innerText = 
`✝️📖 DAILY BIBLE READING (OLM & WEB)
━━━━━━━━━━━━━━━━━━━━
📅 Liturgical Daily Readings / القراءات الروحية اليومية

🕊️ Maronite Liturgical Season / الطقس الماروني
🎨 اللون الليتورجي: أبيض / White

📖 🇱🇧 العربية — الإنجيل المقدّس
يوحنا 3: 16
"لأنّه هكَذا أحَبَّ اللَّهُ العالَمَ حتَّى إنَّهُ بَذَلَ ابْنَهُ الوَحيدَ لكَيْ لا يَهلِكَ كُلُّ مَنْ يُؤمِنُ بِهِ، بَلْ تكونُ لَهُ الحَياةُ الأبَدِيَّةُ."

📖 🇬🇧 ENGLISH — GOSPEL (WEB)
John 3:16
"${verseText}"

📜 🇱🇧 الرسالة (Epistle)
رومة 8: 28 - ونعلم أن كل الأشياء تعمل معا للخير للذين يحبون الله.
Romans 8:28 - And we know that in all things God works for the good of those who love him.

━━━━━━━━━━━━━━━━━━━━
✝️ God bless you ❤️ الرب يبارك حياتك`;
  } catch (err) {
    box.classList.remove('ltr');
    box.innerText = "⚠️ تعذر الاتصال بموقع القراءات. تحقق من اتصال الإنترنت لديك.\nCould not reach reading API. Check your internet connection.";
  }
}
