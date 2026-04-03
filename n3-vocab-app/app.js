// State
let currentMode = 'flashcard';
let currentIndex = 0;
let importedWords = loadImportedWords();
let allVocab = [...N3_VOCAB, ...importedWords];
let filteredVocab = [...allVocab];
let progress = loadProgress();
let quizState = null;
let typingState = { index: 0, correctCount: 0, wrongCount: 0, streak: 0, hintCount: 0, answered: false, hintUsed: false };

// DOM Elements
const flashcard = document.getElementById('flashcard');
const cardCounter = document.getElementById('card-counter');
const categorySelect = document.getElementById('category-select');
const wordCount = document.getElementById('word-count');
const searchInput = document.getElementById('search-input');
const listFilter = document.getElementById('list-filter');

// Initialize
init();

function init() {
  setupCategories();
  setupNavigation();
  setupFlashcard();
  setupTyping();
  setupQuiz();
  setupWordList();
  setupStats();
  setupImport();
  applyFilter();
  renderFlashcard();
}

// ---- Progress (localStorage) ----
function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem('n3-progress')) || {};
  } catch {
    return {};
  }
}

function saveProgress() {
  localStorage.setItem('n3-progress', JSON.stringify(progress));
}

function getWordKey(word) {
  return word.kanji + '|' + word.reading;
}

function isKnown(word) {
  return progress[getWordKey(word)] === true;
}

function setKnown(word, known) {
  const key = getWordKey(word);
  if (known) {
    progress[key] = true;
  } else {
    delete progress[key];
  }
  saveProgress();
}

// ---- Categories ----
function setupCategories() {
  refreshCategoryOptions();
  categorySelect.addEventListener('change', () => {
    applyFilter();
    currentIndex = 0;
    typingState.index = 0;
    renderFlashcard();
    if (currentMode === 'typing') renderTypingCard();
    renderWordList();
  });
}

function refreshCategoryOptions() {
  const current = categorySelect.value;
  categorySelect.innerHTML = '<option value="all">All</option>';
  const categories = [...new Set(allVocab.map(w => w.category))];
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = formatCategory(cat);
    categorySelect.appendChild(opt);
  });
  categorySelect.value = current || 'all';
}

function formatCategory(cat) {
  return cat.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function applyFilter() {
  const cat = categorySelect.value;
  filteredVocab = cat === 'all' ? [...allVocab] : allVocab.filter(w => w.category === cat);
  wordCount.textContent = `${filteredVocab.length} words`;
}

// ---- Navigation ----
function setupNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode;
      document.querySelectorAll('.mode').forEach(m => m.classList.remove('active'));
      document.getElementById(mode + '-mode').classList.add('active');
      currentMode = mode;
      if (mode === 'typing') renderTypingCard();
      if (mode === 'list') renderWordList();
      if (mode === 'stats') renderStats();
    });
  });
}

// ---- Flashcard ----
function setupFlashcard() {
  flashcard.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
  });

  document.getElementById('btn-prev').addEventListener('click', () => {
    if (filteredVocab.length === 0) return;
    currentIndex = (currentIndex - 1 + filteredVocab.length) % filteredVocab.length;
    flashcard.classList.remove('flipped');
    renderFlashcard();
  });

  document.getElementById('btn-next').addEventListener('click', () => {
    if (filteredVocab.length === 0) return;
    currentIndex = (currentIndex + 1) % filteredVocab.length;
    flashcard.classList.remove('flipped');
    renderFlashcard();
  });

  document.getElementById('btn-known').addEventListener('click', () => {
    if (filteredVocab.length === 0) return;
    setKnown(filteredVocab[currentIndex], true);
    nextCard();
  });

  document.getElementById('btn-unknown').addEventListener('click', () => {
    if (filteredVocab.length === 0) return;
    setKnown(filteredVocab[currentIndex], false);
    nextCard();
  });

  document.getElementById('btn-shuffle').addEventListener('click', () => {
    shuffleArray(filteredVocab);
    currentIndex = 0;
    flashcard.classList.remove('flipped');
    renderFlashcard();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (currentMode !== 'flashcard') return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.key === 'ArrowLeft') document.getElementById('btn-prev').click();
    if (e.key === 'ArrowRight') document.getElementById('btn-next').click();
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flashcard.click(); }
  });
}

