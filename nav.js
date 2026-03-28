/* ============================================================
   nav.js — Shared navigation behavior
   Nemecek Org Clubs
   Used by: admin.html, locations.html, settings.html

   Provides:
     - toggleNavMenu() / closeNavMenu()
     - Hover-open with 300ms close delay
     - Click-outside-to-close
     - handleSignOut()
     - Auto-update banner (polls for file changes every 60s)
   ============================================================ */

/* ── AUTO-UPDATE BANNER ── */
(function () {
  var PAGE_LOAD_TIME = Date.now();

  function injectBanner() {
    if (document.getElementById('nav-update-banner')) return;
    var banner = document.createElement('div');
    banner.id = 'nav-update-banner';
    banner.className = 'nav-update-banner';
    banner.innerHTML = '🔄 An update is available — <strong>click anywhere here to refresh</strong>';
    banner.onclick = function () { window.location.reload(true); };
    var body = document.body;
    if (body.firstChild) {
      body.insertBefore(banner, body.firstChild);
    } else {
      body.appendChild(banner);
    }
    // Trigger slide-in on next frame
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        banner.classList.add('show');
      });
    });
  }

  async function checkForUpdate() {
    try {
      var res = await fetch(window.location.pathname + '?_=' + Date.now(), { method: 'HEAD' });
      var lastMod = res.headers.get('last-modified');
      if (!lastMod) return;
      var serverTime = new Date(lastMod).getTime();
      if (serverTime > PAGE_LOAD_TIME) {
        injectBanner();
      }
    } catch (e) { /* silent fail */ }
  }

  // First check after 15 seconds, then every 60 seconds
  setTimeout(checkForUpdate, 15000);
  setInterval(checkForUpdate, 60000);
})();

/* ── TOGGLE / CLOSE ── */
function toggleNavMenu() {
  var dd = document.getElementById('nav-dropdown');
  if (dd) dd.classList.toggle('open');
}

function closeNavMenu() {
  var dd = document.getElementById('nav-dropdown');
  if (dd) dd.classList.remove('open');
}

/* ── HOVER OPEN WITH 300ms CLOSE DELAY ── */
(function () {
  var closeTimer;
  var wrap = document.querySelector('.nav-menu-wrap');
  if (!wrap) return;

  wrap.addEventListener('mouseenter', function () {
    clearTimeout(closeTimer);
    var dd = document.getElementById('nav-dropdown');
    if (dd) dd.classList.add('open');
  });

  wrap.addEventListener('mouseleave', function () {
    closeTimer = setTimeout(function () {
      var dd = document.getElementById('nav-dropdown');
      if (dd) dd.classList.remove('open');
    }, 300);
  });
})();

/* ── CLICK OUTSIDE TO CLOSE ── */
document.addEventListener('click', function (e) {
  var wrap = document.querySelector('.nav-menu-wrap');
  if (wrap && !wrap.contains(e.target)) closeNavMenu();
});

/* ── SIGN OUT ── */
async function handleSignOut() {
  await sb.auth.signOut();
  window.location.href = 'index.html';
}
