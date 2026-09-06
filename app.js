/* ============================================================
   Staudenbeet-Planer — App-Logik
   ============================================================ */

(function () {
  "use strict";

  const APP_VERSION = "0.2";
  const MAX_PER_MONTH = 3;
  const IMG_CACHE_KEY = "staudenbeet:imgcache:v2";
  const STATE_KEY = "staudenbeet:selection:v2";
  const IMG_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 Tage

  // Alle drei Filter sind jetzt Mehrfachauswahl-Listen. Leer = keine Einschraenkung.
  const state = {
    sun: [],
    soil: [],
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
    versionTag: document.getElementById("app-version"),
  };

  // ---------------- Persistence ----------------

  function loadState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved && typeof saved === "object") {
        state.sun = Array.isArray(saved.sun) ? saved.sun : [];
        state.soil = Array.isArray(saved.soil) ? saved.soil : [];
        state.colors = Array.isArray(saved.colors) ? saved.colors : [];
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

  // Keine Obergrenzen mehr irgendwo -- jede Chip-Gruppe ist frei kombinierbar,
  // inkl. "alles auswaehlen". Leere Auswahl bedeutet weiterhin "keine Einschraenkung".
  function syncChipUI() {
    els.sunChips.querySelectorAll(".chip").forEach((c) => {
      c.setAttribute("aria-pressed", String(state.sun.includes(c.dataset.key)));
    });
    els.soilChips.querySelectorAll(".chip").forEach((c) => {
      c.setAttribute("aria-pressed", String(state.soil.includes(c.dataset.key)));
    });
    els.colorChips.querySelectorAll(".chip").forEach((c) => {
      c.setAttribute("aria-pressed", String(state.colors.includes(c.dataset.key)));
    });
  }

  function toggleInArray(arr, key) {
    const idx = arr.indexOf(key);
    if (idx > -1) arr.splice(idx, 1);
    else arr.push(key);
  }

  function onChipClick(e) {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const { key, group } = chip.dataset;

    if (group === "sun") toggleInArray(state.sun, key);
    else if (group === "soil") toggleInArray(state.soil, key);
    else if (group === "color") toggleInArray(state.colors, key);

    syncChipUI();
    saveState();
  }

  // ---------------- Planning ----------------

  function matchesFilters(plant) {
    if (state.sun.length > 0 && !plant.sun.some((s) => state.sun.includes(s))) return false;
    if (state.soil.length > 0 && !plant.soil.some((s) => state.soil.includes(s))) return false;
    if (state.colors.length > 0 && !plant.colors.some((c) => state.colors.includes(c))) return false;
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
    const { groups, matchedCount } = buildMonthGroups();
    renderSummary(matchedCount);
    renderTimeline(groups);
    els.results.hidden = false;
    els.emptyHint.style.display = "none";
    els.results.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function labelFor(dict, key) {
    return dict[key] ? dict[key].label : key;
  }

  function joinLabels(dict, keys, allText) {
    if (!keys.length) return allText;
    return keys.map((k) => labelFor(dict, k)).join(", ");
  }

  function renderSummary(matchedCount) {
    let html =
      `Standort: <strong>${joinLabels(SUN_INFO, state.sun, "alle Standorte")}</strong> &middot; ` +
      `Boden: <strong>${joinLabels(SOIL_INFO, state.soil, "alle Bodentypen")}</strong> &middot; ` +
      `Blütenfarben: <strong>${joinLabels(COLOR_INFO, state.colors, "alle Farben")}</strong> ` +
      `&mdash; ${matchedCount} passende Staudenarten gefunden.`;

    if (state.soil.length > 1) {
      html += ` Hinweis: Für ein einheitliches Beet am besten am Ende auf einen der angezeigten Bodentypen festlegen — jede Karte zeigt, welchen sie konkret braucht.`;
    }
    if (matchedCount > 0 && matchedCount < 6) {
      html += ` Diese Kombination ist anspruchsvoll &mdash; hier lohnt sich eventuell eine Bodenverbesserung oder etwas mehr Auswahl.`;
    } else if (matchedCount === 0) {
      html += ` Für diese Kombination wurde keine passende Staude gefunden &mdash; versuche eine breitere Auswahl.`;
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
    facts.appendChild(factRow("Bodentyp", plant.soil.map((s) => labelFor(SOIL_INFO, s)).join(" / ")));
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
      imgEl.onerror = () => { photo.innerHTML = fallbackSVG(); };
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
  //
  // Reihenfolge pro Pflanze: 1) manuelles wikiTitle (falls hinterlegt),
  // 2) botanischer Name, 3) deutscher Name, 4) Wikipedia-Volltextsuche
  // (opensearch) als letzter Versuch. Ergebnisse werden im Speicher UND
  // in localStorage gecacht (30 Tage), damit spaetere Besuche schneller sind.
  //
  // Laeuft die Seite lokal ueber file:// (Doppelklick auf index.html) statt
  // ueber einen Webserver, blockt der Browser diese Netzwerk-Aufrufe aus
  // Sicherheitsgruenden (CORS) -- dann bleibt das Blueten-Icon als Platzhalter
  // stehen. Ueber GitHub Pages oder "python3 -m http.server" funktioniert
  // es normal.

  const memCache = new Map();

  function readDiskCache() {
    try { return JSON.parse(localStorage.getItem(IMG_CACHE_KEY)) || {}; }
    catch (e) { return {}; }
  }

  function writeDiskCache(cache) {
    try { localStorage.setItem(IMG_CACHE_KEY, JSON.stringify(cache)); } catch (e) { /* ignore */ }
  }

  // Primärer Weg: die klassische MediaWiki-Action-API mit "origin=*" — das ist
  // der offiziell von Wikimedia dokumentierte Weg, um CORS-Anfragen von einer
  // beliebigen Domain aus zu erlauben (zuverlässiger als der neuere REST-Weg,
  // der bei 404-Antworten laut Wikimedia-Bugtracker teils die CORS-Header verliert).
  // "redirects=1" löst z.B. "Helleborus x hybridus" -> "Lenzrose" automatisch auf.
  async function fetchViaActionApi(title) {
    const url = `https://de.wikipedia.org/w/api.php?action=query&format=json&origin=*` +
      `&prop=pageimages|info&piprop=thumbnail|original&pithumbsize=480&inprop=url` +
      `&redirects=1&titles=${encodeURIComponent(title)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("action api failed: " + title);
    const data = await res.json();
    const pages = data && data.query && data.query.pages;
    if (!pages) return null;
    const page = Object.values(pages)[0];
    if (!page || page.missing !== undefined) return null;
    const src = page.thumbnail && page.thumbnail.source;
    if (!src) return null;
    return { url: src, pageUrl: page.fullurl };
  }

  // Fallback 1: RESTBase-Zusammenfassung (anderer Dienst, andere Fehlerquellen).
  async function fetchSummary(title) {
    const url = `https://de.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("summary not found: " + title);
    return res.json();
  }

  // Fallback 2: Volltextsuche, falls der Titel nirgends direkt passt.
  async function findTitleViaSearch(query) {
    const url = `https://de.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&namespace=0&format=json&origin=*`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("opensearch failed");
    const data = await res.json();
    return data && data[1] && data[1][0];
  }

  function summaryToResult(data) {
    const src = data.thumbnail && data.thumbnail.source;
    if (!src) return null;
    return {
      url: src.replace(/\/\d+px-/, "/480px-"),
      pageUrl: data.content_urls && data.content_urls.desktop && data.content_urls.desktop.page,
    };
  }

  async function loadPlantImage(plant) {
    if (memCache.has(plant.id)) return memCache.get(plant.id);

    const disk = readDiskCache();
    const cached = disk[plant.id];
    if (cached && Date.now() - cached.ts < IMG_CACHE_TTL_MS) {
      memCache.set(plant.id, cached.data);
      return cached.data;
    }

    const candidates = [plant.wikiTitle, plant.nameLA, plant.nameDE].filter(Boolean);
    let result = null;

    // 1) Action-API pro Kandidat (primär)
    for (const title of candidates) {
      try {
        result = await fetchViaActionApi(title);
        if (result) break;
      } catch (e) { /* naechster Kandidat */ }
    }

    // 2) RESTBase-Zusammenfassung pro Kandidat (falls Action-API nichts fand)
    if (!result) {
      for (const title of candidates) {
        try {
          const data = await fetchSummary(title);
          result = summaryToResult(data);
          if (result) break;
        } catch (e) { /* naechster Kandidat */ }
      }
    }

    // 3) Volltextsuche als letzter Versuch
    if (!result) {
      try {
        const found = await findTitleViaSearch(plant.nameLA);
        if (found) {
          result = await fetchViaActionApi(found);
        }
      } catch (e) { /* kein Treffer ueber die Suche */ }
    }

    memCache.set(plant.id, result);
    if (result) {
      disk[plant.id] = { ts: Date.now(), data: result };
      writeDiskCache(disk);
    } else if (typeof console !== "undefined") {
      console.warn("Staudenbeet-Planer: kein Foto gefunden für", plant.nameDE, "(" + plant.nameLA + ")");
    }
    return result;
  }

  // ---------------- Init ----------------

  function resetAll() {
    state.sun = [];
    state.soil = [];
    state.colors = [];
    syncChipUI();
    saveState();
    els.results.hidden = true;
    els.emptyHint.style.display = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function init() {
    renderChipGroups();
    loadState();
    syncChipUI();

    if (els.versionTag) els.versionTag.textContent = "v" + APP_VERSION;

    els.sunChips.addEventListener("click", onChipClick);
    els.soilChips.addEventListener("click", onChipClick);
    els.colorChips.addEventListener("click", onChipClick);
    els.planBtn.addEventListener("click", planBed);
    els.resetBtn.addEventListener("click", resetAll);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