function nextCard() {
  if (filteredVocab.length === 0) return;
  currentIndex = (currentIndex + 1) % filteredVocab.length;
  flashcard.classList.remove('flipped');
  renderFlashcard();
}

function renderFlashcard() {
  if (filteredVocab.length === 0) {
    flashcard.querySelector('.flashcard-front .kanji').textContent = 'No words';
    flashcard.querySelector('.flashcard-front .reading').textContent = '';
    flashcard.querySelector('.flashcard-back .meaning').textContent = '';
    flashcard.querySelector('.flashcard-back .example').textContent = '';
    cardCounter.textContent = '0 / 0';
    return;
  }
  const word = filteredVocab[currentIndex];
  flashcard.querySelector('.flashcard-front .kanji').textContent = word.kanji;
  flashcard.querySelector('.flashcard-front .reading').textContent = word.reading;
  flashcard.querySelector('.flashcard-back .meaning').textContent = word.meaning;
  flashcard.querySelector('.flashcard-back .example').textContent = word.example;
  cardCounter.textContent = `${currentIndex + 1} / ${filteredVocab.length}`;
}

// ---- Romaji to Hiragana (IME-style) ----
const ROMAJI_MAP = {
  'a':'あ','i':'い','u':'う','e':'え','o':'お',
  'ka':'か','ki':'き','ku':'く','ke':'け','ko':'こ',
  'sa':'さ','si':'し','shi':'し','su':'す','se':'せ','so':'そ',
  'ta':'た','ti':'ち','chi':'ち','tu':'つ','tsu':'つ','te':'て','to':'と',
  'na':'な','ni':'に','nu':'ぬ','ne':'ね','no':'の',
  'ha':'は','hi':'ひ','hu':'ふ','fu':'ふ','he':'へ','ho':'ほ',
  'ma':'ま','mi':'み','mu':'む','me':'め','mo':'も',
  'ya':'や','yu':'ゆ','yo':'よ',
  'ra':'ら','ri':'り','ru':'る','re':'れ','ro':'ろ',
  'wa':'わ','wi':'ゐ','we':'ゑ','wo':'を','nn':'ん',
  'ga':'が','gi':'ぎ','gu':'ぐ','ge':'げ','go':'ご',
  'za':'ざ','zi':'じ','ji':'じ','zu':'ず','ze':'ぜ','zo':'ぞ',
  'da':'だ','di':'ぢ','du':'づ','de':'で','do':'ど',
  'ba':'ば','bi':'び','bu':'ぶ','be':'べ','bo':'ぼ',
  'pa':'ぱ','pi':'ぴ','pu':'ぷ','pe':'ぺ','po':'ぽ',
  'kya':'きゃ','kyi':'きぃ','kyu':'きゅ','kye':'きぇ','kyo':'きょ',
  'sha':'しゃ','shu':'しゅ','she':'しぇ','sho':'しょ',
  'sya':'しゃ','syu':'しゅ','syo':'しょ',
  'cha':'ちゃ','chu':'ちゅ','che':'ちぇ','cho':'ちょ',
  'tya':'ちゃ','tyu':'ちゅ','tyo':'ちょ',
  'nya':'にゃ','nyi':'にぃ','nyu':'にゅ','nye':'にぇ','nyo':'にょ',
  'hya':'ひゃ','hyi':'ひぃ','hyu':'ひゅ','hye':'ひぇ','hyo':'ひょ',
  'mya':'みゃ','myi':'みぃ','myu':'みゅ','mye':'みぇ','myo':'みょ',
  'rya':'りゃ','ryi':'りぃ','ryu':'りゅ','rye':'りぇ','ryo':'りょ',
  'gya':'ぎゃ','gyi':'ぎぃ','gyu':'ぎゅ','gye':'ぎぇ','gyo':'ぎょ',
  'ja':'じゃ','ju':'じゅ','je':'じぇ','jo':'じょ',
  'jya':'じゃ','jyu':'じゅ','jyo':'じょ',
  'bya':'びゃ','byi':'びぃ','byu':'びゅ','bye':'びぇ','byo':'びょ',
  'pya':'ぴゃ','pyi':'ぴぃ','pyu':'ぴゅ','pye':'ぴぇ','pyo':'ぴょ',
  'fa':'ふぁ','fi':'ふぃ','fe':'ふぇ','fo':'ふぉ',
  'xa':'ぁ','xi':'ぃ','xu':'ぅ','xe':'ぇ','xo':'ぉ',
  'xya':'ゃ','xyu':'ゅ','xyo':'ょ','xtu':'っ','xtsu':'っ',
  'la':'ぁ','li':'ぃ','lu':'ぅ','le':'ぇ','lo':'ぉ',
  'lya':'ゃ','lyu':'ゅ','lyo':'ょ','ltu':'っ','ltsu':'っ',
  '-':'ー',
};

