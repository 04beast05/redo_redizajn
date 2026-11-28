/* =========================================================
   AGENCY REDO – admin panel (Supabase)
   Projekti, kategorije, slike i videi naslovnice, About, Services
   i poruke s kontakt forme.
   ========================================================= */
(function () {
  "use strict";

  const cfg = window.REDO_CONFIG || {};
  const BUCKET = cfg.storageBucket || "media";
  // polazni sadržaj About/Services (isti kao u HTML-u) – koristi se dok u bazi nema ništa
  const DEFAULTS = {
    "about": {
      "hero": [
        "Based in Osijek, Croatia,",
        "Agency Redo is a team of people from",
        "marketing, production, software and PR",
        "combining all in one agency",
        "delivering results to over 20+ clients a month.",
        "",
        "Let's create something big, together!"
      ],
      "video_url": "",
      "intro": "Powered by an in-house collective of 5 talents, a trusted regional network of creatives,\nand a deep sense of co-creation, we deliver strategic clarity, cultural relevance,\nand craft excellence to those willing to make a difference.",
      "principles_title": "Our guiding principles",
      "principles": [
        {
          "title": "Authentic\ncommitment",
          "text": "We take on projects we believe in. Passion, purpose, and impact guide everything we do."
        },
        {
          "title": "Reliability &\ntransparency",
          "text": "We define objectives, scope, budget, and timing upfront. From the first presentation you see the full picture, creative and production together, ensuring serenity and trust throughout the whole process."
        },
        {
          "title": "Flexibility\n& agility",
          "text": "We plug in exactly where you need us, from full campaigns support (strategy to final delivery), to standalone creative, production or post-production."
        },
        {
          "title": "Tailor-made\nteams",
          "text": "We curate the right talents for their fit with your project’s DNA ensuring relevance and outstanding craft."
        },
        {
          "title": "Co-creation\nat every step",
          "text": "We shape every project together, from briefing to delivery. You collaborate directly with our experts at our studio, fostering collaboration, agility, and efficiency."
        },
        {
          "title": "Proximity",
          "text": "We are in the heart of Osijek so we can truly understand your world and your needs, delivering relevant work powered by our expertise, blending local insight with global experience."
        }
      ]
    },
    "services": {
      "sections": [
        {
          "title": "Advertising & Experience design services",
          "columns": 3,
          "items": [
            {
              "title": "Client\nPartnership",
              "lines": [
                "Brief development",
                "Budget & timeline supervision",
                "Cross-team coordination",
                "Ongoing client support"
              ]
            },
            {
              "title": "Creative\nStrategy",
              "lines": [
                "Creative strategy & direction",
                "Communication & content strategy",
                "360° campaigns & comms plans",
                "Brand activations",
                "Partnerships & brand collaborations"
              ]
            },
            {
              "title": "Brand identity\n& Design",
              "lines": [
                "Brand positioning",
                "Brand platform",
                "Visual identity",
                "Tone of voice",
                "Brand architecture & naming"
              ]
            },
            {
              "title": "Experience design\n& Innovation",
              "lines": [
                "Scenography",
                "Immersive installations (VR, AR, spatial audio)",
                "Experiential events",
                "Interactive content",
                "Stage design",
                "Movie set design",
                "Technical direction & deployment"
              ]
            },
            {
              "title": "Production",
              "lines": [
                "Photos & videos",
                "2D/3D animation",
                "Talent curation & casting",
                "Set design, art direction, props, styling, HMC",
                "Production management & logistics"
              ]
            },
            {
              "title": "Post\nProduction",
              "lines": [
                "Video editing",
                "Color grading",
                "VFX & CGI",
                "Sound design",
                "Original music composition",
                "Voice-over recording & direction",
                "Audio mix & mastering",
                "Localization & multi-channel format versioning",
                "AI Workflows"
              ]
            }
          ]
        },
        {
          "title": "Cinema services",
          "columns": 2,
          "items": [
            {
              "title": "Cinema\nPost production\nsupervision",
              "lines": [
                "Define the overall film post-production strategy",
                "Oversee the entire image, sound, VFX workflow",
                "Coordinate internal teams and external vendors",
                "Plan sand secure post-production timelines",
                "Manage the budget and optimizes costs",
                "Ensure compliance of cinema deliverables"
              ]
            },
            {
              "title": "Cinema\nPost production",
              "lines": [
                "Video editing",
                "Sound editing & sound design",
                "Foley",
                "ADR / dialogue recording",
                "Original music composition",
                "Voice-over recording & direction",
                "Audio mix & mastering",
                "Color grading",
                "VFX & CGI",
                "Mastering"
              ]
            }
          ]
        }
      ],
      "clients_title": "Our clients",
      "clients": [
        "HUBLOT",
        "JAEGER-LECOULTRE",
        "UNITED NATIONS",
        "PORTAIL DES NATIONS",
        "MB&F",
        "PATEK PHILIPPE",
        "VACHERON CONSTANTIN",
        "CHOPARD",
        "GIRARD-PERREGAUX",
        "EBEL",
        "CONCORD",
        "SARTORO",
        "NESCENS",
        "LA RESERVE",
        "BONGENIE",
        "PICTET",
        "CAILLER",
        "MEDICXI"
      ]
    },
    "home": {
      "statement": [
        "Bringing together",
        "the best talents from each industry,",
        "we believe creativity is more",
        "than expression. It’s a force",
        "that has meaningful resonance."
      ],
      "cta_label": "About",
      "cta_link": "about.html"
    },
    "settings": {
      "phone": "+385 00 000 0000",
      "email": "os.agency.redo@gmail.com",
      "address": "31 000 Osijek\nHrvatska",
      "instagram": "https://www.instagram.com/",
      "copyright": "Agency Redo. All rights reserved.",
      "cookie_text": "This website uses cookies. By continuing to browse, you accept the use of cookies.",
      "contact_title": "Let's create\nsomething big,\ntogether!",
      "projects_title": "Projects"
    }
  };

  /* ---------- pomoćne funkcije ---------- */
  const $ = (s, c) => (c || document).querySelector(s);
  const clone = (o) => JSON.parse(JSON.stringify(o));

  // h("div", { class: "x", text: "..", onclick: fn }, child1, child2...)
  function h(tag, props, ...children) {
    const n = document.createElement(tag);
    if (props) {
      for (const k in props) {
        const v = props[k];
        if (v == null || v === false) continue;
        if (k === "class") n.className = v;
        else if (k === "text") n.textContent = v;
        else if (k === "value") n.value = v;
        else if (k === "checked") n.checked = !!v;
        else if (k === "style") n.style.cssText = v;
        else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
        else n.setAttribute(k, v === true ? "" : v);
      }
    }
    children.flat().forEach((c) => {
      if (c == null || c === false) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  }

  const isVideo = (x) => /\.(mp4|webm|mov|m4v|ogv)(\?|$)/i.test(typeof x === "string" ? x : (x && x.name) || "") ||
    (x && x.type && x.type.startsWith("video/"));

  function mediaEl(url) {
    if (!url) return null;
    if (isVideo(url)) {
      const v = h("video", { src: url, muted: true, loop: true, autoplay: true, playsinline: true });
      v.muted = true;
      return v;
    }
    return h("img", { src: url, alt: "" });
  }

  function slugify(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "kategorija";
  }

  let toastTimer = null;
  function toast(msg, isErr) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.toggle("err", !!isErr);
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), isErr ? 5000 : 2500);
  }
  function busy(text) {
    const b = h("div", { class: "busy", text: text || "Spremam…" });
    document.body.appendChild(b);
    return {
      set: (t) => { b.textContent = t; },
      done: () => b.remove()
    };
  }
  const errText = (e) => (e && (e.message || e.error_description || e.error)) || String(e);

  function filePicker(opts, onFiles) {
    const input = h("input", { type: "file", accept: opts.accept || "image/*,video/*", multiple: !!opts.multiple, disabled: !!opts.disabled });
    input.addEventListener("change", () => { if (input.files.length) onFiles(Array.from(input.files)); input.value = ""; });
    return h("span", { class: "btn btn-sm file-btn" + (opts.primary ? " btn-primary" : "") + (opts.disabled ? " is-disabled" : "") }, opts.label, input);
  }

  // YouTube / Shorts / Vimeo / MP4 link -> podaci za ugradnju
  function parseVideo(url) {
    url = String(url || "").trim();
    let m;
    if ((m = url.match(/youtube\.com\/shorts\/([\w-]{6,})/i))) return { provider: "youtube", id: m[1], kind: "short", url };
    if ((m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|live\/|v\/)|youtu\.be\/)([\w-]{6,})/i))) return { provider: "youtube", id: m[1], kind: "video", url };
    if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i))) return { provider: "vimeo", id: m[1], kind: "video", url };
    if (/^https?:\/\/.+\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) return { provider: "file", kind: "video", url };
    return null;
  }
  function embedSrc(v) {
    if (v.provider === "youtube") return `https://www.youtube-nocookie.com/embed/${v.id}?rel=0&modestbranding=1&playsinline=1`;
    if (v.provider === "vimeo") return `https://player.vimeo.com/video/${v.id}?dnt=1`;
    return v.url;
  }
  // učitaj stvarne dimenzije slike/videa (za prikaz i provjeru)
  function natural(url) {
    return new Promise((res) => {
      if (isVideo(url)) {
        const v = document.createElement("video");
        v.onloadedmetadata = () => res({ w: v.videoWidth, h: v.videoHeight });
        v.onerror = () => res(null);
        v.src = url;
      } else {
        const i = new Image();
        i.onload = () => res({ w: i.naturalWidth, h: i.naturalHeight });
        i.onerror = () => res(null);
        i.src = url;
      }
    });
  }

  /* ---------- bez podešenog Supabasea ---------- */
  if (!cfg.supabaseUrl || !cfg.supabaseKey || !window.supabase) {
    $("#no-config").hidden = false;
    return;
  }
  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);

  async function q(promise) {
    const { data, error } = await promise;
    if (error) throw error;
    return data;
  }

  /* ---------- spremište (Storage) ---------- */
  async function upload(file, folder) {
    const safe = file.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9.]+/g, "-");
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
    const { error } = await sb.storage.from(BUCKET).upload(path, file, {
      cacheControl: "31536000", upsert: false, contentType: file.type || undefined
    });
    if (error) throw error;
    return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }
  function pathFromUrl(url) {
    const marker = `/object/public/${BUCKET}/`;
    const i = (url || "").indexOf(marker);
    return i < 0 ? null : decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
  }
  async function removeFiles(urls) {
    const paths = (urls || []).map(pathFromUrl).filter(Boolean);
    if (paths.length) await sb.storage.from(BUCKET).remove(paths).catch(() => {});
  }

  /* =========================================================
     PRIJAVA
     ========================================================= */
  const loginEl = $("#login"), panelEl = $("#panel"), view = $("#view");

  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const msg = $("#login-msg");
    msg.textContent = "";
    const btn = $("button", f);
    btn.disabled = true;
    const { data, error } = await sb.auth.signInWithPassword({ email: f.email.value.trim(), password: f.password.value });
    btn.disabled = false;
    if (error) { msg.textContent = "Prijava nije uspjela: " + errText(error); return; }
    enter(data.session);
  });

  $("#logout").addEventListener("click", async () => {
    await sb.auth.signOut();
    location.reload();
  });

  async function enter(session) {
    const { data: ok, error } = await sb.rpc("is_admin");
    if (error || !ok) {
      $("#login-msg").textContent = "Ovaj račun nema admin prava (dodaj mail u tablicu admins).";
      await sb.auth.signOut();
      loginEl.hidden = false; panelEl.hidden = true;
      return;
    }
    loginEl.hidden = true;
    panelEl.hidden = false;
    $("#side-user").textContent = session.user.email;
    go(location.hash.slice(1) || "projects");
  }

  (async () => {
    const { data } = await sb.auth.getSession();
    if (data.session) enter(data.session);
    else loginEl.hidden = false;
  })();

  /* =========================================================
     NAVIGACIJA
     ========================================================= */
  const views = {};
  let current = "projects";
  document.querySelectorAll("#side-nav button").forEach((b) => b.addEventListener("click", () => go(b.dataset.tab)));

  async function go(tab) {
    if (!views[tab]) tab = "projects";
    current = tab;
    history.replaceState(null, "", "#" + tab);
    document.querySelectorAll("#side-nav button").forEach((b) => b.classList.toggle("is-active", b.dataset.tab === tab));
    view.textContent = "";
    view.appendChild(h("p", { class: "empty", text: "Učitavanje…" }));
    try {
      await views[tab]();
    } catch (e) {
      console.error(e);
      view.textContent = "";
      view.appendChild(h("p", { class: "empty", text: "Greška: " + errText(e) }));
    }
  }
  const refresh = () => go(current);

  let categories = [];
  async function loadCategories() {
    categories = await q(sb.from("categories").select("*").order("sort").order("name"));
    return categories;
  }

  /* =========================================================
     PROJEKTI
     ========================================================= */
  const MAX_MAIN = 6, MAX_EXTRA = 4;
  let projectFilter = "";
  views.projects = async function () {
    await loadCategories();
    const projects = await q(sb.from("projects").select("*").order("sort").order("created_at", { ascending: false }));
    const list = projectFilter ? projects.filter((p) => p.category_id === projectFilter) : projects;
    const catName = (id) => (categories.find((c) => c.id === id) || {}).name || "Bez kategorije";

    const filter = h("select", { onchange: (e) => { projectFilter = e.target.value; refresh(); } },
      h("option", { value: "", text: "Sve kategorije" }),
      categories.map((c) => h("option", { value: c.id, text: c.name }))
    );
    filter.value = projectFilter;

    view.textContent = "";
    view.append(
      h("div", { class: "view-head" },
        h("h1", { text: "Projekti (" + projects.length + ")" }),
        h("div", { class: "tools" }, filter,
          h("button", { class: "btn btn-primary", text: "+ Novi projekt", onclick: () => projectEditor(null) }))
      ),
      list.length
        ? h("div", { class: "plist" }, list.map((p) =>
            h("div", { class: "pitem", onclick: () => projectEditor(p) },
              h("div", { class: "thumb", style: p.cover_url && !isVideo(p.cover_url) ? `background-image:url("${p.cover_url}")` : "" },
                p.cover_url && isVideo(p.cover_url) ? mediaEl(p.cover_url) : null),
              h("div", { class: "meta" },
                h("b", { text: p.title }),
                h("span", { text: [catName(p.category_id), p.client, p.year].filter(Boolean).join(" · ") }),
                !p.published ? h("span", { class: "badge", text: "Skriveno" }) : null)
            )))
        : h("p", { class: "empty", text: "Još nema projekata. Klikni „+ Novi projekt”." })
    );
  };

  function projectEditor(p) {
    if (!categories.length) { toast("Prvo dodaj barem jednu kategoriju.", true); return; }
    const st = Object.assign({
      title: "", category_id: projectFilter || categories[0].id, subtitle: "", year: String(new Date().getFullYear()),
      client: "", location: "", website_enabled: false, website_url: "", description: "", goal: "",
      cover_url: "", gallery: [], gallery_extra: [], videos: [], sort: 0, published: true
    }, p ? clone(p) : {});
    st.gallery = st.gallery || []; st.gallery_extra = st.gallery_extra || []; st.videos = st.videos || [];
    let id = p ? p.id : null;          // postoji li već u bazi
    const uploaded = [];               // novo učitano dok projekt još nije spremljen
    const pendingDelete = [];          // uklonjene datoteke – brišu se nakon spremanja
    let dirty = false, saving = false, timer = null;

    const bg = h("div", { class: "drawer-bg", onclick: () => close() });
    const drawer = h("div", { class: "drawer", role: "dialog", "aria-label": "Projekt" });
    const stateEl = h("span", { class: "save-state", text: id ? "Sve je spremljeno" : "Novi projekt – još nije spremljen" });
    document.body.append(bg, drawer);
    document.body.style.overflow = "hidden";

    function setState(t, cls) { stateEl.textContent = t; stateEl.className = "save-state" + (cls ? " " + cls : ""); }

    // ---------- automatsko spremanje ----------
    function changed() {
      dirty = true;
      if (!id) { setState("Nespremljene promjene – klikni „Spremi”"); return; }
      setState("Spremam…", "busy");
      clearTimeout(timer);
      timer = setTimeout(save, 900);
    }
    function payload() {
      return {
        title: st.title.trim(), category_id: st.category_id || null, subtitle: st.subtitle.trim(), year: String(st.year || "").trim(),
        client: st.client.trim(), location: st.location.trim(),
        website_enabled: !!st.website_enabled, website_url: st.website_url.trim(),
        description: st.description, goal: st.goal,
        cover_url: st.cover_url, gallery: st.gallery, gallery_extra: st.gallery_extra,
        videos: st.videos.map((v) => ({ url: v.url, provider: v.provider, id: v.id || "", kind: v.kind })),
        sort: Number(st.sort) || 0, published: !!st.published
      };
    }
    async function save() {
      clearTimeout(timer);
      if (!st.title.trim()) { setState("Upiši naziv projekta", "err"); if (!id) toast("Upiši naziv projekta.", true); return false; }
      if (saving) { timer = setTimeout(save, 400); return; }
      saving = true;
      setState("Spremam…", "busy");
      try {
        if (id) await q(sb.from("projects").update(payload()).eq("id", id));
        else {
          const row = await q(sb.from("projects").insert(payload()).select().single());
          id = row.id; uploaded.length = 0; delBtn.hidden = false;
          $(".drawer-head h1", drawer).textContent = "Uredi projekt";
        }
        const keep = new Set([st.cover_url].concat(st.gallery, st.gallery_extra));
        const del = pendingDelete.filter((u) => !keep.has(u));
        pendingDelete.length = 0;
        await removeFiles(del);
        dirty = false;
        setState("Spremljeno ✓ " + new Date().toLocaleTimeString("hr-HR"), "ok");
        return true;
      } catch (e) {
        setState("Greška pri spremanju: " + errText(e), "err");
        return false;
      } finally { saving = false; }
    }
    async function close() {
      if (id && dirty) { await save(); }
      if (!id && (dirty || uploaded.length)) {
        if (!confirm("Projekt nije spremljen. Zatvoriti bez spremanja?")) return;
        await removeFiles(uploaded);
      }
      clearTimeout(timer);
      bg.remove(); drawer.remove();
      document.body.style.overflow = "";
      refresh();
    }

    // ---------- polja ----------
    const field = (label, input, hint) => h("label", null, label, input, hint ? h("span", { class: "hint", text: hint }) : null);
    const bind = (key, el) => { el.addEventListener("input", () => { st[key] = el.value; changed(); }); return el; };
    const text = (key, ph, max) => bind(key, h("input", { type: "text", value: st[key] || "", placeholder: ph || "", maxlength: max || 200 }));
    const area = (key, rows, ph) => bind(key, h("textarea", { rows: rows || 4, value: st[key] || "", placeholder: ph || "" }));
    const toggle = (key, label, onChange) => {
      const c = h("input", { type: "checkbox", checked: !!st[key] });
      c.addEventListener("change", () => { st[key] = c.checked; changed(); if (onChange) onChange(); });
      return h("label", { class: "switch" }, c, h("span", { class: "track" }), label);
    };

    const catSel = h("select", null, categories.map((c) => h("option", { value: c.id, text: c.name })));
    catSel.value = st.category_id || "";
    catSel.addEventListener("change", () => { st.category_id = catSel.value; changed(); });

    // web link (prekidač)
    const urlWrap = h("div", { hidden: !st.website_enabled }, field("Adresa weba", bind("website_url", h("input", { type: "url", value: st.website_url, placeholder: "https://..." }))));
    const webToggle = toggle("website_enabled", "Projekt ima web stranicu (link)", () => { urlWrap.hidden = !st.website_enabled; });

    // ---------- naslovna slika ----------
    const coverBox = h("div");
    function renderCover() {
      coverBox.textContent = "";
      coverBox.append(
        h("div", { class: "media-preview" }, mediaEl(st.cover_url) || "Nema naslovne slike – prikazuje se na kartici u mreži i na vrhu projekta"),
        h("div", { class: "media-actions" },
          filePicker({ label: st.cover_url ? "Zamijeni naslovnu" : "Odaberi naslovnu", accept: "image/*,video/*" }, async ([f]) => {
            const b = busy("Učitavam naslovnu…");
            try {
              const url = await upload(f, "projects");
              if (!id) uploaded.push(url);
              if (st.cover_url) pendingDelete.push(st.cover_url);
              st.cover_url = url; renderCover(); changed();
            } catch (e) { toast("Greška: " + errText(e), true); } finally { b.done(); }
          }),
          st.cover_url ? h("button", { class: "btn btn-sm btn-danger", type: "button", text: "Ukloni",
            onclick: () => { pendingDelete.push(st.cover_url); st.cover_url = ""; renderCover(); changed(); } }) : null
        )
      );
    }

    // ---------- galerije (glavna 6 + dodatna 4) ----------
    function galleryBlock(key, max, title) {
      const box = h("div");
      function render() {
        const g = st[key];
        box.textContent = "";
        const odd = g.length % 2 === 1;
        const items = g.map((url, i) => {
          const dim = h("span", { class: "dim" });
          natural(url).then((d) => { if (d) dim.textContent = d.w + "×" + d.h; });
          return h("div", { class: "gitem" },
            mediaEl(url),
            h("span", { class: "num", text: String(i + 1) }), dim,
            h("div", { class: "gbtns" },
              h("button", { type: "button", title: "Lijevo", text: "←", onclick: () => { if (i > 0) { [g[i - 1], g[i]] = [g[i], g[i - 1]]; render(); changed(); } } }),
              h("button", { type: "button", title: "Desno", text: "→", onclick: () => { if (i < g.length - 1) { [g[i + 1], g[i]] = [g[i], g[i + 1]]; render(); changed(); } } }),
              h("button", { type: "button", class: "del", title: "Ukloni", text: "×", onclick: () => { pendingDelete.push(url); g.splice(i, 1); render(); changed(); } })
            ));
        });
        for (let k = g.length; k < max; k++) items.push(h("div", { class: "slot-empty", text: "Mjesto " + (k + 1) }));
        box.append(
          h("div", { class: "section-title" },
            h("h3", { text: title }),
            h("span", { class: "count" + (odd ? " warn" : ""), text: `${g.length}/${max}` + (odd ? " – dodaj još jednu (mora biti paran broj)" : "") })),
          h("div", { class: "gallery" }, items),
          h("div", { class: "media-actions" },
            filePicker({ label: "+ Dodaj fotografije / GIF", accept: "image/*", multiple: true, disabled: g.length >= max }, async (files) => {
              const free = max - g.length;
              if (files.length > free) toast(`Stane još ${free} – dodajem prvih ${free}.`, true);
              const b = busy("Učitavam…");
              try {
                const list = files.slice(0, free);
                for (let n = 0; n < list.length; n++) {
                  b.set(`Učitavam ${n + 1}/${list.length}…`);
                  const url = await upload(list[n], "projects");
                  if (!id) uploaded.push(url);
                  g.push(url);
                }
                render(); changed();
              } catch (e) { toast("Greška: " + errText(e), true); } finally { b.done(); }
            }),
            h("span", { class: "hint", text: "Slike se na stranici prikazuju u svom stvarnom formatu (npr. 1080×1350, 1920×1080, 1080×1920, 1080×1080), po dvije u redu. GIF-ovi rade." })
          )
        );
      }
      render();
      return box;
    }

    // ---------- videi (zalijepi link) ----------
    const vBox = h("div");
    const vMsg = h("p", { class: "paste-msg" });
    const vInput = h("input", { type: "url", placeholder: "Zalijepi YouTube, YouTube Shorts ili Vimeo link…" });
    function addVideo(raw) {
      const links = String(raw || "").split(/\s+/).filter(Boolean);
      let added = 0;
      links.forEach((l) => {
        const v = parseVideo(l);
        if (!v) return;
        if (st.videos.some((x) => (x.id && x.id === v.id) || x.url === v.url)) return;
        st.videos.push(v); added++;
      });
      if (added) {
        vInput.value = "";
        vMsg.textContent = added === 1 ? "Video dodan ✓" : `Dodano videa: ${added} ✓`;
        vMsg.className = "paste-msg ok";
        renderVideos(); changed();
      } else if (links.length) {
        vMsg.textContent = "To nije YouTube, Shorts ili Vimeo link (ili je već dodan).";
        vMsg.className = "paste-msg err";
      }
    }
    vInput.addEventListener("paste", () => setTimeout(() => addVideo(vInput.value), 0));
    vInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addVideo(vInput.value); } });
    function renderVideos() {
      vBox.textContent = "";
      const vs = st.videos;
      vBox.append(
        h("div", { class: "section-title" }, h("h3", { text: "Videi (YouTube / Shorts / Vimeo)" }), h("span", { class: "count", text: String(vs.length) })),
        h("div", { class: "paste-row" },
          h("label", null, "Link videa", vInput),
          h("button", { class: "btn btn-sm", type: "button", text: "Dodaj", onclick: () => addVideo(vInput.value) })),
        vMsg,
        vs.length ? h("div", { class: "vlist" }, vs.map((v, i) =>
          h("div", { class: "vitem" + (v.kind === "short" ? " is-short" : "") },
            h("div", { class: "frame" }, v.provider === "file"
              ? h("video", { src: v.url, controls: true, playsinline: true, preload: "metadata" })
              : h("iframe", { src: embedSrc(v), title: "Video", loading: "lazy", allow: "encrypted-media; picture-in-picture; fullscreen", allowfullscreen: true })),
            h("div", { class: "vinfo" },
              h("b", { text: v.provider === "youtube" ? (v.kind === "short" ? "YouTube Shorts" : "YouTube") : v.provider === "vimeo" ? "Vimeo" : "Video" }),
              h("span", { text: v.kind === "short" ? "9:16" : "16:9" })),
            h("div", { class: "gbtns" },
              h("button", { type: "button", title: "Lijevo", text: "←", onclick: () => { if (i > 0) { [vs[i - 1], vs[i]] = [vs[i], vs[i - 1]]; renderVideos(); changed(); } } }),
              h("button", { type: "button", title: "Desno", text: "→", onclick: () => { if (i < vs.length - 1) { [vs[i + 1], vs[i]] = [vs[i], vs[i + 1]]; renderVideos(); changed(); } } }),
              h("button", { type: "button", class: "del", title: "Ukloni", text: "×", onclick: () => { vs.splice(i, 1); renderVideos(); changed(); } })
            )
          ))) : h("p", { class: "hint", text: "Samo zalijepi link – video se odmah doda i spremi. Shorts se prikazuju uspravno (9:16), ostali 16:9." })
      );
    }

    const catSlug = () => (categories.find((c) => c.id === st.category_id) || {}).slug || "";
    const viewLink = h("a", { class: "btn btn-sm", target: "_blank", rel: "noopener", text: "Pogledaj na stranici ↗" });
    viewLink.addEventListener("click", () => { viewLink.href = "../projects.html#" + catSlug(); });
    const delBtn = h("button", { class: "btn btn-danger", type: "button", text: "Obriši projekt", hidden: !id, onclick: del });

    drawer.append(
      h("div", { class: "drawer-head" },
        h("h1", { text: p ? "Uredi projekt" : "Novi projekt" }),
        h("button", { class: "btn btn-sm", type: "button", text: "Zatvori ✕", onclick: close })),
      h("div", { class: "drawer-body" },
        h("div", { class: "box stack", style: "margin:0" },
          h("h2", { text: "Osnovno" }),
          field("Naslov projekta *", text("title", "npr. Mumm Lounge", 160)),
          h("div", { class: "row" },
            field("Kategorija", catSel),
            field("Vrsta (prikazuje se ispod naslova)", text("subtitle", "npr. Ads, Fashion, Interview", 60)),
            field("Godina", text("year", "2026", 10))),
          h("div", { class: "row" },
            field("Klijent (firma)", text("client", "npr. G.H. Mumm", 120)),
            field("Lokacija projekta", text("location", "npr. Osijek, Hrvatska", 120))),
          webToggle, urlWrap
        ),
        h("div", { class: "box stack", style: "margin:0" },
          h("h2", { text: "Opis" }),
          field("Kratki opis projekta", area("description", 4, "Što je napravljeno, za koga…")),
          field("Cilj i zadatak", area("goal", 4, "Koji je bio cilj i zadatak projekta…"))
        ),
        h("div", { class: "box", style: "margin:0" }, h("h2", { text: "Naslovna slika" }), coverBox),
        h("div", { class: "box", style: "margin:0" }, galleryBlock("gallery", MAX_MAIN, "Fotografije (do 6)")),
        h("div", { class: "box", style: "margin:0" }, vBox),
        h("div", { class: "box", style: "margin:0" }, galleryBlock("gallery_extra", MAX_EXTRA, "Dodatne fotografije (do 4)")),
        h("div", { class: "box stack", style: "margin:0" },
          h("h2", { text: "Objava" }),
          toggle("published", "Prikaži projekt na stranici"),
          field("Redoslijed (manji broj = prije)", bind("sort", h("input", { type: "number", value: st.sort })))
        )
      ),
      h("div", { class: "drawer-foot" },
        stateEl,
        h("div", { class: "tools", style: "display:flex;gap:10px;flex-wrap:wrap" },
          delBtn, viewLink,
          h("button", { class: "btn btn-primary", type: "button", text: "Spremi", onclick: async () => { if (await save()) toast("Projekt spremljen."); } }))
      )
    );
    renderCover();
    renderVideos();

    async function del() {
      if (!id || !confirm(`Obrisati projekt „${st.title}”? Ovo se ne može poništiti.`)) return;
      const b = busy("Brišem…");
      try {
        clearTimeout(timer);
        await q(sb.from("projects").delete().eq("id", id));
        await removeFiles([st.cover_url].concat(st.gallery, st.gallery_extra, pendingDelete));
        bg.remove(); drawer.remove();
        document.body.style.overflow = "";
        toast("Projekt obrisan.");
        refresh();
      } catch (e) { toast("Greška: " + errText(e), true); } finally { b.done(); }
    }
  }

  /* =========================================================
     KATEGORIJE
     ========================================================= */
  views.categories = async function () {
    await loadCategories();
    const rows = categories.map((c) => {
      const name = h("input", { type: "text", value: c.name });
      const slug = h("input", { type: "text", value: c.slug });
      const sort = h("input", { type: "number", value: c.sort, style: "max-width:80px" });
      return h("tr", null,
        h("td", null, name), h("td", null, slug), h("td", null, sort),
        h("td", null,
          h("button", { class: "btn btn-sm", text: "Spremi", onclick: async () => {
            try {
              await q(sb.from("categories").update({ name: name.value.trim(), slug: slugify(slug.value || name.value), sort: Number(sort.value) || 0 }).eq("id", c.id));
              toast("Kategorija spremljena."); refresh();
            } catch (e) { toast("Greška: " + errText(e), true); }
          } }), " ",
          h("button", { class: "btn btn-sm btn-danger", text: "Obriši", onclick: async () => {
            if (!confirm(`Obrisati kategoriju „${c.name}”? Njeni projekti ostaju u adminu, ali bez kategorije se ne prikazuju na stranici.`)) return;
            try { await q(sb.from("categories").delete().eq("id", c.id)); toast("Kategorija obrisana."); refresh(); }
            catch (e) { toast("Greška: " + errText(e), true); }
          } })
        )
      );
    });
    const nName = h("input", { type: "text", placeholder: "npr. Social media" });
    const nSort = h("input", { type: "number", value: categories.length + 1, style: "max-width:80px" });

    view.textContent = "";
    view.append(
      h("div", { class: "view-head" }, h("h1", { text: "Kategorije" })),
      h("div", { class: "box" },
        h("p", { class: "hint", style: "margin:0 0 18px", text: "Kategorije su sekcije na stranici Projects i stavke u izborniku. Slug je dio adrese (npr. projects.html#cinema)." }),
        h("div", { class: "table-wrap" }, h("table", { class: "table" },
          h("thead", null, h("tr", null, h("th", { text: "Naziv" }), h("th", { text: "Slug" }), h("th", { text: "Redoslijed" }), h("th"))),
          h("tbody", null, rows)
        ))
      ),
      h("div", { class: "box" },
        h("h2", { text: "Nova kategorija" }),
        h("div", { class: "row" }, h("label", null, "Naziv", nName), h("label", null, "Redoslijed", nSort)),
        h("button", { class: "btn btn-primary", text: "+ Dodaj kategoriju", onclick: async () => {
          if (!nName.value.trim()) { toast("Upiši naziv.", true); return; }
          try {
            await q(sb.from("categories").insert({ name: nName.value.trim(), slug: slugify(nName.value), sort: Number(nSort.value) || 0 }));
            toast("Kategorija dodana."); refresh();
          } catch (e) { toast("Greška: " + errText(e), true); }
        } })
      )
    );
  };

  /* =========================================================
     NASLOVNICA – videi + slike luka
     ========================================================= */
  const SLOT_NAMES = ["Uvodni video (prvi)", "Video 2 – kategorija 1", "Video 3 – kategorija 2", "Video 4 – kategorija 3"];

  views.home = async function () {
    await loadCategories();
    const vids = await q(sb.from("home_videos").select("*").order("slot"));
    const wheel = await q(sb.from("wheel_images").select("*").order("sort").order("created_at"));

    view.textContent = "";
    view.append(h("div", { class: "view-head" }, h("h1", { text: "Naslovnica" })));

    /* ---- tekst na naslovnici ---- */
    const home = await loadPage("home");
    const stmt = { v: (home.statement || []).join("\n") };
    const ctaLink = h("select", null,
      [["about.html", "About"], ["services.html", "Services"], ["projects.html", "Projects"], ["contact.html", "Contact"]]
        .map(([v, t]) => h("option", { value: v, text: t })));
    ctaLink.value = home.cta_link || "about.html";
    view.append(h("div", { class: "box stack" },
      h("h2", { text: "Tekst ispod luka slika" }),
      h("label", null, "Redovi teksta (svaki u novom retku)", txtArea(stmt, "v", 6)),
      h("div", { class: "row" },
        h("label", null, "Natpis linka (prazno = bez linka)", txtInput(home, "cta_label")),
        h("label", null, "Link vodi na", ctaLink)),
      h("button", { class: "btn btn-primary", style: "align-self:flex-start", text: "Spremi tekst", onclick: async () => {
        const data = { statement: stmt.v.split("\n").map((l) => l.trim()).filter(Boolean), cta_label: (home.cta_label || "").trim(), cta_link: ctaLink.value };
        try { await savePage("home", data); toast("Tekst spremljen."); } catch (e) { toast("Greška: " + errText(e), true); }
      } })
    ));

    /* ---- videi ---- */
    const vbox = h("div", { class: "videos" });
    for (let slot = 0; slot < 4; slot++) {
      const v = vids.find((x) => x.slot === slot) || { slot, video_url: "", title: "", category_slug: "" };
      const title = h("input", { type: "text", value: v.title, placeholder: "npr. Cinema" });
      const cat = h("select", null, h("option", { value: "", text: "— bez linka —" }), categories.map((c) => h("option", { value: c.slug, text: c.name })));
      cat.value = v.category_slug || "";
      const saveRow = async (patch) => {
        await q(sb.from("home_videos").upsert(Object.assign({ slot, video_url: v.video_url, title: title.value.trim(), category_slug: cat.value }, patch)));
      };
      vbox.appendChild(h("div", { class: "box", style: "margin:0" },
        h("h2", { text: SLOT_NAMES[slot] }),
        h("div", { class: "media-preview" }, mediaEl(v.video_url) || "Koristi se video iz index.html"),
        h("div", { class: "media-actions" },
          filePicker({ label: v.video_url ? "Zamijeni video" : "Učitaj video", accept: "video/*" }, async ([f]) => {
            const b = busy("Učitavam video… (veliki videi traju duže)");
            try {
              const url = await upload(f, "videos");
              await saveRow({ video_url: url });
              if (v.video_url) await removeFiles([v.video_url]);
              toast("Video spremljen."); refresh();
            } catch (e) { toast("Greška: " + errText(e), true); } finally { b.done(); }
          }),
          v.video_url ? h("button", { class: "btn btn-sm btn-danger", text: "Ukloni", onclick: async () => {
            if (!confirm("Ukloniti ovaj video? Stranica će koristiti video iz index.html.")) return;
            try { await saveRow({ video_url: "" }); await removeFiles([v.video_url]); toast("Video uklonjen."); refresh(); }
            catch (e) { toast("Greška: " + errText(e), true); }
          } }) : null
        ),
        slot > 0 ? h("div", { class: "stack", style: "margin-top:18px" },
          h("label", null, "Natpis na videu", title),
          h("label", null, "Link „Discover all the projects” vodi na", cat),
          h("button", { class: "btn btn-sm", style: "align-self:flex-start", text: "Spremi natpis", onclick: async () => {
            try { await saveRow({}); toast("Spremljeno."); } catch (e) { toast("Greška: " + errText(e), true); }
          } })
        ) : null
      ));
    }
    view.append(h("div", { class: "box" }, h("h2", { text: "Videi (scena s kategorijama)" }),
      h("p", { class: "hint", style: "margin:-6px 0 18px", text: "Preporuka: MP4 (H.264), do ~50 MB po videu. Prvi video je uvodni, ostala tri imaju natpis i link." }),
      vbox));

    /* ---- slike luka ---- */
    const items = wheel.slice();
    const grid = h("div", { class: "gallery" });
    async function persistOrder() {
      const changed = items.map((it, i) => ({ it, i })).filter(({ it, i }) => it.sort !== i);
      for (const { it, i } of changed) {
        await q(sb.from("wheel_images").update({ sort: i }).eq("id", it.id));
        it.sort = i;
      }
    }
    function renderGrid() {
      grid.textContent = "";
      if (!items.length) { grid.appendChild(h("p", { class: "hint", text: "Nema slika u adminu – stranica koristi slike iz index.html." })); return; }
      items.forEach((it, i) => {
        grid.appendChild(h("div", { class: "gitem", style: isVideo(it.url) ? "" : `background-image:url("${it.url}")` },
          isVideo(it.url) ? mediaEl(it.url) : null,
          h("span", { class: "num", text: String(i + 1) }),
          h("div", { class: "gbtns" },
            h("button", { type: "button", title: "Lijevo", text: "←", onclick: async () => {
              if (i === 0) return; [items[i - 1], items[i]] = [items[i], items[i - 1]]; renderGrid();
              try { await persistOrder(); } catch (e) { toast("Greška: " + errText(e), true); }
            } }),
            h("button", { type: "button", title: "Desno", text: "→", onclick: async () => {
              if (i === items.length - 1) return; [items[i + 1], items[i]] = [items[i], items[i + 1]]; renderGrid();
              try { await persistOrder(); } catch (e) { toast("Greška: " + errText(e), true); }
            } }),
            (() => {
              const inp = h("input", { type: "file", accept: "image/*", style: "display:none" });
              inp.addEventListener("change", async () => {
                const f = inp.files[0]; if (!f) return;
                const b = busy("Mijenjam sliku…");
                try {
                  const url = await upload(f, "wheel");
                  await q(sb.from("wheel_images").update({ url }).eq("id", it.id));
                  await removeFiles([it.url]);
                  it.url = url; renderGrid(); toast("Slika zamijenjena.");
                } catch (e) { toast("Greška: " + errText(e), true); } finally { b.done(); }
              });
              return h("button", { type: "button", title: "Zamijeni", text: "⟳", onclick: () => inp.click() }, inp);
            })(),
            h("button", { type: "button", class: "del", title: "Obriši", text: "×", onclick: async () => {
              if (!confirm("Obrisati ovu sliku?")) return;
              try {
                await q(sb.from("wheel_images").delete().eq("id", it.id));
                await removeFiles([it.url]);
                items.splice(i, 1); renderGrid(); toast("Slika obrisana.");
              } catch (e) { toast("Greška: " + errText(e), true); }
            } })
          )
        ));
      });
    }
    renderGrid();

    view.append(h("div", { class: "box" },
      h("div", { class: "view-head", style: "margin-bottom:12px" },
        h("h2", { text: "Slike u luku (" + items.length + ")" }),
        h("div", { class: "tools" },
          filePicker({ label: "+ Dodaj slike", accept: "image/*", multiple: true, primary: true }, async (files) => {
            const b = busy("Učitavam…");
            try {
              let start = items.length;
              for (let i = 0; i < files.length; i++) {
                b.set(`Učitavam ${i + 1}/${files.length}…`);
                const url = await upload(files[i], "wheel");
                const row = await q(sb.from("wheel_images").insert({ url, sort: start + i }).select().single());
                items.push(row);
              }
              toast("Slike dodane."); refresh();
            } catch (e) { toast("Greška: " + errText(e), true); refresh(); } finally { b.done(); }
          }),
          items.length ? h("button", { class: "btn btn-sm btn-danger", text: "Obriši sve", onclick: async () => {
            if (!confirm("Obrisati SVE slike iz luka? Stranica će opet koristiti slike iz index.html.")) return;
            const b = busy("Brišem…");
            try {
              await q(sb.from("wheel_images").delete().in("id", items.map((x) => x.id)));
              await removeFiles(items.map((x) => x.url));
              toast("Sve slike obrisane."); refresh();
            } catch (e) { toast("Greška: " + errText(e), true); } finally { b.done(); }
          } }) : null
        )
      ),
      h("p", { class: "hint", style: "margin:0 0 16px", text: "Čim ovdje postoji barem jedna slika, luk na naslovnici prikazuje samo slike iz admina (redom kako su ovdje). Slike zadržavaju svoje dimenzije." }),
      grid
    ));
  };

  /* =========================================================
     POMOĆNIK ZA LISTE KOJE SE PONAVLJAJU (About / Services)
     ========================================================= */
  function repList(arr, label, renderItem, makeNew, rerender) {
    return h("div", { class: "stack" },
      arr.map((item, i) => h("div", { class: "rep" },
        h("div", { class: "rep-head" },
          h("span", { text: `${label} ${i + 1}` }),
          h("div", { class: "rep-btns" },
            h("button", { class: "btn btn-sm", type: "button", text: "↑", title: "Gore", onclick: () => { if (i > 0) { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; rerender(); } } }),
            h("button", { class: "btn btn-sm", type: "button", text: "↓", title: "Dolje", onclick: () => { if (i < arr.length - 1) { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; rerender(); } } }),
            h("button", { class: "btn btn-sm btn-danger", type: "button", text: "Ukloni", onclick: () => { if (confirm("Ukloniti?")) { arr.splice(i, 1); rerender(); } } })
          )
        ),
        renderItem(item, i)
      )),
      h("button", { class: "btn btn-sm", type: "button", style: "align-self:flex-start", text: "+ Dodaj", onclick: () => { arr.push(makeNew()); rerender(); } })
    );
  }
  const txtInput = (obj, key, ph) => { const i = h("input", { type: "text", value: obj[key] || "", placeholder: ph || "" }); i.addEventListener("input", () => { obj[key] = i.value; }); return i; };
  const txtArea = (obj, key, rows, ph) => { const t = h("textarea", { rows: rows || 3, value: obj[key] || "", placeholder: ph || "" }); t.addEventListener("input", () => { obj[key] = t.value; }); return t; };

  async function loadPage(key) {
    const rows = await q(sb.from("page_content").select("data").eq("key", key));
    return rows[0] && rows[0].data && Object.keys(rows[0].data).length ? rows[0].data : clone(DEFAULTS[key] || {});
  }
  async function savePage(key, data) {
    await q(sb.from("page_content").upsert({ key, data, updated_at: new Date().toISOString() }));
  }

  /* =========================================================
     ABOUT
     ========================================================= */
  views.about = async function () {
    const st = await loadPage("about");
    st.hero = st.hero || []; st.principles = st.principles || [];
    const toDelete = [];
    const heroObj = { v: st.hero.join("\n") };

    function render() {
      view.textContent = "";
      const videoBox = h("div", null,
        h("div", { class: "media-preview" }, mediaEl(st.video_url) || "Nema videa (prikazuje se blok)"),
        h("div", { class: "media-actions" },
          filePicker({ label: st.video_url ? "Zamijeni video" : "Učitaj video", accept: "video/*,image/*" }, async ([f]) => {
            const b = busy("Učitavam…");
            try { const url = await upload(f, "about"); if (st.video_url) toDelete.push(st.video_url); st.video_url = url; render(); }
            catch (e) { toast("Greška: " + errText(e), true); } finally { b.done(); }
          }),
          st.video_url ? h("button", { class: "btn btn-sm btn-danger", type: "button", text: "Ukloni", onclick: () => { toDelete.push(st.video_url); st.video_url = ""; render(); } }) : null
        )
      );
      view.append(
        h("div", { class: "view-head" }, h("h1", { text: "About" }),
          h("div", { class: "tools" }, h("button", { class: "btn btn-primary", text: "Spremi About", onclick: save }))),
        h("div", { class: "box stack" },
          h("h2", { text: "Veliki naslov" }),
          h("label", null, "Redovi naslova (svaki red u novom retku, prazan red = razmak)", txtArea(heroObj, "v", 8))
        ),
        h("div", { class: "box" }, h("h2", { text: "Video" }), videoBox),
        h("div", { class: "box stack" },
          h("h2", { text: "Uvodni tekst" }),
          h("label", null, "Tekst (novi red = prijelom retka)", txtArea(st, "intro", 4))
        ),
        h("div", { class: "box stack" },
          h("h2", { text: "Principi" }),
          h("label", null, "Naslov sekcije", txtInput(st, "principles_title")),
          repList(st.principles, "Princip", (p) => h("div", { class: "stack" },
            h("label", null, "Naslov (novi red = prijelom)", txtArea(p, "title", 2)),
            h("label", null, "Tekst", txtArea(p, "text", 3))
          ), () => ({ title: "", text: "" }), render)
        ),
        h("button", { class: "btn btn-primary", text: "Spremi About", onclick: save })
      );
    }
    async function save() {
      st.hero = heroObj.v.split("\n").map((l) => l.trim());
      while (st.hero.length && !st.hero[st.hero.length - 1]) st.hero.pop();
      const b = busy();
      try {
        await savePage("about", st);
        await removeFiles(toDelete.filter((u) => u !== st.video_url));
        toDelete.length = 0;
        toast("About spremljen.");
      } catch (e) { toast("Greška: " + errText(e), true); } finally { b.done(); }
    }
    render();
  };

  /* =========================================================
     SERVICES
     ========================================================= */
  views.services = async function () {
    const st = await loadPage("services");
    st.sections = st.sections || []; st.clients = st.clients || [];
    st.sections.forEach((s) => { (s.items || []).forEach((it) => { it._lines = (it.lines || []).join("\n"); }); });
    const clientsObj = { v: st.clients.join("\n") };

    function render() {
      view.textContent = "";
      view.append(
        h("div", { class: "view-head" }, h("h1", { text: "Services" }),
          h("div", { class: "tools" }, h("button", { class: "btn btn-primary", text: "Spremi Services", onclick: save }))),
        h("div", { class: "box stack" },
          h("h2", { text: "Sekcije usluga" }),
          h("p", { class: "hint", style: "margin:-8px 0 0", text: "Lista klijenata prikazuje se nakon prve sekcije." }),
          repList(st.sections, "Sekcija", (s) => {
            s.items = s.items || [];
            const cols = h("select", null, h("option", { value: "3", text: "3 stupca" }), h("option", { value: "2", text: "2 stupca" }));
            cols.value = String(s.columns || 3);
            cols.addEventListener("change", () => { s.columns = Number(cols.value); });
            return h("div", { class: "stack" },
              h("div", { class: "row", style: "margin:0" }, h("label", null, "Naslov sekcije", txtInput(s, "title")), h("label", null, "Raspored", cols)),
              repList(s.items, "Usluga", (it) => h("div", { class: "stack" },
                h("label", null, "Naslov (novi red = prijelom)", txtArea(it, "title", 2)),
                h("label", null, "Stavke (svaka u svom retku, bez +)", txtArea(it, "_lines", 6))
              ), () => ({ title: "", _lines: "" }), render)
            );
          }, () => ({ title: "Nova sekcija", columns: 3, items: [] }), render)
        ),
        h("div", { class: "box stack" },
          h("h2", { text: "Klijenti" }),
          h("label", null, "Naslov", txtInput(st, "clients_title")),
          h("label", null, "Klijenti (svaki u svom retku)", txtArea(clientsObj, "v", 10))
        ),
        h("button", { class: "btn btn-primary", text: "Spremi Services", onclick: save })
      );
    }
    async function save() {
      const data = {
        clients_title: st.clients_title || "Our clients",
        clients: clientsObj.v.split("\n").map((l) => l.trim()).filter(Boolean),
        sections: st.sections.map((s) => ({
          title: s.title || "",
          columns: Number(s.columns) === 2 ? 2 : 3,
          items: (s.items || []).map((it) => ({
            title: it.title || "",
            lines: String(it._lines || "").split("\n").map((l) => l.replace(/^\s*\+\s*/, "").trim()).filter(Boolean)
          }))
        }))
      };
      const b = busy();
      try { await savePage("services", data); toast("Services spremljen."); }
      catch (e) { toast("Greška: " + errText(e), true); } finally { b.done(); }
    }
    render();
  };

  /* =========================================================
     POSTAVKE – kontakt podaci, footer, cookie, naslovi
     ========================================================= */
  views.settings = async function () {
    const st = await loadPage("settings");
    const F = (label, key, hint, rows) => h("label", null, label,
      rows ? txtArea(st, key, rows) : txtInput(st, key),
      hint ? h("span", { class: "hint", text: hint }) : null);
    view.textContent = "";
    view.append(
      h("div", { class: "view-head" }, h("h1", { text: "Postavke" }),
        h("div", { class: "tools" }, h("button", { class: "btn btn-primary", text: "Spremi postavke", onclick: save }))),
      h("div", { class: "box stack" },
        h("h2", { text: "Kontakt podaci" }),
        h("p", { class: "hint", style: "margin:-8px 0 0", text: "Prikazuju se u footeru na svim stranicama i na stranici Contact." }),
        h("div", { class: "row" },
          F("Broj mobitela", "phone", "Prazno = sakrij"),
          F("Email", "email", "Na ovaj mail se otvara i ikonica maila")),
        F("Adresa", "address", "Svaki red u novom retku", 3),
        F("Instagram link", "instagram", "Cijeli link, npr. https://www.instagram.com/agency.redo – prazno = sakrij ikonicu")
      ),
      h("div", { class: "box stack" },
        h("h2", { text: "Tekstovi" }),
        F("Naslov na stranici Contact", "contact_title", "Novi red = prijelom", 3),
        F("Naslov stranice Projects", "projects_title"),
        F("Tekst u footeru (iza © godine)", "copyright"),
        F("Cookie obavijest", "cookie_text", null, 2)
      ),
      h("button", { class: "btn btn-primary", text: "Spremi postavke", onclick: save })
    );
    async function save() {
      const b = busy();
      try { await savePage("settings", st); toast("Postavke spremljene."); }
      catch (e) { toast("Greška: " + errText(e), true); } finally { b.done(); }
    }
  };

  /* =========================================================
     PORUKE S KONTAKT FORME
     ========================================================= */
  views.messages = async function () {
    const msgs = await q(sb.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(500));
    view.textContent = "";
    view.append(
      h("div", { class: "view-head" }, h("h1", { text: "Poruke (" + msgs.length + ")" })),
      msgs.length ? h("div", null, msgs.map((m) => h("div", { class: "msg" },
        h("div", { class: "msg-top" },
          h("b", { text: m.name }),
          h("span", { text: new Date(m.created_at).toLocaleString("hr-HR") })),
        h("p", { class: "msg-info" },
          h("a", { href: "mailto:" + m.email, text: m.email }),
          m.phone ? " · " : "", m.phone ? h("a", { href: "tel:" + m.phone.replace(/\s+/g, ""), text: m.phone }) : null,
          " · ", m.service),
        m.message ? h("p", { text: m.message }) : null,
        h("div", { class: "media-actions" },
          h("a", { class: "btn btn-sm", href: "mailto:" + m.email + "?subject=" + encodeURIComponent("Re: " + (m.service || "upit")), text: "Odgovori" }),
          h("button", { class: "btn btn-sm btn-danger", text: "Obriši", onclick: async () => {
            if (!confirm("Obrisati poruku?")) return;
            try { await q(sb.from("contact_messages").delete().eq("id", m.id)); toast("Poruka obrisana."); refresh(); }
            catch (e) { toast("Greška: " + errText(e), true); }
          } })
        )
      ))) : h("p", { class: "empty", text: "Još nema poruka." })
    );
  };
})();
