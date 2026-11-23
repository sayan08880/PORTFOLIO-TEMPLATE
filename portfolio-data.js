/* =========================================================
   PORTFOLIO CMS DATA
   Fully local / static-hosting version.
   All data is stored in browser localStorage.
   No backend or Firebase required.
========================================================= */

(function () {
  const STORAGE_KEY = "portfolio_cms_v1";

  const DEFAULT_DATA = {
    site: {
      logoText: "PORTFOLIO",
      fullName: "YOUR NAME",
      profileImage: "placeholder.svg",
      logoImage: "logo.png",
      github: "https://github.com/",
      linkedin: "https://www.linkedin.com/",
      facebook: "https://www.facebook.com/",
      instagram: "https://www.instagram.com/"
    },
    home: {
      greeting: "Hi, I'm Your Name",
      title: "DEVELOPER / DESIGNER",
      tagline: "BUILDING CLEAN, FAST, AND FUNCTIONAL EXPERIENCES WITH REAL-WORLD IMPACT",
      buttonText: "VIEW DETAILS",
      buttonLink: "cv.html"
    },
    about: {
      heading: "ABOUT ME",
      subtitle: "DEVELOPER & CREATOR",
      text: "I AM A TECHNOLOGY ENTHUSIAST FOCUSED ON WEB DEVELOPMENT AND PROGRAMMING. I BUILD PRACTICAL PROJECTS AND CONTINUOUSLY IMPROVE MY SKILLS WITH MODERN TOOLS AND BEST PRACTICES."
    },
    theme: {
      globalTextColor: "#ffffff",
      accentColor: "#00d4ff",
      fontFamily: "Poppins",
      homeBg: "#050508",
      homeText: "#ffffff",
      aboutBg: "#050508",
      aboutText: "#ffffff",
      projectsBg: "#050508",
      projectsText: "#ffffff",
      skillsBg: "#050508",
      skillsText: "#ffffff",
      cvBg: "#050508",
      cvText: "#ffffff",
      contactBg: "#050508",
      contactText: "#ffffff",
      contactFormBg: "#050508",
      contactFormText: "#ffffff"
    },
    contact: {
      heading: "CONTACT INFORMATION",
      emailLabel: "Email",
      email: "you@example.com",
      phoneLabel: "Phone",
      phone: "+1 000 000 0000",
      locationLabel: "Location",
      location: "Your City\nYour Country",
      mapTitle: "Find Me",
      mapTag: "Your Location",
      mapEmbedUrl: "",
      sendMailButton: "SEND MAIL",
      backButton: "BACK",
      formHeading: "SEND A MESSAGE",
      formIntro: "Feel free to reach out.",
      formSubject: "Portfolio Contact",
      formSubmitEmail: "you@example.com",
      nameLabel: "Name",
      namePlaceholder: "Your name",
      phoneInputLabel: "Phone",
      phonePlaceholder: "Your phone",
      emailInputLabel: "Email",
      emailPlaceholder: "Your email",
      messageLabel: "Message",
      messagePlaceholder: "Your message",
      submitButton: "SEND MESSAGE",
      formButtonText: "SEND MESSAGE"
    },
    projects: [
      {
        title: "Sample Project One",
        description: "A short description of your project. Replace this with your own work.",
        image: "logo.png",
        link: "https://github.com/",
        tags: "Web, Frontend"
      },
      {
        title: "Sample Project Two",
        description: "Another example project entry. Edit or remove from the admin panel.",
        image: "logo.png",
        link: "https://github.com/",
        tags: "Full Stack"
      }
    ],
    skills: [
      { name: "HTML / CSS", percent: 90 },
      { name: "JavaScript", percent: 85 },
      { name: "Python", percent: 75 },
      { name: "UI Design", percent: 70 }
    ],
    cv: {
      navInitials: "YN",
      badge: "Developer",
      fullName: "Your Name",
      subtitle: "Web Development • Programming • Projects",
      phone: "+1 000 000 0000",
      email: "you@example.com",
      location: "Your City, Country",
      profileHeading: "Focused on practical applications and clean code",
      profileText: "Dedicated developer with a foundation in programming and web development. Experienced in building practical projects and solving real-world problems. Continuously learning and focused on creating meaningful applications.",
      profileTag: "Developer",
      skills: [
        { icon: "fa-brands fa-html5", label: "HTML / CSS", title: "Frontend structure and styling", level: "Advanced", percent: 90 },
        { icon: "fa-brands fa-js", label: "JavaScript", title: "Interactive web applications", level: "Intermediate", percent: 85 },
        { icon: "fa-brands fa-python", label: "Python", title: "Scripting and automation", level: "Intermediate", percent: 75 },
        { icon: "fa-solid fa-terminal", label: "Git / CLI", title: "Version control and tooling", level: "Intermediate", percent: 80 }
      ],
      projectGroups: [
        {
          icon: "fa-solid fa-window-maximize",
          label: "Web",
          title: "Frontend & Full-Stack Projects",
          description: "Describe groups of related projects here. Edit from the admin panel.",
          tag: "Frontend"
        }
      ],
      education: [
        { icon: "fa-solid fa-building-columns", label: "Degree", title: "Your Degree or Program", description: "Institution Name", tag: "Year – Year" }
      ],
      languages: [
        { label: "English", title: "Professional working proficiency", description: "Reading, writing, and speaking.", tag: "Fluent" }
      ],
      pdfUrl: ""
    }
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function isObject(value) {
    return value && typeof value === "object" && !Array.isArray(value);
  }

  function mergeDeep(base, override) {
    const output = clone(base);
    if (!isObject(override)) return output;
    Object.keys(override).forEach((key) => {
      if (Array.isArray(override[key])) {
        output[key] = clone(override[key]);
      } else if (isObject(override[key]) && isObject(output[key])) {
        output[key] = mergeDeep(output[key], override[key]);
      } else {
        output[key] = override[key];
      }
    });
    return output;
  }

  function getData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return clone(DEFAULT_DATA);
      return mergeDeep(DEFAULT_DATA, JSON.parse(saved));
    } catch (error) {
      console.warn("Portfolio data could not be loaded. Defaults are being used.", error);
      return clone(DEFAULT_DATA);
    }
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
    window.dispatchEvent(new CustomEvent("portfolio:data-changed"));
  }

  function resetData() {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("portfolio:data-changed"));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function clampPercent(value) {
    const number = Number(value);
    if (Number.isNaN(number)) return 0;
    return Math.min(100, Math.max(0, Math.round(number)));
  }

  window.PortfolioCMS = {
    STORAGE_KEY,
    DEFAULT_DATA,
    getData,
    saveData,
    resetData,
    escapeHtml,
    clampPercent
  };
})();