// Check if a string could be the start of a valid romaji sequence
function couldBeRomaji(s) {
  if (s === '') return true;
  for (const key of Object.keys(ROMAJI_MAP)) {
    if (key.startsWith(s)) return true;
  }
  // Double consonant prefix (e.g., "kk" where first k becomes っ)
  if (s.length === 1 && 'bcdfghjklmpqrstvwxyz'.includes(s)) return true;
  return false;
}

// IME state: tracks the romaji buffer and converted hiragana
let imeBuffer = '';    // pending romaji characters
let imeConverted = ''; // already converted hiragana

function imeReset() {
  imeBuffer = '';
  imeConverted = '';
}

function imeGetDisplay() {
  return imeConverted + imeBuffer;
}

function imeFlush() {
  // Force-convert whatever is in the buffer
  if (imeBuffer === 'n') {
    imeConverted += 'ん';
    imeBuffer = '';
  } else if (imeBuffer.length > 0) {
    // Leave unconvertible chars as-is
    imeConverted += imeBuffer;
    imeBuffer = '';
  }
  return imeConverted;
}

function imeAddChar(ch) {
  ch = ch.toLowerCase();
  imeBuffer += ch;

  // Try to convert from the buffer
  while (imeBuffer.length > 0) {
    let converted = false;

    // Handle 'n' followed by non-vowel, non-y, non-n consonant
    if (imeBuffer.length >= 2 && imeBuffer[0] === 'n' && !'aiueony'.includes(imeBuffer[1])) {
      imeConverted += 'ん';
      imeBuffer = imeBuffer.substring(1);
      converted = true;
      continue;
    }

    // Handle double consonant -> っ
    if (imeBuffer.length >= 2 && imeBuffer[0] === imeBuffer[1] && 'bcdfghjklmpqrstvwxyz'.includes(imeBuffer[0])) {
      imeConverted += 'っ';
      imeBuffer = imeBuffer.substring(1);
      converted = true;
      continue;
    }

    // Try matching longest romaji first (4, 3, 2, 1)
    for (let len = Math.min(4, imeBuffer.length); len >= 1; len--) {
      const chunk = imeBuffer.substring(0, len);
      if (ROMAJI_MAP[chunk]) {
        imeConverted += ROMAJI_MAP[chunk];
        imeBuffer = imeBuffer.substring(len);
        converted = true;
        break;
      }
    }

    if (!converted) {
      // Check if buffer could still form a valid romaji
      if (couldBeRomaji(imeBuffer)) {
        break; // Wait for more input
      } else {
        // First char is not convertible, pass it through
        imeConverted += imeBuffer[0];
        imeBuffer = imeBuffer.substring(1);
      }
    }
  }
}

function imeBackspace() {
  if (imeBuffer.length > 0) {
    imeBuffer = imeBuffer.substring(0, imeBuffer.length - 1);
  } else if (imeConverted.length > 0) {
    imeConverted = imeConverted.substring(0, imeConverted.length - 1);
  }
}

