/* =========================================================
   PORTFOLIO ADMIN PANEL — LOCAL-ONLY VERSION
   - All data stored in browser localStorage (no backend)
   - Optional simple password (default: admin) stored as SHA-256 in localStorage
   - Image uploads converted to data URLs and saved in CMS data
   - Works fully offline after first load
========================================================= */

(async function () {
  const CMS = window.PortfolioCMS;
  if (!CMS) {
    document.addEventListener("DOMContentLoaded", () => {
      document.body.innerHTML = `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#050508;color:#fff;font-family:system-ui;padding:2rem;text-align:center"><div><h1>PortfolioCMS missing</h1><p>Load portfolio-data.js before admin.js</p></div></div>`;
    });
    return;
  }

  const $ = (id) => document.getElementById(id);
  const PASS_KEY = "portfolio_admin_pw_hash";
  const DEFAULT_PASSWORD = "admin";

  let data = CMS.getData();

  // ── Helpers ─────────────────────────────────────────────
  function setVal(id, value) {
    const el = $(id);
    if (el) el.value = value ?? "";
  }

  function getVal(id) {
    const el = $(id);
    return el ? el.value.trim() : "";
  }

  function normalizeHex(value) {
    if (!value) return "#000000";
    let v = String(value).trim();
    if (!v.startsWith("#")) v = "#" + v;
    if (/^#[0-9a-fA-F]{3}$/.test(v)) {
      v = "#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(v)) return "#000000";
    return v.toLowerCase();
  }

  function syncColorPicker(hexId) {
    const hexInput = $(hexId);
    const picker = $(hexId + "_picker");
    if (!hexInput || !picker) return;
    const hex = normalizeHex(hexInput.value || picker.value);
    hexInput.value = hex;
    picker.value = hex;
  }

  function wireColorPickers() {
    document.querySelectorAll(".color-picker").forEach((picker) => {
      const targetId = picker.dataset.hexTarget;
      const hexInput = $(targetId);
      if (!hexInput) return;

      picker.addEventListener("input", () => {
        hexInput.value = picker.value;
      });

      hexInput.addEventListener("input", () => {
        const hex = normalizeHex(hexInput.value);
        if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
          picker.value = hex;
        }
      });

      hexInput.addEventListener("blur", () => {
        syncColorPicker(targetId);
      });
    });
  }

  // Cropper instance
  let cropper = null;
  let cropSourceObjectUrl = null;

  function openCropModal(src) {
    const modal = $("cropModal");
    const img = $("cropImage");
    if (!modal || !img || typeof Cropper === "undefined") {
      status("Crop tool not available. Image still set without crop.", true);
      return;
    }
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
    if (cropSourceObjectUrl) {
      URL.revokeObjectURL(cropSourceObjectUrl);
      cropSourceObjectUrl = null;
    }
    img.src = src;
    modal.hidden = false;
    // slight delay so image dimensions are ready
    setTimeout(() => {
      cropper = new Cropper(img, {
        aspectRatio: 1,
        viewMode: 1,
        dragMode: "move",
        autoCropArea: 0.85,
        responsive: true,
        background: false,
        guides: true,
        center: true
      });
    }, 50);
  }

  function closeCropModal() {
    const modal = $("cropModal");
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
    if (cropSourceObjectUrl) {
      URL.revokeObjectURL(cropSourceObjectUrl);
      cropSourceObjectUrl = null;
    }
    if (modal) modal.hidden = true;
  }

  function applyCrop() {
    if (!cropper) return;
    const canvas = cropper.getCroppedCanvas({
      width: 512,
      height: 512,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high"
    });
    if (!canvas) {
      status("Could not crop image.", true);
      return;
    }
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setVal("site_profileImage", dataUrl);
    updateProfilePreview();
    closeCropModal();
    status("Cropped photo applied. Click Save Changes to persist.");
  }


  function status(msg, isErr = false) {
    const el = $("status");
    if (!el) return;
    el.textContent = msg;
    el.style.color = isErr ? "#fecaca" : "#86efac";
  }

  async function sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function ensureDefaultPassword() {
    if (!localStorage.getItem(PASS_KEY)) {
      const hash = await sha256(DEFAULT_PASSWORD);
      localStorage.setItem(PASS_KEY, hash);
    }
  }

  // ── Field definitions ───────────────────────────────────
  const projectFields = [
    { name: "title", label: "Project Title" },
    { name: "image", label: "Image (path or data URL)" },
    { name: "link", label: "Project Link" },
    { name: "linkLabel", label: "Link Label" },
    { name: "tags", label: "Tags" },
    { name: "description", label: "Description", textarea: true }
  ];
  const skillFields = [
    { name: "name", label: "Skill Name" },
    { name: "percent", label: "Percentage", type: "number" }
  ];
  const cvSkillFields = [
    { name: "icon", label: "FontAwesome Icon Class" },
    { name: "label", label: "Skill Label" },
    { name: "title", label: "Short Description" },
    { name: "level", label: "Level Tag" },
    { name: "percent", label: "Percentage", type: "number" }
  ];
  const cvProjectFields = [
    { name: "icon", label: "FontAwesome Icon Class" },
    { name: "label", label: "Group Label" },
    { name: "title", label: "Title" },
    { name: "tag", label: "Tag" },
    { name: "description", label: "Description", textarea: true }
  ];
  const educationFields = [
    { name: "icon", label: "FontAwesome Icon Class" },
    { name: "label", label: "Label" },
    { name: "title", label: "Title" },
    { name: "tag", label: "Year / Tag" },
    { name: "description", label: "Description", textarea: true }
  ];
  const languageFields = [
    { name: "label", label: "Language" },
    { name: "title", label: "Title" },
    { name: "tag", label: "Level Tag" },
    { name: "description", label: "Description", textarea: true }
  ];

  // ── Row rendering ───────────────────────────────────────
  function renderRows(containerId, items, fields, title) {
    const container = $(containerId);
    if (!container) return;
    const list = Array.isArray(items) ? items : [];
    container.innerHTML = list.map((item, index) => `
      <div class="cms-row" data-index="${index}">
        <div class="row-head">
          <strong>${title} #${index + 1}</strong>
          <button type="button" class="btn btn-danger btn-small" data-delete="${containerId}" data-index="${index}">Delete</button>
        </div>
        <div class="form-grid">
          ${fields.map(f => {
            const val = item[f.name] != null ? String(item[f.name]) : "";
            if (f.textarea) {
              return `<div class="field full"><label>${f.label}</label><textarea data-field="${f.name}">${CMS.escapeHtml(val)}</textarea></div>`;
            }
            const type = f.type === "number" ? "number" : "text";
            return `<div class="field"><label>${f.label}</label><input type="${type}" data-field="${f.name}" value="${CMS.escapeHtml(val)}"></div>`;
          }).join("")}
          ${containerId === "projectRows" ? `
            <div class="field full">
              <label>Upload Image (replaces path above)</label>
              <input type="file" accept="image/*" data-upload-for="image" data-row-index="${index}">
            </div>` : ""}
        </div>
      </div>`).join("");

    container.querySelectorAll("[data-delete]").forEach(btn => {
      btn.addEventListener("click", () => {
        const cid = btn.dataset.delete;
        const idx = Number(btn.dataset.index);
        deleteItem(cid, idx);
      });
    });

    container.querySelectorAll("input[type=file][data-upload-for]").forEach(input => {
      input.addEventListener("change", async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const dataUrl = await fileToDataUrl(file);
        const row = input.closest(".cms-row");
        const fieldInput = row.querySelector(`[data-field="${input.dataset.uploadFor}"]`);
        if (fieldInput) fieldInput.value = dataUrl;
        status("Image loaded into form. Click Save Changes to persist.");
      });
    });
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ── Render form ─────────────────────────────────────────
  function renderForm() {
    setVal("site_logoText", data.site.logoText);
    setVal("site_fullName", data.site.fullName);
    setVal("site_profileImage", data.site.profileImage);
    setVal("site_github", data.site.github);
    setVal("site_linkedin", data.site.linkedin);
    setVal("site_facebook", data.site.facebook);
    setVal("site_instagram", data.site.instagram);

    ["globalTextColor", "accentColor", "homeBg", "homeText", "aboutBg", "aboutText", "projectsBg", "projectsText", "skillsBg", "skillsText", "cvBg", "cvText", "contactBg", "contactText", "contactFormBg", "contactFormText"].forEach(k => {
      setVal("theme_" + k, data.theme?.[k] || "");
      syncColorPicker("theme_" + k);
    });
    setVal("theme_fontFamily", data.theme?.fontFamily || "Poppins");

    ["heading", "emailLabel", "email", "phoneLabel", "phone", "locationLabel", "location", "mapTitle", "mapTag", "mapEmbedUrl", "sendMailButton", "backButton", "formHeading", "formIntro", "formSubject", "formSubmitEmail", "nameLabel", "namePlaceholder", "phoneInputLabel", "phonePlaceholder", "emailInputLabel", "emailPlaceholder", "messageLabel", "messagePlaceholder", "submitButton", "formButtonText"].forEach(k => {
      setVal("contact_" + k, data.contact?.[k] || "");
    });

    setVal("home_greeting", data.home.greeting);
    setVal("home_title", data.home.title);
    setVal("home_tagline", data.home.tagline);
    setVal("home_buttonText", data.home.buttonText);
    setVal("home_buttonLink", data.home.buttonLink);

    setVal("about_heading", data.about.heading);
    setVal("about_subtitle", data.about.subtitle);
    setVal("about_text", data.about.text);

    setVal("cv_navInitials", data.cv.navInitials);
    setVal("cv_badge", data.cv.badge);
    setVal("cv_fullName", data.cv.fullName);
    setVal("cv_subtitle", data.cv.subtitle);
    setVal("cv_phone", data.cv.phone);
    setVal("cv_email", data.cv.email);
    setVal("cv_location", data.cv.location);
    setVal("cv_profileHeading", data.cv.profileHeading);
    setVal("cv_profileText", data.cv.profileText);
    setVal("cv_profileTag", data.cv.profileTag);

    renderRows("projectRows", data.projects, projectFields, "Project");
    renderRows("skillRows", data.skills, skillFields, "Skill");
    renderRows("cvSkillRows", data.cv.skills, cvSkillFields, "CV Skill");
    renderRows("cvProjectRows", data.cv.projectGroups, cvProjectFields, "CV Project Group");
    renderRows("educationRows", data.cv.education, educationFields, "Education");
    renderRows("languageRows", data.cv.languages, languageFields, "Language");

    renderCvPdfPanel();
    refreshJson();
    updateProfilePreview();
  }

  function updateProfilePreview() {
    const preview = $("profileImagePreview");
    const src = getVal("site_profileImage") || data.site.profileImage || "placeholder.svg";
    if (preview) {
      preview.src = src;
      preview.onerror = () => { preview.src = "placeholder.svg"; };
    }
  }

  // ── Collect form ────────────────────────────────────────
  function collectRows(containerId, numericFields = []) {
    const container = $(containerId);
    if (!container) return [];
    return Array.from(container.querySelectorAll(".cms-row")).map((row) => {
      const item = {};
      row.querySelectorAll("[data-field]").forEach((el) => {
        const k = el.dataset.field;
        let v = el.value;
        if (numericFields.includes(k)) v = CMS.clampPercent(v);
        item[k] = v;
      });
      return item;
    });
  }

  function collectForm() {
    const next = CMS.getData(); // start from current to preserve unknown keys

    next.site = {
      logoText: getVal("site_logoText"),
      fullName: getVal("site_fullName"),
      profileImage: getVal("site_profileImage"),
      logoImage: next.site.logoImage || "logo.png",
      github: getVal("site_github"),
      linkedin: getVal("site_linkedin"),
      facebook: getVal("site_facebook"),
      instagram: getVal("site_instagram")
    };

    next.home = {
      greeting: getVal("home_greeting"),
      title: getVal("home_title"),
      tagline: getVal("home_tagline"),
      buttonText: getVal("home_buttonText"),
      buttonLink: getVal("home_buttonLink")
    };

    next.about = {
      heading: getVal("about_heading"),
      subtitle: getVal("about_subtitle"),
      text: getVal("about_text")
    };

    next.theme = next.theme || {};
    ["globalTextColor", "accentColor", "homeBg", "homeText", "aboutBg", "aboutText", "projectsBg", "projectsText", "skillsBg", "skillsText", "cvBg", "cvText", "contactBg", "contactText", "contactFormBg", "contactFormText"].forEach(k => {
      next.theme[k] = getVal("theme_" + k) || next.theme[k];
    });
    next.theme.fontFamily = getVal("theme_fontFamily") || "Poppins";

    next.contact = next.contact || {};
    ["heading", "emailLabel", "email", "phoneLabel", "phone", "locationLabel", "location", "mapTitle", "mapTag", "mapEmbedUrl", "sendMailButton", "backButton", "formHeading", "formIntro", "formSubject", "formSubmitEmail", "nameLabel", "namePlaceholder", "phoneInputLabel", "phonePlaceholder", "emailInputLabel", "emailPlaceholder", "messageLabel", "messagePlaceholder", "submitButton", "formButtonText"].forEach(k => {
      next.contact[k] = getVal("contact_" + k);
    });

    next.projects = collectRows("projectRows");
    next.skills = collectRows("skillRows", ["percent"]);

    next.cv = next.cv || {};
    next.cv.navInitials = getVal("cv_navInitials");
    next.cv.badge = getVal("cv_badge");
    next.cv.fullName = getVal("cv_fullName");
    next.cv.subtitle = getVal("cv_subtitle");
    next.cv.phone = getVal("cv_phone");
    next.cv.email = getVal("cv_email");
    next.cv.location = getVal("cv_location");
    next.cv.profileHeading = getVal("cv_profileHeading");
    next.cv.profileText = getVal("cv_profileText");
    next.cv.profileTag = getVal("cv_profileTag");
    next.cv.skills = collectRows("cvSkillRows", ["percent"]);
    next.cv.projectGroups = collectRows("cvProjectRows");
    next.cv.education = collectRows("educationRows");
    next.cv.languages = collectRows("languageRows");

    return next;
  }

  // ── CV PDF panel ────────────────────────────────────────
  function renderCvPdfPanel() {
    const nameEl = $("cvPdfCurrentName");
    const linkEl = $("cvPdfViewLink");
    const input = $("cvPdfLinkInput");
    const link = data.cv?.pdfUrl || "";
    if (nameEl) nameEl.textContent = link ? "CV link is set." : "No CV link published yet.";
    if (linkEl) {
      if (link) {
        linkEl.href = link;
        linkEl.style.display = "";
      } else {
        linkEl.style.display = "none";
      }
    }
    if (input) input.value = link;
  }

  function toDriveDirectLink(rawUrl) {
    if (!rawUrl) return "";
    const url = rawUrl.trim();
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (!m) return url;
    return "https://drive.google.com/uc?export=download&id=" + m[1];
  }

  function saveCvDriveLink() {
    const input = $("cvPdfLinkInput");
    const raw = input ? input.value.trim() : "";
    const direct = toDriveDirectLink(raw);
    data = collectForm();
    data.cv = data.cv || {};
    data.cv.pdfUrl = direct;
    CMS.saveData(data);
    data = CMS.getData();
    renderCvPdfPanel();
    status(direct ? "CV link saved to local storage." : "CV link cleared.");
  }

  // ── Save / Reset / JSON ─────────────────────────────────
  function save() {
    try {
      data = collectForm();
      CMS.saveData(data);
      data = CMS.getData();
      renderForm();
      status("✅ Saved to browser localStorage. Open portfolio pages to see changes.");
    } catch (err) {
      console.error(err);
      status("Save failed: " + (err.message || err), true);
    }
  }

  function refreshJson() {
    const ta = $("jsonEditor");
    if (ta) ta.value = JSON.stringify(data, null, 2);
  }

  function applyJson() {
    const ta = $("jsonEditor");
    if (!ta) return;
    try {
      const parsed = JSON.parse(ta.value);
      CMS.saveData(parsed);
      data = CMS.getData();
      renderForm();
      status("✅ JSON applied and saved.");
    } catch (err) {
      status("Invalid JSON: " + err.message, true);
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio-data-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        CMS.saveData(parsed);
        data = CMS.getData();
        renderForm();
        status("✅ Imported and saved.");
      } catch (err) {
        status("Import failed: " + err.message, true);
      }
    };
    reader.readAsText(file);
  }

  function deleteItem(containerId, index) {
    data = collectForm();
    const map = {
      projectRows: "projects",
      skillRows: "skills",
      cvSkillRows: ["cv", "skills"],
      cvProjectRows: ["cv", "projectGroups"],
      educationRows: ["cv", "education"],
      languageRows: ["cv", "languages"]
    };
    const key = map[containerId];
    if (!key) return;
    if (Array.isArray(key)) {
      const arr = data[key[0]][key[1]];
      if (Array.isArray(arr)) arr.splice(index, 1);
    } else {
      if (Array.isArray(data[key])) data[key].splice(index, 1);
    }
    renderForm();
    status("Item removed from form. Click Save Changes to persist.");
  }

  function addItem(target) {
    data = collectForm();
    const defaults = {
      project: { title: "New Project", description: "", image: "logo.png", link: "", linkLabel: "View", tags: "" },
      skill: { name: "New Skill", percent: 50 },
      cvSkill: { icon: "fa-solid fa-star", label: "Skill", title: "Description", level: "Beginner", percent: 50 },
      cvProject: { icon: "fa-solid fa-folder", label: "Group", title: "Title", description: "", tag: "" },
      education: { icon: "fa-solid fa-building-columns", label: "Degree", title: "Program", description: "Institution", tag: "Year" },
      language: { label: "Language", title: "Proficiency", description: "", tag: "Fluent" }
    };
    if (target === "project") data.projects.push({ ...defaults.project });
    else if (target === "skill") data.skills.push({ ...defaults.skill });
    else if (target === "cvSkill") data.cv.skills.push({ ...defaults.cvSkill });
    else if (target === "cvProject") data.cv.projectGroups.push({ ...defaults.cvProject });
    else if (target === "education") data.cv.education.push({ ...defaults.education });
    else if (target === "language") data.cv.languages.push({ ...defaults.language });
    renderForm();
    status("Item added. Fill fields and click Save Changes.");
  }

  function resetDefaults() {
    if (!confirm("Reset ALL content to template defaults? This clears your local customizations.")) return;
    CMS.resetData();
    data = CMS.getData();
    renderForm();
    status("✅ Defaults restored.");
  }

  // ── Login ───────────────────────────────────────────────
  function showApp() {
    const login = $("loginView");
    const app = $("adminApp");
    if (login) login.hidden = true;
    if (app) app.hidden = false;
    renderForm();
  }

  async function login() {
    const loginStatus = $("loginStatus");
    const pwInput = $("adminPassword");
    const entered = pwInput ? pwInput.value : "";
    if (loginStatus) {
      loginStatus.textContent = "Verifying…";
      loginStatus.style.color = "#93c5fd";
    }
    await ensureDefaultPassword();
    const stored = localStorage.getItem(PASS_KEY);
    const hash = await sha256(entered);
    if (hash === stored) {
      showApp();
    } else {
      if (loginStatus) {
        loginStatus.textContent = "Wrong password. Default is: admin";
        loginStatus.style.color = "#fecaca";
      }
    }
  }

  // ── Wire events ─────────────────────────────────────────
  function wire() {
    $("loginBtn")?.addEventListener("click", login);
    $("adminPassword")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") login();
    });
    $("saveBtn")?.addEventListener("click", save);
    $("resetBtn")?.addEventListener("click", resetDefaults);
    $("refreshJsonBtn")?.addEventListener("click", refreshJson);
    $("applyJsonBtn")?.addEventListener("click", applyJson);
    $("exportBtn")?.addEventListener("click", exportJson);
    $("importFile")?.addEventListener("change", (e) => {
      const f = e.target.files && e.target.files[0];
      if (f) importJson(f);
    });
    $("cvPdfSaveBtn")?.addEventListener("click", saveCvDriveLink);
    $("addProjectBtn")?.addEventListener("click", () => addItem("project"));
    $("addSkillBtn")?.addEventListener("click", () => addItem("skill"));
    $("addCvSkillBtn")?.addEventListener("click", () => addItem("cvSkill"));
    $("addCvProjectBtn")?.addEventListener("click", () => addItem("cvProject"));
    $("addEducationBtn")?.addEventListener("click", () => addItem("education"));
    $("addLanguageBtn")?.addEventListener("click", () => addItem("language"));

    // Profile image upload → open crop modal
    const profileUpload = $("profileImageUpload");
    if (profileUpload) {
      profileUpload.addEventListener("change", async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
          if (cropSourceObjectUrl) URL.revokeObjectURL(cropSourceObjectUrl);
          cropSourceObjectUrl = URL.createObjectURL(file);
          // also set temporary preview
          setVal("site_profileImage", cropSourceObjectUrl);
          updateProfilePreview();
          openCropModal(cropSourceObjectUrl);
          status("Adjust the crop, then Apply Crop.");
        } catch (err) {
          status("Image upload failed.", true);
        }
      });
    }

    $("site_profileImage")?.addEventListener("input", updateProfilePreview);
    $("cropProfileBtn")?.addEventListener("click", () => {
      const src = getVal("site_profileImage") || data.site.profileImage;
      if (!src || src === "placeholder.svg") {
        status("Upload a photo first, then crop.", true);
        return;
      }
      openCropModal(src);
    });
    $("cropApplyBtn")?.addEventListener("click", applyCrop);
    $("cropCancelBtn")?.addEventListener("click", closeCropModal);
    $("cropCloseBtn")?.addEventListener("click", closeCropModal);

    wireColorPickers();
  }

  // ── Init ────────────────────────────────────────────────
  await ensureDefaultPassword();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }
})();
