// --- Extracted Data Arrays from your Bot Logic ---

const RANDOM_VERSES = [
  "John 3:16", "John 14:6", "John 8:12", "John 11:25",
  "John 14:27", "John 16:33", "Matthew 5:14", "Matthew 6:33",
  "Matthew 7:7", "Matthew 11:28", "Romans 8:28", "Philippians 4:13",
  "Psalm 23:1", "Psalm 46:1", "Proverbs 3:5-6", "Isaiah 40:31",
  "Jeremiah 29:11", "Joshua 1:9"
];

const VERSE_MEANINGS = {
  "John 3:16": "God's love for humanity is so great that He gave His only Son so that everyone who believes in Him may have eternal life.",
  "John 14:6": "Jesus teaches that He is the way to fireplaces of the Father, the truth we can trust, and the source of eternal life.",
  "Philippians 4:13": "Christ gives believers strength to face the circumstances placed before them.",
  "Psalm 23:1": "God is portrayed as a shepherd who lovingly cares for His people.",
  "Proverbs 3:5-6": "Trust God rather than relying entirely on your own understanding, and seek His direction.",
  "Jeremiah 29:11": "God speaks of His intention for His people toward hope and a future.",
  "Joshua 1:9": "Be strong and courageous because God is with you wherever you go."
};

const RANDOM_REFLECTIONS = [
  "Take a moment to thank God for His presence in your life today.",
  "Ask God to help you live out the message of this verse today.",
  "Let this verse remind you to trust God even when you cannot see the whole path.",
  "Take a quiet moment to pray and place today's worries in God's hands.",
  "Think about one way you can put this verse into practice today."
];

const MESSAGES_FROM_GOD = [
  "God's love for you is not measured by who chooses you. Your worth was never theirs to decide.",
  "Someone not loving you back does not mean you are difficult to love.",
  "You do not need to chase someone to prove that your love is real.",
  "God sees the tears you hide and the courage it takes to keep going.",
  "You are worthy of a love that is honest, kind, and freely given.",
  "Do not confuse someone's inability to love you with your inability to be loved.",
  "God has not forgotten you just because life feels quiet right now.",
  "Your heart deserves patience, not pressure."
];

// --- UI Event Handlers ---

let lastReflectionIndex = -1;
let lastMessageIndex = -1;

function getRandomReflection() {
  let index;
  do {
    index = Math.floor(Math.random() * RANDOM_REFLECTIONS.length);
  } while (RANDOM_REFLECTIONS.length > 1 && index === lastReflectionIndex);
  lastReflectionIndex = index;
  return RANDOM_REFLECTIONS[index];
}

function handleRandomVerse() {
  const reference = RANDOM_VERSES[Math.floor(Math.random() * RANDOM_VERSES.length)];
  const meaning = VERSE_MEANINGS[reference] || "This verse reminds us to trust God and live according to His word.";
  const reflection = getRandomReflection();

  const output = `✝️📖 DAILY BIBLE VERSE\n━━━━━━━━━━━━━━━━━━━━\n\n📖 ${reference}\n\n💡 Meaning\n\n${meaning}\n\n🙏 Reflection\n\n${reflection}\n\n━━━━━━━━━━━━━━━━━━━━\n\n✝️ God bless you ❤️`;
  
  document.getElementById('output').innerText = output;
}

function handleMessageFromGod() {
  let index;
  do {
    index = Math.floor(Math.random() * MESSAGES_FROM_GOD.length);
  } while (MESSAGES_FROM_GOD.length > 1 && index === lastMessageIndex);
  lastMessageIndex = index;
  const reflection = MESSAGES_FROM_GOD[index];

  const output = `✝️❤️ A MESSAGE TO REFLECT ON\n━━━━━━━━━━━━━━━━━━━━\n\n${reflection}\n\n🙏 Take what helps you, reflect, and keep going.\n\n━━━━━━━━━━━━━━━━━━━━`;

  document.getElementById('output').innerText = output;
}

async function handleDailyReading() {
  const outputBox = document.getElementById('output');
  outputBox.innerText = "⏳ Fetching today's readings from the web...";

  try {
    // Calls the same public Bible API your bot uses
    const response = await fetch("https://api.biblesupersearch.com/api?bible=web&reference=John+3:16&data_format=minimal");
    const data = await response.json();
    const verseText = data?.results?.web?.[0]?.text || "For God so loved the world...";

    outputBox.innerText = `✝️📖 SAMPLE SCRIPTURE FETCH\n━━━━━━━━━━━━━━━━━━━━\n\n📖 John 3:16 (WEB)\n\n"${verseText}"\n\n(This demonstrates how your bot's API fetch functions connect directly to browser-side JavaScript!)\n━━━━━━━━━━━━━━━━━━━━\n\n✝️ God bless you ❤️`;
  } catch (err) {
    outputBox.innerText = "⚠️ Could not reach scripture API. Check your internet connection.";
  }
}
