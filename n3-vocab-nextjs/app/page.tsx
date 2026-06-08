import Script from "next/script";

export default function Home() {
  return (
    <>
      <div id="layout">
        {/* ---- Sidebar ---- */}
        <aside id="sidebar">
          <div id="sidebar-header">
            <span className="sidebar-title">Vocab</span>
            <button id="btn-sidebar-close" className="sidebar-close-btn" title="Close">×</button>
          </div>
          <div id="sidebar-content"></div>
          <div id="sidebar-footer">
            <button id="btn-new-project" className="sidebar-new-btn">+ New Project</button>
          </div>
        </aside>
        <div id="sidebar-overlay"></div>

        {/* ---- Main ---- */}
        <div id="main">
          <header>
            <div className="header-top">
              <button id="btn-sidebar-toggle" className="sidebar-toggle-btn" title="Menu">☰</button>
              <h1 id="app-title">N3 Vocabulary</h1>
            </div>
            <nav>
              <button className="nav-btn active" data-mode="flashcard">Flashcards</button>
              <button className="nav-btn" data-mode="typing">Typing</button>
              <button className="nav-btn" data-mode="quiz">Quiz</button>
              <button className="nav-btn" data-mode="conjugate">Chia động từ</button>
              <button className="nav-btn" data-mode="list">Word List</button>
              <button className="nav-btn" data-mode="stats">Stats</button>
            </nav>
          </header>

          <div id="category-filter">
            <label>Category:</label>
            <select id="category-select">
              <option value="all">All</option>
            </select>
            <span id="word-count"></span>
          </div>

          <section id="flashcard-mode" className="mode active">
            <div className="flashcard-container">
              <div className="flashcard" id="flashcard">
                <div className="flashcard-front">
                  <div className="kanji"></div>
                  <div className="reading"></div>
                </div>
                <div className="flashcard-back">
                  <div className="meaning"></div>
                  <div className="example"></div>
                  <div className="example-meaning"></div>
                </div>
              </div>
              <button id="btn-speak" className="flashcard-speak-btn" title="Speak word">🔊</button>
            </div>
            <p className="hint">Click card to flip</p>
            <div className="flashcard-controls">
              <button id="btn-prev" className="control-btn">Previous</button>
              <span id="card-counter">1 / 100</span>
              <button id="btn-next" className="control-btn">Next</button>
            </div>
            <div className="flashcard-actions">
              <button id="btn-known" className="action-btn known">I know this</button>
              <button id="btn-unknown" className="action-btn unknown">Still learning</button>
              <button id="btn-shuffle" className="action-btn shuffle">Shuffle</button>
            </div>
          </section>

          <section id="typing-mode" className="mode">
            <div className="typing-card">
              <div className="typing-kanji" id="typing-kanji"></div>
              <div className="typing-meaning" id="typing-meaning"></div>
              <div className="typing-input-area">
                <input type="text" id="typing-input" placeholder="Type romaji (e.g. keiken)..." autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} inputMode="text" />
                <button id="btn-typing-hint" className="hint-btn" title="Show reading">?</button>
                <button id="btn-typing-check" className="primary-btn">Check</button>
              </div>
              <div id="typing-hint" style={{ display: "none" }}></div>
              <div id="typing-first-letter" className="hidden"></div>
              <div id="typing-feedback" className="hidden"></div>
              <div id="typing-answer-reveal" className="hidden">
                <span className="typing-correct-answer"></span>
                <span className="typing-example"></span>
              </div>
            </div>
            <div className="typing-review-row">
              <button id="btn-save-review" className="action-btn save-review">Save for Review</button>
            </div>
            <div className="typing-controls">
              <button id="btn-typing-skip" className="control-btn">Skip</button>
              <span id="typing-counter">1 / 100</span>
              <button id="btn-typing-next" className="control-btn">Next</button>
            </div>
            <div className="typing-score-bar">
              <div className="typing-score-item correct-score">
                <span className="score-label">Correct</span>
                <span id="typing-correct-count">0</span>
              </div>
              <div className="typing-score-item wrong-score">
                <span className="score-label">Wrong</span>
                <span id="typing-wrong-count">0</span>
              </div>
              <div className="typing-score-item streak-score">
                <span className="score-label">Streak</span>
                <span id="typing-streak">0</span>
              </div>
              <div className="typing-score-item hint-score">
                <span className="score-label">Hints</span>
                <span id="typing-hint-count">0</span>
              </div>
              <button id="btn-typing-reset" className="action-btn shuffle">Reset</button>
              <button id="btn-first-letter-toggle" className="action-btn first-letter-toggle" title="Show first letter of reading">1st Letter</button>
            </div>
          </section>

          <section id="quiz-mode" className="mode">
            <div id="quiz-setup">
              <h2>Quiz Settings</h2>
              <div className="quiz-option">
                <label>Number of questions:</label>
                <select id="quiz-count" defaultValue="20">
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
              <div className="quiz-option">
                <label>Question type:</label>
                <select id="quiz-type">
                  <option value="ja-to-en">Japanese → English</option>
                  <option value="en-to-ja">English → Japanese</option>
                  <option value="reading">Reading (Kanji → Hiragana)</option>
                </select>
              </div>
              <button id="btn-start-quiz" className="primary-btn">Start Quiz</button>
            </div>
            <div id="quiz-area" className="hidden">
              <div id="quiz-progress">
                <div id="quiz-progress-bar"></div>
              </div>
              <div id="quiz-question"></div>
              <div id="quiz-choices"></div>
              <div id="quiz-feedback" className="hidden"></div>
              <button id="btn-next-question" className="primary-btn hidden">Next Question</button>
            </div>
            <div id="quiz-results" className="hidden">
              <h2>Quiz Results</h2>
              <div id="quiz-score"></div>
              <div id="quiz-review"></div>
              <button id="btn-retry-quiz" className="primary-btn">Try Again</button>
            </div>
          </section>

          {/* ---- Conjugate Mode ---- */}
          <section id="conjugate-mode" className="mode">
            {/* Phase: form selector */}
            <div id="conj-select" className="conj-phase">
              <h2 className="conj-title">Chia Động Từ</h2>
              <p className="conj-subtitle">Chọn dạng chia muốn luyện tập</p>
              <div className="conj-form-grid">
                <button className="conj-form-btn" data-form="te">
                  <span className="conj-form-jp">て-form</span>
                  <span className="conj-form-vi">Nối động từ</span>
                </button>
                <button className="conj-form-btn" data-form="nai">
                  <span className="conj-form-jp">ない-form</span>
                  <span className="conj-form-vi">Phủ định</span>
                </button>
                <button className="conj-form-btn" data-form="ta">
                  <span className="conj-form-jp">た-form</span>
                  <span className="conj-form-vi">Quá khứ</span>
                </button>
                <button className="conj-form-btn" data-form="potential">
                  <span className="conj-form-jp">〜できる</span>
                  <span className="conj-form-vi">Tiềm năng</span>
                </button>
              </div>
            </div>

            {/* Phase: rule card */}
            <div id="conj-card" className="conj-phase hidden">
              <div className="conj-rule-card">
                <div className="conj-card-header">
                  <h2 id="conj-card-title"></h2>
                  <div id="conj-card-usage" className="conj-card-usage"></div>
                </div>
                <div id="conj-card-patterns" className="conj-card-patterns"></div>
              </div>
              <div className="conj-card-actions">
                <button id="btn-conj-start-drill" className="primary-btn">Bắt đầu luyện tập →</button>
                <button id="btn-conj-skip-card" className="conj-skip-link">Bỏ qua, luyện tập ngay</button>
              </div>
            </div>

            {/* Phase: drill */}
            <div id="conj-drill" className="conj-phase hidden">
              <div className="conj-drill-card">
                <div id="conj-drill-verb" className="conj-drill-verb"></div>
                <div id="conj-drill-form-label" className="conj-drill-form-label"></div>
                <div id="conj-drill-sentence" className="conj-drill-sentence hidden"></div>
                <div className="typing-input-area">
                  <input type="text" id="conj-input" placeholder="Nhập romaji..." autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} inputMode="text" />
                  <button id="btn-conj-check" className="primary-btn">Check</button>
                </div>
                <div id="conj-feedback" className="hidden"></div>
                <div id="conj-answer-reveal" className="hidden">
                  <div id="conj-mini-summary" className="conj-mini-summary"></div>
                </div>
              </div>
              <div className="typing-controls">
                <button id="btn-conj-skip" className="control-btn">Skip</button>
                <span id="conj-counter">1 / 20</span>
                <button id="btn-conj-next" className="control-btn">Next</button>
              </div>
              <div className="conj-drill-footer">
                <button id="btn-conj-to-battle" className="action-btn shuffle">⚡ Speed Battle</button>
                <button id="btn-conj-back" className="action-btn unknown">← Chọn dạng khác</button>
              </div>
            </div>

            {/* Phase: speed battle */}
            <div id="conj-battle" className="conj-phase hidden">
              <div id="conj-battle-ready">
                <h2 className="conj-title">⚡ Speed Battle</h2>
                <p className="conj-subtitle">60 giây — chia động từ càng nhiều càng tốt!</p>
                <button id="btn-conj-battle-start" className="primary-btn">Bắt đầu!</button>
                <div id="conj-battle-highscore" className="conj-battle-hs"></div>
                <button id="btn-conj-battle-back" className="conj-skip-link" style={{marginTop: '12px'}}>← Quay lại luyện tập</button>
              </div>
              <div id="conj-battle-playing" className="hidden">
                <div className="conj-battle-hud">
                  <span id="conj-battle-timer" className="conj-battle-timer">1:00</span>
                  <span id="conj-battle-streak" className="conj-battle-streak">🔥 0</span>
                  <span id="conj-battle-score-live" className="conj-battle-score-live">0</span>
                </div>
                <div id="conj-battle-boss-badge" className="conj-boss-badge hidden">👹 BOSS!</div>
                <div id="conj-battle-verb" className="conj-drill-verb"></div>
                <div id="conj-battle-form-label" className="conj-drill-form-label"></div>
                <div className="typing-input-area">
                  <input type="text" id="conj-battle-input" placeholder="Nhập romaji..." autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} inputMode="text" />
                </div>
                <div id="conj-battle-feedback" className="conj-battle-feedback hidden"></div>
              </div>
              <div id="conj-battle-result" className="hidden">
                <h2 className="conj-title">Kết quả</h2>
                <div id="conj-battle-final-score" className="conj-final-score"></div>
                <div id="conj-battle-final-hs" className="conj-battle-hs"></div>
                <button id="btn-conj-battle-retry" className="primary-btn">Chơi lại</button>
                <button id="btn-conj-after-battle-back" className="conj-skip-link" style={{marginTop: '12px'}}>← Quay lại luyện tập</button>
              </div>
            </div>
          </section>

          <section id="list-mode" className="mode">
            <div className="list-controls">
              <input type="text" id="search-input" placeholder="Search words..." />
              <select id="list-filter">
                <option value="all">All words</option>
                <option value="known">Known</option>
                <option value="unknown">Still learning</option>
              </select>
            </div>
            <div id="word-list"></div>
          </section>

          <section id="stats-mode" className="mode">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number" id="stat-total">0</div>
                <div className="stat-label">Total Words</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" id="stat-known">0</div>
                <div className="stat-label">Known</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" id="stat-learning">0</div>
                <div className="stat-label">Still Learning</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" id="stat-percent">0%</div>
                <div className="stat-label">Progress</div>
              </div>
            </div>
            <div id="progress-chart">
              <div id="progress-bar-visual">
                <div id="progress-fill"></div>
              </div>
            </div>
            <div className="stats-actions">
              <button id="btn-reset-progress" className="action-btn unknown">Reset All Progress</button>
            </div>
            <h3>Category Breakdown</h3>
            <div id="category-stats"></div>
          </section>

          <section id="import-mode" className="mode">
            {/* Custom project word management */}
            <div className="import-section" id="project-words-section" style={{ display: "none" }}>
              <div className="project-section-header">
                <h2 id="project-words-title">Project Words</h2>
                <button id="btn-delete-project" className="action-btn unknown">Delete Project</button>
              </div>
              <div className="import-method">
                <h3>Add a Word</h3>
                <div className="word-form-grid">
                  <input type="text" id="word-kanji" placeholder="Word / Term *" />
                  <input type="text" id="word-reading" placeholder="Reading (e.g. hiragana)" />
                  <input type="text" id="word-meaning" placeholder="Meaning / Definition *" />
                  <input type="text" id="word-example" placeholder="Example sentence" />
                  <input type="text" id="word-category" placeholder="Category (default: custom)" />
                </div>
                <button id="btn-add-word" className="primary-btn">Add Word</button>
                <div id="add-word-result" className="hidden"></div>
              </div>
              <div className="import-divider"><span>or</span></div>
              <div className="import-method">
                <h3>Import JSON Array</h3>
                <p className="import-hint">
                  Paste an array of word objects. Required fields: <code>kanji</code>, <code>meaning</code>.
                  Optional: <code>reading</code>, <code>example</code>, <code>category</code>.
                </p>
                <textarea id="json-import-textarea" rows={6} placeholder={`[\n  {"kanji": "勉強", "reading": "べんきょう", "meaning": "study", "example": "毎日勉強する"},\n  {"kanji": "apple", "meaning": "りんご"}\n]`}></textarea>
                <button id="btn-json-import" className="primary-btn">Import JSON</button>
                <div id="json-import-result" className="hidden"></div>
              </div>
              <div id="project-word-list-section">
                <h3>Words in Project (<span id="project-word-count">0</span>)</h3>
                <div id="project-word-list"></div>
              </div>
            </div>

            {/* Quizlet import */}
            <div id="quizlet-import-section">
              <div className="import-section">
                <h2>Import JSON Array</h2>
                <p className="import-desc">Paste a JSON array of flashcards. Each object needs <code>kanji</code>, <code>reading</code>, <code>meaning</code> fields. Optional: <code>example</code>, <code>category</code>.</p>
                <textarea id="import-json-textarea" rows={8} placeholder={'[\n  { "kanji": "経験", "reading": "けいけん", "meaning": "experience" },\n  { "kanji": "習慣", "reading": "しゅうかん", "meaning": "habit" }\n]'}></textarea>
                <div className="import-settings">
                  <div className="import-option">
                    <label>Default category:</label>
                    <input type="text" id="import-json-category" placeholder="imported" defaultValue="imported" />
                  </div>
                </div>
                <button id="btn-import-json" className="primary-btn">Import JSON</button>
                <div id="import-json-result" className="hidden"></div>
              </div>
              <div className="import-section">
                <h2>Import from Quizlet</h2>
                <p className="import-desc">Paste a Quizlet URL to auto-import, or paste exported text directly.</p>
                <div className="import-method">
                  <h3>Option 1: Quizlet URL</h3>
                  <div className="import-url-row">
                    <input type="text" id="import-url" placeholder="https://quizlet.com/752353557/flashcards" />
                    <button id="btn-import-url" className="primary-btn">Fetch</button>
                  </div>
                  <div id="import-url-status" className="hidden"></div>
                </div>
                <div className="import-divider"><span>or</span></div>
                <div className="import-method">
                  <h3>Option 2: Paste Quizlet Export</h3>
                  <p className="import-hint">In Quizlet: click <strong>...</strong> → <strong>Export</strong> → copy all text → paste below</p>
                  <textarea id="import-textarea" rows={10} placeholder={"term1\tdefinition1\nterm2\tdefinition2\n..."}></textarea>
                </div>
                <div className="import-settings">
                  <div className="import-option">
                    <label>Separator between term &amp; definition:</label>
                    <select id="import-separator">
                      <option value="tab">Tab (Quizlet default)</option>
                      <option value="comma">Comma</option>
                      <option value="dash"> - (dash)</option>
                    </select>
                  </div>
                  <div className="import-option">
                    <label>Save as category:</label>
                    <input type="text" id="import-category" placeholder="quizlet-import" defaultValue="quizlet-import" />
                  </div>
                </div>
                <button id="btn-import-paste" className="primary-btn">Import Words</button>
                <div id="import-result" className="hidden"></div>
              </div>
              <div className="import-section" id="imported-sets-section">
                <h3>Imported Sets</h3>
                <div id="imported-sets-list"></div>
                <button id="btn-clear-imports" className="action-btn unknown hidden">Clear All Imported Words</button>
              </div>
            </div>
          </section>
        </div>{/* end #main */}
      </div>{/* end #layout */}

      <Script src="/conjugation-engine.js" strategy="beforeInteractive" />
      <Script src="/conjugation-rules.js" strategy="beforeInteractive" />
      <Script src="/conjugation-examples.js" strategy="beforeInteractive" />
      <Script src="/vocab-data.js" strategy="beforeInteractive" />
      <Script src="/mimikara-data.js" strategy="beforeInteractive" />
      <Script src="/verb-data.js" strategy="beforeInteractive" />
      <Script src="/n4-data.js" strategy="beforeInteractive" />
      <Script src="/kanji-jlpt-data.js" strategy="beforeInteractive" />
      <Script src="/app.js" strategy="afterInteractive" />
    </>
  );
}
