/* =========================================================
   Mozambique: A Country Guide — shared behaviour
   Every module checks for its own markup, so one file serves every page.
   ========================================================= */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const SVG_NS = "http://www.w3.org/2000/svg";

  const svgEl = (tag, attrs = {}, parent) => {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    if (parent) parent.appendChild(el);
    return el;
  };

  /* ---------- Navigation ---------- */
  const page = document.body.dataset.page;
  if (page) {
    $$(".nav-links a").forEach((a) => {
      if (a.dataset.page === page) a.setAttribute("aria-current", "page");
    });
  }

  const navToggle = $("#navToggle");
  const siteNav = $("#siteNav");
  if (navToggle && siteNav) {
    const setOpen = (open) => {
      siteNav.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
    };
    navToggle.addEventListener("click", () => setOpen(!siteNav.classList.contains("open")));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    $$("a", siteNav).forEach((a) => a.addEventListener("click", () => setOpen(false)));
  }

  /* ---------- Shared tooltip ---------- */
  let tip = null;
  const showTip = (html, x, y) => {
    if (!tip) {
      tip = document.createElement("div");
      tip.className = "tooltip";
      tip.setAttribute("role", "presentation");
      document.body.appendChild(tip);
    }
    tip.replaceChildren(...html);
    tip.hidden = false;
    const pad = 14;
    const r = tip.getBoundingClientRect();
    let left = x + pad;
    let top = y + pad;
    if (left + r.width > window.innerWidth - 8) left = x - r.width - pad;
    if (top + r.height > window.innerHeight - 8) top = y - r.height - pad;
    tip.style.left = `${Math.max(8, left)}px`;
    tip.style.top = `${Math.max(8, top)}px`;
  };
  const hideTip = () => { if (tip) tip.hidden = true; };
  const tipLines = (strong, rest) => {
    const s = document.createElement("strong");
    s.textContent = strong;
    const span = document.createElement("span");
    span.textContent = rest;
    return [s, span];
  };

  /* =========================================================
     Map of Mozambique
     Geometry comes from map-data.js (window.MOZ_MAP). The same
     projection is used here so labels and pins can be placed by
     latitude and longitude.
     ========================================================= */
  const K = 36;
  const C = Math.cos((18.5 * Math.PI) / 180);
  const project = (lon, lat) => [(lon - 29.6) * C * K, (-9.8 - lat) * K];

  const PROVINCES = {
    "MZ-A": {
      name: "Niassa", region: "north", capital: "Lichinga", area: 129056,
      peoples: "Yao, Makhuwa, Nyanja",
      text: "Mozambique's largest and most thinly populated province. Its western edge is the shore of Lake Niassa, and much of the north lies inside the Niassa Reserve, one of the largest protected wildernesses in Africa.",
      label: [37.2, -13.6]
    },
    "MZ-P": {
      name: "Cabo Delgado", region: "north", capital: "Pemba", area: 82625,
      peoples: "Makhuwa, Makonde, Mwani",
      text: "The far north-east. The Quirimbas islands and the old trading town of Ibo lie offshore, the Makonde plateau rises inland around Mueda, and large natural gas fields lie under the sea near Palma. An armed insurgency has affected the province since 2017.",
      label: [39.4, -12.55]
    },
    "MZ-N": {
      name: "Nampula", region: "north", capital: "Nampula", area: 81606,
      peoples: "Makhuwa, Lomwe",
      text: "The most populous province and the heartland of the Makhuwa people. Its coast holds Ilha de Moçambique, the island that gave the country its name, and the deep-water port of Nacala.",
      label: [37.75, -14.65]
    },
    "MZ-Q": {
      name: "Zambézia", region: "centre", capital: "Quelimane", area: 105008,
      peoples: "Lomwe, Chuwabo, Sena, Makhuwa",
      text: "Fertile, well-watered country between the lower Zambezi and the Ligonha river, known for tea around Gurúè, coconut groves and rice. The granite massifs of Namuli and Mabu rise from its interior.",
      label: [37.0, -16.55]
    },
    "MZ-T": {
      name: "Tete", region: "centre", capital: "Tete", area: 100724,
      peoples: "Nyungwe, Sena, Chewa",
      text: "A hot inland wedge between Zambia, Malawi and Zimbabwe. The Zambezi crosses it, held back by the Cahora Bassa dam, and the coal mines around Moatize are among the largest in Africa.",
      label: [32.3, -15.0]
    },
    "MZ-B": {
      name: "Manica", region: "centre", capital: "Chimoio", area: 61661,
      peoples: "Manyika, Ndau, Teve, Sena",
      text: "Highland country along the Zimbabwe border, including the Chimanimani range and Monte Binga (2,436 m), the highest point in Mozambique. The road and railway of the Beira Corridor cross it on their way inland.",
      label: [33.2, -17.6]
    },
    "MZ-S": {
      name: "Sofala", region: "centre", capital: "Beira", area: 68018,
      peoples: "Sena, Ndau",
      text: "Named after the medieval gold port on its coast. Beira is the country's second port and the sea gateway for Zimbabwe, Zambia and Malawi. Gorongosa National Park lies inland, at the southern end of the Great Rift Valley.",
      label: [34.55, -20.35]
    },
    "MZ-I": {
      name: "Inhambane", region: "south", capital: "Inhambane", area: 68615,
      peoples: "Tswa, Chopi, Bitonga",
      text: "A coast of palm groves, dunes and lagoons. The Bazaruto Archipelago lies offshore, and the waters off Tofo are known for whale sharks and manta rays. It is the home of the Chopi and their timbila orchestras.",
      label: [34.3, -22.9]
    },
    "MZ-G": {
      name: "Gaza", region: "south", capital: "Xai-Xai", area: 75709,
      peoples: "Changana",
      text: "The Limpopo valley and its floodplains, heartland of the 19th-century Gaza Empire. Limpopo National Park, on the western border, is part of a park shared with South Africa and Zimbabwe.",
      label: [32.55, -23.2]
    },
    "MZ-L": {
      name: "Maputo", region: "south", capital: "Matola", area: 26058,
      peoples: "Ronga, Changana",
      text: "The smallest province, wrapped around the capital. Maputo City is governed separately with the status of a province (347 km²). Matola is an industrial hub, and Maputo National Park runs south to the South African border.",
      label: [32.45, -25.25]
    }
  };
  const REGION_NAME = { north: "North", centre: "Centre", south: "South" };

  const CITIES = [
    { name: "Maputo", ll: [32.573, -25.969], capital: true, anchor: "start", dx: 7, dy: 4 },
    { name: "Beira", ll: [34.839, -19.844], anchor: "start", dx: 6, dy: 4 },
    { name: "Nampula", ll: [39.267, -15.117], anchor: "end", dx: -6, dy: 4 },
    { name: "Quelimane", ll: [36.888, -17.879], anchor: "start", dx: 6, dy: 4 },
    { name: "Tete", ll: [33.587, -16.156], anchor: "start", dx: 6, dy: 4 },
    { name: "Chimoio", ll: [33.483, -19.116], anchor: "end", dx: -6, dy: 4 },
    { name: "Pemba", ll: [40.518, -12.974], anchor: "end", dx: -6, dy: 4 },
    { name: "Lichinga", ll: [35.241, -13.313], anchor: "start", dx: 6, dy: 4 },
    { name: "Inhambane", ll: [35.383, -23.865], anchor: "start", dx: 6, dy: 4 },
    { name: "Xai-Xai", ll: [33.644, -25.052], anchor: "start", dx: 6, dy: 4 },
    { name: "Ilha de Moçambique", ll: [40.736, -15.034], anchor: "end", dx: 4, dy: 17 }
  ];

  const COUNTRY_LABELS = [
    { t: "TANZANIA", ll: [37.6, -10.25] },
    { t: "MALAWI", ll: [33.55, -13.1] },
    { t: "ZAMBIA", ll: [30.6, -14.3] },
    { t: "ZIMBABWE", ll: [31.2, -18.6] },
    { t: "SOUTH", ll: [30.75, -24.3] },
    { t: "AFRICA", ll: [30.75, -24.62] },
    { t: "ESWATINI", ll: [31.35, -26.95] }
  ];
  const SEA_LABELS = [
    { t: "Mozambique", ll: [39.0, -19.9] },
    { t: "Channel", ll: [39.0, -20.3] },
    { t: "INDIAN OCEAN", ll: [38.4, -25.6], cls: "t-country" }
  ];
  const RIVER_LABELS = [
    { t: "Zambezi", ll: [34.35, -17.0], rot: 33 },
    { t: "Limpopo", ll: [32.35, -23.4], rot: 52 },
    { t: "Rovuma", ll: [38.1, -11.3], rot: -8 },
    { t: "Save", ll: [33.55, -21.1], rot: -8 },
    { t: "Lúrio", ll: [39.3, -13.85], rot: -12 },
    { t: "L. Niassa", ll: [34.85, -12.4], rot: -78 },
    { t: "Cahora Bassa", ll: [31.9, -15.95], rot: 0 }
  ];

  const MozMap = {
    render(host, opts = {}) {
      const data = window.MOZ_MAP;
      if (!data || !host) return null;
      const o = Object.assign({
        mode: "regions", provinceLabels: true, rivers: true, riverLabels: false,
        cities: false, countries: true, seaLabels: true, pins: [], interactive: false, title: "Map of Mozambique"
      }, opts);

      host.classList.add("map");
      if (o.mode === "plain") host.classList.add("plain");
      if (o.interactive) host.classList.add("interactive");

      const svg = svgEl("svg", { viewBox: `0 0 ${data.W} ${data.H}`, role: o.interactive ? "group" : "img", "aria-label": o.title });
      svgEl("rect", { class: "sea", x: 0, y: 0, width: data.W, height: data.H }, svg);

      if (o.countries) {
        const g = svgEl("g", { "aria-hidden": "true" }, svg);
        data.neighbours.forEach((n) => svgEl("path", { class: "out", d: n.d }, g));
      }

      const provGroup = svgEl("g", {}, svg);
      const provEls = {};
      data.provinces.forEach((p) => {
        const info = PROVINCES[p.iso] || {};
        const path = svgEl("path", { class: `prov ${info.region || ""}`, d: p.d, "data-iso": p.iso }, provGroup);
        if (o.interactive) {
          path.setAttribute("tabindex", "0");
          path.setAttribute("role", "button");
          path.setAttribute("aria-label", `${info.name} province, ${REGION_NAME[info.region]} region`);
        } else {
          svgEl("title", {}, path).textContent = `${info.name} (${REGION_NAME[info.region]})`;
        }
        provEls[p.iso] = path;
      });

      const water = svgEl("g", { "aria-hidden": "true" }, svg);
      data.lakes.forEach((l) => svgEl("path", { class: "lake", d: l.d }, water));
      if (o.rivers) data.rivers.forEach((r) => svgEl("path", { class: "river", d: r.d }, water));

      const labels = svgEl("g", { "aria-hidden": "true" }, svg);
      const text = (t, x, y, cls, extra = {}) => {
        const el = svgEl("text", Object.assign({ x: x.toFixed(1), y: y.toFixed(1), class: cls, "text-anchor": "middle" }, extra), labels);
        el.textContent = t;
        return el;
      };

      if (o.countries) COUNTRY_LABELS.forEach((c) => { const [x, y] = project(...c.ll); text(c.t, x, y, "t-country"); });
      if (o.seaLabels) SEA_LABELS.forEach((c) => { const [x, y] = project(...c.ll); text(c.t, x, y, c.cls || "t-sea"); });
      if (o.riverLabels) {
        RIVER_LABELS.forEach((r) => {
          const [x, y] = project(...r.ll);
          text(r.t, x, y, "t-river", { transform: `rotate(${r.rot} ${x.toFixed(1)} ${y.toFixed(1)})` });
        });
      }
      if (o.provinceLabels) {
        Object.entries(PROVINCES).forEach(([iso, info]) => {
          const [x, y] = project(...info.label);
          text(info.name, x, y, "t-prov", { "data-iso": iso });
        });
      }

      if (o.cities) {
        const cg = svgEl("g", { "aria-hidden": "true" }, svg);
        CITIES.forEach((c) => {
          const [x, y] = project(...c.ll);
          if (c.capital) {
            const r1 = 6.5, r2 = 2.7;
            const pts = [];
            for (let i = 0; i < 10; i++) {
              const r = i % 2 ? r2 : r1;
              const a = -Math.PI / 2 + (i * Math.PI) / 5;
              pts.push(`${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`);
            }
            svgEl("polygon", { class: "capital", points: pts.join(" ") }, cg);
          } else {
            svgEl("circle", { class: "city", cx: x.toFixed(1), cy: y.toFixed(1), r: 3 }, cg);
          }
          const t = svgEl("text", { x: (x + c.dx).toFixed(1), y: (y + c.dy).toFixed(1), class: "t-city", "text-anchor": c.anchor }, cg);
          t.textContent = c.name;
        });
      }

      const pinEls = {};
      if (o.pins.length) {
        const pg = svgEl("g", {}, svg);
        o.pins.forEach((p) => {
          const [x, y] = project(...p.ll);
          const g = svgEl("g", { class: `pin ${p.kind || ""}`, "data-id": p.id, tabindex: "0", role: "button", "aria-label": p.name }, pg);
          svgEl("circle", { class: "hit", cx: x.toFixed(1), cy: y.toFixed(1), r: 12 }, g);
          svgEl("circle", { class: "mark", cx: x.toFixed(1), cy: y.toFixed(1), r: 5.5 }, g);
          if (p.short) {
            const t = svgEl("text", { x: (x + (p.dx ?? 9)).toFixed(1), y: (y + (p.dy ?? 3.5)).toFixed(1), class: "t-pin", "text-anchor": p.anchor || "start" }, g);
            t.textContent = p.short;
          }
          pinEls[p.id] = g;
        });
      }

      host.prepend(svg);
      return { svg, provEls, pinEls };
    }
  };
  window.MozMap = MozMap;

  const fmt = (n) => n.toLocaleString("en-GB");

  /* ---------- Home hero map ---------- */
  const heroMap = $("#heroMap");
  if (heroMap) MozMap.render(heroMap, { mode: "regions", provinceLabels: true, rivers: true, title: "Map of Mozambique's ten provinces, shaded by region" });

  /* ---------- Geography: interactive province map ---------- */
  const geoMap = $("#provinceMap");
  if (geoMap) {
    const m = MozMap.render(geoMap, {
      mode: "regions", provinceLabels: true, rivers: true, riverLabels: true, cities: true, interactive: true,
      title: "Interactive map of Mozambique's provinces"
    });
    const panel = $("#provPanel");
    const list = $("#provList");
    const regionToggle = $("#toggleRegions");
    const cityToggle = $("#toggleCities");
    const riverToggle = $("#toggleRivers");
    let active = null;

    const buttons = {};
    Object.entries(PROVINCES).forEach(([iso, info]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = info.name;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => select(iso));
      list.appendChild(b);
      buttons[iso] = b;
    });

    const select = (iso) => {
      const info = PROVINCES[iso];
      if (!info) return;
      active = iso;
      geoMap.classList.add("has-active");
      Object.entries(m.provEls).forEach(([k, el]) => el.classList.toggle("active", k === iso));
      Object.entries(buttons).forEach(([k, b]) => b.setAttribute("aria-pressed", String(k === iso)));
      $("[data-f='name']", panel).textContent = info.name;
      $("[data-f='region']", panel).textContent = `${REGION_NAME[info.region]} region`;
      $("[data-f='swatch']", panel).className = `swatch ${info.region}`;
      $("[data-f='capital']", panel).textContent = info.capital;
      $("[data-f='area']", panel).textContent = `${fmt(info.area)} km²`;
      $("[data-f='share']", panel).textContent = `${((info.area / 799380) * 100).toFixed(1)}%`;
      $("[data-f='peoples']", panel).textContent = info.peoples;
      $("[data-f='text']", panel).textContent = info.text;
    };

    Object.entries(m.provEls).forEach(([iso, el]) => {
      el.addEventListener("click", () => select(iso));
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(iso); }
      });
      el.addEventListener("pointermove", (e) => {
        const info = PROVINCES[iso];
        showTip(tipLines(info.name, `${REGION_NAME[info.region]} · capital ${info.capital}`), e.clientX, e.clientY);
      });
      el.addEventListener("pointerleave", hideTip);
    });

    if (regionToggle) regionToggle.addEventListener("change", () => geoMap.classList.toggle("plain", !regionToggle.checked));
    if (cityToggle) cityToggle.addEventListener("change", () => { $$(".city, .capital, .t-city", geoMap).forEach((el) => { el.style.display = cityToggle.checked ? "" : "none"; }); });
    if (riverToggle) riverToggle.addEventListener("change", () => { $$(".river, .t-river", geoMap).forEach((el) => { el.style.display = riverToggle.checked ? "" : "none"; }); });

    select("MZ-S");
  }

  /* ---------- Wildlife: protected areas map ---------- */
  const parkMap = $("#parkMap");
  if (parkMap) {
    const cards = $$("[data-park]");
    const pins = cards.map((c) => ({
      id: c.dataset.park,
      name: c.querySelector("h3").textContent,
      ll: c.dataset.ll.split(",").map(Number),
      kind: c.dataset.kind,
      short: c.dataset.short,
      anchor: c.dataset.anchor,
      dx: c.dataset.dx ? Number(c.dataset.dx) : undefined,
      dy: c.dataset.dy ? Number(c.dataset.dy) : undefined
    }));
    const m = MozMap.render(parkMap, { mode: "plain", provinceLabels: false, rivers: true, pins, title: "Map of Mozambique's main national parks and reserves" });

    const highlight = (id, on) => {
      const pin = m.pinEls[id];
      const card = cards.find((c) => c.dataset.park === id);
      if (pin) pin.classList.toggle("hl", on);
      if (card) card.classList.toggle("hl", on);
    };
    Object.entries(m.pinEls).forEach(([id, g]) => {
      const card = cards.find((c) => c.dataset.park === id);
      g.addEventListener("pointerenter", () => highlight(id, true));
      g.addEventListener("pointerleave", () => highlight(id, false));
      g.addEventListener("focus", () => highlight(id, true));
      g.addEventListener("blur", () => highlight(id, false));
      const go = () => card && card.scrollIntoView({ behavior: "smooth", block: "center" });
      g.addEventListener("click", go);
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });
    cards.forEach((c) => {
      c.addEventListener("pointerenter", () => highlight(c.dataset.park, true));
      c.addEventListener("pointerleave", () => highlight(c.dataset.park, false));
    });
  }

  /* ---------- Filterable card grids ---------- */
  $$("[data-filter-for]").forEach((bar) => {
    const target = document.getElementById(bar.dataset.filterFor);
    if (!target) return;
    const items = $$("[data-tags]", target);
    const count = $("[data-filter-count]", bar);
    const empty = document.getElementById(`${bar.dataset.filterFor}-empty`);
    const noun = bar.dataset.noun || "items";
    const buttons = $$("button[data-value]", bar);

    const apply = (value) => {
      let shown = 0;
      items.forEach((it) => {
        const match = value === "all" || it.dataset.tags.split(" ").includes(value);
        it.hidden = !match;
        if (match) shown += 1;
      });
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.value === value)));
      if (count) count.textContent = `${shown} of ${items.length} ${noun}`;
      if (empty) empty.hidden = shown !== 0;
    };
    buttons.forEach((b) => b.addEventListener("click", () => apply(b.dataset.value)));
    apply("all");
  });

  /* ---------- History: highlight the era in view ---------- */
  const eraNav = $(".era-nav");
  if (eraNav && "IntersectionObserver" in window) {
    const links = $$("a", eraNav);
    const byId = Object.fromEntries(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const list = $("ol", eraNav);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const a = byId[en.target.id];
        if (!a) return;
        links.forEach((l) => l.classList.toggle("active", l === a));
        const left = a.offsetLeft - list.clientWidth / 2 + a.clientWidth / 2;
        list.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    $$(".era").forEach((s) => io.observe(s));
  }

  /* ---------- Languages: bar chart built from the data table ---------- */
  const chartHost = $("#langChart");
  const dataTable = $("#langData");
  if (chartHost && dataTable) {
    const rows = $$("tbody tr", dataTable).map((tr) => {
      const cells = $$("td", tr);
      return {
        name: cells[0].textContent.trim(),
        note: cells[1].textContent.trim(),
        value: parseFloat(cells[2].textContent),
        muted: tr.hasAttribute("data-muted")
      };
    });
    const max = 30;
    const ul = document.createElement("ul");
    ul.className = "bars";
    rows.forEach((r, i) => {
      const li = document.createElement("li");
      li.className = `bar-row${r.muted ? " muted-bar" : ""}`;
      li.tabIndex = 0;
      li.setAttribute("aria-label", `${r.name}: ${r.value}% of people speak it as their first language`);
      const name = document.createElement("div");
      name.className = "name";
      name.textContent = r.name;
      if (r.note) {
        const small = document.createElement("small");
        small.textContent = r.note;
        name.appendChild(small);
      }
      const track = document.createElement("div");
      track.className = "bar-track";
      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.width = `calc((100% - 3.5rem) * ${(r.value / max).toFixed(4)})`;
      const val = document.createElement("span");
      val.className = "bar-val";
      val.textContent = `${r.value.toFixed(1)}%`;
      track.append(bar, val);
      li.append(name, track);
      const show = (x, y) => showTip(tipLines(`${r.value.toFixed(1)}%`, r.muted ? r.name : `${r.name} · rank ${i + 1} of the named languages`), x, y);
      li.addEventListener("pointermove", (e) => show(e.clientX, e.clientY));
      li.addEventListener("pointerleave", hideTip);
      li.addEventListener("focus", () => { const b = li.getBoundingClientRect(); show(b.left + b.width / 2, b.top); });
      li.addEventListener("blur", hideTip);
      ul.appendChild(li);
    });
    chartHost.appendChild(ul);
  }

  /* ---------- Home: quiz ---------- */
  const quiz = $("#quiz");
  if (quiz) {
    const QUESTIONS = [
      { q: "On what date did Mozambique become independent from Portugal?", a: ["25 September 1964", "25 June 1975", "4 October 1992", "7 September 1974"], c: 1,
        why: "Samora Machel proclaimed independence on 25 June 1975. The other dates mark the start of the armed struggle, the Rome peace accords and the Lusaka Accord." },
      { q: "Which language do the most Mozambicans speak as their first language?", a: ["Portuguese", "Swahili", "Emakhuwa", "Xichangana"], c: 2,
        why: "About a quarter of people grow up speaking Emakhuwa. Portuguese is the official language and is spoken by about half the population, but it is the first language of roughly one person in six." },
      { q: "Which river is held back by the Cahora Bassa dam?", a: ["Limpopo", "Zambezi", "Rovuma", "Save"], c: 1,
        why: "Cahora Bassa, finished in 1974 in Tete province, dams the Zambezi and forms a lake nearly 300 km long." },
      { q: "What unusual object appears on the national flag?", a: ["A fishing boat", "An AK-47 rifle", "A baobab tree", "A cashew nut"], c: 1,
        why: "The emblem shows a rifle with a bayonet crossed with a hoe over an open book. It stands for defence and vigilance, beside agriculture and education." },
      { q: "Where does the name 'Mozambique' come from?", a: ["A river in the north", "A Portuguese navigator", "An island named after a local ruler", "A Bantu word for 'coast'"], c: 2,
        why: "Ilha de Moçambique is usually said to be named after Mussa Bin Bique, the sheikh who ruled the island when the Portuguese arrived in 1498. The name later spread to the whole colony." },
      { q: "Which rare marine mammal survives in the seagrass of the Bazaruto Archipelago?", a: ["Manatee", "Dugong", "Monk seal", "Sea otter"], c: 1,
        why: "Bazaruto holds the last viable population of dugongs on the East African coast." },
      { q: "In 1995 Mozambique became the first country to join the Commonwealth without…", a: ["a coastline", "a king or queen", "ever having been a British colony", "an army"], c: 2,
        why: "Its neighbours were all Commonwealth members, and Mozambique was admitted in 1995 as a special case, the first member never ruled by Britain." }
    ];

    const qEl = $("#quizQ", quiz);
    const optsEl = $("#quizOptions", quiz);
    const fb = $("#quizFeedback", quiz);
    const next = $("#quizNext", quiz);
    const counter = $("#quizCount", quiz);
    const scoreEl = $("#quizScore", quiz);
    const bar = $("#quizProgress", quiz);
    let idx = 0;
    let score = 0;
    let answered = false;

    const render = () => {
      const item = QUESTIONS[idx];
      answered = false;
      counter.textContent = `Question ${idx + 1} of ${QUESTIONS.length}`;
      scoreEl.textContent = `Score ${score}`;
      bar.style.width = `${(idx / QUESTIONS.length) * 100}%`;
      qEl.textContent = item.q;
      fb.textContent = "";
      next.hidden = true;
      optsEl.replaceChildren();
      item.a.forEach((text, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.id = `quiz-opt-${i}`;
        const span = document.createElement("span");
        span.textContent = text;
        b.appendChild(span);
        b.addEventListener("click", () => choose(i));
        optsEl.appendChild(b);
      });
    };

    const mark = (btn, label, cls) => {
      btn.classList.add(cls);
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = label;
      btn.appendChild(tag);
    };

    const choose = (i) => {
      if (answered) return;
      answered = true;
      const item = QUESTIONS[idx];
      const btns = $$("button", optsEl);
      btns.forEach((b) => { b.disabled = true; });
      if (i === item.c) {
        score += 1;
        mark(btns[i], "Correct", "right");
        fb.textContent = item.why;
      } else {
        mark(btns[i], "Your answer", "wrong");
        mark(btns[item.c], "Answer", "right");
        fb.textContent = item.why;
      }
      scoreEl.textContent = `Score ${score}`;
      next.textContent = idx === QUESTIONS.length - 1 ? "See result" : "Next question";
      next.hidden = false;
      next.focus();
    };

    let finished = false;
    next.addEventListener("click", () => {
      if (finished) {
        finished = false;
        idx = 0;
        score = 0;
        render();
        return;
      }
      if (idx < QUESTIONS.length - 1) {
        idx += 1;
        render();
        return;
      }
      finished = true;
      bar.style.width = "100%";
      counter.textContent = "Finished";
      qEl.textContent = `You scored ${score} out of ${QUESTIONS.length}.`;
      optsEl.replaceChildren();
      fb.textContent = score === QUESTIONS.length
        ? "A perfect score. You clearly read the history page."
        : "Every answer is covered somewhere in this guide. The history and languages pages are good places to start.";
      next.textContent = "Start again";
    });

    render();
  }
})();
