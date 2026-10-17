/* Katalog Harga Trailer, CV. Rezky Abadi Karoseri. Logika halaman. Data ada di data.js */
(function () {
  "use strict";

  var K = window.KATALOG;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var framed = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();

  var state = { tipe: K.produk[0].id, paket: "velg", warna: "biru-royal", unit: 1 };

  /* ---------- helpers ---------- */
  function rupiah(n) { return "Rp" + Math.round(n).toLocaleString("id-ID"); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function produk(id) { return K.produk.filter(function (p) { return p.id === id; })[0]; }
  function paket(id) { return K.paket.filter(function (p) { return p.id === id; })[0]; }
  function warna(id) { return K.warna.filter(function (w) { return w.id === id; })[0]; }
  function waLink(text) { return "https://wa.me/" + K.kontak.whatsapp + "?text=" + encodeURIComponent(text); }
  function axle(p) { return p.spek.suspensi.split(",")[0]; }
  function today() {
    try { return new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }); }
    catch (e) { return ""; }
  }

  var toastTimer;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("is-on"); }, 2600);
  }

  function copyText(text, okMsg) {
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      toast(ok ? okMsg : "Tidak bisa menyalin otomatis. Silakan salin manual.");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(okMsg); }, fallback);
    } else { fallback(); }
  }

  /* ---------- paket ban (shared state) ---------- */
  function renderPaketGroups() {
    $$("[data-paket-group]").forEach(function (g) {
      var name = "paket-" + g.getAttribute("data-paket-group");
      g.innerHTML = K.paket.map(function (pk) {
        return '<label><input type="radio" name="' + name + '" value="' + pk.id + '"><span>' + esc(pk.nama) + "</span></label>";
      }).join("");
      g.addEventListener("change", function (e) { if (e.target.name === name) setPaket(e.target.value); });
    });
  }

  function setPaket(id) {
    if (!paket(id)) return;
    state.paket = id;
    $$("[data-paket-group] input").forEach(function (i) { i.checked = i.value === id; });
    $$(".rung").forEach(function (r) { r.setAttribute("aria-pressed", r.getAttribute("data-paket") === id ? "true" : "false"); });
    $$("#ctable tr[data-paket]").forEach(function (tr) { tr.classList.toggle("is-current", tr.getAttribute("data-paket") === id); });
    applyFilters();
    updateProductLinks();
    updateSummary(true);
  }

  /* ---------- product list ---------- */
  function renderProducts() {
    var box = $("#products");
    box.innerHTML = K.produk.map(function (p) {
      var rungs = K.paket.map(function (pk, i) {
        var lvl = [0, 1, 2].map(function (j) { return '<i class="' + (j <= i ? "on" : "") + '"></i>'; }).join("");
        return '<button type="button" class="rung" data-paket="' + pk.id + '" aria-pressed="false">' +
          '<span class="rung__lvl" aria-hidden="true">' + lvl + "</span>" +
          '<span class="rung__name">' + esc(pk.nama) + "</span>" +
          '<span class="rung__price">' + rupiah(p.harga[pk.id]) + "</span>" +
          '<span class="rung__ket">' + esc(pk.ket) + "</span></button>";
      }).join("");

      var specs = K.labelSpek.filter(function (l) { return p.spek[l[0]]; }).map(function (l) {
        return "<div><dt>" + esc(l[1]) + "</dt><dd>" + esc(p.spek[l[0]]) + "</dd></div>";
      }).join("");

      return '<article class="product" id="p-' + p.id + '" data-id="' + p.id + '">' +
        '<div class="product__photo">' +
          '<img src="' + p.gambar + '.webp" srcset="' + p.gambar + '-sm.webp 640w, ' + p.gambar + '.webp 1200w" sizes="(min-width: 1200px) 530px, (min-width: 860px) 44vw, 100vw" width="1200" height="960" loading="lazy" alt="' + esc(p.nama) + ', tampak belakang">' +
          '<div class="product__tags"><span class="tag tag--dark">' + p.ukuran + ' feet</span><span class="tag">' + esc(p.tipe) + '</span><span class="tag">' + esc(axle(p)) + "</span></div>" +
        "</div>" +
        '<div class="product__body">' +
          "<h3>" + esc(p.nama) + "</h3>" +
          '<p class="product__desc">' + esc(p.deskripsi) + "</p>" +
          '<div class="ladder" role="group" aria-label="Harga ' + esc(p.nama) + ' per paket ban">' + rungs + "</div>" +
          '<div class="product__actions">' +
            '<button type="button" class="btn btn--primary" data-order="' + p.id + '">Hitung &amp; pesan</button>' +
            '<a class="btn btn--wa-ghost" data-wa-produk="' + p.id + '" href="#" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-wa"/></svg>Tanya unit ini</a>' +
          "</div>" +
          '<button type="button" class="spec-toggle" aria-expanded="false" aria-controls="spec-' + p.id + '">Spesifikasi lengkap<svg aria-hidden="true"><use href="#i-down"/></svg></button>' +
          '<dl class="plate specs" id="spec-' + p.id + '" hidden>' + specs + '<p class="specs__note">' + esc(K.catatanVelg) + "</p></dl>" +
        "</div></article>";
    }).join("") + '<p class="empty" id="emptyProducts" hidden>Tidak ada tipe yang cocok dengan filter ini. Pilih "Semua" untuk melihat seluruh tipe.</p>';

    box.addEventListener("click", function (e) {
      var rung = e.target.closest(".rung");
      if (rung) { setPaket(rung.getAttribute("data-paket")); return; }
      var ord = e.target.closest("[data-order]");
      if (ord) {
        setTipe(ord.getAttribute("data-order"));
        document.getElementById("pesan").scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth" });
        return;
      }
      var tg = e.target.closest(".spec-toggle");
      if (tg) {
        var open = tg.getAttribute("aria-expanded") !== "true";
        tg.setAttribute("aria-expanded", open ? "true" : "false");
        document.getElementById(tg.getAttribute("aria-controls")).hidden = !open;
      }
    });
  }

  function prefersReduced() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  function updateProductLinks() {
    $$("[data-wa-produk]").forEach(function (a) {
      var p = produk(a.getAttribute("data-wa-produk"));
      var pk = paket(state.paket);
      a.href = waLink("Halo Pak Aziz, saya tertarik dengan " + p.nama + " paket " + pk.nama + " (" + rupiah(p.harga[pk.id]) + "). Apakah unit ini bisa dipesan, dan berapa harga terbarunya?");
    });
  }

  function applyFilters() {
    var uk = ($("input[name=fUkuran]:checked") || {}).value || "all";
    var tp = ($("input[name=fTipe]:checked") || {}).value || "all";
    var sort = $("#fSort").value;
    var list = K.produk.slice();
    if (sort === "murah") list.sort(function (a, b) { return a.harga[state.paket] - b.harga[state.paket]; });
    if (sort === "mahal") list.sort(function (a, b) { return b.harga[state.paket] - a.harga[state.paket]; });
    var shown = 0;
    list.forEach(function (p, i) {
      var el = document.getElementById("p-" + p.id);
      var ok = (uk === "all" || String(p.ukuran) === uk) && (tp === "all" || p.tipe === tp);
      el.hidden = !ok;
      el.style.order = i;
      if (ok) shown++;
    });
    $("#emptyProducts").hidden = shown > 0;
    $("#count").textContent = "Menampilkan " + shown + " dari " + K.produk.length + " tipe";
  }

  /* ---------- comparison table ---------- */
  function renderCompare() {
    var t = $("#ctable");
    var head = "<thead><tr><th scope=\"col\">Spesifikasi</th>" + K.produk.map(function (p) {
      return '<th scope="col"><span class="col-name">' + p.ukuran + " ft " + esc(p.tipe) + '</span><span class="col-sub">' + esc(axle(p)) + "</span></th>";
    }).join("") + "</tr></thead>";

    var rows = '<tr class="group"><th scope="rowgroup">Harga per unit</th>' + K.produk.map(function () { return "<td></td>"; }).join("") + "</tr>";
    rows += K.paket.map(function (pk) {
      return '<tr data-paket="' + pk.id + '"><th scope="row">' + esc(pk.nama) + "</th>" + K.produk.map(function (p) {
        return '<td class="num">' + rupiah(p.harga[pk.id]) + "</td>";
      }).join("") + "</tr>";
    }).join("");
    rows += '<tr class="group"><th scope="rowgroup">Spesifikasi</th>' + K.produk.map(function () { return "<td></td>"; }).join("") + "</tr>";
    rows += K.labelSpek.map(function (l) {
      var vals = K.produk.map(function (p) { return p.spek[l[0]] || null; });
      var diff = vals.some(function (v) { return v !== vals[0]; });
      return '<tr class="' + (diff ? "is-diff" : "is-same") + '"><th scope="row">' + esc(l[1]) + "</th>" + vals.map(function (v) {
        return v ? "<td>" + esc(v) + "</td>" : '<td class="na" title="Tidak tercantum di katalog">–</td>';
      }).join("") + "</tr>";
    }).join("");
    t.innerHTML = head + "<tbody>" + rows + "</tbody>";

    var note = document.createElement("p");
    note.className = "price-note";
    note.textContent = K.catatanVelg + " Tanda – berarti tidak tercantum untuk tipe tersebut.";
    t.parentNode.parentNode.appendChild(note);

    $("#onlyDiff").addEventListener("change", function (e) {
      $$("#ctable tr.is-same").forEach(function (tr) { tr.hidden = e.target.checked; });
    });
  }

  /* ---------- colours ---------- */
  function renderColors() {
    $("#swatches").innerHTML = K.warna.map(function (w) {
      return '<label class="swatch"><input type="radio" name="warna" value="' + w.id + '" aria-label="' + esc(w.nama) + '">' +
        '<span class="swatch__img"><img src="assets/img/warna/' + w.id + '.webp" width="375" height="215" alt="" loading="lazy"></span>' +
        '<span class="swatch__name"><i style="background:' + w.hex + '"></i>' + esc(w.nama) + "</span></label>";
    }).join("");
    $("#swatches").addEventListener("change", function (e) { if (e.target.name === "warna") setWarna(e.target.value); });

    $("#oWarna").innerHTML = K.warna.map(function (w) { return '<option value="' + w.id + '">' + esc(w.nama) + "</option>"; }).join("");
    $("#oWarna").addEventListener("change", function (e) { setWarna(e.target.value); });

    $("#useColor").addEventListener("click", function () {
      document.getElementById("pesan").scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth" });
      toast("Warna " + warna(state.warna).nama + " dipakai untuk pesanan");
    });
  }

  function setWarna(id) {
    var w = warna(id); if (!w) return;
    state.warna = id;
    $$("input[name=warna]").forEach(function (i) { i.checked = i.value === id; });
    var img = $("#colorImg");
    img.src = "assets/img/warna/" + id + ".webp";
    img.alt = "Contoh trailer warna " + w.nama;
    $("#colorName").textContent = w.nama;
    $("#colorChip").style.background = w.hex;
    $("#oWarna").value = id;
    $("#oChip").style.background = w.hex;
    updateSummary(false);
  }

  /* ---------- order form ---------- */
  function renderTypes() {
    $("#types").innerHTML = K.produk.map(function (p) {
      return '<label class="type"><input type="radio" name="oTipe" value="' + p.id + '">' +
        '<span class="type__box"><img src="' + p.gambar + '-sm.webp" width="640" height="512" alt="" loading="lazy">' +
        '<span class="type__txt"><b>' + esc(p.nama.replace("Trailer ", "")) + "</b><small>mulai " + rupiah(p.harga.velg) + "</small></span></span></label>";
    }).join("");
    $("#types").addEventListener("change", function (e) { if (e.target.name === "oTipe") setTipe(e.target.value); });
  }

  function setTipe(id) {
    if (!produk(id)) return;
    state.tipe = id;
    $$("input[name=oTipe]").forEach(function (i) { i.checked = i.value === id; });
    updateSummary(true);
  }

  function setUnit(n) {
    n = parseInt(n, 10);
    if (isNaN(n) || n < 1) n = 1;
    if (n > 50) n = 50;
    state.unit = n;
    $("#oUnit").value = n;
    $("#unitMinus").disabled = n <= 1;
    $("#unitPlus").disabled = n >= 50;
    updateSummary(true);
  }

  function calc() {
    var p = produk(state.tipe), pk = paket(state.paket), w = warna(state.warna);
    var harga = p.harga[pk.id];
    var total = harga * state.unit;
    var dp = Math.round(total * K.ketentuan.dpPersen / 100);
    return { p: p, pk: pk, w: w, harga: harga, total: total, dp: dp, sisa: total - dp };
  }

  function extras() {
    return {
      nama: $("#oNama").value.trim(),
      kota: $("#oKota").value.trim(),
      catatan: $("#oCatatan").value.trim()
    };
  }

  function quoteLines(c) {
    var x = extras();
    var lines = [
      "Tipe: " + c.p.nama,
      "Paket: " + c.pk.nama + " (" + c.pk.ket.toLowerCase() + ")",
      "Warna: " + c.w.nama,
      "Jumlah: " + state.unit + " unit",
      "Harga per unit: " + rupiah(c.harga),
      "Estimasi total: " + rupiah(c.total),
      "DP " + K.ketentuan.dpPersen + "%: " + rupiah(c.dp)
    ];
    var more = [];
    if (x.nama) more.push("Nama: " + x.nama);
    if (x.kota) more.push("Kota: " + x.kota);
    if (x.catatan) more.push("Catatan: " + x.catatan);
    return { main: lines, more: more };
  }

  function waMessage(c) {
    var q = quoteLines(c);
    var parts = ["Halo Pak Aziz, saya ingin memesan trailer dari CV. Rezky Abadi Karoseri.", "", q.main.join("\n")];
    if (q.more.length) parts.push("", q.more.join("\n"));
    parts.push("", "Mohon info harga terbaru dan jadwal pengerjaannya. Terima kasih.");
    return parts.join("\n");
  }

  function copyMessage(c) {
    var q = quoteLines(c);
    var parts = ["Estimasi biaya trailer, CV. Rezky Abadi Karoseri (" + today() + ")", "", q.main.join("\n"),
      "Sisa pembayaran: " + rupiah(c.sisa), "Pengerjaan: " + K.ketentuan.pengerjaan];
    if (q.more.length) parts.push("", q.more.join("\n"));
    parts.push("", "WhatsApp " + K.kontak.nama + ": " + K.kontak.whatsappTampil, "Harga dapat berubah sewaktu-waktu.");
    return parts.join("\n");
  }

  function updateSummary(pulse) {
    var c = calc();
    $("#sNama").textContent = c.p.nama;
    $("#sPaket").textContent = "Paket " + c.pk.nama;
    $("#sWarna").textContent = c.w.nama;
    $("#sChip").style.background = c.w.hex;
    $("#sHarga").textContent = rupiah(c.harga);
    $("#sUnit").textContent = state.unit + " unit";
    $("#sTotal").textContent = rupiah(c.total);
    $("#sDp").textContent = rupiah(c.dp);
    $("#sSisa").textContent = rupiah(c.sisa);
    $("#sendWa").href = waLink(waMessage(c));
    if (pulse && !prefersReduced()) {
      var el = $("#sTotal");
      el.classList.remove("pulse"); void el.offsetWidth; el.classList.add("pulse");
    }
  }

  function shareUrl() {
    var base = location.protocol === "file:" ? "https://rezkyabadikaroseri.github.io/" : location.origin + location.pathname;
    var q = new URLSearchParams({ tipe: state.tipe, paket: state.paket, warna: state.warna, unit: String(state.unit) });
    return base + "?" + q.toString() + "#pesan";
  }

  function fillPrintSheet(c) {
    var x = extras();
    var row = function (a, b, cls) { return "<tr" + (cls ? ' class="' + cls + '"' : "") + "><td>" + esc(a) + "</td><td>" + esc(b) + "</td></tr>"; };
    var who = [x.nama, x.kota].filter(Boolean).join(", ");
    $("#printSheet").innerHTML =
      '<header><img src="assets/img/logo.png" alt=""><div><h1>CV. Rezky Abadi Karoseri</h1>' +
      '<div class="muted">' + esc(K.kontak.alamat) + "<br>WhatsApp " + esc(K.kontak.nama) + ": " + esc(K.kontak.whatsappTampil) + " | " + esc(K.kontak.email) + "</div></div></header>" +
      "<h2>Estimasi biaya trailer</h2>" +
      '<p class="muted">Tanggal: ' + esc(today()) + (who ? "<br>Untuk: " + esc(who) : "") + "</p>" +
      "<table>" +
      row("Tipe", c.p.nama) + row("Paket ban", c.pk.nama + " (" + c.pk.ket.toLowerCase() + ")") + row("Warna", c.w.nama) +
      row("Harga per unit", rupiah(c.harga)) + row("Jumlah", state.unit + " unit") +
      row("Total", rupiah(c.total), "tot") + row("Uang muka (DP " + K.ketentuan.dpPersen + "%)", rupiah(c.dp)) +
      row("Sisa pembayaran", rupiah(c.sisa)) + row("Pengerjaan", K.ketentuan.pengerjaan) +
      "</table>" +
      (x.catatan ? "<h2>Catatan</h2><p>" + esc(x.catatan) + "</p>" : "") +
      "<h2>Spesifikasi</h2><table>" + K.labelSpek.filter(function (l) { return c.p.spek[l[0]]; }).map(function (l) { return row(l[1], c.p.spek[l[0]]); }).join("") + "</table>" +
      '<p class="muted" style="margin-top:14px">' + esc(K.catatanVelg) + " Sparepart merek " + esc(K.ketentuan.sparepart) + ". Estimasi ini dihitung dari daftar harga dan bukan penawaran resmi. Harga dapat berubah sewaktu-waktu.</p>";
  }

  function bindOrder() {
    $("#unitMinus").addEventListener("click", function () { setUnit(state.unit - 1); });
    $("#unitPlus").addEventListener("click", function () { setUnit(state.unit + 1); });
    $("#oUnit").addEventListener("change", function (e) { setUnit(e.target.value); });
    $("#oUnit").addEventListener("input", function (e) { if (e.target.value !== "") setUnit(e.target.value); });
    ["#oNama", "#oKota", "#oCatatan"].forEach(function (s) { $(s).addEventListener("input", function () { updateSummary(false); }); });
    $("#orderForm").addEventListener("submit", function (e) { e.preventDefault(); });

    $("#copyQuote").addEventListener("click", function () { copyText(copyMessage(calc()), "Rincian estimasi disalin"); });
    $("#shareQuote").addEventListener("click", function () {
      var url = shareUrl(), c = calc();
      var data = { title: "Estimasi " + c.p.nama, text: c.p.nama + ", paket " + c.pk.nama + ", " + state.unit + " unit: " + rupiah(c.total), url: url };
      if (navigator.share) {
        navigator.share(data).catch(function (err) { if (err && err.name !== "AbortError") copyText(url, "Link estimasi disalin"); });
      } else { copyText(url, "Link estimasi disalin"); }
    });
    $("#printQuote").addEventListener("click", function () { fillPrintSheet(calc()); window.print(); });
  }

  /* ---------- generic links, nav, misc ---------- */
  function bindGeneral() {
    var msg = "Halo Pak Aziz, saya ingin bertanya tentang trailer di katalog CV. Rezky Abadi Karoseri.";
    $$("[data-wa=umum]").forEach(function (a) { a.href = waLink(msg); });
    $$("[data-copy]").forEach(function (b) {
      b.addEventListener("click", function () { copyText(b.getAttribute("data-copy"), "Disalin: " + b.getAttribute("data-copy")); });
    });

    var btn = $("#menuBtn"), nav = $("#nav");
    btn.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) { nav.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-label", "Buka menu"); }
    });

    ["fUkuran", "fTipe"].forEach(function (n) {
      $$("input[name=" + n + "]").forEach(function (i) { i.addEventListener("change", applyFilters); });
    });
    $("#fSort").addEventListener("change", applyFilters);

    $("#year").textContent = new Date().getFullYear();
    $("#slipDate").textContent = today();
    $$("[data-updated]").forEach(function (el) { el.textContent = "per " + K.diperbarui; });
    var min = Math.min.apply(null, K.produk.map(function (p) { return p.harga.velg; }));
    $("#factFrom").textContent = rupiah(min);

    if (framed) {
      $$("[data-top-only]").forEach(function (el) { el.hidden = true; });
      $("#copyQuote").style.gridColumn = "1 / -1";
    }

    if ("IntersectionObserver" in window) {
      var links = $$("#nav a");
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            links.forEach(function (a) { a.setAttribute("aria-current", a.getAttribute("href") === "#" + en.target.id ? "true" : "false"); });
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      ["harga", "banding", "warna", "pesan", "kontak"].forEach(function (id) { spy.observe(document.getElementById(id)); });

      var fab = $(".fab");
      var visible = {};
      var fabObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { visible[en.target.id || "hero"] = en.isIntersecting; });
        var hide = visible.pesan || visible.kontak || visible.hero;
        fab.classList.toggle("is-hidden", !!hide);
      }, { threshold: 0.15 });
      fabObs.observe(document.getElementById("pesan"));
      fabObs.observe(document.getElementById("kontak"));
      fabObs.observe($(".hero"));
    }
  }

  function readParams() {
    var q;
    try { q = new URLSearchParams(location.search); } catch (e) { return false; }
    var any = false;
    if (q.get("tipe") && produk(q.get("tipe"))) { state.tipe = q.get("tipe"); any = true; }
    if (q.get("paket") && paket(q.get("paket"))) { state.paket = q.get("paket"); any = true; }
    if (q.get("warna") && warna(q.get("warna"))) { state.warna = q.get("warna"); any = true; }
    if (q.get("unit")) { var u = parseInt(q.get("unit"), 10); if (u >= 1 && u <= 50) { state.unit = u; any = true; } }
    return any;
  }

  /* ---------- boot ---------- */
  var fromLink = readParams();
  renderPaketGroups();
  renderProducts();
  renderCompare();
  renderColors();
  renderTypes();
  bindOrder();
  bindGeneral();
  setTipe(state.tipe);
  setWarna(state.warna);
  setUnit(state.unit);
  setPaket(state.paket);

  if (fromLink && location.hash === "#pesan") {
    requestAnimationFrame(function () { document.getElementById("pesan").scrollIntoView(); });
  }
})();