// ---- Typing Practice ----
function setupTyping() {
  const input = document.getElementById('typing-input');
  const checkBtn = document.getElementById('btn-typing-check');

  checkBtn.addEventListener('click', checkTypingAnswer);

  // Intercept keystrokes for IME-style romaji->hiragana conversion
  input.addEventListener('keydown', (e) => {
    if (typingState.answered) {
      if (e.key === 'Enter') {
        typingNext();
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      checkTypingAnswer();
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      imeBackspace();
      input.value = imeGetDisplay();
      return;
    }

    // Only handle single printable characters
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      imeAddChar(e.key);
      input.value = imeGetDisplay();
    }
  });

  // Prevent direct paste/input that bypasses our IME
  input.addEventListener('paste', (e) => {
    e.preventDefault();
    if (typingState.answered) return;
    const text = (e.clipboardData || window.clipboardData).getData('text');
    for (const ch of text) {
      imeAddChar(ch);
    }
    input.value = imeGetDisplay();
  });

  document.getElementById('btn-typing-hint').addEventListener('click', () => {
    if (typingState.answered || typingState.hintUsed) return;
    if (filteredVocab.length === 0) return;

    const word = filteredVocab[typingState.index];
    typingState.hintUsed = true;
    typingState.hintCount++;
    typingState.streak = 0;

    // Show hint and hide button
    const hintEl = document.getElementById('typing-hint');
    hintEl.textContent = word.reading;
    hintEl.style.display = 'block';
    document.getElementById('btn-typing-hint').classList.add('used');
    document.getElementById('typing-hint-count').textContent = typingState.hintCount;

    // Re-focus input
    document.getElementById('typing-input').focus();
  });

  document.getElementById('btn-typing-skip').addEventListener('click', () => {
    if (!typingState.answered) {
      typingState.wrongCount++;
      typingState.streak = 0;
    }
    typingNext();
  });

  document.getElementById('btn-typing-next').addEventListener('click', typingNext);

  document.getElementById('btn-typing-reset').addEventListener('click', () => {
    typingState = { index: 0, correctCount: 0, wrongCount: 0, streak: 0, hintCount: 0, answered: false, hintUsed: false };
    shuffleArray(filteredVocab);
    renderTypingCard();
  });
}

function renderTypingCard() {
  if (filteredVocab.length === 0) return;
  if (typingState.index >= filteredVocab.length) typingState.index = 0;

  const word = filteredVocab[typingState.index];
  document.getElementById('typing-kanji').textContent = word.kanji;
  document.getElementById('typing-meaning').textContent = word.meaning;

  const input = document.getElementById('typing-input');
  imeReset();
  input.value = '';
  input.classList.remove('correct-input', 'wrong-input');
  input.disabled = false;
  input.focus();

  document.getElementById('typing-feedback').classList.add('hidden');
  document.getElementById('typing-answer-reveal').classList.add('hidden');
  document.getElementById('typing-hint').style.display = 'none';
  document.getElementById('btn-typing-hint').classList.remove('used');
  typingState.hintUsed = false;
  document.getElementById('typing-counter').textContent = `${typingState.index + 1} / ${filteredVocab.length}`;

  document.getElementById('typing-correct-count').textContent = typingState.correctCount;
  document.getElementById('typing-wrong-count').textContent = typingState.wrongCount;
  document.getElementById('typing-streak').textContent = typingState.streak;
  document.getElementById('typing-hint-count').textContent = typingState.hintCount;

  typingState.answered = false;
}

function normalizeReading(str) {
  return str.replace(/\s+/g, '').trim();
}

