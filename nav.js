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
     - 30-minute idle auto-logout with 3-minute warning
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

  setTimeout(checkForUpdate, 15000);
  setInterval(checkForUpdate, 60000);
})();

/* ── IDLE AUTO-LOGOUT (30 min idle, 3 min warning) ── */
(function () {
  var IDLE_LIMIT     = 30 * 60 * 1000;  // 30 minutes total
  var WARN_BEFORE    =  3 * 60 * 1000;  //  3 minutes warning
  var WARN_AT        = IDLE_LIMIT - WARN_BEFORE; // fire warning at 27 min
  var idleTimer      = null;
  var warnTimer      = null;
  var countdownTimer = null;
  var modalInjected  = false;

  function injectModal() {
    if (modalInjected) return;
    modalInjected = true;
    var el = document.createElement('div');
    el.id = 'idle-modal-overlay';
    el.style.cssText = 'position:fixed;inset:0;z-index:9000;background:rgba(30,45,61,0.55);backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;padding:20px;';
    el.innerHTML =
      '<div style="background:#fff;border-radius:18px;width:100%;max-width:380px;padding:32px 28px 24px;box-shadow:0 20px 60px rgba(30,45,61,0.25);text-align:center;font-family:\'DM Sans\',sans-serif;">' +
        '<div style="font-size:36px;margin-bottom:12px;">⏱</div>' +
        '<div style="font-family:\'Outfit\',sans-serif;font-size:20px;font-weight:700;color:#1e2d3d;margin-bottom:8px;">Still there?</div>' +
        '<div style="font-size:14px;color:#5b7087;margin-bottom:6px;line-height:1.5;">You will be signed out automatically due to inactivity in</div>' +
        '<div id="idle-countdown" style="font-family:\'Outfit\',sans-serif;font-size:36px;font-weight:800;color:#c47c0a;margin:10px 0 20px;letter-spacing:-1px;">3:00</div>' +
        '<button id="idle-stay-btn" style="width:100%;font-family:\'DM Sans\',sans-serif;font-size:15px;font-weight:600;background:linear-gradient(135deg,#3a5470,#5b80a0);color:white;border:none;border-radius:10px;padding:13px;cursor:pointer;box-shadow:0 2px 10px rgba(58,84,112,0.25);">Keep me signed in</button>' +
      '</div>';
    document.body.appendChild(el);
    document.getElementById('idle-stay-btn').addEventListener('click', resetIdle);
  }

  function showWarning() {
    injectModal();
    var overlay = document.getElementById('idle-modal-overlay');
    overlay.style.display = 'flex';
    var secondsLeft = WARN_BEFORE / 1000;
    updateCountdown(secondsLeft);
    countdownTimer = setInterval(function () {
      secondsLeft--;
      if (secondsLeft <= 0) {
        clearInterval(countdownTimer);
        doSignOut();
      } else {
        updateCountdown(secondsLeft);
      }
    }, 1000);
  }

  function updateCountdown(seconds) {
    var el = document.getElementById('idle-countdown');
    if (!el) return;
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    el.textContent = m + ':' + (s < 10 ? '0' : '') + s;
    el.style.color = seconds <= 60 ? '#c03030' : '#c47c0a';
  }

  function hideWarning() {
    var overlay = document.getElementById('idle-modal-overlay');
    if (overlay) overlay.style.display = 'none';
    clearInterval(countdownTimer);
  }

  async function doSignOut() {
    hideWarning();
    try { if (typeof sb !== 'undefined') await sb.auth.signOut(); } catch(e) {}
    window.location.href = 'index.html?msg=timeout';
  }

  function resetIdle() {
    hideWarning();
    clearTimeout(idleTimer);
    clearTimeout(warnTimer);
    warnTimer = setTimeout(showWarning, WARN_AT);
    idleTimer = setTimeout(doSignOut, IDLE_LIMIT);
  }

  ['mousemove','mousedown','keydown','scroll','touchstart','click'].forEach(function (evt) {
    document.addEventListener(evt, resetIdle, { passive: true });
  });

  resetIdle();
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
