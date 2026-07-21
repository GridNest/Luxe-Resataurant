const API_BASE = 'https://luxe-restaurant-backend.onrender.com/api';

function getToken() {
  return localStorage.getItem('token');
}

function redirectToLogin() {
  if (window.location.pathname.includes('/pages/')) {
    window.location.href = '/admin/index.html';
  } else {
    window.location.href = '/admin/index.html';
  }
}

function checkAuth() {
  if (!getToken()) {
    redirectToLogin();
    return false;
  }
  return true;
}

function cacheBustUrl(url) {
  if (!url || url.startsWith('data:')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
}

async function apiFetch(endpoint, signal) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      signal
    });
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      redirectToLogin();
      return null;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    if (err.name === 'AbortError') return null;
    console.error('API Error:', err);
    return null;
  }
}

async function apiPost(endpoint, body) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Request failed');
    return json;
  } catch (err) {
    throw err;
  }
}

async function apiPut(endpoint, body) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Request failed');
    return json;
  } catch (err) {
    throw err;
  }
}

async function apiDelete(endpoint) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Request failed');
    return json;
  } catch (err) {
    throw err;
  }
}

async function apiUpload(endpoint, formData, method = 'POST') {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: method,
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Upload failed');
    return json;
  } catch (err) {
    throw err;
  }
}

function showToast(message, type = 'success') {
  const existing = document.querySelectorAll('.toast');
  existing.forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function getFullImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `https://luxe-restaurant-backend.onrender.com${cleanUrl}`;
}

function getCacheBustedUrl(url) {
  return cacheBustUrl(getFullImageUrl(url));
}

// Dynamically initialize Mobile Responsive UI controls on screens < 1024px
function initMobileUI() {
  const sidebar = document.querySelector('aside');
  const main = document.querySelector('main');
  if (!sidebar || !main) return;

  sidebar.classList.add('transition-transform', 'duration-300', 'ease-in-out');

  let overlay = document.getElementById('sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'sidebar-overlay';
    overlay.className = 'fixed inset-0 bg-black/60 z-40 hidden backdrop-blur-sm transition-opacity duration-300 opacity-0';
    document.body.appendChild(overlay);
  }

  let header = document.getElementById('mobile-header');
  if (!header) {
    header = document.createElement('header');
    header.id = 'mobile-header';
    header.className = 'lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#111] border-b border-white/10 flex items-center justify-between px-6 z-30';

    let pageTitle = 'LUXE Admin';
    const mainHeading = document.querySelector('main h2');
    if (mainHeading) {
      pageTitle = mainHeading.textContent.trim();
    } else if (document.title) {
      pageTitle = document.title.replace('LUXE Admin - ', '').trim();
    }

    let adminNameStr = 'Admin';
    try {
      const admin = JSON.parse(localStorage.getItem('admin'));
      if (admin && admin.name) {
        adminNameStr = admin.name;
      }
    } catch (e) {}

    header.innerHTML = `
      <div class="flex items-center gap-3">
        <button id="hamburger-btn" class="text-white text-2xl w-12 h-12 flex items-center justify-center rounded-lg hover:bg-white/5 focus:outline-none" aria-label="Open Menu">&#9776;</button>
        <span class="font-semibold text-lg gold">${pageTitle}</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-[#c9a96e] text-[#0b0a0a] flex items-center justify-center font-bold text-sm">
          ${adminNameStr.charAt(0).toUpperCase()}
        </div>
        <span class="text-sm font-medium text-white/80 hidden sm:inline-block">${adminNameStr}</span>
      </div>
    `;

    document.body.insertBefore(header, document.body.firstChild);
  }

  function openSidebar() {
    sidebar.classList.add('sidebar-open');
    overlay.classList.remove('hidden');
    overlay.offsetHeight;
    overlay.classList.remove('opacity-0');
    overlay.classList.add('opacity-100');
  }

  function closeSidebar() {
    sidebar.classList.remove('sidebar-open');
    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0');
    setTimeout(() => {
      if (!sidebar.classList.contains('sidebar-open')) {
        overlay.classList.add('hidden');
      }
    }, 300);
  }

  const hamburgerBtn = document.getElementById('hamburger-btn');
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openSidebar();
    });
  }

  overlay.addEventListener('click', closeSidebar);

  const sidebarHeader = sidebar.querySelector('.border-b') || sidebar.firstElementChild;
  if (sidebarHeader && !sidebar.querySelector('.sidebar-close-btn')) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'sidebar-close-btn lg:hidden text-white/50 hover:text-white text-2xl focus:outline-none ml-auto p-2 w-12 h-12 flex items-center justify-center';
    closeBtn.innerHTML = '&#10005;';
    closeBtn.setAttribute('aria-label', 'Close sidebar');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSidebar();
    });
    sidebarHeader.classList.add('flex', 'items-center', 'justify-between');
    sidebarHeader.appendChild(closeBtn);
  }

  sidebar.querySelectorAll('nav a, button').forEach(link => {
    link.addEventListener('click', () => {
      closeSidebar();
    });
  });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobileUI);
} else {
  initMobileUI();
}