function checkTypingAnswer() {
  if (typingState.answered) return;
  if (filteredVocab.length === 0) return;

  const word = filteredVocab[typingState.index];
  const input = document.getElementById('typing-input');
  // Flush any remaining romaji buffer before checking
  const flushed = imeFlush();
  input.value = flushed;
  const userAnswer = normalizeReading(flushed);
  const correctAnswer = normalizeReading(word.reading);

  if (!userAnswer) return;

  typingState.answered = true;
  input.disabled = true;

  const feedback = document.getElementById('typing-feedback');
  const reveal = document.getElementById('typing-answer-reveal');
  feedback.classList.remove('hidden', 'correct', 'wrong');
  reveal.classList.remove('hidden');

  reveal.querySelector('.typing-correct-answer').textContent = word.reading;
  reveal.querySelector('.typing-example').textContent = word.example;

  if (userAnswer === correctAnswer) {
    feedback.classList.add('correct');
    feedback.textContent = 'Correct!';
    input.classList.add('correct-input');
    input.classList.add('pop');
    typingState.correctCount++;
    typingState.streak++;
    setKnown(word, true);
  } else {
    feedback.classList.add('wrong');
    feedback.textContent = `Wrong! You typed: ${userAnswer}`;
    input.classList.add('wrong-input');
    input.classList.add('shake');
    typingState.wrongCount++;
    typingState.streak = 0;
  }

  document.getElementById('typing-correct-count').textContent = typingState.correctCount;
  document.getElementById('typing-wrong-count').textContent = typingState.wrongCount;
  document.getElementById('typing-streak').textContent = typingState.streak;
}

function typingNext() {
  typingState.index++;
  if (typingState.index >= filteredVocab.length) typingState.index = 0;
  const input = document.getElementById('typing-input');
  input.classList.remove('shake', 'pop');
  renderTypingCard();
}

// ---- Quiz ----
function setupQuiz() {
  document.getElementById('btn-start-quiz').addEventListener('click', startQuiz);
  document.getElementById('btn-next-question').addEventListener('click', nextQuestion);
  document.getElementById('btn-retry-quiz').addEventListener('click', () => {
    document.getElementById('quiz-results').classList.add('hidden');
    document.getElementById('quiz-setup').classList.remove('hidden');
  });
}

function startQuiz() {
  const count = parseInt(document.getElementById('quiz-count').value);
  const type = document.getElementById('quiz-type').value;
  const pool = filteredVocab.length >= 4 ? filteredVocab : N3_VOCAB;

  if (pool.length < 4) return;

  const questions = [];
  const shuffled = [...pool];
  shuffleArray(shuffled);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  selected.forEach(word => {
    const wrongPool = pool.filter(w => getWordKey(w) !== getWordKey(word));
    shuffleArray(wrongPool);
    const wrongs = wrongPool.slice(0, 3);

    let question, correct, choices;
    if (type === 'ja-to-en') {
      question = word.kanji;
      correct = word.meaning;
      choices = [correct, ...wrongs.map(w => w.meaning)];
    } else if (type === 'en-to-ja') {
      question = word.meaning;
      correct = word.kanji;
      choices = [correct, ...wrongs.map(w => w.kanji)];
    } else {
      question = word.kanji;
      correct = word.reading;
      choices = [correct, ...wrongs.map(w => w.reading)];
    }

    shuffleArray(choices);
    questions.push({ word, question, correct, choices });
  });

  quizState = { questions, current: 0, score: 0, results: [] };
  document.getElementById('quiz-setup').classList.add('hidden');
  document.getElementById('quiz-area').classList.remove('hidden');
  document.getElementById('quiz-results').classList.add('hidden');
  renderQuestion();
}

function renderQuestion() {
  const q = quizState.questions[quizState.current];
  const total = quizState.questions.length;

  document.getElementById('quiz-progress-bar').style.width = `${(quizState.current / total) * 100}%`;
  document.getElementById('quiz-question').textContent = q.question;
  document.getElementById('quiz-feedback').classList.add('hidden');
  document.getElementById('btn-next-question').classList.add('hidden');

  const choicesEl = document.getElementById('quiz-choices');
  choicesEl.innerHTML = '';
  q.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'quiz-choice';
    btn.textContent = choice;
    btn.addEventListener('click', () => selectAnswer(choice, q));
    choicesEl.appendChild(btn);
  });
}

function selectAnswer(answer, q) {
  const isCorrect = answer === q.correct;
  quizState.results.push({ word: q.word, correct: isCorrect, userAnswer: answer });
  if (isCorrect) quizState.score++;

  // Highlight choices
  document.querySelectorAll('.quiz-choice').forEach(btn => {
    btn.style.pointerEvents = 'none';
    if (btn.textContent === q.correct) btn.classList.add('correct');
    if (btn.textContent === answer && !isCorrect) btn.classList.add('wrong');
  });

  // Show feedback
  const feedback = document.getElementById('quiz-feedback');
  feedback.classList.remove('hidden', 'correct', 'wrong');
  if (isCorrect) {
    feedback.classList.add('correct');
    feedback.textContent = 'Correct!';
  } else {
    feedback.classList.add('wrong');
    feedback.textContent = `Wrong! The answer is: ${q.correct}`;
  }

  document.getElementById('btn-next-question').classList.remove('hidden');
}

