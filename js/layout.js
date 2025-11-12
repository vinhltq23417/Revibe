// Load HTML partials and highlight active nav
(function () {
  async function includePartials() {
    const includeEls = document.querySelectorAll('[data-include]');
    await Promise.all(Array.from(includeEls).map(async (el) => {
      const url = el.getAttribute('data-include');
      try {
        const res = await fetch(url);
        const html = await res.text();
        el.innerHTML = html;
      } catch (e) {
        console.error('Failed to load partial:', url, e);
      }
    }));

    // After partials are injected, sync active nav state
    setActiveNav();
    wireUserMenu();
  }

  function setActiveNav() {
    let current = location.pathname.split('/').pop().toLowerCase();
    // Map child pages to their parent nav item
    const childToParent = {
      'newproduct.html': 'productmanagement.html',
      'editproduct.html': 'productmanagement.html',
      'newarticle.html': 'blogmanagement.html',
      'editarticle.html': 'blogmanagement.html',
      'orderdetails.html': 'ordermanagement.html'
    };
    if (childToParent[current]) current = childToParent[current];
    const links = document.querySelectorAll('.sidebar .nav a');
    links.forEach((a) => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      if (href.endsWith(current)) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }

  // Kick off
  document.addEventListener('DOMContentLoaded', () => {
    enforceAuthGuard();
    includePartials();
  });

  function isLoggedIn() {
    try {
      return localStorage.getItem('adminLoggedIn') === 'true';
    } catch (e) {
      return false;
    }
  }

  function enforceAuthGuard() {
    const current = location.pathname.split('/').pop().toLowerCase();
    const onLoginPage = current === 'Login.html';

    if (!isLoggedIn() && !onLoginPage) {
      location.replace('Login.html');
      return;
    }

    if (isLoggedIn() && onLoginPage) {
      location.replace('admin.html');
    }
  }

  function wireUserMenu() {
    const toggle = document.getElementById('userMenuToggle');
    const dropdown = document.getElementById('userDropdown');
    const logout = document.getElementById('logoutAction');
    const adminNameEl = document.getElementById('adminName');
    try {
      const storedName = localStorage.getItem('adminName');
      if (storedName && adminNameEl) adminNameEl.textContent = storedName;
    } catch (e) {}
    if (!toggle || !dropdown) return;
    const open = () => { dropdown.style.display = 'block'; };
    const close = () => { dropdown.style.display = 'none'; };
    let isOpen = false;
    const toggleMenu = (e) => {
      e.stopPropagation();
      isOpen = !isOpen;
      if (isOpen) open(); else close();
    };
    toggle.addEventListener('click', toggleMenu);
    document.addEventListener('click', () => { if (isOpen) { isOpen = false; close(); } });
    if (logout) {
      logout.addEventListener('click', (e) => {
        e.preventDefault();
        try {
          localStorage.removeItem('adminLoggedIn');
          localStorage.removeItem('adminName');
        } catch (e) {}
        location.replace('Login.html');
      });
    }
  }
})();


