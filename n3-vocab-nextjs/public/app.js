// ---- Projects ----
const N3_PROJECT_ID = 'n3';
const MIMIKARA_PROJECT_ID = 'mimikara';
const VERB_PROJECT_ID = 'verb';
const N4_PROJECT_ID = 'n4';
const KANJI_JLPT_PROJECT_ID = 'kanji-jlpt';

const BUILTIN_PROJECTS = [
  { id: N3_PROJECT_ID, name: 'N3', isBuiltin: true },
  { id: MIMIKARA_PROJECT_ID, name: 'Mimikara', isBuiltin: true },
  { id: VERB_PROJECT_ID, name: 'Động từ', isBuiltin: true },
  { id: N4_PROJECT_ID, name: 'N4 (Bài 26-50)', isBuiltin: true, lessonBased: true },
  { id: KANJI_JLPT_PROJECT_ID, name: 'Kanji JLPT N4', isBuiltin: true },
];

function isLessonBasedProject(id) {
  const p = BUILTIN_PROJECTS.find(p => p.id === id);
  return p && p.lessonBased;
}

function isBuiltinProject(id) {
  return BUILTIN_PROJECTS.some(p => p.id === id);
}

function loadCustomProjects() {
  try { return JSON.parse(localStorage.getItem('vocab-projects')) || []; }
  catch { return []; }
}

function saveCustomProjects() {
  localStorage.setItem('vocab-projects', JSON.stringify(customProjects));
}

function loadActiveProjectId() {
  return localStorage.getItem('vocab-active-project') || N3_PROJECT_ID;
}

function saveActiveProjectId() {
  localStorage.setItem('vocab-active-project', activeProjectId);
}

function getActiveProject() {
  const builtin = BUILTIN_PROJECTS.find(p => p.id === activeProjectId);
  if (builtin) return builtin;
  return customProjects.find(p => p.id === activeProjectId) || null;
}

function createProject(name) {
  const id = 'proj-' + Date.now();
  customProjects.push({ id, name, createdAt: Date.now(), words: [] });
  saveCustomProjects();
  return id;
}

function deleteActiveProject() {
  if (isBuiltinProject(activeProjectId)) return;
  localStorage.removeItem('vocab-progress-' + activeProjectId);
  customProjects = customProjects.filter(p => p.id !== activeProjectId);
  saveCustomProjects();
  activeProjectId = N3_PROJECT_ID;
  saveActiveProjectId();
}

function addWordToActiveProject(word) {
  const project = customProjects.find(p => p.id === activeProjectId);
  if (!project) return false;
  project.words.push(word);
  saveCustomProjects();
  return true;
}

function removeWordFromActiveProject(index) {
  const project = customProjects.find(p => p.id === activeProjectId);
  if (!project) return;
  project.words.splice(index, 1);
  saveCustomProjects();
}

function getProjectVocab() {
  return getProjectVocabById(activeProjectId);
}

// ---- State ----
let activeProjectId = loadActiveProjectId();
let customProjects = loadCustomProjects();

// ---- Lessons ----
const DEFAULT_LESSON_SIZE = 30;
let activeLessonIndex = 'all';
let expandedProjects = new Set([loadActiveProjectId()]);

function getLessonSizeForProject(id) {
  return parseInt(localStorage.getItem('vocab-lesson-size-' + id)) || DEFAULT_LESSON_SIZE;
}

function getProjectVocabById(id) {
  if (id === N3_PROJECT_ID) return [...N3_VOCAB, ...importedWords];
  if (id === MIMIKARA_PROJECT_ID) return [...MIMIKARA_VOCAB];
  if (id === VERB_PROJECT_ID) return [...VERB_VOCAB];
  if (id === N4_PROJECT_ID) return [...N4_VOCAB];
  if (id === KANJI_JLPT_PROJECT_ID) return [...KANJI_JLPT_VOCAB];
  const project = customProjects.find(p => p.id === id);
  return project ? [...project.words] : [];
}

// State
let currentMode = 'flashcard';
let currentIndex = 0;
let importedWords = loadImportedWords();
let allVocab = getProjectVocab();
let filteredVocab = [...allVocab];
let progress = loadProgress();
let quizState = null;
let typingState = { index: 0, correctCount: 0, wrongCount: 0, streak: 0, hintCount: 0, answered: false, hintUsed: false };
let typingFirstLetterEnabled = localStorage.getItem('vocab-typing-first-letter') === 'true';

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
  setupSidebar();
  setupCategories();
  setupNavigation();
  setupFlashcard();
  setupTyping();
  setupQuiz();
  setupWordList();
  setupStats();
  setupImport();
  setupConjugate();
  setupProjectWordManagement();
  applyFilter();
  renderFlashcard();
  updateImportModeUI();
}

// ---- Progress (localStorage, per-project) ----
function progressKey() {
  if (activeProjectId === N3_PROJECT_ID) return 'n3-progress';
  return 'vocab-progress-' + activeProjectId;
}

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(progressKey())) || {};
  } catch {
    return {};
  }
}

