(function () {
  "use strict";

  const BACKEND_URL = "https://luxe-restaurant-backend.onrender.com";
  const API_BASE = `${BACKEND_URL}/api`;

  function $(sel) {
    return document.querySelector(sel);
  }

  async function apiFetch(endpoint, signal) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      if (err.name === 'AbortError') return null;
      console.warn(`API fetch failed for ${endpoint}`, err);
      return null;
    }
  }

  function getFullImageUrl(url) {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    var cleanUrl = url.startsWith("/") ? url : "/" + url;
    return BACKEND_URL + cleanUrl;
  }

  function cacheBust(url) {
    if (!url || url.startsWith("data:") || url.indexOf("unsplash") !== -1) return url;
    var sep = url.indexOf("?") !== -1 ? "&" : "?";
    return url + sep + "t=" + Date.now();
  }

  async function loadData() {
    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, 45000);

    try {
      var results = await Promise.all([
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
      return {
        hero: results[0], about: results[1], categories: results[2],
        menuItems: results[3], gallery: results[4], testimonials: results[5],
        contact: results[6], settings: results[7]
      };
    } catch (err) {
      clearTimeout(timeoutId);
      return { hero: null, about: null, categories: null, menuItems: null, gallery: null, testimonials: null, contact: null, settings: null };
    }
  }

  function showSkeletons() {
    var menuGrid = document.getElementById("menuGrid");
    if (menuGrid) {
      menuGrid.innerHTML = "";
      for (var i = 0; i < 6; i++) {
        var card = document.createElement("div");
        card.className = "skeleton-card";
        card.innerHTML = '<div class="skeleton skeleton-img"></div><div style="padding:16px">' +
          '<div class="skeleton skeleton-text" style="width:70%"></div>' +
          '<div class="skeleton skeleton-text" style="width:40%"></div>' +
          '<div class="skeleton skeleton-text" style="width:90%"></div></div>';
        menuGrid.appendChild(card);
      }
    }

    var galleryMasonry = document.getElementById("galleryMasonry");
    if (galleryMasonry) {
      galleryMasonry.innerHTML = "";
      for (var j = 0; j < 6; j++) {
        var skel = document.createElement("div");
        skel.className = "skeleton skeleton-img";
        skel.style.height = "250px";
        skel.style.marginBottom = "16px";
        galleryMasonry.appendChild(skel);
      }
    }

    var testimonialCards = document.getElementById("testimonialCards");
    if (testimonialCards) {
      testimonialCards.innerHTML = "";
      for (var k = 0; k < 3; k++) {
        var tcard = document.createElement("div");
        tcard.className = "skeleton-card";
        tcard.style.padding = "24px";
        tcard.innerHTML = '<div class="skeleton skeleton-text" style="width:30%;margin-bottom:12px"></div>' +
          '<div class="skeleton skeleton-text" style="width:100%"></div>' +
          '<div class="skeleton skeleton-text" style="width:80%"></div>' +
          '<div class="skeleton skeleton-text" style="width:40%;margin-top:16px"></div>';
        testimonialCards.appendChild(tcard);
      }
    }
  }

  function initScrollProgress() {
    window.addEventListener("scroll", function () {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      var bar = document.getElementById("scrollProgress");
      if (bar) bar.style.width = progress + "%";

      var btn = document.getElementById("backTop");
      if (btn) {
        if (scrollTop > 400) btn.classList.add("visible");
        else btn.classList.remove("visible");
      }
    });

    var backBtn = document.getElementById("backTop");
    if (backBtn) {
      backBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  function initMobileMenu() {
    var hamburger = document.getElementById("hamburger");
    var mobileMenu = document.getElementById("mobileMenu");
    var closeMenu = document.getElementById("closeMenu");

    if (!hamburger || !mobileMenu) return;

    function toggleMenu(open) {
      mobileMenu.style.transform = open ? "translateY(0)" : "translateY(-100%)";
    }

    hamburger.addEventListener("click", function () { toggleMenu(true); });
    if (closeMenu) closeMenu.addEventListener("click", function () { toggleMenu(false); });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { toggleMenu(false); });
    });
  }

  function renderHero(heroData) {
    var container = document.querySelector("#home .relative.z-10");
    if (!container) return;

    if (!heroData) {
      container.innerHTML =
        '<h1 class="text-5xl md:text-7xl font-light tracking-widest gold">LUXE</h1>' +
        '<p class="text-3xl md:text-5xl font-light text-white/90">Culinary Artistry</p>' +
        '<p class="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">Where tradition meets innovation.</p>' +
        '<div class="flex flex-wrap justify-center gap-4 pt-6"><a href="#menu" class="btn-gold px-8 py-3 rounded-full text-sm uppercase tracking-wider">Explore Menu</a></div>';
      return;
    }

    var title = heroData.title || "Culinary Artistry";
    var subtitle = heroData.subtitle || "";
    var btnText = heroData.buttonText || "Explore Menu";
    var btnLink = heroData.buttonLink || "#menu";

    container.innerHTML =
      '<h1 class="text-5xl md:text-7xl font-light tracking-widest gold">LUXE</h1>' +
      '<p class="text-3xl md:text-5xl font-light text-white/90">' + title + '</p>' +
      '<p class="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">' + subtitle + '</p>' +
      '<div class="flex flex-wrap justify-center gap-4 pt-6"><a href="' + btnLink + '" class="btn-gold px-8 py-3 rounded-full text-sm uppercase tracking-wider">' + btnText + '</a></div>';

    if (heroData.backgroundImage) {
      var bgEl = document.querySelector("#home .absolute.inset-0");
      if (bgEl) {
        var imgUrl = getFullImageUrl(heroData.backgroundImage);
        var bgImg = new Image();
        bgImg.onload = function () {
          bgEl.style.backgroundImage = "url('" + imgUrl + "')";
        };
        bgImg.onerror = function () {
          bgEl.style.backgroundImage = "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80')";
        };
        bgImg.src = imgUrl;
      }
    }
  }

  function renderMenu(categories, menuItems) {
    var categoryTabs = document.getElementById("categoryTabs");
    var menuGrid = document.getElementById("menuGrid");
    if (!categoryTabs || !menuGrid || !categories || !categories.length) return;

    var activeCategory = categories[0] ? categories[0].slug : "starter";

    function renderTabs() {
      categoryTabs.innerHTML = categories
        .map(function (cat) {
          return '<button class="tab-btn px-4 py-2 text-sm uppercase tracking-wider ' +
            (cat.slug === activeCategory ? "tab-active" : "text-white/60") +
            '" data-slug="' + cat.slug + '" data-id="' + cat._id + '">' +
            cat.name + "</button>";
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

      if (!items.length) {
        menuGrid.innerHTML = '<p class="text-white/40 text-center col-span-3 py-8">No items in this category</p>';
        return;
      }

      menuGrid.innerHTML = items
        .map(function (item) {
          var imgSrc = getFullImageUrl(item.image);
          return '<div class="card-hover bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-gold/10 shadow-lg">' +
            '<div class="relative w-full h-48 overflow-hidden">' +
            '<img src="' + imgSrc + '" alt="' + item.name + '" loading="lazy" class="w-full h-48 object-cover" ' +
            'onerror="this.onerror=null;this.src=\'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="#1a1818" width="400" height="300"/><text fill="#666" font-size="14" x="200" y="150" text-anchor="middle">Image Not Available</text></svg>') + '\'" />' +
            '</div>' +
            '<div class="p-5 space-y-2">' +
            '<div class="flex justify-between items-start">' +
            '<h3 class="text-lg font-semibold text-white">' + item.name + '</h3>' +
            '<span class="gold font-bold">$' + item.price + '</span>' +
            '</div>' +
            '<p class="text-white/50 text-sm">' + (item.description || '') + '</p>' +
            '<div class="flex gap-2 mt-2">' +
            (item.veg ? '<span class="bg-green-800/30 text-green-300 text-xs px-2 py-0.5 rounded-full">Veg</span>' : '<span class="bg-red-800/30 text-red-300 text-xs px-2 py-0.5 rounded-full">Non-Veg</span>') +
            (item.popular ? '<span class="bg-yellow-800/30 text-yellow-300 text-xs px-2 py-0.5 rounded-full">Popular</span>' : '') +
            '</div></div></div>';
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
      img.onerror = function () {
        this.onerror = null;
        this.src = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect fill="#1a1818" width="400" height="500"/><text fill="#666" font-size="14" x="200" y="250" text-anchor="middle">Chef Image</text></svg>');
        this.style.opacity = "1";
      };
      img.src = getFullImageUrl(aboutData.chefImage);
      img.style.opacity = "1";
    }
    if (exp) exp.textContent = aboutData.experience || "12+";
    if (fresh) fresh.textContent = aboutData.features && aboutData.features[0] ? aboutData.features[0] : "100%";
    if (lux) lux.textContent = "\u2605";
  }

  function renderGallery(galleryData) {
    var container = document.getElementById("galleryMasonry");
    if (!container || !galleryData) return;

    container.innerHTML = galleryData
      .map(function (item) {
        var imgSrc = getFullImageUrl(item.image);
        return '<figure class="masonry break-inside-avoid rounded-xl overflow-hidden shadow-lg cursor-pointer relative group">' +
          '<img src="' + imgSrc + '" loading="lazy" class="w-full h-auto object-cover transition" alt="' + (item.title || 'Gallery image') + '" ' +
          'onerror="this.onerror=null;this.src=\'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="#1a1818" width="400" height="300"/><text fill="#666" font-size="14" x="200" y="150" text-anchor="middle">Image Not Available</text></svg>') + '\'" />' +
          '<div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-lg">\u26F6</div>' +
          '</figure>';
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
        overlay.querySelector("button").addEventListener("click", function () { overlay.remove(); });
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
        return '<div class="glass p-6 rounded-2xl border border-gold/10 card-hover">' +
          '<div class="flex gold text-sm mb-2">' + stars + "</div>" +
          '<p class="text-white/80 italic">\u201C' + t.review + "\u201D</p>" +
          '<p class="gold mt-4 text-sm">\u2014 ' + t.customerName + "</p>" +
          "</div>";
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
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", settingsData.metaDescription);
    }

    if (settingsData.keywords) {
      var metaKey = document.querySelector('meta[name="keywords"]');
      if (!metaKey) {
        metaKey = document.createElement("meta");
        metaKey.setAttribute("name", "keywords");
        document.head.appendChild(metaKey);
      }
      metaKey.setAttribute("content", settingsData.keywords);
    }

    if (settingsData.favicon) {
      var faviconLink = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
      if (!faviconLink) {
        faviconLink = document.createElement("link");
        faviconLink.setAttribute("rel", "icon");
        document.head.appendChild(faviconLink);
      }
      faviconLink.setAttribute("href", getFullImageUrl(settingsData.favicon));
    }

    var footerCopyright = document.querySelector("footer p");
    if (footerCopyright && settingsData.copyright) {
      footerCopyright.innerHTML = settingsData.copyright;
    }

    var logoContainer = document.querySelector("nav .gold");
    if (logoContainer && settingsData.businessName) {
      logoContainer.textContent = settingsData.businessName;
    }
  }

  async function init() {
    initScrollProgress();
    initMobileMenu();
    showSkeletons();

    var data = await loadData();

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
