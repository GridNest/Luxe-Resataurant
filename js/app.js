(function () {
  "use strict";

  const API_BASE = "http://localhost:5000/api";

  function $(sel) {
    return document.querySelector(sel);
  }

  async function apiFetch(endpoint) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn(`API fetch failed for ${endpoint}, using fallback`, err);
      return null;
    }
  }

  function getFullImageUrl(url) {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `http://localhost:5000${cleanUrl}`;
  }

  async function loadData() {
    const [hero, about, categories, menuItems, gallery, testimonials, contact, settings] = await Promise.all([
      apiFetch("/hero"),
      apiFetch("/about"),
      apiFetch("/categories"),
      apiFetch("/menu"),
      apiFetch("/gallery"),
      apiFetch("/testimonials"),
      apiFetch("/contact"),
      apiFetch("/settings")
    ]);

    return { hero, about, categories, menuItems, gallery, testimonials, contact, settings };
  }

  function initScrollProgress() {
    window.addEventListener("scroll", function () {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      const bar = document.getElementById("scrollProgress");
      if (bar) bar.style.width = progress + "%";

      const btn = document.getElementById("backTop");
      if (btn) {
        if (scrollTop > 400) btn.classList.add("visible");
        else btn.classList.remove("visible");
      }
    });

    const backBtn = document.getElementById("backTop");
    if (backBtn) {
      backBtn.addEventListener("click", () =>
        window.scrollTo({ top: 0, behavior: "smooth" })
      );
    }
  }

  function initMobileMenu() {
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobileMenu");
    const closeMenu = document.getElementById("closeMenu");

    if (!hamburger || !mobileMenu) return;

    function toggleMenu(open) {
      mobileMenu.style.transform = open ? "translateY(0)" : "translateY(-100%)";
    }

    hamburger.addEventListener("click", () => toggleMenu(true));
    if (closeMenu) closeMenu.addEventListener("click", () => toggleMenu(false));

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", () => toggleMenu(false));
    });
  }

  function renderHero(heroData) {
    if (!heroData) return;
    const titleEl = document.querySelector("#home h1");
    const subtitleEl = document.querySelector("#home .text-3xl");
    const descEl = document.querySelector("#home .text-lg");
    const btnEl = document.querySelector("#home .btn-gold");
    const bgEl = document.querySelector("#home .absolute.inset-0");

    if (titleEl) titleEl.textContent = "LUXE";
    if (subtitleEl) subtitleEl.textContent = heroData.title || "Culinary Artistry";
    if (descEl) descEl.textContent = heroData.subtitle || "";
    if (btnEl) {
      btnEl.textContent = heroData.buttonText || "Explore Menu";
      if (heroData.buttonLink) btnEl.href = heroData.buttonLink;
    }
    if (bgEl && heroData.backgroundImage) {
      bgEl.style.backgroundImage = `url('${getFullImageUrl(heroData.backgroundImage)}')`;
    }
  }

  function renderMenu(categories, menuItems) {
    const categoryTabs = document.getElementById("categoryTabs");
    const menuGrid = document.getElementById("menuGrid");
    if (!categoryTabs || !menuGrid || !categories) return;

    let activeCategory = categories[0]?.slug || "starter";

    function renderTabs() {
      categoryTabs.innerHTML = categories
        .map(function (cat) {
          return (
            '<button class="tab-btn px-4 py-2 text-sm uppercase tracking-wider ' +
            (cat.slug === activeCategory ? "tab-active" : "text-white/60") +
            '" data-slug="' + cat.slug + '" data-id="' + cat._id + '">' +
            cat.name +
            "</button>"
          );
        })
        .join("");

      categoryTabs.addEventListener("click", function (e) {
        var btn = e.target.closest(".tab-btn");
        if (!btn) return;
        activeCategory = btn.dataset.slug;
        document.querySelectorAll(".tab-btn").forEach(function (b) {
          b.classList.remove("tab-active");
          b.classList.add("text-white/60");
        });
        btn.classList.add("tab-active");
        btn.classList.remove("text-white/60");
        renderMenuItems(activeCategory);
      });
    }

    function renderMenuItems(categorySlug) {
      var cat = categories.find(function (c) { return c.slug === categorySlug; });
      if (!cat) return;

      var items = (menuItems || []).filter(function (item) {
        return item.categoryId && item.categoryId._id === cat._id;
      });

      menuGrid.innerHTML = items
        .map(function (item) {
          return (
            '<div class="card-hover bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-gold/10 shadow-lg">' +
            '<img src="' + getFullImageUrl(item.image) + '" alt="' + item.name + '" loading="lazy" class="w-full h-48 object-cover" />' +
            '<div class="p-5 space-y-2">' +
            '<div class="flex justify-between items-start">' +
            '<h3 class="text-lg font-semibold text-white">' + item.name + "</h3>" +
            '<span class="gold font-bold">$' + item.price + "</span>" +
            "</div>" +
            '<p class="text-white/50 text-sm">' + item.description + "</p>" +
            '<div class="flex gap-2 mt-2">' +
            (item.veg
              ? '<span class="bg-green-800/30 text-green-300 text-xs px-2 py-0.5 rounded-full">Veg</span>'
              : '<span class="bg-red-800/30 text-red-300 text-xs px-2 py-0.5 rounded-full">Non-Veg</span>') +
            (item.popular
              ? '<span class="bg-yellow-800/30 text-yellow-300 text-xs px-2 py-0.5 rounded-full">Popular</span>'
              : "") +
            "</div></div></div>"
          );
        })
        .join("");
    }

    renderTabs();
    renderMenuItems(activeCategory);
  }

  function renderAbout(aboutData) {
    if (!aboutData) return;
    var story = document.getElementById("aboutStory");
    var img = document.getElementById("aboutChefImg");
    var exp = document.getElementById("aboutExp");
    var fresh = document.getElementById("aboutFresh");
    var lux = document.getElementById("aboutLux");

    if (story) story.textContent = aboutData.description;
    if (img) img.src = getFullImageUrl(aboutData.chefImage);
    if (exp) exp.textContent = aboutData.experience || "12+";
    if (fresh) fresh.textContent = aboutData.features?.[0] || "100%";
    if (lux) lux.textContent = "\u2605";
  }

  function renderGallery(galleryData) {
    var container = document.getElementById("galleryMasonry");
    if (!container || !galleryData) return;

    container.innerHTML = galleryData
      .map(function (item) {
        return (
          '<figure class="masonry break-inside-avoid rounded-xl overflow-hidden shadow-lg cursor-pointer relative group">' +
          '<img src="' + getFullImageUrl(item.image) + '" loading="lazy" class="w-full h-auto object-cover transition" />' +
          '<div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-lg">\u26F6</div>' +
          "</figure>"
        );
      })
      .join("");

    container.querySelectorAll("figure").forEach(function (fig) {
      fig.addEventListener("click", function () {
        var imgSrc = this.querySelector("img").src;
        var overlay = document.createElement("div");
        overlay.className = "fixed inset-0 z-[999] lightbox-overlay flex items-center justify-center p-6";
        overlay.innerHTML =
          '<img src="' + imgSrc + '" class="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl" />' +
          '<button class="absolute top-6 right-8 text-white text-4xl">\u2715</button>';
        overlay.querySelector("button").addEventListener("click", () => overlay.remove());
        overlay.addEventListener("click", function (e) {
          if (e.target === overlay) overlay.remove();
        });
        document.body.appendChild(overlay);
      });
    });
  }

  function renderTestimonials(testimonialsData) {
    var container = document.getElementById("testimonialCards");
    if (!container || !testimonialsData) return;

    container.innerHTML = testimonialsData
      .map(function (t) {
        var stars = "";
        for (var i = 0; i < 5; i++) {
          stars += i < t.rating ? "\u2605" : "\u2606";
        }
        return (
          '<div class="glass p-6 rounded-2xl border border-gold/10 card-hover">' +
          '<div class="flex gold text-sm mb-2">' + stars + "</div>" +
          '<p class="text-white/80 italic">\u201C' + t.review + "\u201D</p>" +
          '<p class="gold mt-4 text-sm">\u2014 ' + t.customerName + "</p>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderContact(contactData) {
    if (!contactData) return;
    var phone = document.getElementById("contactPhone");
    var email = document.getElementById("contactEmail");
    var address = document.getElementById("contactAddress");
    var hours = document.getElementById("contactHours");
    var map = document.getElementById("mapFrame");

    if (phone) phone.textContent = contactData.phone;
    if (email) email.textContent = contactData.email;
    if (address) address.textContent = contactData.address;
    if (hours) hours.textContent = contactData.openingHours;
    if (map && contactData.googleMap) map.src = contactData.googleMap;
  }

  function initReveal() {
    var revealEls = document.querySelectorAll("#about, #gallery, #testimonials, #contact, #menu");
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) {
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        var target = document.querySelector(this.getAttribute("href"));
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function renderSettings(settingsData) {
    if (!settingsData) return;

    if (settingsData.metaTitle) {
      document.title = settingsData.metaTitle;
    }

    if (settingsData.metaDescription) {
      var metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', settingsData.metaDescription);
    }

    if (settingsData.keywords) {
      var metaKey = document.querySelector('meta[name="keywords"]');
      if (!metaKey) {
        metaKey = document.createElement('meta');
        metaKey.setAttribute('name', 'keywords');
        document.head.appendChild(metaKey);
      }
      metaKey.setAttribute('content', settingsData.keywords);
    }

    if (settingsData.favicon) {
      var faviconLink = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.setAttribute('rel', 'icon');
        document.head.appendChild(faviconLink);
      }
      faviconLink.setAttribute('href', getFullImageUrl(settingsData.favicon));
    }

    var footerCopyright = document.querySelector('footer p');
    if (footerCopyright && settingsData.copyright) {
      footerCopyright.innerHTML = settingsData.copyright;
    }

    var logoContainer = document.querySelector('nav .gold');
    if (logoContainer && settingsData.businessName) {
      logoContainer.textContent = settingsData.businessName;
    }
  }

  async function init() {
    initScrollProgress();
    initMobileMenu();

    const data = await loadData();

    renderHero(data.hero);
    renderMenu(data.categories, data.menuItems);
    renderAbout(data.about);
    renderGallery(data.gallery);
    renderTestimonials(data.testimonials);
    renderContact(data.contact);
    renderSettings(data.settings);

    initReveal();
    initSmoothScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