function saveProgress() {
  localStorage.setItem(progressKey(), JSON.stringify(progress));
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

// ---- Review List (per-project) ----
function reviewKeyForProject(id) { return 'vocab-review-' + id; }

function loadReviewListForProject(id) {
  try { return new Set(JSON.parse(localStorage.getItem(reviewKeyForProject(id))) || []); }
  catch { return new Set(); }
}

function saveReviewList() {
  localStorage.setItem(reviewKeyForProject(activeProjectId), JSON.stringify([...reviewList]));
}

function addToReview(word) {
  reviewList.add(getWordKey(word));
  saveReviewList();
}

function removeFromReview(word) {
  reviewList.delete(getWordKey(word));
  saveReviewList();
}

function isInReview(word) {
  return reviewList.has(getWordKey(word));
}

let reviewList = loadReviewListForProject(loadActiveProjectId());

// ---- Sidebar ----
function setupSidebar() {
  renderSidebar();
  updateProjectTitle();

  document.getElementById('btn-new-project').addEventListener('click', () => {
    const name = prompt('Enter project name:');
    if (!name || !name.trim()) return;
    const id = createProject(name.trim());
    activeProjectId = id;
    saveActiveProjectId();
    progress = loadProgress();
    activeLessonIndex = 'all';
    expandedProjects.add(id);
    rebuildVocab();
    updateProjectTitle();
    updateImportModeUI();
    // Switch to import tab
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-mode="import"]').classList.add('active');
    document.querySelectorAll('.mode').forEach(m => m.classList.remove('active'));
    document.getElementById('import-mode').classList.add('active');
    currentMode = 'import';
    closeSidebar();
  });

  document.getElementById('btn-sidebar-toggle').addEventListener('click', openSidebar);
  document.getElementById('btn-sidebar-close').addEventListener('click', closeSidebar);
  document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);
}

function renderSidebar() {
  const content = document.getElementById('sidebar-content');
  content.innerHTML = '';
  const allProjects = [...BUILTIN_PROJECTS, ...customProjects];

  allProjects.forEach(project => {
    const isActive = project.id === activeProjectId;
    const isExpanded = expandedProjects.has(project.id);
    const vocab = getProjectVocabById(project.id);
    const pLessonSize = getLessonSizeForProject(project.id);
    const numLessons = Math.ceil(vocab.length / pLessonSize);

    const projectDiv = document.createElement('div');
    projectDiv.className = 'sb-project' + (isActive ? ' active' : '');

    // Header row
    const headerDiv = document.createElement('div');
    headerDiv.className = 'sb-project-header';
    headerDiv.innerHTML = `
      <span class="sb-project-arrow">${isExpanded ? '▾' : '▸'}</span>
      <span class="sb-project-name">${project.name}</span>
      <span class="sb-project-count">${vocab.length}</span>
      ${!project.isBuiltin ? '<button class="sb-project-delete" title="Delete project">×</button>' : ''}
    `;
    headerDiv.addEventListener('click', (e) => {
      if (e.target.classList.contains('sb-project-delete')) return;
      if (expandedProjects.has(project.id) && isActive) {
        expandedProjects.delete(project.id);
        renderSidebar();
        return;
      }
      expandedProjects.add(project.id);
      switchToProject(project.id, 'all');
    });
    const deleteBtn = headerDiv.querySelector('.sb-project-delete');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const p = customProjects.find(x => x.id === project.id);
        if (!p || !confirm(`Delete project "${p.name}"?`)) return;
        const wasActive = activeProjectId === project.id;
        localStorage.removeItem('vocab-progress-' + project.id);
        customProjects = customProjects.filter(x => x.id !== project.id);
        saveCustomProjects();
        expandedProjects.delete(project.id);
        if (wasActive) {
          activeProjectId = N3_PROJECT_ID;
          saveActiveProjectId();
          progress = loadProgress();
          activeLessonIndex = 'all';
          expandedProjects.add(N3_PROJECT_ID);
          rebuildVocab();
          updateProjectTitle();
          updateImportModeUI();
        } else {
          renderSidebar();
        }
      });
    }

    // Lessons area
    const lessonsDiv = document.createElement('div');
    lessonsDiv.className = 'sb-lessons' + (isExpanded ? ' open' : '');

    if (isExpanded) {
      // All
      const allItem = document.createElement('div');
      allItem.className = 'sb-lesson' + (isActive && activeLessonIndex === 'all' ? ' active' : '');
      allItem.textContent = `All  (${vocab.length})`;
      allItem.addEventListener('click', () => switchToProject(project.id, 'all'));
      lessonsDiv.appendChild(allItem);

      // Review lesson
      const reviewCount = loadReviewListForProject(project.id).size;
      if (reviewCount > 0) {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'sb-lesson sb-lesson-review' + (isActive && activeLessonIndex === 'review' ? ' active' : '');
        reviewItem.textContent = `Review  (${reviewCount})`;
        reviewItem.addEventListener('click', () => switchToProject(project.id, 'review'));
        lessonsDiv.appendChild(reviewItem);
      }

      // Individual lessons
      if (project.lessonBased) {
        // Group by category (lesson-26, lesson-27, ...)
        const cats = [...new Set(vocab.map(w => w.category).filter(Boolean))].sort((a, b) => {
          const na = parseInt(a.replace(/\D/g, '')) || 0;
          const nb = parseInt(b.replace(/\D/g, '')) || 0;
          return na - nb;
        });
        cats.forEach(cat => {
          const count = vocab.filter(w => w.category === cat).length;
          const lessonNum = cat.replace('lesson-', '');
          const item = document.createElement('div');
          item.className = 'sb-lesson' + (isActive && activeLessonIndex === cat ? ' active' : '');
          item.textContent = `Bài ${lessonNum}  (${count})`;
          item.addEventListener('click', () => switchToProject(project.id, cat));
          lessonsDiv.appendChild(item);
        });
      } else {
        for (let i = 0; i < numLessons; i++) {
          const start = i * pLessonSize + 1;
          const end = Math.min((i + 1) * pLessonSize, vocab.length);
          const item = document.createElement('div');
          item.className = 'sb-lesson' + (isActive && activeLessonIndex === i ? ' active' : '');
          item.textContent = `Lesson ${i + 1}  ${start}–${end}`;
          item.addEventListener('click', () => switchToProject(project.id, i));
          lessonsDiv.appendChild(item);
        }

        // Lesson size config
        const sizeRow = document.createElement('div');
        sizeRow.className = 'sb-lesson-size-row';
        sizeRow.innerHTML = `<label>Words/lesson</label><input type="number" min="1" value="${pLessonSize}" class="sb-lesson-size-input" />`;
        sizeRow.querySelector('input').addEventListener('change', (e) => {
          const size = Math.max(1, parseInt(e.target.value) || DEFAULT_LESSON_SIZE);
          e.target.value = size;
          localStorage.setItem('vocab-lesson-size-' + project.id, String(size));
          if (project.id === activeProjectId) {
            activeLessonIndex = 'all';
            applyFilter();
            currentIndex = 0;
            renderFlashcard();
          }
          renderSidebar();
        });
        lessonsDiv.appendChild(sizeRow);
      }
    }

    projectDiv.appendChild(headerDiv);
    projectDiv.appendChild(lessonsDiv);
    content.appendChild(projectDiv);
  });
}

