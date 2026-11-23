/*
 * Premium Cinematic Page Transition — Full-element Up / Down
 *
 * Forward navigation (any internal link):
 *   All page elements fade + move UP and out, black overlay covers,
 *   new page elements rise FROM BELOW and settle.
 *
 * Back / history navigation:
 *   Detected via performance.navigation / pageshow; reverse direction
 *   (elements exit downward, enter from above).
 *
 * Every major visual element participates — not only the top bar.
 * Black glassmorphism overlay with soft ambient highlight.
 * Respects prefers-reduced-motion. Prevents rapid-click double triggers.
 */
(function () {
  "use strict";

  var OVERLAY_ID = "pageTransitionOverlay";
  var STYLES_ID = "pageTransitionStyles";
  var EXIT_MS = 560;
  var ENTER_MS = 620;
  var CONTENT_MS = 420;
  var isTransitioning = false;
  var reducedMotion = false;
  var navDirection = "forward"; // "forward" | "back"

  try {
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  /* Detect back/forward via Navigation Timing / PerformanceNavigationTiming */
  function detectDirection() {
    try {
      var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
      if (nav && (nav.type === "back_forward")) {
        return "back";
      }
      // Legacy
      if (performance.navigation && performance.navigation.type === 2) {
        return "back";
      }
    } catch (e) {}
    // Session flag set just before we navigate
    try {
      var stored = sessionStorage.getItem("pt-dir");
      if (stored) {
        sessionStorage.removeItem("pt-dir");
        return stored;
      }
    } catch (e) {}
    return "forward";
  }

  function injectStyles() {
    if (document.getElementById(STYLES_ID)) return;
    var style = document.createElement("style");
    style.id = STYLES_ID;

    /* Broad selector covering virtually every visible page element */
    var els = [
      "main", "header", "footer", "section",
      ".header", ".top-nav", ".home", ".home-contant", ".container",
      ".projects", ".projects-container", ".project-card",
      ".contact", ".contact-page", ".page-shell",
      ".skills-grid", ".skill-card", ".info-card",
      ".admin-shell", ".back-btn",
      ".navbar a", ".logo", ".nav-link",
      ".profile-pic", ".t1", ".subtitle",
      ".section-heading", ".hero-title", ".hero-subtitle",
      ".home__social", ".home__social-icon",
      ".s2", ".project-style-btn", ".modern-btn",
      ".particles"
    ].join(",");

    var exitSel = els.split(",").map(function (s) { return "body.pt-exiting " + s.trim(); }).join(",");
    var enterSel = els.split(",").map(function (s) { return "body.pt-entering " + s.trim(); }).join(",");
    var enteredSel = els.split(",").map(function (s) { return "body.pt-entered " + s.trim(); }).join(",");

    style.textContent = [
      /* ===== Overlay ===== */
      "#" + OVERLAY_ID + "{",
      "  position:fixed;inset:0;z-index:999999;pointer-events:none;",
      "  background:#030305;",
      "  opacity:0;",
      "  will-change:opacity,transform;",
      "  transform:translateY(0) scale(1.01);",
      "  transition:none;",
      "}",
      "#" + OVERLAY_ID + "::after{",
      "  content:'';position:absolute;inset:0;pointer-events:none;",
      "  background:",
      "    radial-gradient(ellipse 70% 45% at 50% -5%, rgba(90,100,130,0.16), transparent 55%),",
      "    radial-gradient(ellipse 50% 40% at 85% 100%, rgba(40,45,65,0.14), transparent 50%),",
      "    linear-gradient(180deg, rgba(8,8,12,0.4) 0%, transparent 40%, rgba(3,3,5,0.5) 100%);",
      "  opacity:1;",
      "}",
      /* Cover – overlay rises / settles */
      "#" + OVERLAY_ID + ".pt-cover{",
      "  transition:opacity " + EXIT_MS + "ms cubic-bezier(0.4,0,0.2,1),",
      "             transform " + EXIT_MS + "ms cubic-bezier(0.4,0,0.2,1);",
      "  opacity:1;",
      "  transform:translateY(0) scale(1);",
      "}",
      /* Reveal – overlay lifts away */
      "#" + OVERLAY_ID + ".pt-reveal{",
      "  transition:opacity " + ENTER_MS + "ms cubic-bezier(0.22,1,0.36,1),",
      "             transform " + ENTER_MS + "ms cubic-bezier(0.22,1,0.36,1);",
      "  opacity:0;",
      "  transform:translateY(-8%) scale(1.02);",
      "}",

      /* ===== Content EXIT (forward = up & out) ===== */
      exitSel + "{",
      "  transition:opacity " + CONTENT_MS + "ms cubic-bezier(0.4,0,0.2,1),",
      "             transform " + CONTENT_MS + "ms cubic-bezier(0.4,0,0.2,1) !important;",
      "  opacity:0 !important;",
      "  transform:translateY(-28px) scale(0.97) !important;",
      "}",
      /* Exit reverse when going back (down & out) */
      "body.pt-dir-back.pt-exiting " + els.split(",").map(function(s){return s.trim();}).join(", body.pt-dir-back.pt-exiting ") + "{",
      "  transform:translateY(28px) scale(0.97) !important;",
      "}",

      /* ===== Content ENTER (forward = rise from below) ===== */
      enterSel + "{",
      "  opacity:0;",
      "  transform:translateY(36px) scale(0.96);",
      "}",
      /* Enter reverse when arriving via back (drop from above) */
      "body.pt-dir-back.pt-entering " + els.split(",").map(function(s){return s.trim();}).join(", body.pt-dir-back.pt-entering ") + "{",
      "  transform:translateY(-36px) scale(0.96);",
      "}",

      /* Settled state */
      enteredSel + "{",
      "  transition:opacity " + ENTER_MS + "ms cubic-bezier(0.22,1,0.36,1),",
      "             transform " + ENTER_MS + "ms cubic-bezier(0.22,1,0.36,1) !important;",
      "  opacity:1 !important;",
      "  transform:translateY(0) scale(1) !important;",
      "}",

      /* Floating dock nav keeps horizontal center while animating vertically */
      "body.pt-exiting header.header, body.pt-exiting .top-nav{",
      "  transform:translateX(-50%) translateY(-28px) scale(0.97) !important;",
      "}",
      "body.pt-dir-back.pt-exiting header.header, body.pt-dir-back.pt-exiting .top-nav{",
      "  transform:translateX(-50%) translateY(28px) scale(0.97) !important;",
      "}",
      "body.pt-entering header.header, body.pt-entering .top-nav{",
      "  transform:translateX(-50%) translateY(36px) scale(0.96) !important;",
      "}",
      "body.pt-dir-back.pt-entering header.header, body.pt-dir-back.pt-entering .top-nav{",
      "  transform:translateX(-50%) translateY(-36px) scale(0.96) !important;",
      "}",
      "body.pt-entered header.header, body.pt-entered .top-nav{",
      "  transform:translateX(-50%) translateY(0) scale(1) !important;",
      "}",

      /* Stagger feel via transition-delay on common children */
      "body.pt-entered .project-card,",
      "body.pt-entered .skill-card,",
      "body.pt-entered .info-card,",
      "body.pt-entered .home__social-icon{",
      "  transition-delay:0.04s;",
      "}",
      "body.pt-entered .project-card:nth-child(2),",
      "body.pt-entered .skill-card:nth-child(2){ transition-delay:0.08s; }",
      "body.pt-entered .project-card:nth-child(3),",
      "body.pt-entered .skill-card:nth-child(3){ transition-delay:0.12s; }",
      "body.pt-entered .project-card:nth-child(4),",
      "body.pt-entered .skill-card:nth-child(4){ transition-delay:0.16s; }",

      "body.pt-locked{ overflow:hidden; }",

      /* Reduced motion */
      "@media (prefers-reduced-motion: reduce){",
      "  #" + OVERLAY_ID + ".pt-cover, #" + OVERLAY_ID + ".pt-reveal{",
      "    transition-duration:0.01ms !important;",
      "  }",
      "  body.pt-exiting *, body.pt-entering *, body.pt-entered *{",
      "    transition-duration:0.01ms !important;",
      "    transform:none !important;",
      "  }",
      "}"
    ].join("\n");

    document.head.appendChild(style);
  }

  function ensureOverlay() {
    var el = document.getElementById(OVERLAY_ID);
    if (el) return el;
    el = document.createElement("div");
    el.id = OVERLAY_ID;
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
    return el;
  }

  function playReveal() {
    injectStyles();
    var overlay = ensureOverlay();
    navDirection = detectDirection();

    document.body.classList.remove("pt-exiting", "pt-entered");
    document.body.classList.toggle("pt-dir-back", navDirection === "back");
    document.body.classList.add("pt-entering");

    // Start fully covered
    overlay.classList.remove("pt-reveal", "pt-cover");
    overlay.style.opacity = "1";
    overlay.style.transform = "translateY(0) scale(1)";
    void overlay.offsetHeight;

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add("pt-reveal");
        document.body.classList.remove("pt-entering");
        document.body.classList.add("pt-entered");
      });
    });

    window.setTimeout(function () {
      overlay.classList.remove("pt-reveal");
      overlay.style.opacity = "0";
      overlay.style.transform = "translateY(0) scale(1.01)";
      document.body.classList.remove("pt-entered", "pt-dir-back");
      isTransitioning = false;
    }, ENTER_MS + 50);
  }

  function isExcluded(link) {
    if (!link) return true;
    if (link.hasAttribute("data-no-transition")) return true;
    if (link.id === "homeButton") return true;
    var target = (link.getAttribute("target") || "").toLowerCase();
    if (target === "_blank") return true;
    var href = link.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#") return true;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return true;
    try {
      var url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return true;
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return true;
      }
    } catch (e) {
      return true;
    }
    return false;
  }

  function handleClick(e) {
    if (isTransitioning) {
      e.preventDefault();
      return;
    }

    var link = e.target.closest ? e.target.closest("a[href]") : null;
    if (!link || isExcluded(link)) return;

    if (reducedMotion) return; // native navigation

    e.preventDefault();
    var destination = link.href;
    isTransitioning = true;

    // Always forward on explicit link click
    try { sessionStorage.setItem("pt-dir", "forward"); } catch (err) {}

    injectStyles();
    var overlay = ensureOverlay();

    overlay.classList.remove("pt-reveal", "pt-cover");
    overlay.style.opacity = "0";
    overlay.style.transform = "translateY(0) scale(1.01)";
    void overlay.offsetHeight;

    document.body.classList.remove("pt-entering", "pt-entered", "pt-dir-back");
    document.body.classList.add("pt-locked", "pt-exiting");

    requestAnimationFrame(function () {
      overlay.classList.add("pt-cover");
    });

    window.setTimeout(function () {
      window.location.href = destination;
    }, EXIT_MS);
  }

  function init() {
    injectStyles();
    ensureOverlay();

    if (!reducedMotion) {
      playReveal();
    } else {
      var overlay = ensureOverlay();
      overlay.style.opacity = "0";
    }

    document.addEventListener("click", handleClick, true);

    window.addEventListener("pageshow", function (ev) {
      isTransitioning = false;
      document.body.classList.remove("pt-locked", "pt-exiting", "pt-entering");
      if (ev.persisted && !reducedMotion) {
        playReveal();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
