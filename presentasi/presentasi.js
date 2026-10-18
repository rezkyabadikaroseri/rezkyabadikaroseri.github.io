/* Presentasi CV. Rezky Abadi Karoseri, tanpa library.
   Tombol: → / spasi / PageDown = lanjut, ← / PageUp = kembali, Home / End,
   F = layar penuh, G = semua slide, N = catatan, P = mode presenter, K = putar/jeda video. */
(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  var MODE = params.has('presenter') ? 'presenter' : params.has('embed') ? 'embed' : 'main';
  var body = document.body;
  var stage = document.getElementById('stage');
  var slides = Array.prototype.slice.call(stage.querySelectorAll(':scope > .slide'));
  var total = slides.length;
  var cur = -1;
  var channel = null;
  try { channel = new BroadcastChannel('rak-presentasi'); } catch (e) { channel = null; }

  var $ = function (id) { return document.getElementById(id); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var titleOf = function (i) { return slides[i].getAttribute('data-title') || ('Slide ' + (i + 1)); };
  var notesOf = function (i) { var a = slides[i].querySelector('.notes'); return a ? a.textContent.trim() : ''; };

  /* ---------- page numbers ---------- */
  slides.forEach(function (s, i) {
    if (s.classList.contains('s-cover') || s.classList.contains('s-video') || s.classList.contains('s-contact')) return;
    var f = document.createElement('div');
    f.className = 'pageno';
    f.innerHTML = '<span>' + (s.querySelector('.foot-note') ? '' : 'CV. Rezky Abadi Karoseri') + '</span><span>' + pad(i + 1) + '</span>';
    s.appendChild(f);
  });

  /* ---------- scaling ---------- */
  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
    if (!$('overview').hidden) scaleThumbs();
  }
  window.addEventListener('resize', fit);
  fit();

  /* ---------- videos ---------- */
  function setupVideo(box) {
    var v = box.querySelector('video'), btn = box.querySelector('.playbtn');
    if (!v || !btn) return;
    btn.addEventListener('click', function () { playVideo(box); });
    v.addEventListener('play', function () { box.classList.add('playing'); v.controls = true; });
    v.addEventListener('ended', function () { box.classList.remove('playing'); v.controls = false; try { v.currentTime = 0; } catch (e) {} });
  }
  function playVideo(box) {
    var v = box.querySelector('video');
    v.muted = false;
    var p = v.play();
    if (p && p.catch) p.catch(function () { v.muted = true; v.play().catch(function () {}); });
  }
  function toggleVideo() {
    var box = slides[cur] && slides[cur].querySelector('.vid');
    if (!box) return;
    var v = box.querySelector('video');
    if (v.paused) playVideo(box); else v.pause();
  }
  function stopVideos(slide) {
    slide.querySelectorAll('video').forEach(function (v) { if (!v.paused) v.pause(); });
  }
  if (MODE !== 'embed') stage.querySelectorAll('.vid').forEach(setupVideo);

  /* ---------- navigation ---------- */
  function go(n, opts) {
    opts = opts || {};
    n = Math.max(0, Math.min(total - 1, n));
    if (n === cur && !opts.force) return;
    if (cur >= 0) { stopVideos(slides[cur]); slides[cur].classList.remove('active'); }
    cur = n;
    slides[cur].classList.add('active');
    $('counter').textContent = (cur + 1) + ' / ' + total;
    $('progress').firstElementChild.style.width = ((cur + 1) / total * 100) + '%';
    if (MODE !== 'presenter') {
      var h = '#' + (cur + 1);
      if (location.hash !== h) history.replaceState(null, '', h);
    }
    $('npTitle').textContent = (cur + 1) + '. ' + titleOf(cur);
    $('npText').textContent = notesOf(cur) || 'Tidak ada catatan untuk slide ini.';
    if (MODE === 'presenter') updatePresenter();
    if (!opts.remote && channel && MODE !== 'embed') channel.postMessage({ t: 'go', n: cur });
    var ov = $('ovGrid').children;
    for (var i = 0; i < ov.length; i++) ov[i].classList.toggle('cur', i === cur);
  }
  var next = function () { go(cur + 1); };
  var prev = function () { go(cur - 1); };
  function fromHash() {
    var m = /^#(\d+)$/.exec(location.hash);
    return m ? parseInt(m[1], 10) - 1 : 0;
  }

  /* ---------- overview ---------- */
  function buildOverview() {
    var grid = $('ovGrid');
    if (grid.children.length) return;
    slides.forEach(function (s, i) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'ov-item';
      var thumb = document.createElement('div');
      thumb.className = 'ov-thumb';
      var c = s.cloneNode(true);
      c.classList.remove('active');
      c.removeAttribute('aria-hidden');
      c.querySelectorAll('.notes, .playbtn').forEach(function (e) { e.remove(); });
      c.querySelectorAll('video').forEach(function (v) {
        var img = document.createElement('img');
        img.src = v.getAttribute('poster'); img.alt = '';
        img.style.cssText = 'width:100%;height:100%;object-fit:cover';
        v.replaceWith(img);
      });
      c.querySelectorAll('.print-poster').forEach(function (e) { e.remove(); });
      thumb.appendChild(c);
      item.appendChild(thumb);
      var cap = document.createElement('span');
      cap.innerHTML = '<b>' + (i + 1) + '</b>' + titleOf(i);
      item.appendChild(cap);
      item.addEventListener('click', function () { closeOverview(); go(i); });
      grid.appendChild(item);
    });
  }
  function scaleThumbs() {
    var items = $('ovGrid').querySelectorAll('.ov-thumb');
    items.forEach(function (t) { var s = t.clientWidth / 1920; t.firstElementChild.style.transform = 'scale(' + s + ')'; });
  }
  function openOverview() {
    buildOverview();
    $('overview').hidden = false;
    $('btnGrid').classList.add('on');
    scaleThumbs();
    var c = $('ovGrid').children[cur];
    if (c) { c.classList.add('cur'); c.focus({ preventScroll: true }); c.scrollIntoView({ block: 'center' }); }
  }
  function closeOverview() { $('overview').hidden = true; $('btnGrid').classList.remove('on'); }
  function toggleOverview() { if ($('overview').hidden) openOverview(); else closeOverview(); }

  /* ---------- notes, fullscreen, presenter ---------- */
  function toggleNotes() { var p = $('notesPanel'); p.hidden = !p.hidden; $('btnNotes').classList.toggle('on', !p.hidden); }
  var canFull = !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
  function toggleFull() {
    var d = document, el = d.documentElement;
    if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); }
    else if (canFull) { (el.requestFullscreen || el.webkitRequestFullscreen).call(el); }
  }
  if (!canFull) $('btnFull').hidden = true;
  function openPresenter() {
    var w = window.open(location.pathname + '?presenter#' + (cur + 1), 'rak-presenter', 'width=1280,height=800');
    if (!w) alert('Izinkan pop-up untuk membuka mode presenter.');
  }

  /* ---------- input ---------- */
  function onKey(e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var tag = (e.target.tagName || '').toLowerCase();
    var k = e.key;
    if (!$('overview').hidden) {
      if (k === 'Escape' || k === 'g' || k === 'G') { closeOverview(); e.preventDefault(); }
      return;
    }
    if (k === 'ArrowRight' || k === 'PageDown' || k === 'ArrowDown' || (k === ' ' && tag !== 'video' && tag !== 'button')) { next(); e.preventDefault(); }
    else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'ArrowUp' || k === 'Backspace') { prev(); e.preventDefault(); }
    else if (k === 'Home') { go(0); e.preventDefault(); }
    else if (k === 'End') { go(total - 1); e.preventDefault(); }
    else if (k === 'f' || k === 'F') { toggleFull(); }
    else if (k === 'g' || k === 'G') { toggleOverview(); }
    else if (k === 'Escape' && !$('notesPanel').hidden) { toggleNotes(); }
    else if (k === 'n' || k === 'N') { toggleNotes(); }
    else if (k === 'p' || k === 'P') { openPresenter(); }
    else if (k === 'k' || k === 'K') { toggleVideo(); }
    else if (/^[1-9]$/.test(k) && e.shiftKey === false && numBuf !== null) { numBuf += k; clearTimeout(numT); numT = setTimeout(function () { var n = parseInt(numBuf, 10); numBuf = ''; if (n) go(n - 1); }, 600); }
    else if (k === '0' && numBuf) { numBuf += k; }
  }
  var numBuf = '', numT = null;

  /* ---------- modes ---------- */
  if (MODE === 'embed') {
    body.classList.add('is-embed');
    stage.style.pointerEvents = 'none';
    window.addEventListener('hashchange', function () { go(fromHash(), { remote: true }); });
    go(fromHash(), { remote: true });
    return;
  }

  if (MODE === 'presenter') {
    body.classList.add('is-presenter');
    $('presenter').hidden = false;
    document.title = 'Mode presenter | Presentasi RAK';
    var base = location.pathname + '?embed';
    var t0 = Date.now();
    var updatePresenterImpl = function () {
      $('pvCur').src = base + '#' + (cur + 1);
      $('pvNext').src = base + '#' + Math.min(total, cur + 2);
      $('pvCount').textContent = (cur + 1) + ' / ' + total;
      $('pvTitle').textContent = (cur + 1) + '. ' + titleOf(cur);
      $('pvNotes').textContent = notesOf(cur) || 'Tidak ada catatan untuk slide ini.';
    };
    window.updatePresenter = updatePresenterImpl;
    $('pvPrev').addEventListener('click', prev);
    $('pvNext2').addEventListener('click', next);
    $('pvVideo').addEventListener('click', function () { if (channel) channel.postMessage({ t: 'video' }); });
    $('pvReset').addEventListener('click', function () { t0 = Date.now(); });
    setInterval(function () {
      var s = Math.floor((Date.now() - t0) / 1000);
      $('pvTimer').textContent = pad(Math.floor(s / 60)) + ':' + pad(s % 60);
      var d = new Date(); $('pvClock').textContent = pad(d.getHours()) + ':' + pad(d.getMinutes());
    }, 500);
    document.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'ArrowDown') { next(); e.preventDefault(); }
      else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'ArrowUp') { prev(); e.preventDefault(); }
      else if (k === 'k' || k === 'K') { if (channel) channel.postMessage({ t: 'video' }); }
    });
    if (channel) {
      channel.onmessage = function (m) { if (m.data && m.data.t === 'go') go(m.data.n, { remote: true }); };
      channel.postMessage({ t: 'hello' });
    }
    go(fromHash(), { remote: true, force: true });
    return;
  }
  function updatePresenter() { if (window.updatePresenter) window.updatePresenter(); }

  // main mode
  document.addEventListener('keydown', onKey);
  $('btnPrev').addEventListener('click', prev);
  $('btnNext').addEventListener('click', next);
  $('btnGrid').addEventListener('click', toggleOverview);
  $('ovClose').addEventListener('click', closeOverview);
  $('btnNotes').addEventListener('click', toggleNotes);
  $('npClose').addEventListener('click', toggleNotes);
  $('btnFull').addEventListener('click', toggleFull);
  $('btnPresenter').addEventListener('click', openPresenter);
  $('btnPrint').addEventListener('click', function () { window.print(); });
  window.addEventListener('hashchange', function () { go(fromHash()); });
  if (channel) channel.onmessage = function (m) {
    if (!m.data) return;
    if (m.data.t === 'go') go(m.data.n, { remote: true });
    else if (m.data.t === 'video') toggleVideo();
    else if (m.data.t === 'hello') channel.postMessage({ t: 'go', n: cur });
  };

  // swipe
  var sx = 0, sy = 0, st = 0;
  $('viewport').addEventListener('touchstart', function (e) {
    if (e.target.closest('.vid')) { st = 0; return; }
    var t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; st = Date.now();
  }, { passive: true });
  $('viewport').addEventListener('touchend', function (e) {
    if (!st) return;
    var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Date.now() - st < 700 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) { if (dx < 0) next(); else prev(); }
    st = 0;
  }, { passive: true });

  // idle controls
  var ctr = $('controls'), idleT = null;
  function wake() {
    ctr.classList.remove('idle'); body.style.cursor = '';
    clearTimeout(idleT);
    idleT = setTimeout(function () { if (!ctr.matches(':hover') && $('notesPanel').hidden) { ctr.classList.add('idle'); body.style.cursor = 'none'; } }, 2600);
  }
  ['mousemove', 'mousedown', 'touchstart', 'keydown'].forEach(function (ev) { document.addEventListener(ev, wake, { passive: true }); });
  wake();

  // keep screen awake while presenting
  var lock = null;
  function wakeLock() { if (navigator.wakeLock && !lock) navigator.wakeLock.request('screen').then(function (l) { lock = l; l.addEventListener('release', function () { lock = null; }); }).catch(function () {}); }
  document.addEventListener('click', wakeLock, { once: true });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') wakeLock(); });

  // first-visit hint
  var hint = $('hint');
  try { if (!sessionStorage.getItem('rak-hint')) { hint.hidden = false; setTimeout(function () { hint.style.opacity = 0; }, 3500); setTimeout(function () { hint.hidden = true; }, 4200); sessionStorage.setItem('rak-hint', '1'); } } catch (e) {}

  go(fromHash(), { force: true });
})();