function switchToProject(projectId, lessonIndex) {
  if (projectId !== activeProjectId) {
    activeProjectId = projectId;
    saveActiveProjectId();
    progress = loadProgress();
    reviewList = loadReviewListForProject(projectId);
    allVocab = getProjectVocabById(projectId);
    refreshCategoryOptions();
    updateProjectTitle();
    updateImportModeUI();
  }
  activeLessonIndex = lessonIndex;
  applyFilter();
  currentIndex = 0;
  typingState.index = 0;
  renderFlashcard();
  if (currentMode === 'typing') renderTypingCard(false);
  if (currentMode === 'list') renderWordList();
  if (currentMode === 'stats') renderStats();
  renderSidebar();
  closeSidebar();
}

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('open');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

// ---- Categories ----
function setupCategories() {
  refreshCategoryOptions();
  categorySelect.addEventListener('change', () => {
    applyFilter();
    currentIndex = 0;
    typingState.index = 0;
    renderFlashcard();
    if (currentMode === 'typing') renderTypingCard(false);
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
  let base = [...allVocab];

  if (activeLessonIndex === 'review') {
    base = base.filter(w => reviewList.has(getWordKey(w)));
  } else if (activeLessonIndex !== 'all') {
    if (isLessonBasedProject(activeProjectId)) {
      base = base.filter(w => w.category === activeLessonIndex);
    } else {
      const lessonSize = getLessonSizeForProject(activeProjectId);
      base = base.slice(activeLessonIndex * lessonSize, (activeLessonIndex + 1) * lessonSize);
    }
  }

  filteredVocab = cat === 'all' ? base : base.filter(w => w.category === cat);
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
      if (mode === 'typing') {
        shuffleArray(filteredVocab);
        typingState.index = 0;
        renderTypingCard(false);
      }
      if (mode === 'list') renderWordList();
      if (mode === 'stats') renderStats();
      if (mode === 'conjugate') conjShowPhase('select');
    });
  });
}

