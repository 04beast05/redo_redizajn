/* =========================================================
   AGENCY REDO – učitavanje sadržaja iz Supabasea (admin panel)
   1) pročita podatke (projekti, kategorije, slike luka, videi,
      About, Services) preko Supabase REST API-ja
   2) ubaci ih u stranicu
   3) tek onda pokrene script.js (animacije)
   Ako Supabase nije podešen ili nešto ne radi, ostaje sadržaj iz HTML-a.
   ========================================================= */
(function () {
  "use strict";

  const cfg = window.REDO_CONFIG || {};
  const page = document.body.dataset.page || "";
  const TIMEOUT = 6000;

  function startSite() {
    if (window.__redoStarted) return;
    window.__redoStarted = true;
    const s = document.createElement("script");
    s.src = "js/script.js";
    document.body.appendChild(s);
  }

  if (!cfg.supabaseUrl || !cfg.supabaseKey) { startSite(); return; }

  const base = cfg.supabaseUrl.replace(/\/+$/, "") + "/rest/v1/";
  const api = (path) =>
    fetch(base + path, { headers: { apikey: cfg.supabaseKey }, cache: "no-store" }).then((r) => {
      if (!r.ok) throw new Error("Supabase " + r.status);
      return r.json();
    });

  /* ---------- pomoćne funkcije ---------- */
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  // sigurno stvaranje elemenata (bez ubacivanja HTML-a iz baze)
  function el(tag, props, children) {
    const n = document.createElement(tag);
    if (props) {
      for (const k in props) {
        const v = props[k];
        if (v == null) continue;
        if (k === "class") n.className = v;
        else if (k === "text") n.textContent = v;
        else if (k === "data") Object.assign(n.dataset, v);
        else n.setAttribute(k, v);
      }
    }
    if (tag === "video") n.muted = true; // potrebno za autoplay
    (children || []).forEach((c) => c != null && n.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return n;
  }
  // tekst s novim redovima -> tekst + <br>
  function lines(text) {
    const out = [];
    String(text || "").split(/\n/).forEach((t, i) => {
      if (i) out.push(el("br"));
      out.push(document.createTextNode(t));
    });
    return out;
  }
  const ARROW = () => {
    const a = el("span", { class: "arrow" });
    a.innerHTML = '<svg viewBox="0 0 14 8" fill="none" stroke="currentColor"><path d="M0 4h13M9.5 .5 13 4 9.5 7.5"/></svg><svg viewBox="0 0 14 8" fill="none" stroke="currentColor"><path d="M0 4h13M9.5 .5 13 4 9.5 7.5"/></svg>';
    return a;
  };
  const isVideo = (url) => /\.(mp4|webm|mov|m4v|ogv)(\?|$)/i.test(url || "");

  /* =========================================================
     ZAJEDNIČKO: kategorije u izborniku + kontakt forma
     ========================================================= */
  function renderCategories(cats) {
    if (!cats || !cats.length) return;
    const ul = $(".menu-main");
    if (ul) {
      ul.textContent = "";
      cats.forEach((c) => ul.appendChild(el("li", null, [el("a", { href: "projects.html#" + c.slug, text: c.name.toUpperCase() })])));
    }
    const sel = $("#cf-service");
    if (sel) {
      $$("option:not([value=''])", sel).forEach((o) => o.remove());
      cats.forEach((c) => sel.appendChild(el("option", { text: c.name })));
      sel.appendChild(el("option", { text: "Other" }));
    }
  }

  /* =========================================================
     NASLOVNICA: slike luka + videi kategorija
     ========================================================= */
  function renderWheel(rows) {
    const wheel = $("#wheel");
    if (!wheel || !rows || !rows.length) return;
    wheel.textContent = "";
    rows.forEach((r, i) => {
      const media = isVideo(r.url)
        ? el("video", { src: r.url, muted: "", loop: "", autoplay: "", playsinline: "" })
        : el("img", { src: r.url, alt: "" });
      wheel.appendChild(el("figure", null, [el("div", { class: "ph", "data-label": "Slika " + (i + 1) }, [media])]));
    });
  }

  function renderVideos(rows) {
    if (!rows || !rows.length) return;
    const layers = $$("#cat-layers .cat-media");
    const caps = $$(".category-caption");
    rows.forEach((r) => {
      const layer = layers[r.slot];
      if (layer && r.video_url) {
        layer.textContent = "";
        const v = el("video", { src: r.video_url, muted: "", loop: "", autoplay: "", playsinline: "", preload: "auto" });
        v.muted = true;
        layer.appendChild(v);
      }
      const cap = r.slot >= 1 ? caps[r.slot - 1] : null;
      if (cap) {
        if (r.title) $("h3", cap).textContent = r.title;
        if (r.category_slug) $("a.cta", cap).setAttribute("href", "projects.html#" + r.category_slug);
      }
    });
  }

  /* =========================================================
     PROJECTS
     ========================================================= */
  function renderProjects(cats, projects) {
    const list = $("#projects-list");
    const tabs = $("#project-tabs");
    if (!list || !cats || !cats.length || !projects) return;
    list.textContent = "";
    if (tabs) tabs.textContent = "";
    let first = true;
    cats.forEach((c) => {
      const items = projects.filter((p) => p.category_id === c.id);
      if (!items.length) return;
      const grid = el("div", { class: "project-grid", "data-stagger": "" });
      items.forEach((p) => {
        const meta = [p.subtitle, p.year].filter(Boolean).join(" / ");
        const media = el("div", { class: "pc-media ph", "data-label": p.title });
        if (p.cover_url) {
          media.appendChild(isVideo(p.cover_url)
            ? el("video", { src: p.cover_url, muted: "", loop: "", autoplay: "", playsinline: "" })
            : el("img", { src: p.cover_url, alt: p.title, loading: "lazy" }));
        }
        const data = Object.assign({}, p, { category: c.name });
        grid.appendChild(el("article", {
          class: "project-card", tabindex: "0", role: "button",
          data: { project: JSON.stringify(data) }
        }, [media, el("h3", { class: "pc-name", text: p.title }), meta ? el("p", { class: "pc-meta", text: meta }) : null]));
      });
      list.appendChild(el("section", { class: "project-category", id: c.slug }, [
        el("div", { class: "pcat-head" }, [
          el("h2", { class: "pcat-title", text: c.name }),
          el("span", { class: "pcat-count", text: "(" + String(items.length).padStart(2, "0") + ")" })
        ]),
        grid
      ]));
      if (tabs) tabs.appendChild(el("a", { class: "tab-link" + (first ? " active" : ""), href: "#" + c.slug, text: c.name }));
      first = false;
    });
    if (!list.children.length) list.appendChild(el("p", { class: "projects-empty", text: "Projects coming soon." }));
  }

  /* =========================================================
     POSTAVKE (kontakt podaci, footer, cookie, naslovi) – sve stranice
     ========================================================= */
  function applySettings(st) {
    if (!st) return;
    const each = (k, fn) => $$('[data-cms="' + k + '"]').forEach(fn);
    if (st.phone !== undefined) each("phone", (a) => {
      a.textContent = st.phone;
      a.setAttribute("href", "tel:" + st.phone.replace(/[^\d+]/g, ""));
      a.hidden = !st.phone;
      if (a.parentNode && a.parentNode.tagName === "P") a.parentNode.hidden = !st.phone;
    });
    if (st.email) {
      each("email", (a) => { a.textContent = st.email; a.setAttribute("href", "mailto:" + st.email); });
      each("email-link", (a) => a.setAttribute("href", "mailto:" + st.email));
      cfg.contactEmail = st.email;
    }
    if (st.address) {
      each("address", (n) => { n.textContent = ""; lines(st.address).forEach((x) => n.appendChild(x)); });
      each("address-inline", (n) => { n.textContent = st.address.split("\n").map((x) => x.trim()).filter(Boolean).join(", "); });
    }
    if (st.instagram !== undefined) each("instagram", (a) => { a.setAttribute("href", st.instagram || "#"); a.hidden = !st.instagram; });
    if (st.copyright) each("copyright", (n) => { n.textContent = st.copyright; });
    if (st.cookie_text) each("cookie", (n) => { n.textContent = st.cookie_text; });
    if (st.contact_title) each("contact-title", (n) => { n.textContent = ""; lines(st.contact_title).forEach((x) => n.appendChild(x)); });
    if (st.projects_title) each("projects-title", (n) => { n.textContent = st.projects_title; });
  }

  /* =========================================================
     NASLOVNICA – tekst ispod luka slika
     ========================================================= */
  function renderHomeText(d) {
    if (!d) return;
    const h = $(".statement .split");
    if (h && Array.isArray(d.statement) && d.statement.length) {
      h.textContent = "";
      d.statement.filter((t) => t.trim()).forEach((t) => h.appendChild(el("span", { class: "flex-line", text: t })));
    }
    const cta = $(".statement .cta");
    if (cta) {
      if (d.cta_label) $(".label", cta).textContent = d.cta_label;
      if (d.cta_link) cta.setAttribute("href", d.cta_link);
      cta.hidden = d.cta_label === "";
    }
  }

  /* =========================================================
     ABOUT
     ========================================================= */
  function renderAbout(d) {
    if (!d) return;
    const hero = $(".about-hero");
    if (hero && Array.isArray(d.hero) && d.hero.length) {
      hero.textContent = "";
      d.hero.forEach((t) => hero.appendChild(t.trim() ? el("span", { class: "flex-line", text: t }) : el("br")));
    }
    const media = $(".about-media");
    if (media && d.video_url) {
      $$("video, img", media).forEach((n) => n.remove());
      const v = isVideo(d.video_url)
        ? el("video", { src: d.video_url, muted: "", loop: "", autoplay: "", playsinline: "" })
        : el("img", { src: d.video_url, alt: "" });
      media.insertBefore(v, media.firstChild);
    }
    const intro = $(".about-text");
    if (intro && d.intro) { intro.textContent = ""; lines(d.intro).forEach((n) => intro.appendChild(n)); }
    const sec = $(".principles");
    if (sec && Array.isArray(d.principles)) {
      if (d.principles_title) $(".section-title", sec).textContent = d.principles_title;
      const ul = $(".list-container", sec);
      ul.textContent = "";
      d.principles.forEach((p) => ul.appendChild(el("li", { class: "list-item" }, [
        el("h3", null, lines(p.title)),
        el("div", { class: "text" }, [el("p", { text: p.text || "" })])
      ])));
    }
  }

  /* =========================================================
     SERVICES
     ========================================================= */
  function serviceSection(s, isFirst) {
    const ul = el("ul", { class: "list-container" + (Number(s.columns) === 2 ? " cols-2" : ""), "data-stagger": "" });
    (s.items || []).forEach((it) => {
      const p = el("p");
      (it.lines || []).forEach((l, i) => { if (i) p.appendChild(el("br")); p.appendChild(document.createTextNode("+ " + l)); });
      ul.appendChild(el("li", { class: "list-item" }, [el("h3", null, lines(it.title)), el("div", { class: "text" }, [p])]));
    });
    return el("section", { class: "page-section services-block" }, [
      el(isFirst ? "h1" : "h2", { class: "section-title", text: s.title || "" }),
      el("div", { class: "list" }, [ul])
    ]);
  }
  function renderServices(d) {
    if (!d || !Array.isArray(d.sections)) return;
    const main = $("#main");
    const nav = $(".tab-nav", main);
    $$(":scope > section", main).forEach((n) => n.remove());
    d.sections.forEach((s, i) => {
      main.insertBefore(serviceSection(s, i === 0), nav);
      if (i === 0 && Array.isArray(d.clients) && d.clients.length) {
        const grid = el("div", { class: "clients-grid" });
        d.clients.forEach((c) => grid.appendChild(el("div", { class: "client" }, [el("h2", { class: "name", text: c })])));
        main.insertBefore(el("section", { class: "clients" }, [el("h2", { class: "section-title", text: d.clients_title || "Our clients" }), grid]), nav);
      }
    });
  }

  /* =========================================================
     POKRETANJE
     ========================================================= */
  const jobs = [];
  const catsP = api("categories?select=*&order=sort.asc,name.asc");
  jobs.push(catsP.then(renderCategories));
  jobs.push(api("page_content?select=data&key=eq.settings").then((r) => applySettings(r[0] && r[0].data)));

  if (page === "home") {
    jobs.push(api("wheel_images?select=url&order=sort.asc,created_at.asc").then(renderWheel));
    jobs.push(api("home_videos?select=*&order=slot.asc").then(renderVideos));
    jobs.push(api("page_content?select=data&key=eq.home").then((r) => renderHomeText(r[0] && r[0].data)));
  }
  if (page === "projects") {
    jobs.push(Promise.all([catsP, api("projects?select=*&published=eq.true&order=sort.asc,created_at.desc")])
      .then(([c, p]) => renderProjects(c, p)));
  }
  if (page === "about") jobs.push(api("page_content?select=data&key=eq.about").then((r) => renderAbout(r[0] && r[0].data)));
  if (page === "services") jobs.push(api("page_content?select=data&key=eq.services").then((r) => renderServices(r[0] && r[0].data)));

  const all = Promise.allSettled(jobs.map((j) => j.catch((e) => { console.warn("[Redo] sadržaj nije učitan:", e); })));
  Promise.race([all, new Promise((res) => setTimeout(res, TIMEOUT))]).then(startSite);
})();
