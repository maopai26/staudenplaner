/* ============================================================
   Staudenbeet-Planer — App-Logik
   ============================================================ */

(function () {
  "use strict";

  const MAX_COLORS = 3;
  const MAX_PER_MONTH = 3;
  const IMG_CACHE_KEY = "staudenbeet:imgcache:v1";
  const STATE_KEY = "staudenbeet:selection:v1";
  const IMG_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 Tage

  const state = {
    sun: null,
    soil: null,
    colors: [],
  };

  const els = {
    sunChips: document.getElementById("sun-chips"),
    soilChips: document.getElementById("soil-chips"),
    colorChips: document.getElementById("color-chips"),
    planBtn: document.getElementById("plan-btn"),
    resetBtn: document.getElementById("reset-btn"),
    results: document.getElementById("results"),
    summary: document.getElementById("results-summary"),
    timeline: document.getElementById("timeline"),
    emptyHint: document.getElementById("empty-hint"),
  };

  // ---------------- Persistence ----------------

  function loadState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved && typeof saved === "object") {
        state.sun = saved.sun || null;
        state.soil = saved.soil || null;
        state.colors = Array.isArray(saved.colors) ? saved.colors.slice(0, MAX_COLORS) : [];
      }
    } catch (e) { /* ignore */ }
  }

  function saveState() {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  // ---------------- Chip UI ----------------

  function buildChip({ key, group, label, hint, swatchHex }) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip" + (swatchHex ? " chip-color" : "");
    btn.dataset.key = key;
    btn.dataset.group = group;
    btn.setAttribute("aria-pressed", "false");

    if (swatchHex) {
      const sw = document.createElement("span");
      sw.className = "swatch";
      sw.style.background = swatchHex;
      btn.appendChild(sw);
    }

    const labelWrap = document.createElement("span");
    const labelText = document.createElement("span");
    labelText.textContent = label;
    labelWrap.appendChild(labelText);
    if (hint) {
      const hintEl = document.createElement("span");
      hintEl.className = "hint";
      hintEl.textContent = hint;
      labelWrap.appendChild(hintEl);
    }
    btn.appendChild(labelWrap);
    return btn;
  }

  function renderChipGroups() {
    Object.entries(SUN_INFO).forEach(([key, info]) => {
      els.sunChips.appendChild(buildChip({ key, group: "sun", label: info.label, hint: info.hint }));
    });
    Object.entries(SOIL_INFO).forEach(([key, info]) => {
      els.soilChips.appendChild(buildChip({ key, group: "soil", label: info.label, hint: info.hint }));
    });
    Object.entries(COLOR_INFO).forEach(([key, info]) => {
      els.colorChips.appendChild(buildChip({ key, group: "color", label: info.label, swatchHex: info.hex }));
    });
  }

  function syncChipUI() {
    els.sunChips.querySelectorAll(".chip").forEach((c) => {
      c.setAttribute("aria-pressed", String(c.dataset.key === state.sun));
    });
    els.soilChips.querySelectorAll(".chip").forEach((c) => {
      c.setAttribute("aria-pressed", String(c.dataset.key === state.soil));
    });
    const colorAtMax = state.colors.length >= MAX_COLORS;
    els.colorChips.querySelectorAll(".chip").forEach((c) => {
      const active = state.colors.includes(c.dataset.key);
      c.setAttribute("aria-pressed", String(active));
      c.disabled = !active && colorAtMax;
    });
  }

  function onChipClick(e) {
    const chip = e.target.closest(".chip");
    if (!chip || chip.disabled) return;
    const { key, group } = chip.dataset;

    if (group === "sun") {
      state.sun = state.sun === key ? null : key;
    } else if (group === "soil") {
      state.soil = state.soil === key ? null : key;
    } else if (group === "color") {
      const idx = state.colors.indexOf(key);
      if (idx > -1) {
        state.colors.splice(idx, 1);
      } else if (state.colors.length < MAX_COLORS) {
        state.colors.push(key);
      }
    }
    syncChipUI();
    saveState();
  }

  // ---------------- Planning ----------------

  function matchesFilters(plant) {
    if (state.sun && !plant.sun.includes(state.sun)) return false;
    if (state.soil && !plant.soil.includes(state.soil)) return false;
    if (state.colors.length > 0) {
      const hit = plant.colors.some((c) => state.colors.includes(c));
      if (!hit) return false;
    }
    return true;
  }

  function buildMonthGroups() {
    const matched = PLANTS.filter(matchesFilters);
    const groups = [];
    for (let m = 1; m <= 12; m++) {
      const forMonth = matched
        .filter((p) => p.months.includes(m))
        .sort((a, b) => a.nameDE.localeCompare(b.nameDE, "de"));
      groups.push({ month: m, items: forMonth.slice(0, MAX_PER_MONTH), total: forMonth.length });
    }
    return { groups, matchedCount: matched.length };
  }

  function planBed() {
    if (!state.sun || !state.soil) {
      showValidation();
      return;
    }
    const { groups, matchedCount } = buildMonthGroups();
    renderSummary(matchedCount);
    renderTimeline(groups);
    els.results.hidden = false;
    els.emptyHint.style.display = "none";
    els.results.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showValidation() {
    const msg = "Bitte wähle mindestens Standort und Bodentyp aus, bevor du dein Beet planst.";
    let box = document.getElementById("validation-msg");
    if (!box) {
      box = document.createElement("p");
      box.id = "validation-msg";
      box.style.color = "#7A3B4E";
      box.style.fontSize = "0.92rem";
      box.style.marginTop = "14px";
      els.planBtn.closest(".field-actions").after(box);
    }
    box.textContent = msg;
  }

  function clearValidation() {
    const box = document.getElementById("validation-msg");
    if (box) box.remove();
  }

  function labelFor(dict, key) {
    return dict[key] ? dict[key].label : key;
  }

  function renderSummary(matchedCount) {
    const colorPart = state.colors.length
      ? state.colors.map((c) => labelFor(COLOR_INFO, c)).join(", ")
      : "alle Farben";
    let html =
      `Dein Beet: <strong>${labelFor(SUN_INFO, state.sun)}</strong> &middot; ` +
      `Boden: <strong>${labelFor(SOIL_INFO, state.soil)}</strong> (gilt für das ganze Beet) &middot; ` +
      `Blütenfarben: <strong>${colorPart}</strong> &mdash; ${matchedCount} passende Staudenarten gefunden.`;

    if (matchedCount > 0 && matchedCount < 6) {
      html += ` Diese Kombination aus Standort und Bodentyp ist anspruchsvoll &mdash; ` +
        `hier lohnt sich eventuell eine Bodenverbesserung oder etwas mehr Farbauswahl.`;
    } else if (matchedCount === 0) {
      html += ` Für diese Kombination wurde keine passende Staude gefunden &mdash; versuche einen anderen Bodentyp oder mehr Blütenfarben.`;
    }
    els.summary.innerHTML = html;
  }

  // ---------------- Timeline rendering ----------------

  function renderTimeline(groups) {
    els.timeline.innerHTML = "";
    els.timeline.classList.remove("is-revealing");

    groups.forEach(({ month, items, total }, i) => {
      const block = document.createElement("div");
      block.className = "month-block" + (items.length === 0 ? " is-empty" : "");
      block.style.animationDelay = (i * 0.035) + "s";

      const rail = document.createElement("div");
      rail.className = "month-rail";
      const dot = document.createElement("div");
      dot.className = "month-dot";
      rail.appendChild(dot);

      const body = document.createElement("div");
      body.className = "month-body";

      const heading = document.createElement("h3");
      heading.className = "month-name";
      heading.textContent = MONTH_NAMES[month];
      body.appendChild(heading);

      if (items.length === 0) {
        const note = document.createElement("p");
        note.className = "month-empty-note";
        note.textContent = "Keine passende Staude für diesen Zeitraum gefunden.";
        body.appendChild(note);
      } else {
        const row = document.createElement("div");
        row.className = "card-row";
        items.forEach((plant) => row.appendChild(renderPlantCard(plant)));
        body.appendChild(row);
        if (total > items.length) {
          const more = document.createElement("p");
          more.className = "month-empty-note";
          more.textContent = `+ ${total - items.length} weitere passende Art(en) im Sortiment möglich.`;
          body.appendChild(more);
        }
      }

      block.appendChild(rail);
      block.appendChild(body);
      els.timeline.appendChild(block);
    });

    requestAnimationFrame(() => els.timeline.classList.add("is-revealing"));
  }

  function renderPlantCard(plant) {
    const card = document.createElement("article");
    card.className = "plant-card";

    const photo = document.createElement("div");
    photo.className = "plant-photo";
    photo.innerHTML = fallbackSVG();
    card.appendChild(photo);

    const info = document.createElement("div");
    info.className = "plant-info";

    const nameDE = document.createElement("p");
    nameDE.className = "plant-name-de";
    nameDE.textContent = plant.nameDE;
    info.appendChild(nameDE);

    const nameLA = document.createElement("p");
    nameLA.className = "plant-name-la";
    nameLA.textContent = plant.nameLA;
    info.appendChild(nameLA);

    if (plant.toxic) {
      const tox = document.createElement("span");
      tox.className = "plant-toxic";
      tox.textContent = "Vorsicht: giftig";
      info.appendChild(tox);
    }

    const facts = document.createElement("ul");
    facts.className = "plant-facts";
    facts.appendChild(factRow("Blüte", monthRangeLabel(plant.months)));
    facts.appendChild(factRow("Wuchshöhe", `${plant.height[0]}–${plant.height[1]} cm`));
    facts.appendChild(factRow("Bodentyp", labelFor(SOIL_INFO, state.soil)));
    facts.appendChild(factRow("Pflanzzeit", plant.planting));
    info.appendChild(facts);

    card.appendChild(info);

    loadPlantImage(plant).then((img) => {
      if (!img) return;
      photo.innerHTML = "";
      const imgEl = document.createElement("img");
      imgEl.src = img.url;
      imgEl.alt = `${plant.nameDE} (${plant.nameLA}) in Blüte`;
      imgEl.loading = "lazy";
      photo.appendChild(imgEl);
      if (img.pageUrl) {
        const credit = document.createElement("a");
        credit.className = "credit";
        credit.href = img.pageUrl;
        credit.target = "_blank";
        credit.rel = "noopener noreferrer";
        credit.textContent = "Foto: Wikipedia";
        photo.appendChild(credit);
      }
    });

    return card;
  }

  function factRow(k, v) {
    const li = document.createElement("li");
    const kEl = document.createElement("span");
    kEl.className = "k";
    kEl.textContent = k;
    const vEl = document.createElement("span");
    vEl.className = "v";
    vEl.textContent = v;
    li.appendChild(kEl);
    li.appendChild(vEl);
    return li;
  }

  function monthRangeLabel(months) {
    // Die Monate stehen in data.js bereits in der natürlichen Blühreihenfolge
    // (z.B. [11,12,1,2,3] für Winterblüher) — daher genügt erstes/letztes Element.
    if (months.length === 1) return MONTH_SHORT[months[0]];
    return `${MONTH_SHORT[months[0]]}–${MONTH_SHORT[months[months.length - 1]]}`;
  }

  function fallbackSVG() {
    return `<div class="ph-fallback" aria-hidden="true">
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(28,26)">
          <ellipse rx="8" ry="14" fill="#B87F2A" transform="rotate(0)"/>
          <ellipse rx="8" ry="14" fill="#7A3B4E" transform="rotate(60)"/>
          <ellipse rx="8" ry="14" fill="#B87F2A" transform="rotate(120)"/>
          <ellipse rx="8" ry="14" fill="#7A3B4E" transform="rotate(180)"/>
          <ellipse rx="8" ry="14" fill="#B87F2A" transform="rotate(240)"/>
          <ellipse rx="8" ry="14" fill="#7A3B4E" transform="rotate(300)"/>
          <circle r="5.5" fill="#FBF8EF"/>
        </g>
      </svg>
    </div>`;
  }

  // ---------------- Wikipedia image lookup ----------------

  const memCache = new Map();

  function readDiskCache() {
    try {
      return JSON.parse(localStorage.getItem(IMG_CACHE_KEY)) || {};
    } catch (e) { return {}; }
  }

  function writeDiskCache(cache) {
    try { localStorage.setItem(IMG_CACHE_KEY, JSON.stringify(cache)); } catch (e) { /* ignore, e.g. quota */ }
  }

  async function fetchSummary(title) {
    const url = `https://de.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("not found");
    return res.json();
  }

  async function loadPlantImage(plant) {
    if (memCache.has(plant.id)) return memCache.get(plant.id);

    const disk = readDiskCache();
    const cached = disk[plant.id];
    if (cached && Date.now() - cached.ts < IMG_CACHE_TTL_MS) {
      memCache.set(plant.id, cached.data);
      return cached.data;
    }

    const candidates = [plant.nameLA, plant.nameDE];
    let result = null;
    for (const title of candidates) {
      try {
        const data = await fetchSummary(title);
        const src = data.thumbnail && data.thumbnail.source;
        if (src) {
          result = {
            url: src.replace(/\/\d+px-/, "/480px-"),
            pageUrl: data.content_urls && data.content_urls.desktop && data.content_urls.desktop.page,
          };
          break;
        }
      } catch (e) { /* try next candidate */ }
    }

    memCache.set(plant.id, result);
    if (result) {
      disk[plant.id] = { ts: Date.now(), data: result };
      writeDiskCache(disk);
    }
    return result;
  }

  // ---------------- Init ----------------

  function resetAll() {
    state.sun = null;
    state.soil = null;
    state.colors = [];
    syncChipUI();
    saveState();
    clearValidation();
    els.results.hidden = true;
    els.emptyHint.style.display = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function init() {
    renderChipGroups();
    loadState();
    syncChipUI();

    els.sunChips.addEventListener("click", (e) => { onChipClick(e); clearValidation(); });
    els.soilChips.addEventListener("click", (e) => { onChipClick(e); clearValidation(); });
    els.colorChips.addEventListener("click", onChipClick);
    els.planBtn.addEventListener("click", planBed);
    els.resetBtn.addEventListener("click", resetAll);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
