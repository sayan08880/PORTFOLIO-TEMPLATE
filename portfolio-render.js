/* =========================================================
   PORTFOLIO CMS RENDERER
========================================================= */

(function () {
  const CMS = window.PortfolioCMS;
  if (!CMS) return;

  const E = CMS.escapeHtml;
  const P = CMS.clampPercent;


  function setCssVar(name, value) {
    if (value) document.documentElement.style.setProperty(name, value);
  }

  const FONT_STACKS = {
    "Poppins": '"Poppins", "Segoe UI", Arial, sans-serif',
    "Inter": '"Inter", "Segoe UI", Arial, sans-serif',
    "Roboto": '"Roboto", "Segoe UI", Arial, sans-serif',
    "Montserrat": '"Montserrat", "Segoe UI", Arial, sans-serif',
    "Open Sans": '"Open Sans", "Segoe UI", Arial, sans-serif',
    "System UI": 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    "Segoe UI": '"Segoe UI", Tahoma, Arial, sans-serif',
    "Arial": 'Arial, Helvetica, sans-serif',
    "Verdana": 'Verdana, Geneva, sans-serif',
    "Tahoma": 'Tahoma, Geneva, sans-serif',
    "Trebuchet MS": '"Trebuchet MS", Arial, sans-serif',
    "Georgia": 'Georgia, "Times New Roman", serif',
    "Times New Roman": '"Times New Roman", Times, serif',
    "Courier New": '"Courier New", Courier, monospace'
  };

  function applyTheme(data) {
    const t = data.theme || {};
    const path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const map = {
      'index.html': ['homeBg', 'homeText'],
      '': ['homeBg', 'homeText'],
      'about.html': ['aboutBg', 'aboutText'],
      'project.html': ['projectsBg', 'projectsText'],
      'skill.html': ['skillsBg', 'skillsText'],
      'cv.html': ['cvBg', 'cvText'],
      'contact.html': ['contactBg', 'contactText'],
      'contactus.html': ['contactFormBg', 'contactFormText']
    };
    const [bgKey, textKey] = map[path] || ['homeBg', 'globalTextColor'];
    const background = t[bgKey] || t.homeBg || '#050433';
    const text = t[textKey] || t.globalTextColor || '#ffffff';
    const accent = t.accentColor || '#00d4ff';
    const font = FONT_STACKS[t.fontFamily] || FONT_STACKS.Poppins;

    setCssVar('--admin-page-bg', background);
    setCssVar('--admin-page-text', text);
    setCssVar('--admin-accent', accent);
    setCssVar('--admin-font-family', font);

    // Direct inline values provide a reliable fallback for pages with legacy inline CSS.
    document.documentElement.style.backgroundColor = background;
    if (document.body) {
      document.body.style.setProperty('background-color', background, 'important');
      document.body.style.setProperty('color', text, 'important');
      document.body.style.setProperty('font-family', font, 'important');
    }
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    const el = byId(id);
    if (el) el.textContent = value || "";
  }

  function setImage(id, src, alt) {
    const el = byId(id);
    if (el && src) {
      el.src = src;
      el.alt = alt || "Portfolio image";
    }
  }

  function safeUrl(url, fallback = "#") {
    const value = String(url || "").trim();
    if (!value) return fallback;
    if (/^(https?:|mailto:|tel:)/i.test(value) || /^[\w./#-]+$/i.test(value)) return value;
    return fallback;
  }

  function renderCommon(data) {
    applyTheme(data);
    document.querySelectorAll("[data-site-logo]").forEach((el) => (el.textContent = data.site.logoText || "PORTFOLIO"));
    document.querySelectorAll("[data-full-name]").forEach((el) => (el.textContent = data.site.fullName || "YOUR NAME"));
    setImage("siteProfileImage", data.site.profileImage, data.site.fullName);
    setImage("aboutProfileImage", data.site.profileImage, data.site.fullName);
    setImage("cvProfileImage", data.site.profileImage, data.cv.fullName || data.site.fullName);
  }

  function renderHome(data) {
    setText("homeGreeting", data.home.greeting);
    setText("homeTitle", data.home.title);
    setText("homeTagline", data.home.tagline);
    setText("homeButtonText", data.home.buttonText);
    const btn = byId("homeButton");
    if (btn) btn.onclick = () => window.open(safeUrl(data.home.buttonLink, "cv.html"), "_blank");
  }

  function renderAbout(data) {
    setText("aboutSubtitle", data.about.subtitle);
    setText("aboutHeading", data.about.heading);
    setText("aboutText", data.about.text);

    const facebook = byId("aboutFacebook");
    const instagram = byId("aboutInstagram");
    const github = byId("aboutGithub");
    const linkedin = byId("aboutLinkedin");
    if (facebook) facebook.href = safeUrl(data.site.facebook);
    if (instagram) instagram.href = safeUrl(data.site.instagram);
    if (github) github.href = safeUrl(data.site.github);
    if (linkedin) linkedin.href = safeUrl(data.site.linkedin);
  }


  function nl2br(value) {
    return E(value).replace(/\n/g, "<br>");
  }

  function renderContact(data) {
    const c = data.contact || {};
    setText("contactHeading", c.heading);
    setText("contactEmailLabel", c.emailLabel);
    setText("contactEmail", c.email);
    setText("contactPhoneLabel", c.phoneLabel);
    setText("contactPhone", c.phone);
    setText("contactLocationLabel", c.locationLabel);
    const loc = byId("contactLocation");
    if (loc) loc.innerHTML = nl2br(c.location || "");
    setText("contactMapTitle", c.mapTitle);
    setText("contactMapTag", c.mapTag);
    setText("contactSendMailButton", c.sendMailButton);
    setText("contactBackButton", c.backButton);
    const map = byId("contactMapFrame");
    if (map && c.mapEmbedUrl) map.src = safeUrl(c.mapEmbedUrl);

    setText("contactFormHeading", c.formHeading);
    setText("contactFormIntro", c.formIntro);
    setText("contactNameLabel", c.nameLabel);
    setText("contactPhoneInputLabel", c.phoneInputLabel);
    setText("contactEmailInputLabel", c.emailInputLabel);
    setText("contactMessageLabel", c.messageLabel);
    setText("contactSubmitButton", c.submitButton);
    const nameInput = byId("contactNameInput");
    const phoneInput = byId("contactPhoneInput");
    const emailInput = byId("contactEmailInput");
    const messageInput = byId("contactMessageInput");
    if (nameInput) nameInput.placeholder = c.namePlaceholder || "";
    if (phoneInput) phoneInput.placeholder = c.phonePlaceholder || "";
    if (emailInput) emailInput.placeholder = c.emailPlaceholder || "";
    if (messageInput) messageInput.placeholder = c.messagePlaceholder || "";
    const subject = byId("contactFormSubject");
    if (subject) subject.value = c.formSubject || "New Portfolio Contact Message";
    const form = byId("contactForm");
    if (form) form.action = `https://formsubmit.co/${encodeURIComponent(c.formSubmitEmail || c.email || '')}`;
  }

  function renderProjects(data) {
    const container = byId("projectsContainer");
    if (!container) return;
    container.innerHTML = (data.projects || []).map((project, index) => `
      <article class="project-card">
        <div class="project-img-container">
          <img src="${E(project.image || "logo.png")}" alt="${E(project.title || `Project ${index + 1}`)}" class="project-img" onerror="this.onerror=null;this.src='logo.png';">
        </div>
        <div class="project-info">
          <h3>${E(project.title)}</h3>
          <p>${E(project.description)}</p>
          <a href="${E(safeUrl(project.link))}" target="_blank" rel="noopener" class="github-link" title="${E(project.linkLabel || "Open Project")}" aria-label="${E(project.linkLabel || "Open Project")}">
            <i class="fa-solid fa-arrow-up-right-from-square project-link-icon" aria-hidden="true"></i>
          </a>
        </div>
      </article>
    `).join("");
  }

  function renderSkills(data) {
    const grid = byId("skillsGrid");
    if (!grid) return;
    grid.innerHTML = (data.skills || []).map((skill) => {
      const percent = P(skill.percent);
      return `
        <article class="skill-card">
          <div class="skill-title">${E(skill.name)}</div>
          <div class="skill-bar-container">
            <div class="skill-bar" data-percent="${percent}%" data-target="${percent}%" style="width: 0%;"></div>
          </div>
        </article>
      `;
    }).join("");

    setTimeout(() => {
      grid.querySelectorAll(".skill-bar").forEach((bar) => {
        bar.style.width = bar.dataset.target || "0%";
      });
    }, 250);
  }

  function renderCv(data) {
    const cv = data.cv || {};
    setText("cvInitials", cv.navInitials || "SM");
    setText("cvTopName", data.site.fullName || cv.fullName);
    setText("cvBadge", cv.badge);
    const nameEl = byId("cvFullName");
    if (nameEl) nameEl.innerHTML = E(cv.fullName || "").replace(/\s+/, "<br>");
    setText("cvSubtitle", cv.subtitle);

    const phone = byId("cvPhone");
    const email = byId("cvEmail");
    const location = byId("cvLocation");
    if (phone) {
      phone.href = `tel:${String(cv.phone || "").replace(/\s+/g, "")}`;
      phone.innerHTML = `<i class="fa-solid fa-phone text-blue-400"></i> ${E(cv.phone)}`;
    }
    if (email) {
      email.href = `mailto:${E(cv.email)}`;
      email.innerHTML = `<i class="fa-solid fa-envelope text-blue-400"></i> ${E(cv.email)}`;
    }
    if (location) location.innerHTML = `<i class="fa-solid fa-location-dot text-blue-400"></i> ${E(cv.location)}`;

    setText("cvProfileHeading", cv.profileHeading);
    setText("cvProfileText", cv.profileText);
    setText("cvProfileTag", cv.profileTag);

    const skills = byId("cvSkillsList");
    if (skills) {
      skills.innerHTML = (cv.skills || []).map((skill) => {
        const percent = P(skill.percent);
        return `
          <div class="info-row skill-item" data-width="${percent}%">
            <div class="row-label"><i class="${E(skill.icon || "fa-solid fa-code")}"></i> ${E(skill.label)}</div>
            <div class="row-main"><h3>${E(skill.title)}</h3><div class="skill-line"><div class="skill-fill"></div></div></div>
            <span class="row-tag">${E(skill.level)}</span>
          </div>
        `;
      }).join("");
    }

    const projectGroups = byId("cvProjectGroups");
    if (projectGroups) {
      projectGroups.innerHTML = (cv.projectGroups || []).map((group) => `
        <div class="info-row">
          <div class="row-label"><i class="${E(group.icon || "fa-solid fa-diagram-project")}"></i> ${E(group.label)}</div>
          <div class="row-main"><h3>${E(group.title)}</h3><p>${E(group.description)}</p></div>
          <span class="row-tag">${E(group.tag)}</span>
        </div>
      `).join("");
    }

    const githubLink = byId("cvGithubLink");
    if (githubLink) githubLink.href = safeUrl(data.site.github);

    const education = byId("cvEducationList");
    if (education) {
      education.innerHTML = (cv.education || []).map((item) => `
        <div class="info-row">
          <div class="row-label"><i class="${E(item.icon || "fa-solid fa-graduation-cap")}"></i> ${E(item.label)}</div>
          <div class="row-main"><h3>${E(item.title)}</h3><p>${E(item.description)}</p></div>
          <span class="row-tag">${E(item.tag)}</span>
        </div>
      `).join("");
    }

    const languages = byId("cvLanguagesList");
    if (languages) {
      languages.innerHTML = (cv.languages || []).map((item) => `
        <div class="info-row">
          <div class="row-label">${E(item.label)}</div>
          <div class="row-main"><h3>${E(item.title)}</h3><p>${E(item.description)}</p></div>
          <span class="row-tag">${E(item.tag)}</span>
        </div>
      `).join("");
    }

    requestAnimationFrame(() => {
      document.querySelectorAll(".skill-item").forEach((item) => {
        const fill = item.querySelector(".skill-fill");
        if (fill) fill.style.width = item.dataset.width || "0%";
      });
    });
  }

  function makeParticles() {
    const container = byId("particles");
    if (!container || container.dataset.ready) return;
    container.dataset.ready = "true";
    for (let i = 0; i < 35; i++) {
      const dot = document.createElement("div");
      dot.classList.add("dot");
      dot.style.left = Math.random() * 100 + "vw";
      dot.style.top = Math.random() * 100 + "vh";
      dot.style.animationDuration = 4 + Math.random() * 6 + "s";
      dot.style.animationDelay = Math.random() * 6 + "s";
      dot.style.width = dot.style.height = 2 + Math.random() * 4 + "px";
      container.appendChild(dot);
    }
  }

  function setupReveal() {
    const revealItems = document.querySelectorAll(".reveal");
    if (!revealItems.length) return;
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("show");
      });
    }, { threshold: 0.15 });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  function renderAll() {
    const data = CMS.getData();
    renderCommon(data);
    renderHome(data);
    renderAbout(data);
    renderContact(data);
    renderProjects(data);
    renderSkills(data);
    renderCv(data);
    makeParticles();
    setupReveal();
  }

  window.toggleMenu = function () {
    const navbar = byId("navbar");
    const hamburger = byId("hamburger");
    if (navbar) navbar.classList.toggle("open");
    if (hamburger) hamburger.classList.toggle("active");
  };

  function closeMobileMenu() {
    const navbar = byId("navbar");
    const hamburger = byId("hamburger");
    if (navbar) navbar.classList.remove("open");
    if (hamburger) hamburger.classList.remove("active");
  }

  document.addEventListener("click", function (e) {
    const navbar = byId("navbar");
    const hamburger = byId("hamburger");
    if (!navbar || !navbar.classList.contains("open")) return;
    if (navbar.contains(e.target) || (hamburger && hamburger.contains(e.target))) return;
    closeMobileMenu();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMobileMenu();
  });

  document.addEventListener("DOMContentLoaded", renderAll);
  window.addEventListener("portfolio:data-changed", renderAll);

  // Live update when admin saves in another tab (same origin)
  window.addEventListener("storage", function (e) {
    if (!e.key) return;
    if (e.key === (CMS.STORAGE_KEY || "portfolio_cms_v1")) {
      renderAll();
    }
  });
})();
