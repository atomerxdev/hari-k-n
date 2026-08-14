/* ============================================================
   hari.krishnan — portfolio interactions
   ============================================================ */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------
     1. BOOT SCREEN
     ---------------------------------------------------------- */
  const boot = document.getElementById("boot-screen");
  if (boot) {
    const hide = () => boot.classList.add("done");
    if (prefersReducedMotion) hide();
    else setTimeout(hide, 1500);
  }

  /* ----------------------------------------------------------
     2. MATRIX RAIN (subtle, hero background)
     ---------------------------------------------------------- */
  const canvas = document.getElementById("matrix");
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, cols, drops;
    const fontSize = 14;
    const chars = "ABCDEF0123456789<>/\\{}[]#$%&*+-=~".split("");

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      cols = Math.floor(w / fontSize);
      drops = Array(cols).fill(0).map(() => Math.random() * -40);
    };
    resize();
    window.addEventListener("resize", resize);

    let last = 0;
    const frame = (t) => {
      // throttle to ~20fps for a calmer rain
      if (t - last > 50) {
        last = t;
        ctx.fillStyle = "rgba(11, 15, 20, 0.08)";
        ctx.fillRect(0, 0, w, h);
        ctx.font = fontSize + "px monospace";
        for (let i = 0; i < drops.length; i++) {
          const ch = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillStyle = Math.random() > 0.975 ? "#00e08f" : "rgba(0, 224, 143, 0.55)";
          ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > h && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        }
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /* ----------------------------------------------------------
     3. TERMINAL TYPING EFFECT
     ---------------------------------------------------------- */
  const termText = document.getElementById("terminal-text");
  const cursor = document.getElementById("terminal-cursor");
  if (termText) {
    const lines = [
      "$ whoami",
      "hari.krishnan.n — cybersecurity analyst / pentester",
      "",
      "$ cat about_me.txt",
      "I study how systems break so I can help",
      "fix them — before someone with bad",
      "intentions finds them first.",
      "",
      "$ ./status --check",
      "[ OK ] curiosity........... enabled",
      "[ OK ] persistence......... enabled",
      "[ OK ] ethics.............. MAX",
      "[ !! ] coffee intake....... CRITICAL",
      "",
      "$ ▍",
    ];

    const bootDelay = prefersReducedMotion ? 0 : 1400;

    let li = 0, ci = 0, active = true;
    const lineSpeed = () => (li === 0 ? 55 : 26); // faster after first line

    const type = () => {
      if (!active) return;
      if (li >= lines.length) return;

      const line = lines[li];
      if (ci <= line.length) {
        termText.textContent = lines.slice(0, li).join("\n") + (ci ? "\n" : "") + line.slice(0, ci);
        ci++;
        setTimeout(type, lineSpeed());
      } else {
        ci = 0;
        li++;
        setTimeout(type, li >= lines.length ? 0 : 260);
      }
    };

    setTimeout(() => {
      type();
      // stop blinking cursor once done, show block at end
      if (cursor) {
        cursor.style.animation = "none";
        cursor.textContent = "▋";
      }
    }, bootDelay);

    // pause typing while hero is off-screen
    const ioTerm = new IntersectionObserver((entries) => {
      active = entries[0].isIntersecting;
    }, { threshold: 0.1 });
    ioTerm.observe(document.getElementById("home"));
  }

  /* ----------------------------------------------------------
     4. NAV — mobile toggle + active section highlight
     ---------------------------------------------------------- */
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      navToggle.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  const navAnchor = document.querySelectorAll(".nav-links a");
  const sections = [...document.querySelectorAll("main section[id]")];
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navAnchor.forEach((a) =>
          a.classList.toggle("active", a.getAttribute("href") === "#" + id)
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  /* ----------------------------------------------------------
     5. SCROLL REVEAL + SKILL BAR FILL + COUNTERS
     ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  const revealIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealIo.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => revealIo.observe(el));

  // animate skill bars once visible
  const bars = document.querySelectorAll(".bar span, .p-bar span");
  const barIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.style.getPropertyValue("--p") || "90%";
          barIo.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  bars.forEach((b) => barIo.observe(b));

  // animated counters
  const stats = document.querySelectorAll(".stat-num");
  const countIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (!el.dataset.count) return; // static stats (e.g. "∞") are not counted
        const target = +el.dataset.count;
        const duration = 1400;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        countIo.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  stats.forEach((s) => countIo.observe(s));

  /* ----------------------------------------------------------
     6. CONTACT FORM (demo submit)
     ---------------------------------------------------------- */
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  if (form && status) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const msg = form.message.value.trim();

      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !validEmail || !msg) {
        status.textContent = "[!] all fields required — and that email needs an @";
        status.classList.add("error");
        return;
      }
      status.classList.remove("error");
      status.textContent = "[ ✓ ] packet received. encrypting reply...";
      form.reset();
      setTimeout(() => {
        status.textContent = "[ ✓ ] transmitted. expect a response within 24h.";
      }, 1400);
    });
  }

  /* ----------------------------------------------------------
     7. EASTER EGG — type "1337" anywhere
     ---------------------------------------------------------- */
  const egg = document.getElementById("easter-egg");
  if (egg) {
    let buffer = "";
    window.addEventListener("keydown", (e) => {
      buffer = (buffer + e.key).slice(-4).toLowerCase();
      if (buffer === "1337") {
        egg.classList.add("show");
        setTimeout(() => egg.classList.remove("show"), 2600);
      }
    });
  }
})();