function nextQuestion() {
  quizState.current++;
  if (quizState.current >= quizState.questions.length) {
    showQuizResults();
  } else {
    renderQuestion();
  }
}

function showQuizResults() {
  document.getElementById('quiz-area').classList.add('hidden');
  document.getElementById('quiz-results').classList.remove('hidden');

  const total = quizState.questions.length;
  const score = quizState.score;
  const percent = Math.round((score / total) * 100);
  const scoreEl = document.getElementById('quiz-score');
  scoreEl.textContent = `${score} / ${total} (${percent}%)`;
  scoreEl.style.color = percent >= 80 ? '#4ade80' : percent >= 50 ? '#fbbf24' : '#ff6b6b';

  const reviewEl = document.getElementById('quiz-review');
  reviewEl.innerHTML = '';
  quizState.results.forEach(r => {
    const div = document.createElement('div');
    div.className = `review-item ${r.correct ? 'correct' : 'wrong'}`;
    div.innerHTML = `
      <span class="review-word">${r.word.kanji} (${r.word.reading})</span>
      <span class="review-answer">${r.word.meaning}</span>
    `;
    reviewEl.appendChild(div);
  });

  document.getElementById('quiz-progress-bar').style.width = '100%';
}

// ---- Word List ----
function setupWordList() {
  searchInput.addEventListener('input', renderWordList);
  listFilter.addEventListener('change', renderWordList);
}

function renderWordList() {
  const search = searchInput.value.toLowerCase().trim();
  const filter = listFilter.value;

  let words = filteredVocab;

  if (search) {
    words = words.filter(w =>
      w.kanji.includes(search) ||
      w.reading.includes(search) ||
      w.meaning.toLowerCase().includes(search)
    );
  }

  if (filter === 'known') words = words.filter(w => isKnown(w));
  if (filter === 'unknown') words = words.filter(w => !isKnown(w));

  const listEl = document.getElementById('word-list');
  listEl.innerHTML = '';

  words.forEach(word => {
    const div = document.createElement('div');
    div.className = 'word-item';
    const known = isKnown(word);
    div.innerHTML = `
      <div class="word-ja">${word.kanji}<small>${word.reading}</small></div>
      <div class="word-en">${word.meaning}</div>
      <span class="word-status ${known ? 'known' : 'learning'}" data-key="${getWordKey(word)}">
        ${known ? 'Known' : 'Learning'}
      </span>
    `;
    div.querySelector('.word-status').addEventListener('click', (e) => {
      const key = e.target.dataset.key;
      const w = allVocab.find(v => getWordKey(v) === key);
      if (w) {
        setKnown(w, !isKnown(w));
        renderWordList();
        renderStats();
      }
    });
    listEl.appendChild(div);
  });
}

// ---- Stats ----
function setupStats() {
  document.getElementById('btn-reset-progress').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all progress?')) {
      progress = {};
      saveProgress();
      renderStats();
      renderWordList();
    }
  });
}

function renderStats() {
  const total = allVocab.length;
  const known = allVocab.filter(w => isKnown(w)).length;
  const learning = total - known;
  const percent = total > 0 ? Math.round((known / total) * 100) : 0;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-known').textContent = known;
  document.getElementById('stat-learning').textContent = learning;
  document.getElementById('stat-percent').textContent = percent + '%';
  document.getElementById('progress-fill').style.width = percent + '%';

  // Category breakdown
  const categories = [...new Set(allVocab.map(w => w.category))];
  const catStatsEl = document.getElementById('category-stats');
  catStatsEl.innerHTML = '';

  categories.forEach(cat => {
    const catWords = allVocab.filter(w => w.category === cat);
    const catKnown = catWords.filter(w => isKnown(w)).length;
    const catPercent = catWords.length > 0 ? Math.round((catKnown / catWords.length) * 100) : 0;

    const div = document.createElement('div');
    div.className = 'cat-stat';
    div.innerHTML = `
      <span class="cat-stat-name">${formatCategory(cat)}</span>
      <div class="cat-stat-bar"><div class="cat-stat-fill" style="width: ${catPercent}%"></div></div>
      <span class="cat-stat-text">${catKnown}/${catWords.length}</span>
    `;
    catStatsEl.appendChild(div);
  });
}

