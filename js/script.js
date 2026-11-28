/* =========================================================
   AGENCY REDO – web stranica
   Čisti JavaScript, bez biblioteka.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- pomoćne funkcije ---------- */
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  // jednostavan "seeded" random – da raspored bude uvijek isti
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  let vw = window.innerWidth;
  let vh = window.innerHeight;
  const isMobile = () => vw <= 768;

  const storage = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ništa */ } }
  };

  /* ---------- boje placeholder blokova ---------- */
  const palette = [
    ["#5b4a3a", "#1b1410"], ["#36495a", "#0f151b"], ["#6b5d4e", "#26201a"],
    ["#2f3b2f", "#0e130e"], ["#7a5a46", "#2a1a12"], ["#46566b", "#141a22"],
    ["#5e5e5e", "#1a1a1a"], ["#7b6a55", "#302719"], ["#3c4f57", "#0c1417"],
    ["#6d4c4c", "#1e1212"], ["#4f5a3e", "#171b10"], ["#8a7a66", "#2b241c"]
  ];
  $$(".wheel .ph, .ring-panel.ph").forEach((el, i) => {
    const p = palette[(i * 5) % palette.length];
    el.style.setProperty("--c1", p[0]);
    el.style.setProperty("--c2", p[1]);
  });

  /* =========================================================
     LOADER – čeka da se učitaju slike i videi, pa se podigne
     ========================================================= */
  const header = $("#header");
  const cookie = $("#cookie-banner");
  const loader = $("#loader");
  const LOADER_MIN = 1200;   // najkraće trajanje (ms) da ne "bljesne"
  const LOADER_MAX = 15000;  // ako nešto zapne, stranica se ipak otvori nakon 15 s

  if (!loader) {
    // About / Services nemaju loader
    header.classList.add("is-visible");
    setTimeout(showCookie, 400);
  } else {
    const num = $("#loader-num");
    const media = $$("img, video").filter((el) => !loader.contains(el));
    const doneSet = new Set();
    let total = media.length + 1; // +1 = fontovi
    const mark = (el) => { doneSet.add(el); };

    media.forEach((el) => {
      if (el.tagName === "IMG") {
        if (el.complete) mark(el);
        else {
          el.addEventListener("load", () => mark(el), { once: true });
          el.addEventListener("error", () => mark(el), { once: true });
        }
      } else {
        // video je "spreman" kad se može pokrenuti
        el.preload = "auto";
        if (el.readyState >= 3) mark(el);
        else {
          el.addEventListener("canplay", () => mark(el), { once: true });
          el.addEventListener("error", () => mark(el), { once: true });
        }
      }
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => mark("fonts"));
    else mark("fonts");

    const started = performance.now();
    let shown = 0;
    let finished = false;

    const finish = () => {
      finished = true;
      num.textContent = "100";
      setTimeout(() => {
        window.scrollTo(0, 0);
        loader.classList.add("is-done");
        header.classList.add("is-visible");
        setTimeout(() => {
          loader.classList.add("is-gone");
          document.body.classList.remove("is-locked");
          showCookie();
        }, 1100);
      }, 250);
    };

    const tickLoader = (now) => {
      if (finished) return;
      const elapsed = now - started;
      let target = doneSet.size / total;
      // ne dopusti 100% prije minimalnog vremena
      target = Math.min(target, elapsed / LOADER_MIN);
      if (elapsed > LOADER_MAX) target = 1;
      shown = lerp(shown, target, 0.08);
      if (target >= 1 && shown > 0.995) shown = 1;
      num.textContent = String(Math.floor(shown * 100));
      if (shown >= 1) finish();
      else requestAnimationFrame(tickLoader);
    };
    requestAnimationFrame(tickLoader);
  }

  /* =========================================================
     COOKIE BANNER
     ========================================================= */
  function showCookie() {
    if (storage.get("redo-cookie")) return;
    cookie.classList.remove("is-hidden");
    // donja navigacija (About|Services / kategorije) se podigne iznad obavijesti
    document.documentElement.style.setProperty("--cookie-h", cookie.offsetHeight + "px");
    document.body.classList.add("cookie-open");
  }
  $$("[data-cookie]", cookie).forEach((b) =>
    b.addEventListener("click", () => {
      storage.set("redo-cookie", b.dataset.cookie);
      cookie.classList.add("is-hidden");
      document.body.classList.remove("cookie-open");
    })
  );

  /* =========================================================
     MENU (overlay + 3D prsten projekata)
     ========================================================= */
  const menuBtn = $("#menu-toggle");
  const menu = $("#core-menu");
  const ring = $("#ring");
  // prsten: 9 projekata ponovljeno 2x (18 panela) kao gusti kružni niz
  $$(".ring-panel", ring).forEach((p) => ring.appendChild(p.cloneNode(true)));
  const panels = $$(".ring-panel", ring);
  let menuOpen = false;
  let menuOpenedAt = 0;
  let ringAngle = 0;
  let ringMouseX = 0, ringMouseY = 0, ringMX = 0, ringMY = 0;

  function layoutRing() {
    const n = panels.length;
    const w = isMobile() ? vw * 0.42 : Math.max(vw * 0.19, 240);
    const h = isMobile() ? vh * 0.3 : Math.max(vh * 0.56, 260);
    const r = (n * w) / (2 * Math.PI) * 0.98;
    panels.forEach((p, i) => {
      p.style.width = w + "px";
      p.style.height = h + "px";
      p.style.left = -w / 2 + "px";
      p.style.top = -h / 2 + "px";
      p.style.transform = `rotateY(${(i * 360) / n}deg) translateZ(${r}px)`;
    });
    ring.dataset.r = r;
  }

  function setMenu(open) {
    menuOpen = open;
    document.body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    if (open) menuOpenedAt = performance.now();
  }
  // "stakleni" sloj teksta u izborniku: kopija navigacije koja daje svijetli
  // rub slovima, dok originalna slova mijenjaju boju kad prsten prođe iza njih
  const menuNav = $(".menu-nav", menu);
  if (menuNav) {
    const wrap = document.createElement("div");
    wrap.className = "menu-nav-wrap";
    menuNav.parentNode.insertBefore(wrap, menuNav);
    wrap.appendChild(menuNav);
    const glass = menuNav.cloneNode(true);
    glass.className = "menu-nav menu-nav-glass";
    glass.setAttribute("aria-hidden", "true");
    $$("a", glass).forEach((a) => { a.setAttribute("tabindex", "-1"); a.removeAttribute("href"); });
    wrap.appendChild(glass);
  }

  menuBtn.addEventListener("click", () => setMenu(!menuOpen));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menuOpen) setMenu(false); });
  menu.addEventListener("mousemove", (e) => {
    ringMouseX = (e.clientX / vw - .5) * 2;
    ringMouseY = (e.clientY / vh - .5) * 2;
  });

  function updateRing(dt, now) {
    const r = parseFloat(ring.dataset.r || 600);
    const t = clamp((now - menuOpenedAt) / 1400);
    const e = easeOut(t);
    ringAngle += dt * (8 + (1 - e) * 120); // na otvaranju brzo, pa se smiri
    ringMX = lerp(ringMX, ringMouseX, .05);
    ringMY = lerp(ringMY, ringMouseY, .05);
    const tiltX = -14 + ringMY * 6;
    const tiltZ = -11 + ringMX * 4;
    const scale = lerp(.55, 1, e);
    ring.style.transform =
      `translateZ(${-r * 0.55}px) scale(${scale}) rotateZ(${tiltZ}deg) rotateX(${tiltX}deg) rotateY(${ringAngle}deg)`;
  }

  /* =========================================================
     IMAGE WHEEL – slike kruže po velikom luku
     (svaka slika zadržava svoje dimenzije: 1080x1350, 1080x1920, 1920x1080...)
     (rekonstrukcija originala: rotacija oko točke izvan ekrana,
      blokovi se protu-rotiraju i povećavaju na sredini luka)
     ========================================================= */
  const wheelSection = $("#wheel-section");
  const wheel = $("#wheel");
  const figs = $$("figure", wheel);
  const N = figs.length;
  const STEP = 1.4506;                 // razmak između blokova (stupnjevi)
  const SPAN = N * STEP;               // ukupni luk (ovisi o broju slika)
  const START = -11;                   // ulaz gore lijevo
  const PEAK = -46;                    // najveća slika
  const FALLOFF = 14.5;
  const items = figs.map((f) => ({
    fig: f,
    inner: f.firstElementChild,
    img: f.querySelector("img, video"),
    ratio: 16 / 9,             // dok se slika ne učita (i za prazne blokove)
    yoff: (rnd() * 2 - 1) * 180,
    lastZ: -1
  }));
  let wheelPhase = 0;
  let wheelU = 1, wheelShiftX = 0, wheelShiftY = 0;

  // veličina bloka prema omjeru slike – sve slike imaju sličnu površinu
  function sizeWheelItem(it) {
    const W = 480 * wheelU, H = 270 * wheelU;
    const area = W * H;
    const w = Math.sqrt(area * it.ratio);
    const h = Math.sqrt(area / it.ratio);
    it.inner.style.width = w + "px";
    it.inner.style.height = h + "px";
    it.inner.style.left = (W - w) / 2 + "px";
    it.inner.style.top = (H - h) / 2 + "px";
  }
  items.forEach((it) => {
    const m = it.img;
    if (!m) return;
    const apply = () => {
      const nw = m.naturalWidth || m.videoWidth, nh = m.naturalHeight || m.videoHeight;
      if (nw && nh) { it.ratio = nw / nh; sizeWheelItem(it); }
    };
    if (m.tagName === "IMG") {
      if (m.complete) apply(); else m.addEventListener("load", apply, { once: true });
    } else {
      if (m.readyState >= 1) apply(); else m.addEventListener("loadedmetadata", apply, { once: true });
    }
  });

  function layoutWheel() {
    const u = Math.max(vw / 1920, isMobile() ? 0.42 : 0.5);
    wheelU = u;
    const W = 480 * u, H = 270 * u;
    figs.forEach((f) => {
      f.style.width = W + "px";
      f.style.height = H + "px";
      f.style.left = -W + "px";
      f.style.top = -H + "px";
      f.style.transformOrigin = `${1920 * u}px ${-1009 * u}px`;
    });
    items.forEach(sizeWheelItem);
    // centriraj vrh luka (najveću sliku) na ~57% širine i ~79% visine
    wheelShiftX = vw * 0.57 - 1096 * u;
    wheelShiftY = vh * 0.79 - 724 * u;
    wheel.style.transform = `translate(${wheelShiftX}px, ${wheelShiftY}px)`;
  }

  function updateWheel(dt, velocity) {
    const rect = wheelSection.getBoundingClientRect();
    if (rect.bottom < -50 || rect.top > vh + 50) return;

    // otkrivanje luka dok sekcija ulazi u ekran
    const reveal = clamp((vh * 0.55 - rect.top) / (vh * 0.9));
    wheelPhase += dt * (4.2 + Math.min(Math.abs(velocity) * 0.02, 18));

    for (let i = 0; i < N; i++) {
      const it = items[i];
      const pos = ((i * STEP + wheelPhase) % SPAN + SPAN) % SPAN; // 0..SPAN
      const a = START - pos;
      const d = Math.abs(a - PEAK);
      const k = d < FALLOFF ? Math.pow(1 - (d / FALLOFF) * (d / FALLOFF), 1.5) : 0;
      const s = 0.2 + 0.8 * k;
      // blago pojavljivanje na rubovima luka
      const edge = clamp(pos / 2.5) * clamp((SPAN - pos) / 2.5);
      const shown = pos / SPAN < reveal * 1.15 ? 1 : 0;
      it.fig.style.transform = `rotate(${a}deg)`;
      it.fig.style.opacity = (edge * shown).toFixed(3);
      it.inner.style.transform =
        `translate3d(0, ${it.yoff * wheelU}px, 0) rotate(${-a}deg) scale(${s})`;
      const z = 100 + Math.round(k * 400);
      if (z !== it.lastZ) { it.fig.style.zIndex = z; it.lastZ = z; }
    }
  }

  /* =========================================================
     SPLIT TEXT – riječi se razmiču pa skupljaju pri skrolanju
     ========================================================= */
  const splits = $$("[data-split]").map((el) => {
    const lines = $$(".flex-line", el);
    const spread = parseFloat(el.dataset.spread || 1);
    const data = [];
    lines.forEach((line, L) => {
      const words = line.textContent.trim().split(/\s+/);
      line.innerHTML = words.map((w) => `<span class="word">${w}</span>`).join("");
      const spans = $$(".word", line);
      const m = spans.length;
      const f = lines.length > 1 ? L / (lines.length - 1) : 1;
      spans.forEach((sp, i) => {
        const centered = m > 1 ? (i - (m - 1) / 2) / ((m - 1) / 2) : 0;
        // malo nepravilnosti kao u originalu
        const jitter = 0.65 + rnd() * 0.7;
        data.push({ el: sp, k: centered * f * jitter * spread });
      });
    });
    return { el, data };
  });

  function updateSplits() {
    splits.forEach(({ el, data }) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      // 0 kad tekst uđe dolje, 1 kad je centar teksta na ~55% ekrana
      const p = clamp((vh - r.top) / (vh * 0.45 + r.height / 2));
      const e = 1 - easeInOut(p);
      const gap = vw * (isMobile() ? 0.12 : 0.11);
      data.forEach((w) => {
        w.el.style.transform = `translate3d(${(w.k * gap * e).toFixed(1)}px,0,0)`;
      });
    });
  }

  /* =========================================================
     KATEGORIJE – zakvačena scena, "tekući" prijelazi
     ========================================================= */
  const catSection = $("#categories");
  const catLayersWrap = $("#cat-layers");
  const catLayers = $$(".cat-media", catLayersWrap);
  const captions = $$(".category-caption");
  const disp = $("#liquid-disp");
  const turb = $("#liquid-turb");
  // točke prijelaza: uvod -> advertising -> cinema -> experience
  const T = [0.1, 0.42, 0.74];
  const TW = 0.07; // širina prijelaza
  let catActiveVideo = null;
  let catMuted = true, catPaused = false;

  function updateCategories(now) {
    const r = catSection.getBoundingClientRect();
    if (r.bottom < -50 || r.top > vh + 50) {
      catLayers.forEach((l) => { const v = $("video", l); if (v && !v.paused) v.pause(); });
      return;
    }
    const p = clamp(-r.top / (r.height - vh));

    // koja dva sloja se miješaju
    let from = 0, to = 0, mix = 0, liquid = 0;
    for (let i = 0; i < T.length; i++) {
      if (p >= T[i] - TW / 2) { from = i; to = i + 1; mix = clamp((p - (T[i] - TW / 2)) / TW); }
    }
    if (p < T[0] - TW / 2) { from = 0; to = 0; mix = 0; }
    if (mix >= 1) { from = to; mix = 0; }
    liquid = Math.sin(Math.PI * mix);

    catLayers.forEach((l, i) => {
      let o = 0;
      if (i === from) o = 1;
      if (i === to && to !== from) o = easeInOut(mix);
      l.style.opacity = o;
      l.style.zIndex = i === to ? 2 : 1;
      l.style.transform = i === to && to !== from ? `scale(${1.08 - .08 * easeOut(mix)})` : "";
    });

    if (liquid > 0.01) {
      catLayersWrap.classList.add("is-liquid");
      catLayersWrap.style.transform = `scale(${1 + liquid * 0.12})`;
      disp.setAttribute("scale", (liquid * 160).toFixed(1));
      const bf = 0.004 + liquid * 0.004;
      turb.setAttribute("baseFrequency", `${bf.toFixed(4)} ${(bf * 3).toFixed(4)}`);
      turb.setAttribute("seed", String(Math.floor(now / 120) % 50));
    } else {
      catLayersWrap.classList.remove("is-liquid");
      catLayersWrap.style.transform = "";
    }

    // video – svira samo aktivni sloj
    const active = mix > .5 ? to : from;
    catLayers.forEach((l, i) => {
      const v = $("video", l);
      if (!v) return;
      v.muted = catMuted;
      if (i === active && !catPaused) { if (v.paused) v.play().catch(() => {}); }
      else if (!v.paused) v.pause();
      if (i === active) catActiveVideo = v;
    });

    // natpisi – putuju od dna prema vrhu dok je kategorija aktivna
    captions.forEach((c, idx) => {
      const k = idx + 1;
      const s = T[k - 1];
      const e = k < T.length ? T[k] : 1.02;
      const u = clamp((p - s) / (e - s));
      const y = lerp(vh * (isMobile() ? 0.78 : 0.8), vh * 0.14, u);
      let o = clamp(u / 0.12) * (k < T.length ? clamp((1 - u) / 0.12) : 1);
      if (p < s) o = 0;
      c.style.transform = `translate3d(0, ${y}px, 0)`;
      c.style.opacity = o.toFixed(3);
      c.classList.toggle("is-active", o > .5);
    });
  }

  if (catSection) $("#cat-sound").addEventListener("click", (e) => {
    catMuted = !catMuted;
    e.currentTarget.classList.toggle("unmuted", !catMuted);
  });
  if (catSection) $("#cat-pause").addEventListener("click", (e) => {
    catPaused = !catPaused;
    e.currentTarget.classList.toggle("paused", catPaused);
    if (catPaused && catActiveVideo) catActiveVideo.pause();
  });

  /* =========================================================
     CTA – "scramble" slova (slova se izmiješaju pa slože)
     ========================================================= */
  function scramble(el) {
    const final = el.dataset.text || el.textContent;
    el.dataset.text = final;
    if (el._running) return;
    el._running = true;
    const letters = final.split("");
    const duration = 650;
    const start = performance.now();
    const tick = (now) => {
      const p = clamp((now - start) / duration);
      const fixed = Math.floor(p * letters.length);
      const rest = letters.slice(fixed).filter((c) => c !== " ");
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }
      let k = 0;
      el.textContent = letters.map((c, i) => (i < fixed || c === " " ? c : rest[k++])).join("");
      if (p < 1) requestAnimationFrame(tick);
      else { el.textContent = final; el._running = false; }
    };
    requestAnimationFrame(tick);
  }
  const ctaLabels = $$(".cta .label");
  ctaLabels.forEach((l) => {
    l.closest(".cta").addEventListener("mouseenter", () => scramble(l));
  });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { scramble(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 1 });
    ctaLabels.forEach((l) => io.observe(l));
  }

  /* =========================================================
     STAGGER – elementi liste / tima se pojavljuju jedan po jedan
     ========================================================= */
  const staggerItems = $$("[data-stagger] > *");
  if (staggerItems.length && "IntersectionObserver" in window) {
    let queue = [];
    let flushing = false;
    const flush = () => {
      if (!queue.length) { flushing = false; return; }
      flushing = true;
      queue.shift().classList.add("is-in");
      setTimeout(flush, 110);
    };
    const so = new IntersectionObserver((entries) => {
      entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => staggerItems.indexOf(a.target) - staggerItems.indexOf(b.target))
        .forEach((e) => { queue.push(e.target); so.unobserve(e.target); });
      if (!flushing) flush();
    }, { rootMargin: "0px 0px -12% 0px" });
    staggerItems.forEach((el) => so.observe(el));
  } else {
    staggerItems.forEach((el) => el.classList.add("is-in"));
  }

  /* =========================================================
     ABOUT – naslov (riječi ulaze odozdo) + video koji se sužava
     ========================================================= */
  const aboutHero = $(".about-hero");
  if (aboutHero) {
    let w = 0;
    $$(".flex-line", aboutHero).forEach((line) => {
      const words = line.textContent.trim().split(/\s+/);
      line.innerHTML = words.map((x) => `<span class="word">${x}</span>`).join("");
      $$(".word", line).forEach((sp) => { sp.style.transitionDelay = (0.15 + w++ * 0.03) + "s"; });
    });
    setTimeout(() => aboutHero.classList.add("is-in"), 250);
  }

  const aboutMedia = $(".about-media");
  function updateAboutMedia() {
    const r = aboutMedia.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    // ulaz: suženo -> puna širina ; izlaz: puna širina -> suženo
    const enter = clamp(1 - r.top / vh);
    const exit = clamp(1 - r.bottom / vh);
    const k = (1 - easeOut(enter)) + easeInOut(exit);
    const inset = clamp(k) * (isMobile() ? 6 : 12.5);
    aboutMedia.style.clipPath = `inset(0 ${inset}% 0 ${inset}%)`;
  }
  if (aboutMedia) {
    const v = $("video", aboutMedia);
    const snd = $(".toggle-sound", aboutMedia), pp = $(".toggle-play-pause", aboutMedia);
    if (snd) snd.addEventListener("click", () => {
      snd.classList.toggle("unmuted");
      if (v) v.muted = !snd.classList.contains("unmuted");
    });
    if (pp) pp.addEventListener("click", () => {
      pp.classList.toggle("paused");
      if (v) pp.classList.contains("paused") ? v.pause() : v.play().catch(() => {});
    });
  }

  /* tab-nav (About | Services) se sakrije kad dođe footer */
  const tabNav = $(".tab-nav");
  const footerEl = $(".site-footer");
  function updateTabNav() {
    const r = footerEl.getBoundingClientRect();
    const hide = r.top < vh - 40;
    tabNav.style.opacity = hide ? 0 : "";
    tabNav.style.pointerEvents = hide ? "none" : "";
    tabNav.style.transition = "opacity .4s ease";
  }

  /* =========================================================
     PROJECTS – detalj projekta (otvara se klikom na karticu)
     ========================================================= */
  const projectCards = $$(".project-card");
  let projectView = null;

  // YouTube / Shorts / Vimeo / MP4 link -> podaci za ugradnju
  function parseVideo(input) {
    const url = String((input && input.url) || input || "").trim();
    let m;
    if ((m = url.match(/youtube\.com\/shorts\/([\w-]{6,})/i))) return { provider: "youtube", id: m[1], kind: "short", url };
    if ((m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|live\/|v\/)|youtu\.be\/)([\w-]{6,})/i))) return { provider: "youtube", id: m[1], kind: "video", url };
    if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i))) return { provider: "vimeo", id: m[1], kind: "video", url };
    if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) return { provider: "file", kind: "video", url };
    return null;
  }
  function videoNode(v) {
    const info = parseVideo(v);
    if (!info) return null;
    const kind = (v && v.kind) || info.kind;
    const box = document.createElement("div");
    box.className = "pv-video" + (kind === "short" ? " is-short" : "");
    if (info.provider === "file") {
      const vid = document.createElement("video");
      vid.src = info.url; vid.controls = true; vid.playsInline = true; vid.preload = "metadata";
      box.appendChild(vid);
    } else {
      const f = document.createElement("iframe");
      f.src = info.provider === "youtube"
        ? `https://www.youtube-nocookie.com/embed/${info.id}?rel=0&modestbranding=1&playsinline=1`
        : `https://player.vimeo.com/video/${info.id}?dnt=1`;
      f.title = "Video";
      f.loading = "lazy";
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      f.allowFullscreen = true;
      f.referrerPolicy = "strict-origin-when-cross-origin";
      box.appendChild(f);
    }
    return box;
  }
  const isVid = (src) => /\.(mp4|webm|mov|m4v|ogv)(\?|$)/i.test(src || "");
  function mediaNode(src, alt) {
    const m = document.createElement(isVid(src) ? "video" : "img");
    m.src = src;
    if (isVid(src)) { m.muted = true; m.loop = true; m.autoplay = true; m.playsInline = true; }
    else { m.alt = alt || ""; m.loading = "lazy"; m.decoding = "async"; }
    return m;
  }

  function buildProjectView() {
    projectView = document.createElement("div");
    projectView.className = "project-view";
    projectView.setAttribute("role", "dialog");
    projectView.setAttribute("aria-modal", "true");
    projectView.setAttribute("aria-hidden", "true");
    projectView.innerHTML =
      '<div class="pv-bar"><span class="pv-meta"></span>' +
      '<button class="pv-close" type="button">CLOSE <span aria-hidden="true">×</span></button></div>' +
      '<article class="pv-inner">' +
        '<h2 class="pv-title"></h2>' +
        '<dl class="pv-facts"></dl>' +
        '<div class="pv-hero"></div>' +
        '<div class="pv-texts"></div>' +
        '<div class="pv-gallery pv-gallery-main"></div>' +
        '<div class="pv-videos"></div>' +
        '<div class="pv-gallery pv-gallery-extra"></div>' +
      '</article>';
    document.body.appendChild(projectView);
    $(".pv-close", projectView).addEventListener("click", closeProject);
  }

  function readProject(card) {
    let p = {};
    try { p = JSON.parse(card.dataset.project || "{}"); } catch (e) { p = {}; }
    if (!p.title) p.title = ($(".pc-name", card) || {}).textContent || "";
    if (!p.cover_url) {
      const m = $(".pc-media img, .pc-media video", card);
      if (m) p.cover_url = m.getAttribute("src");
    }
    return p;
  }

  function openProject(card) {
    if (!projectView) buildProjectView();
    const p = readProject(card);
    const pv = projectView;
    $(".pv-title", pv).textContent = p.title || "";
    $(".pv-meta", pv).textContent = [p.category, p.subtitle !== p.category ? p.subtitle : "", p.year].filter(Boolean).join(" / ");

    // podaci: klijent, lokacija, godina, web
    const facts = $(".pv-facts", pv);
    facts.textContent = "";
    const fact = (label, value) => {
      if (!value) return;
      const d = document.createElement("div");
      const dt = document.createElement("dt"); dt.textContent = label;
      const dd = document.createElement("dd");
      if (value instanceof Node) dd.appendChild(value); else dd.textContent = value;
      d.append(dt, dd);
      facts.appendChild(d);
    };
    fact("Client", p.client);
    fact("Location", p.location);
    fact("Year", p.year);
    if (p.website_enabled && p.website_url) {
      const a = document.createElement("a");
      const href = /^https?:\/\//i.test(p.website_url) ? p.website_url : "https://" + p.website_url;
      a.href = href; a.target = "_blank"; a.rel = "noopener";
      a.textContent = href.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "") + " ↗";
      fact("Website", a);
    }
    facts.hidden = !facts.children.length;

    // naslovna slika – u pravom omjeru
    const hero = $(".pv-hero", pv);
    hero.textContent = "";
    if (p.cover_url) hero.appendChild(mediaNode(p.cover_url, p.title));

    // tekstovi
    const texts = $(".pv-texts", pv);
    texts.textContent = "";
    [["About the project", p.description], ["Goal & task", p.goal]].forEach(([label, txt]) => {
      if (!txt) return;
      const s = document.createElement("section");
      const h = document.createElement("h3"); h.className = "pv-label"; h.textContent = label;
      const para = document.createElement("p"); para.textContent = txt;
      s.append(h, para);
      texts.appendChild(s);
    });
    texts.hidden = !texts.children.length;

    // galerije (svaka slika u svom stvarnom omjeru, po dvije u redu)
    const fillGallery = (sel, list) => {
      const g = $(sel, pv);
      g.textContent = "";
      (list || []).filter(Boolean).forEach((src) => {
        const fig = document.createElement("figure");
        fig.appendChild(mediaNode(src, p.title));
        g.appendChild(fig);
      });
      g.hidden = !g.children.length;
    };
    fillGallery(".pv-gallery-main", p.gallery);
    fillGallery(".pv-gallery-extra", p.gallery_extra);

    // videi (YouTube, Shorts, Vimeo, MP4)
    const vids = $(".pv-videos", pv);
    vids.textContent = "";
    (p.videos || []).forEach((v) => { const n = videoNode(v); if (n) vids.appendChild(n); });
    vids.hidden = !vids.children.length;

    pv.scrollTop = 0;
    pv.classList.add("is-open");
    pv.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked-view");
    $(".pv-close", pv).focus({ preventScroll: true });
    pv._from = card;
  }
  function closeProject() {
    if (!projectView || !projectView.classList.contains("is-open")) return;
    projectView.classList.remove("is-open");
    projectView.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked-view");
    // zaustavi sve videe
    $$("video", projectView).forEach((v) => v.pause());
    setTimeout(() => { if (!projectView.classList.contains("is-open")) $(".pv-videos", projectView).textContent = ""; }, 800);
    if (projectView._from) projectView._from.focus({ preventScroll: true });
  }
  projectCards.forEach((card) => {
    card.addEventListener("click", () => openProject(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openProject(card); }
    });
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeProject(); });

  const projectTabs = $$(".project-tabs .tab-link");
  const projectSections = $$(".project-category");
  function updateProjectTabs() {
    let current = projectSections[0];
    projectSections.forEach((s) => {
      if (s.getBoundingClientRect().top < vh * 0.45) current = s;
    });
    projectTabs.forEach((t) => {
      const on = t.getAttribute("href") === "#" + current.id;
      t.classList.toggle("active", on);
      if (on) t.setAttribute("aria-current", "true"); else t.removeAttribute("aria-current");
    });
  }

  /* =========================================================
     KONTAKT FORMA – šalje na Supabase Edge funkciju (Resend + baza)
     ========================================================= */
  const form = $("#contact-form");
  if (form) {
    const status = $("#form-status");
    const btn = $(".form-submit", form);
    const cfg = window.REDO_CONFIG || {};
    // polja s tekstom: oznaka se podigne kad je polje popunjeno
    $$("input, select, textarea", form).forEach((f) => {
      const upd = () => f.closest(".field") && f.closest(".field").classList.toggle("has-value", !!f.value);
      f.addEventListener("input", upd); f.addEventListener("change", upd); upd();
    });
    const msg = $("textarea", form);
    if (msg) msg.addEventListener("input", () => { msg.style.height = "auto"; msg.style.height = msg.scrollHeight + "px"; });

    const setStatus = (t, type) => { status.textContent = t; status.dataset.type = type || ""; };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      $$(".field", form).forEach((f) => f.classList.remove("is-error"));
      let bad = null;
      if (!data.name || data.name.trim().length < 2) bad = bad || "name";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || "")) bad = bad || "email";
      if (!data.service) bad = bad || "service";
      if (bad) {
        const f = form.elements[bad];
        f.closest(".field").classList.add("is-error");
        f.focus();
        setStatus("Please fill in your name, a valid email and the service.", "error");
        return;
      }
      // bez Supabasea: otvori mail program s popunjenim upitom
      if (!cfg.supabaseUrl || !cfg.supabaseKey) {
        const body = `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || "-"}\nService: ${data.service}\n\n${data.message || ""}`;
        location.href = `mailto:${cfg.contactEmail || "os.agency.redo@gmail.com"}?subject=${encodeURIComponent("New inquiry – " + data.name)}&body=${encodeURIComponent(body)}`;
        return;
      }
      btn.disabled = true;
      setStatus("Sending…", "");
      try {
        const url = cfg.supabaseUrl.replace(/\/+$/, "") + "/functions/v1/" + (cfg.contactFunction || "contact");
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: cfg.supabaseKey },
          body: JSON.stringify(data)
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || !out.ok) throw new Error(out.error || "Error " + res.status);
        form.reset();
        $$(".field", form).forEach((f) => f.classList.remove("has-value"));
        setStatus("Thank you! We'll get back to you soon.", "ok");
      } catch (err) {
        setStatus("Something went wrong. Please try again or email us directly.", "error");
      } finally {
        btn.disabled = false;
      }
    });
  }

  /* godina u footeru */
  $$("[data-year]").forEach((n) => { n.textContent = String(new Date().getFullYear()); });

  /* ako je u adresi #kategorija (npr. projects.html#cinema), skrolaj do nje
     nakon što se sadržaj iz admin panela ubacio u stranicu */
  if (location.hash.length > 1) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: "auto" }));
  }

  /* =========================================================
     PRIJELAZ IZMEĐU STRANICA (fade)
     ========================================================= */
  $$("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (!/\.html(#.*)?$/.test(href) || a.target === "_blank") return;
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      const [file, hash] = href.split("#");
      const here = location.pathname.split("/").pop() || "index.html";
      if (file === here && hash) {
        // ista stranica (npr. projects.html#cinema na projects.html) – samo skrolaj
        const target = document.getElementById(hash);
        if (target) target.scrollIntoView({ behavior: "smooth" });
        history.replaceState(null, "", "#" + hash);
        return;
      }
      document.body.classList.add("is-leaving-page");
      setTimeout(() => { window.location.href = href; }, 420);
    });
  });
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) document.body.classList.remove("is-leaving-page");
  });

  /* =========================================================
     GLAVNA PETLJA
     ========================================================= */
  let lastT = performance.now();
  let lastScroll = window.scrollY;
  let velocity = 0;

  function frame(now) {
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;
    const sy = window.scrollY;
    velocity = lerp(velocity, (sy - lastScroll) / Math.max(dt, 0.001), 0.15);
    lastScroll = sy;

    if (!menuOpen) {
      if (wheelSection) updateWheel(dt, velocity);
      updateSplits();
      if (catSection) updateCategories(now);
      if (aboutMedia) updateAboutMedia();
      if (tabNav && footerEl) updateTabNav();
      if (projectTabs.length) updateProjectTabs();
    } else {
      updateRing(dt, now);
    }
    requestAnimationFrame(frame);
  }

  function onResize() {
    vw = window.innerWidth;
    vh = window.innerHeight;
    if (wheelSection) layoutWheel();
    layoutRing();
  }
  window.addEventListener("resize", onResize);
  onResize();
  requestAnimationFrame(frame);
})();
