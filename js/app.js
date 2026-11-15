(function () {
  "use strict";

  const app = document.getElementById("app");
  const course = window.COURSE;
  const base = "#/course/" + course.id;
  const progressKey = "dip-study-progress";

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function getProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(progressKey) || "{}");
      return {
        done: Array.isArray(saved.done) ? saved.done : [],
        wrong: Array.isArray(saved.wrong) ? saved.wrong : []
      };
    } catch (error) {
      console.warn("לא ניתן לקרוא את התקדמות הלמידה השמורה.", error);
      return { done: [], wrong: [] };
    }
  }

  function saveProgress(progress) {
    try {
      localStorage.setItem(progressKey, JSON.stringify(progress));
    } catch (error) {
      console.warn("לא ניתן לשמור את התקדמות הלמידה.", error);
    }
  }

  function themeButton() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    const label = dark ? "מעבר למצב בהיר" : "מעבר למצב כהה";
    return '<button class="theme-toggle" type="button" data-theme-toggle aria-label="' + label + '" title="' + label + '">' + themeIcon(dark) + "</button>";
  }

  function themeIcon(dark) {
    return dark
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 8.5 8.5 0 1 0 21 14.5Z"/></svg>';
  }

  function routeInfo() {
    const hash = location.hash || base;
    const parts = hash.split("?")[0].replace(/^#\/?/, "").split("/").filter(Boolean);
    const params = new URLSearchParams(hash.indexOf("?") >= 0 ? hash.slice(hash.indexOf("?") + 1) : "");
    return {
      courseId: parts[1] || course.id,
      area: parts[2] || "home",
      unitId: parts[3] || "",
      query: params.get("q") || ""
    };
  }

  function navLink(href, text, active) {
    return '<a href="' + href + '"' + (active ? ' class="active" aria-current="page"' : "") + ">" + text + "</a>";
  }

  function shell(content, active) {
    return '<header class="topbar"><div class="topbar-inner">' +
      '<a class="brand" href="' + base + '">' + escapeHtml(course.code) + " · " + escapeHtml(course.name) + '</a>' +
      '<div class="topbar-tools"><nav class="nav" aria-label="ניווט ראשי">' +
      navLink(base, "קורס", active === "home") +
      navLink(base + "/learn", "יחידות", active === "learn") +
      navLink(base + "/summary", "סיכום", active === "summary") +
      navLink(base + "/practice", "תרגול", active === "practice") +
      navLink(base + "/exams", "מבחנים", active === "exams") +
      navLink(base + "/search", "חיפוש", active === "search") +
      "</nav>" + themeButton() + '</div></div></header>' +
      '<main class="page">' + content + '</main>' +
      '<footer class="footer"><div class="footer-inner"><p>סביבת למידה לקורס עיבוד תמונה ספרתי · מבוסס על מדריך הלמידה, מצגת השיעור הראשון והסיכום שסופקו. חומרי מבחנים ופתרונות יתווספו בהמשך.</p></div></footer>';
  }

  function unitCard(unit, progress) {
    const done = progress.done.indexOf(unit.id) >= 0;
    return '<a class="unit-card" href="' + base + "/learn/" + encodeURIComponent(unit.id) + '">' +
      '<span class="unit-number">' + (course.units.indexOf(unit) + 1) + '</span>' +
      '<span class="unit-copy"><strong>' + escapeHtml(unit.title) + '</strong><p>' + escapeHtml(unit.description) + '</p>' +
      '<span class="unit-meta"><span class="pill">' + escapeHtml(unit.short) + '</span>' +
      (done ? '<span class="pill done">הושלם</span>' : "") + "</span></span></a>";
  }

  function renderHome() {
    const progress = getProgress();
    const count = progress.done.length;
    const percent = Math.round(count / course.units.length * 100);
    return shell(
      '<section class="hero"><div class="hero-content"><p class="eyebrow">' + escapeHtml(course.code) + " · " + course.tags.map(escapeHtml).join(" · ") + '</p>' +
      "<h1>" + escapeHtml(course.name) + '</h1><p class="hero-lead">' + escapeHtml(course.blurb) + '</p>' +
      '<div class="hero-actions"><a class="button" href="' + base + '/learn">מתחילים ללמוד <span aria-hidden="true">←</span></a>' +
      '<a class="button-secondary" href="' + base + '/practice">בדיקת הבנה</a></div>' +
      '<div class="stat-grid"><div class="stat"><strong>' + course.units.length + '</strong><span>יחידות לימוד</span></div>' +
      '<div class="stat"><strong>' + count + '</strong><span>יחידות שהושלמו</span></div>' +
      '<div class="stat"><strong>' + percent + '%</strong><span>התקדמות בקורס</span><div class="progress-track" role="progressbar" aria-valuenow="' + percent + '" aria-valuemin="0" aria-valuemax="100"><span style="width:' + percent + '%"></span></div></div></div>' +
      '</div></section>' +
      '<div class="section-heading"><div><h2>מפת הקורס</h2><p>יחידות הלימוד לפי מדריך הקורס, המצגת והסיכום</p></div><a href="' + base + '/learn">לכל היחידות ←</a></div>' +
      '<div class="unit-grid">' + course.units.map(function (unit) { return unitCard(unit, progress); }).join("") + "</div>" +
      '<div class="section-heading"><div><h2>כלי הלמידה</h2><p>סיכום, תרגול ומבחנים</p></div></div>' +
      '<div class="portal-grid">' +
      '<a class="portal" href="' + base + '/summary"><span class="portal-icon" aria-hidden="true">📘</span><strong>סיכום נוסחאות</strong><span>תזכורת מהירה למושגים ולנוסחאות מרכזיות</span></a>' +
      '<a class="portal" href="' + base + '/practice"><span class="portal-icon" aria-hidden="true">✏️</span><strong>תרגול קצר</strong><span>שאלות בדיקה קצרות בכל נושאי הקורס</span></a>' +
      '<a class="portal" href="' + base + '/exams"><span class="portal-icon" aria-hidden="true">🗂️</span><strong>מבחנים ופתרונות</strong><span>האזור ייפתח עם הוספת החומרים</span></a></div>',
      "home"
    );
  }

  function renderUnits() {
    const progress = getProgress();
    return shell('<a class="back-link" href="' + base + '">← חזרה לקורס</a>' +
      '<header class="page-head"><p class="eyebrow">תוכנית הלימוד</p><h1>יחידות הקורס</h1><p>כל יחידה כוללת מושגי יסוד, הסברים ונקודות מפתח. אפשר ללמוד לפי הסדר ולסמן יחידות שהושלמו.</p></header>' +
      '<div class="unit-grid">' + course.units.map(function (unit) { return unitCard(unit, progress); }).join("") + "</div>", "learn");
  }

  function renderUnit(unit) {
    const progress = getProgress();
    const index = course.units.indexOf(unit);
    const completed = progress.done.indexOf(unit.id) >= 0;
    const sections = unit.sections.map(function (section, sectionIndex) {
      return '<section class="lesson-card" id="section-' + sectionIndex + '"><h2>' + escapeHtml(section.title) + "</h2>" +
        section.paragraphs.map(function (paragraph) { return "<p>" + escapeHtml(paragraph) + "</p>"; }).join("") +
        (section.formula ? '<div class="formula">' + escapeHtml(section.formula) + "</div>" : "") +
        (section.key ? '<div class="callout"><strong>נקודה לזכור:</strong> ' + escapeHtml(section.key) + "</div>" : "") +
        "</section>";
    }).join("");
    const previous = index > 0 ? '<a class="button-secondary" href="' + base + "/learn/" + course.units[index - 1].id + '">→ ' + escapeHtml(course.units[index - 1].title) + "</a>" : "";
    const next = index < course.units.length - 1 ? '<a class="button" href="' + base + "/learn/" + course.units[index + 1].id + '">' + escapeHtml(course.units[index + 1].title) + " ←</a>" : "";
    const demo = unit.id === "halftone" ? '<section class="demo" aria-labelledby="demo-title"><h3 id="demo-title">מעבדת סף: נסו בעצמכם</h3><p>הזיזו את הסף וראו איך אותו מעבר אפור הופך לתמונה בינרית.</p><div class="demo-canvases"><figure><figcaption>תמונה בגווני אפור</figcaption><canvas width="280" height="96" data-gray-canvas aria-label="מעבר הדרגתי של גווני אפור"></canvas></figure><figure><figcaption>אחרי סף</figcaption><canvas width="280" height="96" data-binary-canvas aria-label="המעבר אחרי בינריזציה"></canvas></figure></div><label class="range-row" for="threshold-range"><span>סף</span><input id="threshold-range" type="range" min="0" max="255" value="128"><output data-threshold-value for="threshold-range">128</output></label></section>' : "";

    return shell('<a class="back-link" href="' + base + '/learn">← לכל היחידות</a>' +
      '<header class="page-head"><p class="eyebrow">יחידה ' + (index + 1) + " מתוך " + course.units.length + '</p><h1>' + escapeHtml(unit.title) + '</h1><p>' + escapeHtml(unit.description) + "</p></header>" +
      '<div class="course-layout"><div class="lesson-content">' + sections + demo +
      '<div class="actions"><button type="button" class="' + (completed ? "button-secondary" : "button") + '" data-complete-unit="' + escapeHtml(unit.id) + '" aria-pressed="' + completed + '">' + (completed ? "ביטול סימון השלמה" : "סיימתי ללמוד את היחידה") + "</button>" +
      '<a class="button-secondary" href="' + base + '/practice">לתרגול ←</a></div><div class="actions lesson-pager">' + previous + next + "</div></div>" +
      '<aside class="panel lesson-nav"><h2>ביחידה הזו</h2>' + unit.sections.map(function (section, i) { return '<a href="#section-' + i + '">' + escapeHtml(section.title) + "</a>"; }).join("") +
      '<hr><a href="' + base + '/summary">מעבר לסיכום הקורס ←</a></aside></div>', "learn");
  }

  function renderSummary() {
    const rows = course.units.map(function (unit, index) {
      return '<section class="lesson-card"><p class="kicker">יחידה ' + (index + 1) + '</p><h2>' + escapeHtml(unit.title) + "</h2>" +
        unit.sections.map(function (section) {
          return "<p><strong>" + escapeHtml(section.title) + ".</strong> " + escapeHtml(section.key || section.paragraphs[0]) + "</p>" +
            (section.formula ? '<div class="formula">' + escapeHtml(section.formula) + "</div>" : "");
        }).join("") + "</section>";
    }).join("");
    return shell('<a class="back-link" href="' + base + '">← חזרה לקורס</a>' +
      '<header class="page-head"><p class="eyebrow">חזרה מהירה</p><h1>סיכום ונוסחאות</h1><p>מפת מושגים קצרה לכל יחידות הקורס. לפרטים והסברים עברו לעמוד היחידה.</p></header>' + rows, "summary");
  }

  function allQuestions() {
    return course.units.reduce(function (questions, unit, unitIndex) {
      unit.quiz.forEach(function (item, index) {
        questions.push({
          id: unit.id + "-" + index,
          unit: unit,
          unitIndex: unitIndex,
          question: item.question,
          options: item.options,
          answer: item.answer,
          explanation: item.explanation
        });
      });
      return questions;
    }, []);
  }

  function quizCard(item) {
    return '<article class="quiz-card" data-quiz-card="' + escapeHtml(item.id) + '"><p class="kicker">יחידה ' + (item.unitIndex + 1) + " · " + escapeHtml(item.unit.title) + "</p><h2>" + escapeHtml(item.question) + '</h2><div class="quiz-options">' +
      item.options.map(function (option, index) {
        return '<button type="button" class="quiz-option" data-answer="' + index + '" data-question="' + escapeHtml(item.id) + '">' + escapeHtml(option) + "</button>";
      }).join("") + '</div><p class="quiz-feedback" data-feedback="' + escapeHtml(item.id) + '" aria-live="polite" hidden></p></article>';
  }

  function renderPractice() {
    const questions = allQuestions();
    return shell('<a class="back-link" href="' + base + '">← חזרה לקורס</a>' +
      '<header class="page-head"><p class="eyebrow">בדיקת הבנה</p><h1>תרגול קצר</h1><p>בחרו תשובה בכל שאלה. אפשר לנסות שוב; השאלות כאן נועדו לחזרה על מושגי היסוד.</p></header>' +
      '<div class="quiz-list">' + questions.map(quizCard).join("") + "</div>", "practice");
  }

  function renderExams() {
    return shell('<a class="back-link" href="' + base + '">← חזרה לקורס</a>' +
      '<header class="page-head"><p class="eyebrow">תרגול מסכם</p><h1>מבחנים ופתרונות</h1><p>האזור מיועד למבחנים מלאים ולפתרונות שיתווספו בהמשך.</p></header>' +
      '<section class="exam-placeholder"><div class="exam-icon" aria-hidden="true">🗂️</div><h2>החומרים יתווספו לכאן</h2><p>כשתעלי מבחנים ופתרונות, נוכל לארגן אותם לפי מועד ונושא, ולהוסיף מעבר בין שאלון לפתרון.</p><a class="button-secondary" href="' + base + '/learn">בינתיים: חזרה ליחידות</a></section>', "exams");
  }

  function searchResults(query) {
    const normalized = query.trim().toLocaleLowerCase("he");
    if (normalized.length < 2) return '<p class="empty-state">הקלידו לפחות שתי אותיות כדי לחפש ביחידות ובסיכום.</p>';
    const results = [];
    course.units.forEach(function (unit, unitIndex) {
      const text = [unit.title, unit.description, unit.short].concat(unit.sections.map(function (section) {
        return section.title + " " + section.paragraphs.join(" ") + " " + (section.key || "");
      })).join(" ");
      if (text.toLocaleLowerCase("he").includes(normalized)) {
        results.push('<a class="search-result" href="' + base + "/learn/" + unit.id + '"><strong>יחידה ' + (unitIndex + 1) + " · " + escapeHtml(unit.title) + '</strong><span>' + escapeHtml(unit.description) + "</span></a>");
      }
    });
    return results.length ? results.join("") : '<p class="empty-state">לא נמצאו תוצאות עבור „' + escapeHtml(query) + "”.</p>";
  }

  function renderSearch(query) {
    return shell('<a class="back-link" href="' + base + '">← חזרה לקורס</a>' +
      '<header class="page-head"><p class="eyebrow">חיפוש בחומר</p><h1>חיפוש</h1><p>חפשו מושג, נושא או מילה מתוך הסיכומים.</p></header>' +
      '<form class="search-form" data-search-form><label class="sr-only" for="search-query">מילות חיפוש</label><input id="search-query" name="q" type="search" value="' + escapeHtml(query) + '" placeholder="לדוגמה: אנטרופיה, DCT, כרסום" autocomplete="off"><button class="button" type="submit">חיפוש</button></form>' +
      '<div class="search-results" data-search-results>' + searchResults(query) + "</div>", "search");
  }

  function route() {
    const info = routeInfo();
    if (info.courseId !== course.id) {
      location.hash = base;
      return;
    }
    if (info.area === "learn" && info.unitId) {
      const unit = course.units.find(function (item) { return item.id === info.unitId; });
      app.innerHTML = unit ? renderUnit(unit) : renderUnits();
    } else if (info.area === "learn") app.innerHTML = renderUnits();
    else if (info.area === "summary") app.innerHTML = renderSummary();
    else if (info.area === "practice") app.innerHTML = renderPractice();
    else if (info.area === "exams") app.innerHTML = renderExams();
    else if (info.area === "search") app.innerHTML = renderSearch(info.query);
    else app.innerHTML = renderHome();
    bindEvents();
    if (info.area === "learn" && info.unitId === "halftone") initThresholdDemo();
  }

  function bindEvents() {
    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try {
          localStorage.setItem("cs-theme", next);
        } catch (error) {
          console.warn("לא ניתן לשמור את ערכת הצבעים.", error);
        }
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", next === "dark" ? "#0c1421" : "#f4f7fb");
        const label = next === "dark" ? "מעבר למצב בהיר" : "מעבר למצב כהה";
        button.innerHTML = themeIcon(next === "dark");
        button.setAttribute("aria-label", label);
        button.setAttribute("title", label);
      });
    });

    document.querySelectorAll("[data-complete-unit]").forEach(function (button) {
      button.addEventListener("click", function () {
        const progress = getProgress();
        const id = button.getAttribute("data-complete-unit");
        progress.done = progress.done.indexOf(id) >= 0 ? progress.done.filter(function (item) { return item !== id; }) : progress.done.concat(id);
        saveProgress(progress);
        route();
      });
    });

    document.querySelectorAll("[data-question]").forEach(function (button) {
      button.addEventListener("click", function () {
        const questionId = button.getAttribute("data-question");
        const question = allQuestions().find(function (item) { return item.id === questionId; });
        const card = button.closest("[data-quiz-card]");
        const feedback = card.querySelector("[data-feedback]");
        const selected = Number(button.getAttribute("data-answer"));
        const correct = selected === question.answer;
        const progress = getProgress();
        if (correct) progress.wrong = progress.wrong.filter(function (id) { return id !== questionId; });
        else if (progress.wrong.indexOf(questionId) < 0) progress.wrong.push(questionId);
        saveProgress(progress);
        card.querySelectorAll("[data-question]").forEach(function (option) {
          option.disabled = correct || option === button;
          if (Number(option.getAttribute("data-answer")) === question.answer) option.classList.add("correct");
          else if (option === button) option.classList.add("incorrect");
        });
        feedback.hidden = false;
        feedback.className = "quiz-feedback " + (correct ? "good" : "try-again");
        feedback.textContent = (correct ? "נכון. " : "לא בדיוק. ") + question.explanation;
      });
    });

    const searchForm = document.querySelector("[data-search-form]");
    if (searchForm) {
      const input = searchForm.querySelector('input[name="q"]');
      const results = document.querySelector("[data-search-results]");
      if (input && results) {
        input.addEventListener("input", function () {
          results.innerHTML = searchResults(input.value);
        });
        searchForm.addEventListener("submit", function (event) {
          event.preventDefault();
          location.hash = base + "/search?q=" + encodeURIComponent(input.value.trim());
        });
      }
    }
  }

  function initThresholdDemo() {
    const grayCanvas = document.querySelector("[data-gray-canvas]");
    const binaryCanvas = document.querySelector("[data-binary-canvas]");
    const slider = document.getElementById("threshold-range");
    const output = document.querySelector("[data-threshold-value]");
    if (!grayCanvas || !binaryCanvas || !slider || !output) return;
    const grayContext = grayCanvas.getContext("2d");
    const binaryContext = binaryCanvas.getContext("2d");
    const width = grayCanvas.width;
    const height = grayCanvas.height;
    const original = grayContext.createImageData(width, height);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 4;
        const value = Math.max(0, Math.min(255, Math.round((x / (width - 1)) * 255 + 20 * Math.sin(y / 8))));
        original.data[index] = value;
        original.data[index + 1] = value;
        original.data[index + 2] = value;
        original.data[index + 3] = 255;
      }
    }
    grayContext.putImageData(original, 0, 0);
    function update() {
      const threshold = Number(slider.value);
      const outputData = binaryContext.createImageData(width, height);
      for (let i = 0; i < original.data.length; i += 4) {
        const value = original.data[i] < threshold ? 0 : 255;
        outputData.data[i] = value;
        outputData.data[i + 1] = value;
        outputData.data[i + 2] = value;
        outputData.data[i + 3] = 255;
      }
      binaryContext.putImageData(outputData, 0, 0);
      output.value = String(threshold);
      output.textContent = String(threshold);
    }
    slider.addEventListener("input", update);
    update();
  }

  try {
    const savedTheme = localStorage.getItem("cs-theme");
    if (savedTheme === "light" || savedTheme === "dark") document.documentElement.setAttribute("data-theme", savedTheme);
  } catch (error) {
    console.warn("לא ניתן לטעון את ערכת הצבעים השמורה.", error);
  }
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.addEventListener("hashchange", function () {
    if (!location.hash.startsWith("#/")) return;
    route();
    window.requestAnimationFrame(function () {
      window.scrollTo(0, 0);
    });
  });
  if (!location.hash) location.hash = base;
  else route();
})();