// ---- Import ----
function loadImportedWords() {
  try {
    return JSON.parse(localStorage.getItem('n3-imported')) || [];
  } catch {
    return [];
  }
}

function saveImportedWords() {
  localStorage.setItem('n3-imported', JSON.stringify(importedWords));
}

function rebuildVocab() {
  allVocab = [...N3_VOCAB, ...importedWords];
  refreshCategoryOptions();
  applyFilter();
  currentIndex = 0;
  renderFlashcard();
}

function setupImport() {
  document.getElementById('btn-import-url').addEventListener('click', fetchQuizlet);
  document.getElementById('btn-import-paste').addEventListener('click', importFromPaste);
  document.getElementById('btn-clear-imports').addEventListener('click', () => {
    if (confirm('Remove all imported words?')) {
      importedWords = [];
      saveImportedWords();
      rebuildVocab();
      renderImportedSets();
    }
  });
  renderImportedSets();
}

async function fetchQuizlet() {
  const url = document.getElementById('import-url').value.trim();
  const statusEl = document.getElementById('import-url-status');

  if (!url) return;

  // Extract set ID from URL
  const match = url.match(/quizlet\.com\/(\d+)/);
  if (!match) {
    statusEl.className = 'error';
    statusEl.textContent = 'Invalid Quizlet URL. Expected format: https://quizlet.com/123456/...';
    statusEl.classList.remove('hidden');
    return;
  }

  const setId = match[1];
  statusEl.className = 'loading';
  statusEl.textContent = 'Fetching from Quizlet...';
  statusEl.classList.remove('hidden');

  // Try multiple CORS proxies
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent('https://quizlet.com/' + setId)}`,
    `https://corsproxy.io/?${encodeURIComponent('https://quizlet.com/' + setId)}`,
  ];

  let html = null;
  for (const proxyUrl of proxies) {
    try {
      const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
      if (resp.ok) {
        html = await resp.text();
        break;
      }
    } catch {}
  }

  if (!html) {
    statusEl.className = 'error';
    statusEl.innerHTML = `Could not fetch from Quizlet (blocked by CORS).<br><br>
      <strong>Manual workaround:</strong><br>
      1. Open the Quizlet link in your browser<br>
      2. Click <strong>... &rarr; Export</strong><br>
      3. Copy the text and paste it below`;
    statusEl.classList.remove('hidden');
    return;
  }

  // Parse flashcard data from HTML
  const words = parseQuizletHtml(html);

  if (words.length === 0) {
    statusEl.className = 'error';
    statusEl.textContent = 'Could not parse flashcards from the page. Try the paste method instead.';
    statusEl.classList.remove('hidden');
    return;
  }

  const category = document.getElementById('import-category').value.trim() || 'quizlet-import';
  words.forEach(w => w.category = category);
  addImportedWords(words, category);

  statusEl.className = 'success';
  statusEl.textContent = `Successfully imported ${words.length} words as "${category}"!`;
  statusEl.classList.remove('hidden');
}

