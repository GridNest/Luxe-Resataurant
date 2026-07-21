(function () {
  "use strict";

  const BACKEND_URL = "https://luxe-restaurant-backend.onrender.com";
  const API_BASE = `${BACKEND_URL}/api`;
  let imageCache = {};

  function $(sel) {
    return document.querySelector(sel);
  }

  function cacheBustUrl(url) {
    if (!url || url.startsWith('data:') || url.includes('unsplash') || url.includes('cloudinary')) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  }

  async function apiFetch(endpoint, signal) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      if (err.name === 'AbortError') return null;
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
    return `${BACKEND_URL}${cleanUrl}`;
  }

  function createLazyImage(src, alt, className, attrs = {}) {
    const img = new Image();
    img.alt = alt || '';
    img.className = `img-loading ${className || ''}`;
    Object.keys(attrs).forEach(k => img.setAttribute(k, attrs[k]));

    img.onload = function() {
      this.classList.remove('img-loading');
      this.classList.add('img-loaded');
    };
    img.onerror = function() {
      this.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="#1a1818" width="400" height="300"/><text fill="#666" font-family="sans-serif" font-size="14" x="200" y="150" text-anchor="middle">Image Not Available</text></svg>');
      this.classList.remove('img-loading');
      this.classList.add('img-loaded');
    };

    img.src = getFullImageUrl(src);
    return img;
  }

  async function loadData() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const [hero, about, categories, menuItems, gallery, testimonials, contact, settings] = await Promise.all([
        apiFetch("/hero", controller.signal),
        apiFetch("/about", controller.signal),
        apiFetch("/categories", controller.signal),
        apiFetch("/menu", controller.signal),
        apiFetch("/gallery", controller.signal),
        apiFetch("/testimonials", controller.signal),
        apiFetch("/contact", controller.signal),
        apiFetch("/settings", controller.signal)
      ]);

      clearTimeout(timeoutId);
      return { hero, about, categories, menuItems, gallery, testimonials, contact, settings };
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('Partial load failed, rendering available data');
      return { hero: null, about: null, categories: null, menuItems: null, gallery: null, testimonials: null, contact: null, settings: null };
    }
  }

  function showSkeletons() {
    const heroContent = document.querySelector('#home .relative.z-10');
    if (heroContent) {
      heroContent.innerHTML = `
        <div class="skeleton skeleton-title mx-auto" style="width:200px;height:60px;margin-bottom:16px"></div>
        <div class="skeleton skeleton-title mx-auto" style="width:300px;height:40px;margin-bottom:12px"></div>
        <div class="skeleton skeleton-text mx-auto" style="width:400px;max-width:100%"></div>
      `;
    }

    const menuGrid = document.getElementById('menuGrid');
    if (menuGrid) {
      menuGrid.innerHTML = Array(6).fill('').map(() => `
        <div class="skeleton-card">
          <div class="skeleton skeleton-img"></div>
          <div style="padding:16px">
            <div class="skeleton skeleton-text" style="width:70%"></div>
            <div class="skeleton skeleton-text" style="width:40%"></div>
            <div class="skeleton skeleton-text" style="width:90%"></div>
          </div>
        </div>
      `).join('');
    }

    const galleryMasonry = document.getElementById('galleryMasonry');
    if (galleryMasonry) {
      galleryMasonry.innerHTML = Array(6).fill('').map(() => `
        <div class="skeleton skeleton-img" style="height:250px;margin-bottom:16px"></div>
      `).join('');
    }

    const testimonialCards = document.getElementById('testimonialCards');
    if (testimonialCards) {
      testimonialCards.innerHTML = Array(3).fill('').map(() => `
        <div class="skeleton-card" style="padding:24px">
          <div class="skeleton skeleton-text" style="width:30%;margin-bottom:12px"></div>
          <div class="skeleton skeleton-text" style="width:100%"></div>
          <div class="skeleton skeleton-text" style="width:80%"></div>
          <div class="skeleton skeleton-text" style="width:40%;margin-top:16px"></div>
        </div>
      `).join('');
    }
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
      const imgUrl = getFullImageUrl(heroData.backgroundImage);
      const bgImg = new Image();
      bgImg.onload = function() {
        bgEl.style.backgroundImage = `url('${imgUrl}')`;
        bgEl.style.transition = 'opacity 0.5s ease';
      };
      bgImg.onerror = function() {
        bgEl.style.backgroundImage = `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80')`;
      };
      bgImg.src = imgUrl;
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
            '<div class="relative w-full h-48 overflow-hidden">' +
            '<img src="' + getFullImageUrl(item.image) + '" alt="' + item.name + '" loading="lazy" class="w-full h-48 object-cover img-loading" onload="this.classList.remove(\'img-loading\');this.classList.add(\'img-loaded\')" onerror="this.src=\'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="#1a1818" width="400" height="300"/><text fill="#666" font-family="sans-serif" font-size="14" x="200" y="150" text-anchor="middle">Image Not Available</text></svg>') + '\';this.classList.remove(\'img-loading\');this.classList.add(\'img-loaded\')" />' +
            '</div>' +
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
    if (img) {
      img.onload = function() { this.classList.add('loaded'); };
      img.onerror = function() {
        this.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect fill="#1a1818" width="400" height="500"/><text fill="#666" font-family="sans-serif" font-size="14" x="200" y="250" text-anchor="middle">Chef Image</text></svg>');
      };
      img.src = getFullImageUrl(aboutData.chefImage);
    }
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
          '<img src="' + getFullImageUrl(item.image) + '" loading="lazy" class="w-full h-auto object-cover transition img-loading" alt="' + (item.title || 'Gallery image') + '" onload="this.classList.remove(\'img-loading\');this.classList.add(\'img-loaded\')" onerror="this.src=\'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="#1a1818" width="400" height="300"/><text fill="#666" font-family="sans-serif" font-size="14" x="200" y="150" text-anchor="middle">Image Not Available</text></svg>') + '\';this.classList.remove(\'img-loading\');this.classList.add(\'img-loaded\')" />' +
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
    showSkeletons();

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