// ---- Flashcard ----
function setupFlashcard() {
  flashcard.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
    if (flashcard.classList.contains('flipped') && filteredVocab[currentIndex]) {
      speakWord(filteredVocab[currentIndex].kanji);
    }
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

  document.getElementById('btn-speak').addEventListener('click', () => {
    if (filteredVocab.length === 0) return;
    speakWord(filteredVocab[currentIndex].kanji);
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
  flashcard.querySelector('.flashcard-back .example-meaning').textContent = word.exampleMeaning || '';
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
      if (e.key === 'Enter' && Date.now() - typingState.answeredAt > 300) {
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

  // Global Enter listener for when input is not focused (after correct answer)
  document.addEventListener('keydown', (e) => {
    if (currentMode !== 'typing') return;
    if (e.target.tagName === 'TEXTAREA' || (e.target.tagName === 'INPUT' && e.target.id !== 'typing-input')) return;
    if (typingState.answered && e.key === 'Enter' && Date.now() - typingState.answeredAt > 300) {
      e.preventDefault();
      typingNext();
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

  // Float controls above keyboard on mobile
  const typingControls = document.querySelector('.typing-controls');
  function updateControlsPosition() {
    if (!window.visualViewport || !typingControls) return;
    const keyboardHeight = window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop;
    if (keyboardHeight > 100 && document.activeElement === input) {
      typingControls.style.position = 'fixed';
      typingControls.style.bottom = keyboardHeight + 'px';
      typingControls.style.left = '0';
      typingControls.style.right = '0';
      typingControls.style.zIndex = '200';
      typingControls.style.background = '#0d0d20';
      typingControls.style.borderTop = '1px solid #1a1a2e';
      typingControls.style.margin = '0';
      typingControls.style.padding = '10px 16px';
    } else {
      typingControls.removeAttribute('style');
    }
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateControlsPosition);
    window.visualViewport.addEventListener('scroll', updateControlsPosition);
  }
  input.addEventListener('blur', () => setTimeout(() => typingControls && typingControls.removeAttribute('style'), 100));

  document.getElementById('btn-typing-reset').addEventListener('click', () => {
    typingState = { index: 0, correctCount: 0, wrongCount: 0, streak: 0, hintCount: 0, answered: false, hintUsed: false };
    shuffleArray(filteredVocab);
    renderTypingCard(false);
  });

  const firstLetterToggle = document.getElementById('btn-first-letter-toggle');
  firstLetterToggle.classList.toggle('active', typingFirstLetterEnabled);
  firstLetterToggle.addEventListener('click', () => {
    typingFirstLetterEnabled = !typingFirstLetterEnabled;
    localStorage.setItem('vocab-typing-first-letter', typingFirstLetterEnabled);
    firstLetterToggle.classList.toggle('active', typingFirstLetterEnabled);
    if (filteredVocab.length > 0) updateFirstLetterHint(filteredVocab[typingState.index]);
  });

  document.getElementById('btn-save-review').addEventListener('click', () => {
    if (filteredVocab.length === 0) return;
    const word = filteredVocab[typingState.index];
    if (isInReview(word)) {
      removeFromReview(word);
    } else {
      addToReview(word);
    }
    updateSaveReviewBtn(word);
    renderSidebar();
  });
}

function updateFirstLetterHint(word) {
  const el = document.getElementById('typing-first-letter');
  if (!el) return;
  if (typingFirstLetterEnabled && word.reading) {
    el.textContent = word.reading[0] + '_'.repeat(Math.max(0, word.reading.length - 1));
    el.classList.remove('hidden');
  } else {
    el.classList.add('hidden');
  }
}

function updateSaveReviewBtn(word) {
  const btn = document.getElementById('btn-save-review');
  if (!btn) return;
  const saved = isInReview(word);
  btn.textContent = saved ? '✓ Saved for Review' : 'Save for Review';
  btn.classList.toggle('saved', saved);
}

function renderTypingCard(speak = true) {
  if (filteredVocab.length === 0) return;
  if (typingState.index >= filteredVocab.length) typingState.index = 0;

  const word = filteredVocab[typingState.index];
  document.getElementById('typing-kanji').textContent = word.kanji;
  document.getElementById('typing-meaning').textContent = word.meaning;

  const input = document.getElementById('typing-input');
  imeReset();
  input.value = '';
  input.classList.remove('correct-input', 'wrong-input');
  input.readOnly = false;
  input.focus();

  document.getElementById('typing-feedback').classList.add('hidden');
  document.getElementById('typing-answer-reveal').classList.add('hidden');
  document.getElementById('typing-hint').style.display = 'none';
  document.getElementById('btn-typing-hint').classList.remove('used');
  typingState.hintUsed = false;
  document.getElementById('typing-counter').textContent = `${typingState.index + 1} / ${filteredVocab.length}`;
  if (speak) speakWord(word.kanji);

  document.getElementById('typing-correct-count').textContent = typingState.correctCount;
  document.getElementById('typing-wrong-count').textContent = typingState.wrongCount;
  document.getElementById('typing-streak').textContent = typingState.streak;
  document.getElementById('typing-hint-count').textContent = typingState.hintCount;

  updateSaveReviewBtn(word);
  updateFirstLetterHint(word);
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

  const feedback = document.getElementById('typing-feedback');
  const reveal = document.getElementById('typing-answer-reveal');
  feedback.classList.remove('hidden', 'correct', 'wrong');

  if (userAnswer === correctAnswer) {
    // Correct — lock input, show answer, Enter to advance
    typingState.answered = true;
    typingState.answeredAt = Date.now();
    input.readOnly = true;
    reveal.classList.remove('hidden');
    reveal.querySelector('.typing-correct-answer').textContent = word.reading;
    reveal.querySelector('.typing-example').textContent = word.example;
    feedback.classList.add('correct');
    feedback.textContent = 'Correct! Press Enter for next word.';
    input.classList.remove('wrong-input', 'shake');
    input.classList.add('correct-input', 'pop');
    typingState.correctCount++;
    typingState.streak++;
    setKnown(word, true);
  } else {
    // Wrong — show feedback but allow retype
    feedback.classList.add('wrong');
    feedback.textContent = `Wrong! Try again. (You typed: ${userAnswer})`;
    input.classList.remove('correct-input', 'pop');
    input.classList.add('wrong-input', 'shake');
    typingState.wrongCount++;
    typingState.streak = 0;

    // Clear input and reset IME for retry
    setTimeout(() => {
      input.classList.remove('shake');
      imeReset();
      input.value = '';
      input.focus();
    }, 500);
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
  renderTypingCard(false);
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
      <button class="speak-icon" data-word="${word.kanji}" title="Speak">🔊</button>
      <span class="word-status ${known ? 'known' : 'learning'}" data-key="${getWordKey(word)}">
        ${known ? 'Known' : 'Learning'}
      </span>
    `;
    div.querySelector('.speak-icon').addEventListener('click', (e) => {
      speakWord(e.currentTarget.dataset.word);
    });
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
  allVocab = getProjectVocab();
  reviewList = loadReviewListForProject(activeProjectId);
  activeLessonIndex = 'all';
  refreshCategoryOptions();
  applyFilter();
  currentIndex = 0;
  renderFlashcard();
  renderSidebar();
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

  const match = url.match(/quizlet\.com\/(\d+)/);
  if (!match) {
    statusEl.className = 'error';
    statusEl.textContent = 'Invalid Quizlet URL. Expected format: https://quizlet.com/123456/...';
    statusEl.classList.remove('hidden');
    return;
  }

  statusEl.className = 'loading';
  statusEl.textContent = 'Fetching from Quizlet...';
  statusEl.classList.remove('hidden');

  try {
    const resp = await fetch(`/api/quizlet?url=${encodeURIComponent(url)}`, {
      signal: AbortSignal.timeout(20000),
    });
    const data = await resp.json();

    if (!data.success || data.cards.length === 0) {
      statusEl.className = 'error';
      statusEl.innerHTML = `${data.error || 'No flashcards found.'}<br><br>
        <strong>Manual workaround:</strong><br>
        1. Open the Quizlet link in your browser<br>
        2. Click <strong>... &rarr; Export</strong><br>
        3. Copy the text and paste it below`;
      statusEl.classList.remove('hidden');
      return;
    }

    const category = document.getElementById('import-category').value.trim() || 'quizlet-import';
    const words = data.cards.map(c => ({
      kanji: c.term,
      reading: '',
      meaning: c.definition,
      example: '',
      category: category,
    }));
    addImportedWords(words, category);

    statusEl.className = 'success';
    statusEl.textContent = `Successfully imported ${words.length} words as "${category}"!`;
    statusEl.classList.remove('hidden');
  } catch (err) {
    statusEl.className = 'error';
    statusEl.innerHTML = `Failed to fetch: ${err.message}<br><br>
      <strong>Manual workaround:</strong><br>
      1. Open the Quizlet link in your browser<br>
      2. Click <strong>... &rarr; Export</strong><br>
      3. Copy the text and paste it below`;
    statusEl.classList.remove('hidden');
  }
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


function updateProjectTitle() {
  const project = getActiveProject();
  const name = project ? project.name : 'N3';
  document.getElementById('app-title').textContent = name + ' Vocabulary';
}

function updateImportModeUI() {
  const isBuiltin = isBuiltinProject(activeProjectId);
  document.getElementById('quizlet-import-section').style.display = isBuiltin ? '' : 'none';
  document.getElementById('project-words-section').style.display = isBuiltin ? 'none' : '';
  if (!isBuiltin) {
    const project = getActiveProject();
    if (project) {
      document.getElementById('project-words-title').textContent = project.name + ' — Words';
    }
    renderProjectWordList();
  }
}

// ---- Project Word Management ----
function setupProjectWordManagement() {
  document.getElementById('btn-delete-project').addEventListener('click', () => {
    const project = getActiveProject();
    if (!project || isBuiltinProject(activeProjectId)) return;
    if (!confirm(`Delete project "${project.name}" and all its words?`)) return;
    deleteActiveProject();
    refreshProjectSelect();
    progress = loadProgress();
    rebuildVocab();
    updateProjectTitle();
    updateImportModeUI();
  });

  document.getElementById('btn-add-word').addEventListener('click', () => {
    const kanji = document.getElementById('word-kanji').value.trim();
    const reading = document.getElementById('word-reading').value.trim();
    const meaning = document.getElementById('word-meaning').value.trim();
    const example = document.getElementById('word-example').value.trim();
    const category = document.getElementById('word-category').value.trim() || 'custom';
    const resultEl = document.getElementById('add-word-result');

    if (!kanji || !meaning) {
      resultEl.className = 'error';
      resultEl.textContent = 'Word and Meaning are required.';
      resultEl.classList.remove('hidden');
      return;
    }

    addWordToActiveProject({ kanji, reading, meaning, example, category });
    ['word-kanji', 'word-reading', 'word-meaning', 'word-example', 'word-category'].forEach(id => {
      document.getElementById(id).value = '';
    });
    resultEl.className = 'success';
    resultEl.textContent = `"${kanji}" added!`;
    resultEl.classList.remove('hidden');
    setTimeout(() => resultEl.classList.add('hidden'), 2000);

    rebuildVocab();
    renderProjectWordList();
    document.getElementById('word-kanji').focus();
  });

  document.getElementById('btn-json-import').addEventListener('click', () => {
    const text = document.getElementById('json-import-textarea').value.trim();
    const resultEl = document.getElementById('json-import-result');

    if (!text) {
      resultEl.className = 'error';
      resultEl.textContent = 'Please paste JSON first.';
      resultEl.classList.remove('hidden');
      return;
    }

    let words;
    try {
      words = JSON.parse(text);
      if (!Array.isArray(words)) throw new Error('Expected a JSON array [ ... ]');
    } catch (e) {
      resultEl.className = 'error';
      resultEl.textContent = 'Invalid JSON: ' + e.message;
      resultEl.classList.remove('hidden');
      return;
    }

    const valid = words.filter(w => w && w.kanji && w.meaning);
    if (valid.length === 0) {
      resultEl.className = 'error';
      resultEl.textContent = 'No valid words found. Each item needs "kanji" and "meaning" fields.';
      resultEl.classList.remove('hidden');
      return;
    }

    valid.forEach(w => addWordToActiveProject({
      kanji: String(w.kanji),
      reading: String(w.reading || ''),
      meaning: String(w.meaning),
      example: String(w.example || ''),
      category: String(w.category || 'custom'),
    }));

    resultEl.className = 'success';
    resultEl.textContent = `Imported ${valid.length} word${valid.length > 1 ? 's' : ''}!`;
    resultEl.classList.remove('hidden');
    document.getElementById('json-import-textarea').value = '';

    rebuildVocab();
    renderProjectWordList();
  });
}

function renderProjectWordList() {
  const project = customProjects.find(p => p.id === activeProjectId);
  if (!project) return;

  document.getElementById('project-word-count').textContent = project.words.length;
  const listEl = document.getElementById('project-word-list');
  listEl.innerHTML = '';

  if (project.words.length === 0) {
    listEl.innerHTML = '<p style="color:#555;font-size:0.9rem;">No words yet. Add some above.</p>';
    return;
  }

  project.words.forEach((word, index) => {
    const div = document.createElement('div');
    div.className = 'word-item';
    div.innerHTML = `
      <div class="word-ja">${word.kanji}<small>${word.reading ? ' ' + word.reading : ''}</small></div>
      <div class="word-en">${word.meaning}</div>
      <button class="imported-set-delete" data-index="${index}" title="Remove word">✕</button>
    `;
    div.querySelector('.imported-set-delete').addEventListener('click', () => {
      removeWordFromActiveProject(index);
      rebuildVocab();
      renderProjectWordList();
    });
    listEl.appendChild(div);
  });
}

// ---- Text-to-Speech ----
function speakWord(text) {
  if (!text || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

// ---- Conjugate Mode ----
let conjState = {
  form: null,       // 'te' | 'nai' | 'ta' | 'potential'
  phase: 'select',  // 'select' | 'card' | 'drill' | 'battle'
  drillVocab: [],
  drillIndex: 0,
  answered: false,
  score: 0,
  streak: 0,
  bossMode: false,
  battleTimer: null,
  battleTimeLeft: 60,
};

const BOSS_VERBS = [
  { kanji: 'します',   reading: 'します',   category: 'verb-group3', meaning: 'làm' },
  { kanji: 'きます',   reading: 'きます',   category: 'verb-group3', meaning: 'đến/lại' },
  { kanji: 'いきます', reading: 'いきます', category: 'verb-group1', meaning: 'đi' },
];

function conjShowPhase(phase) {
  ['conj-select','conj-card','conj-drill','conj-battle'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById('conj-' + phase).classList.remove('hidden');
}

function conjBuildRuleCard(ruleData) {
  document.getElementById('conj-card-title').textContent = `${ruleData.name} (${ruleData.nameVi})`;
  document.getElementById('conj-card-usage').textContent = ruleData.usageVi;

  const patternsEl = document.getElementById('conj-card-patterns');
  patternsEl.innerHTML = '';
  ruleData.patterns.forEach(p => {
    const div = document.createElement('div');
    div.className = 'conj-pattern-group';
    let html = `<div class="conj-pattern-group-name">${p.group}</div>`;
    html += `<div class="conj-pattern-rule">${p.rule}</div>`;
    if (p.table) {
      html += `<table class="conj-pattern-table">`;
      p.table.forEach(row => {
        html += `<tr><td>${row.from}</td><td>→ ${row.to}</td><td>${row.ex}</td></tr>`;
      });
      html += `</table>`;
    }
    if (p.ex && !p.table) html += `<div class="conj-pattern-ex">${p.ex}</div>`;
    if (p.note) html += `<div class="conj-pattern-note">${p.note}</div>`;
    div.innerHTML = html;
    patternsEl.appendChild(div);
  });
}

function conjBuildDrillVocab() {
  // Use all VERB_VOCAB verbs (all groups), shuffle
  const vocab = [...VERB_VOCAB].filter(w => w.reading && w.category && w.category.startsWith('verb-'));
  shuffleArray(vocab);
  return vocab;
}

function conjRenderDrillCard() {
  const word = conjState.drillVocab[conjState.drillIndex];
  if (!word) return;

  conjState.answered = false;
  imeReset();

  document.getElementById('conj-input').value = '';
  document.getElementById('conj-input').classList.remove('correct-input', 'wrong-input');
  document.getElementById('conj-feedback').className = 'hidden';
  document.getElementById('conj-answer-reveal').className = 'hidden';
  document.getElementById('conj-mini-summary').textContent = '';

  document.getElementById('conj-drill-verb').textContent = word.kanji || word.reading;
  const formLabels = { te: '→ Thể て', nai: '→ Thể ない (phủ định)', ta: '→ Thể た (quá khứ)', potential: '→ Thể tiềm năng (có thể...)' };
  document.getElementById('conj-drill-form-label').textContent = formLabels[conjState.form] || '';

  // Context sentence if available
  const examples = getConjugationExamples(conjState.form);
  const ex = examples.find(e => e.reading === word.reading);
  const sentEl = document.getElementById('conj-drill-sentence');
  if (ex) {
    sentEl.textContent = ex.sentence;
    sentEl.classList.remove('hidden');
    sentEl.dataset.hint = ex.hint || '';
  } else {
    sentEl.classList.add('hidden');
    sentEl.textContent = '';
  }

  document.getElementById('conj-counter').textContent = `${conjState.drillIndex + 1} / ${conjState.drillVocab.length}`;
  document.getElementById('conj-input').focus();
}

function conjCheckAnswer() {
  if (conjState.answered) return;
  const word = conjState.drillVocab[conjState.drillIndex];
  if (!word) return;

  const correct = conjugate(word.reading, word.category, conjState.form);
  if (!correct) { conjNextDrill(); return; }

  const userInput = imeGetDisplay().trim();
  const isCorrect = userInput === correct;

  const inputEl = document.getElementById('conj-input');
  const feedbackEl = document.getElementById('conj-feedback');
  const revealEl = document.getElementById('conj-answer-reveal');
  const summaryEl = document.getElementById('conj-mini-summary');

  inputEl.classList.toggle('correct-input', isCorrect);
  inputEl.classList.toggle('wrong-input', !isCorrect);
  feedbackEl.classList.remove('hidden');
  feedbackEl.className = isCorrect ? 'typing-feedback correct' : 'typing-feedback wrong';
  feedbackEl.textContent = isCorrect ? '✓ Đúng rồi!' : `✗ Sai — đáp án: ${correct}`;

  revealEl.classList.remove('hidden');
  summaryEl.textContent = conjugateSummary(word.reading, word.category, conjState.form);

  conjState.answered = true;
}

function conjNextDrill() {
  conjState.drillIndex = (conjState.drillIndex + 1) % conjState.drillVocab.length;
  conjRenderDrillCard();
}

// ---- Battle ----
function conjStartBattle() {
  conjState.score = 0;
  conjState.streak = 0;
  conjState.bossMode = false;
  conjState.battleTimeLeft = 60;

  document.getElementById('conj-battle-ready').classList.add('hidden');
  document.getElementById('conj-battle-result').classList.add('hidden');
  document.getElementById('conj-battle-playing').classList.remove('hidden');
  document.getElementById('conj-boss-badge').classList.add('hidden');

  conjBattleRenderWord();
  conjUpdateBattleHUD();

  conjState.battleTimer = setInterval(() => {
    conjState.battleTimeLeft--;
    conjUpdateBattleHUD();

    if (conjState.battleTimeLeft <= 0) {
      clearInterval(conjState.battleTimer);
      conjEndBattle();
    }
    // Boss round trigger: 45s elapsed or streak 10
    if (!conjState.bossMode && (conjState.battleTimeLeft <= 15 || conjState.streak >= 10)) {
      conjState.bossMode = true;
      document.getElementById('conj-boss-badge').classList.remove('hidden');
    }
  }, 1000);
}

function conjUpdateBattleHUD() {
  const t = conjState.battleTimeLeft;
  const timerEl = document.getElementById('conj-battle-timer');
  timerEl.textContent = `0:${t < 10 ? '0' + t : t}`;
  timerEl.className = 'conj-battle-timer' + (t <= 10 ? ' danger' : t <= 20 ? ' warning' : '');
  document.getElementById('conj-battle-streak').textContent = `🔥 ${conjState.streak}`;
  document.getElementById('conj-battle-score-live').textContent = conjState.score;
}

function conjBattleRenderWord() {
  const pool = conjState.bossMode ? BOSS_VERBS : VERB_VOCAB.filter(w => w.category && w.category.startsWith('verb-'));
  const word = pool[Math.floor(Math.random() * pool.length)];
  conjState._battleWord = word;

  imeReset();
  document.getElementById('conj-battle-input').value = '';
  document.getElementById('conj-battle-input').classList.remove('correct-input', 'wrong-input');
  document.getElementById('conj-battle-feedback').classList.add('hidden');

  document.getElementById('conj-battle-verb').textContent = word.kanji || word.reading;
  const formLabels = { te: 'て-form', nai: 'ない-form', ta: 'た-form (quá khứ)', potential: 'Thể tiềm năng' };
  document.getElementById('conj-battle-form-label').textContent = '→ ' + (formLabels[conjState.form] || '');
}

function conjBattleCheck() {
  const word = conjState._battleWord;
  if (!word) return;
  const correct = conjugate(word.reading, word.category, conjState.form);
  if (!correct) { conjBattleRenderWord(); return; }

  const userInput = imeGetDisplay().trim();
  const isCorrect = userInput === correct;
  const fb = document.getElementById('conj-battle-feedback');
  fb.classList.remove('hidden');
  fb.className = 'conj-battle-feedback ' + (isCorrect ? 'correct' : 'wrong');

  if (isCorrect) {
    conjState.streak++;
    conjState.score += 10 + Math.floor(conjState.streak / 3) * 5; // streak bonus
    fb.textContent = `✓  +${10 + Math.floor(conjState.streak / 3) * 5}`;
    setTimeout(() => conjBattleRenderWord(), 400);
  } else {
    conjState.streak = 0;
    fb.textContent = `✗  ${correct}`;
    document.getElementById('conj-battle-input').classList.add('wrong-input');
    document.getElementById('conj-battle-input').classList.add('shake');
    setTimeout(() => {
      document.getElementById('conj-battle-input').classList.remove('shake', 'wrong-input');
      conjBattleRenderWord();
    }, 700);
  }
  conjUpdateBattleHUD();
}

function conjEndBattle() {
  document.getElementById('conj-battle-playing').classList.add('hidden');
  document.getElementById('conj-battle-result').classList.remove('hidden');
  document.getElementById('conj-final-score').textContent = conjState.score;

  const hsKey = 'conj-hs-' + conjState.form;
  const prev = parseInt(localStorage.getItem(hsKey)) || 0;
  const isNew = conjState.score > prev;
  if (isNew) localStorage.setItem(hsKey, conjState.score);
  document.getElementById('conj-battle-final-hs').textContent = isNew
    ? `🏆 Kỷ lục mới!`
    : `Kỷ lục: ${prev}`;
  document.getElementById('conj-battle-highscore').textContent = `Kỷ lục: ${Math.max(conjState.score, prev)}`;
}

function setupConjugate() {
  // Form selector buttons
  document.querySelectorAll('.conj-form-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      conjState.form = btn.dataset.form;
      const rule = CONJUGATION_RULES.find(r => r.id === conjState.form);
      if (rule) conjBuildRuleCard(rule);
      conjShowPhase('card');
    });
  });

  // Rule card → start drill
  document.getElementById('btn-conj-start-drill').addEventListener('click', () => {
    conjState.drillVocab = conjBuildDrillVocab();
    conjState.drillIndex = 0;
    conjShowPhase('drill');
    conjRenderDrillCard();
  });

  // Skip rule card
  document.getElementById('btn-conj-skip-card').addEventListener('click', () => {
    conjState.drillVocab = conjBuildDrillVocab();
    conjState.drillIndex = 0;
    conjShowPhase('drill');
    conjRenderDrillCard();
  });

  // Drill input — reuse IME engine
  const conjInput = document.getElementById('conj-input');
  conjInput.addEventListener('keydown', (e) => {
    if (conjState.answered) {
      if (e.key === 'Enter') conjNextDrill();
      return;
    }
    if (e.key === 'Enter') { e.preventDefault(); conjCheckAnswer(); return; }
    if (e.key === 'Backspace') { e.preventDefault(); imeBackspace(); conjInput.value = imeGetDisplay(); return; }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      imeInput(e.key);
      conjInput.value = imeGetDisplay();
    }
  });

  document.getElementById('btn-conj-check').addEventListener('click', conjCheckAnswer);
  document.getElementById('btn-conj-next').addEventListener('click', conjNextDrill);
  document.getElementById('btn-conj-skip').addEventListener('click', conjNextDrill);

  document.getElementById('btn-conj-back').addEventListener('click', () => {
    conjShowPhase('select');
  });

  // To battle
  document.getElementById('btn-conj-to-battle').addEventListener('click', () => {
    if (conjState.battleTimer) clearInterval(conjState.battleTimer);
    document.getElementById('conj-battle-ready').classList.remove('hidden');
    document.getElementById('conj-battle-playing').classList.add('hidden');
    document.getElementById('conj-battle-result').classList.add('hidden');
    const hsKey = 'conj-hs-' + conjState.form;
    const prev = parseInt(localStorage.getItem(hsKey)) || 0;
    document.getElementById('conj-battle-highscore').textContent = prev > 0 ? `Kỷ lục: ${prev}` : '';
    conjShowPhase('battle');
  });

  document.getElementById('btn-conj-battle-start').addEventListener('click', conjStartBattle);
  document.getElementById('btn-conj-battle-retry').addEventListener('click', () => {
    if (conjState.battleTimer) clearInterval(conjState.battleTimer);
    conjStartBattle();
  });
  document.getElementById('btn-conj-battle-back').addEventListener('click', () => {
    if (conjState.battleTimer) clearInterval(conjState.battleTimer);
    conjShowPhase('drill');
  });
  document.getElementById('btn-conj-after-battle-back').addEventListener('click', () => {
    if (conjState.battleTimer) clearInterval(conjState.battleTimer);
    conjShowPhase('drill');
  });

  // Battle input
  const battleInput = document.getElementById('conj-battle-input');
  battleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); conjBattleCheck(); return; }
    if (e.key === 'Backspace') { e.preventDefault(); imeBackspace(); battleInput.value = imeGetDisplay(); return; }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      imeInput(e.key);
      battleInput.value = imeGetDisplay();
    }
  });

  // Mobile keyboard float for drill controls (reuse same pattern as typing mode)
  const drillControls = document.querySelector('#conj-drill .typing-controls');
  function updateConjControlsPos() {
    if (!window.visualViewport || !drillControls) return;
    const kbHeight = window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop;
    if (kbHeight > 100 && (document.activeElement === conjInput || document.activeElement === battleInput)) {
      drillControls.style.position = 'fixed';
      drillControls.style.bottom = kbHeight + 'px';
      drillControls.style.left = '0';
      drillControls.style.right = '0';
      drillControls.style.zIndex = '200';
      drillControls.style.background = '#0d0d20';
      drillControls.style.borderTop = '1px solid #1a1a2e';
      drillControls.style.margin = '0';
      drillControls.style.padding = '10px 16px';
    } else {
      drillControls.removeAttribute('style');
    }
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateConjControlsPos);
  }
  conjInput.addEventListener('blur', () => setTimeout(() => drillControls && drillControls.removeAttribute('style'), 100));
}

// ---- Utility ----
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