function parseQuizletHtml(html) {
  const words = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Try JSON-LD data
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent);
      if (data && data.hasPart) {
        data.hasPart.forEach(part => {
          if (part.name && part.acceptedAnswer && part.acceptedAnswer.text) {
            words.push({
              kanji: part.name,
              reading: '',
              meaning: part.acceptedAnswer.text,
              example: '',
            });
          }
        });
      }
    } catch {}
  }

  if (words.length > 0) return words;

  // Try parsing from span elements with specific classes
  const rows = doc.querySelectorAll('.SetPageTerms-term, .TermText');
  // Fallback: try to find paired elements
  const termEls = doc.querySelectorAll('[class*="wordText"], [class*="TermText"]');
  const defEls = doc.querySelectorAll('[class*="definitionText"], [class*="TermText"]');

  // Try regex on raw HTML for window.__NEXT_DATA__ or similar
  const nextDataMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (nextDataMatch) {
    try {
      const nextData = JSON.parse(nextDataMatch[1]);
      const studiableItems = findInObject(nextData, 'studiableItem') ||
                             findInObject(nextData, 'termIdToTermsMap') ||
                             findInObject(nextData, 'terms');
      if (Array.isArray(studiableItems)) {
        studiableItems.forEach(item => {
          const word = item.word || item.front || item.term || '';
          const def = item.definition || item.back || '';
          if (word && def) {
            words.push({ kanji: word, reading: '', meaning: def, example: '' });
          }
        });
      }
    } catch {}
  }

  return words;
}

function findInObject(obj, key) {
  if (!obj || typeof obj !== 'object') return null;
  if (obj[key]) return obj[key];
  for (const k of Object.keys(obj)) {
    const result = findInObject(obj[k], key);
    if (result) return result;
  }
  return null;
}

function importFromPaste() {
  const text = document.getElementById('import-textarea').value.trim();
  const resultEl = document.getElementById('import-result');

  if (!text) {
    resultEl.className = 'error';
    resultEl.textContent = 'Please paste some text first.';
    resultEl.classList.remove('hidden');
    return;
  }

  const sepValue = document.getElementById('import-separator').value;
  const separator = sepValue === 'tab' ? '\t' : sepValue === 'comma' ? ',' : ' - ';
  const category = document.getElementById('import-category').value.trim() || 'quizlet-import';

  const lines = text.split('\n').filter(l => l.trim());
  const words = [];

  lines.forEach(line => {
    const parts = line.split(separator);
    if (parts.length >= 2) {
      const term = parts[0].trim();
      const definition = parts.slice(1).join(separator).trim();
      if (term && definition) {
        words.push({
          kanji: term,
          reading: '',
          meaning: definition,
          example: '',
          category: category,
        });
      }
    }
  });

  if (words.length === 0) {
    resultEl.className = 'error';
    resultEl.textContent = 'Could not parse any words. Check separator setting and format.';
    resultEl.classList.remove('hidden');
    return;
  }

  addImportedWords(words, category);

  resultEl.className = 'success';
  resultEl.textContent = `Imported ${words.length} words as "${category}"!`;
  resultEl.classList.remove('hidden');
  document.getElementById('import-textarea').value = '';
}

function addImportedWords(words, category) {
  // Remove existing words with same category to avoid duplicates on re-import
  importedWords = importedWords.filter(w => w.category !== category);
  importedWords.push(...words);
  saveImportedWords();
  rebuildVocab();
  renderImportedSets();
}

function renderImportedSets() {
  const listEl = document.getElementById('imported-sets-list');
  const clearBtn = document.getElementById('btn-clear-imports');
  listEl.innerHTML = '';

  const categories = [...new Set(importedWords.map(w => w.category))];

  if (categories.length === 0) {
    listEl.innerHTML = '<p style="color:#555;font-size:0.9rem;">No imported sets yet.</p>';
    clearBtn.classList.add('hidden');
    return;
  }

  clearBtn.classList.remove('hidden');

  categories.forEach(cat => {
    const count = importedWords.filter(w => w.category === cat).length;
    const div = document.createElement('div');
    div.className = 'imported-set-item';
    div.innerHTML = `
      <span class="imported-set-name">${formatCategory(cat)}</span>
      <span class="imported-set-count">${count} words</span>
      <button class="imported-set-delete" data-cat="${cat}">Delete</button>
    `;
    div.querySelector('.imported-set-delete').addEventListener('click', () => {
      importedWords = importedWords.filter(w => w.category !== cat);
      saveImportedWords();
      rebuildVocab();
      renderImportedSets();
    });
    listEl.appendChild(div);
  });
}

// ---- Utility ----
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
