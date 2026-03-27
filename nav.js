/* ============================================================
   nav.js — Shared navigation behavior
   Nemecek Org Clubs
   Used by: admin.html, locations.html, settings.html

   Provides:
     - toggleNavMenu() / closeNavMenu()
     - Hover-open with 300ms close delay
     - Click-outside-to-close
     - handleSignOut()
     - Version-check cache buster (bump NAV_VERSION when deploying)
   ============================================================ */

/* ── VERSION CHECK — bump this string on every deploy ── */
const NAV_VERSION = '2026-03-27-v1';
(function () {
  var stored = sessionStorage.getItem('nav_version');
  if (stored && stored !== NAV_VERSION) {
    sessionStorage.setItem('nav_version', NAV_VERSION);
    window.location.reload(true);
  } else {
    sessionStorage.setItem('nav_version', NAV_VERSION);
  }
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
