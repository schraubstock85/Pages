// Klick auf das G schaltet zwischen hell und dunkel um; die Wahl bleibt im
// localStorage des Browsers (kein Cookie, nichts wird übertragen).
// Dazu kleine Spielereien: Glühwürmchen fangen, Glühwürmchen bzw. Blätter per
// Tipp auf die Fläche, Initialen mischen (nur bis zum Neuladen).
(function () {
  var root = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  var system = matchMedia("(prefers-color-scheme: dark)");
  var ruhig = matchMedia("(prefers-reduced-motion: reduce)");

  function istDunkel() {
    return root.dataset.theme ? root.dataset.theme === "dark" : system.matches;
  }
  function leisteFaerben() {
    if (meta) meta.content = istDunkel() ? "#0b1a13" : "#f4f1ea";
  }
  function zufall(min, max) {
    return min + Math.random() * (max - min);
  }

  leisteFaerben();
  system.addEventListener("change", leisteFaerben);

  var g = document.querySelector("button.monogramm");
  if (g) {
    g.addEventListener("click", function () {
      root.dataset.theme = istDunkel() ? "light" : "dark";
      try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
      leisteFaerben();
    });
  }

  // --- Glühwürmchen fangen -------------------------------------------------
  var schwarm = document.querySelector(".gluehwuermchen");
  var gruss = document.querySelector(".gutenacht");
  var ruhepause = false;

  function uebrig() {
    return schwarm.querySelectorAll("i:not(.gefangen)").length;
  }

  function fangen(f) {
    if (f.classList.contains("gefangen")) return;
    f.classList.add("gefangen");
    if (f.dataset.neu) {
      setTimeout(function () { f.remove(); }, 800);
    }
    if (uebrig() === 0 && !ruhepause) {
      ruhepause = true;
      if (gruss) {
        gruss.textContent = "Gute Nacht 🌙";
        gruss.classList.add("sichtbar");
      }
      setTimeout(function () {
        if (gruss) gruss.classList.remove("sichtbar");
        schwarm.querySelectorAll("i.gefangen").forEach(function (alt) {
          if (alt.dataset.neu) { alt.remove(); return; }
          alt.classList.remove("gefangen");
          alt.classList.add("neu");
        });
        ruhepause = false;
      }, 4500);
    }
  }

  // Treffer über die Entfernung statt über das Element, damit auch
  // Glühwürmchen hinter dem Schriftzug fangbar sind.
  function naechstesGluehwuermchen(x, y) {
    var bestes = null, abstand = 34;
    schwarm.querySelectorAll("i:not(.gefangen)").forEach(function (f) {
      var r = f.getBoundingClientRect();
      var d = Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y);
      if (d < abstand) { abstand = d; bestes = f; }
    });
    return bestes;
  }

  // Bewegung so wählen, dass das Glühwürmchen im sichtbaren Bereich bleibt.
  function rand(pos, groesse) {
    return zufall(Math.max(-40, 12 - pos), Math.min(40, groesse - 12 - pos));
  }

  function neuesGluehwuermchen(x, y) {
    if (schwarm.querySelectorAll("i[data-neu]").length >= 25) return;
    var f = document.createElement("i");
    f.dataset.neu = "1";
    f.className = "neu";
    f.style.cssText =
      "--x:" + x + "px;--y:" + y + "px;" +
      "--d:" + zufall(9, 16).toFixed(1) + "s;--v:0s;" +
      "--dx:" + Math.round(rand(x, window.innerWidth)) + "px;--dy:" + Math.round(rand(y, window.innerHeight)) + "px";
    schwarm.appendChild(f);
  }

  // --- Blätter im Hellmodus ------------------------------------------------
  var laub = document.querySelector(".blaetter");
  var gruentoene = ["#2f5a40", "#3f6b4f", "#5f8a5a", "#7a9a5c", "#12301f"];
  var blattform =
    '<svg viewBox="0 0 20 20"><path d="M10 1C15.5 5 16.5 12.5 10 19 3.5 12.5 4.5 5 10 1Z"/>' +
    '<path d="M10 3.5V17.5" stroke="rgba(255,255,255,.35)" stroke-width=".8" fill="none"/></svg>';

  function neuesBlatt(x, y) {
    if (!laub || laub.childElementCount >= 40) return;
    var b = document.createElement("span");
    b.className = "blatt";
    var r = zufall(-40, 40);
    b.style.cssText =
      "left:" + (x - 9) + "px;top:" + (y - 9) + "px;" +
      "--f:" + zufall(4, 6.5).toFixed(2) + "s;" +
      "--g:" + Math.round(zufall(14, 22)) + "px;" +
      "--c:" + gruentoene[Math.floor(Math.random() * gruentoene.length)] + ";" +
      "--h:" + Math.round(window.innerHeight - y + 40) + "px;" +
      "--r1:" + Math.round(r - 35) + "deg;--r2:" + Math.round(r + 35) + "deg";
    b.innerHTML = blattform;
    b.addEventListener("animationend", function (e) {
      if (e.target === b) b.remove();
    });
    laub.appendChild(b);
  }

  // --- Ein Tipp irgendwo auf der Seite ------------------------------------
  document.addEventListener("pointerdown", function (e) {
    if (ruhig.matches || e.button > 0) return;
    var t = e.target;
    if (t.closest(".monogramm, .initialen, a")) return;
    if (istDunkel() && schwarm) {
      var naechstes = naechstesGluehwuermchen(e.clientX, e.clientY);
      if (naechstes) { fangen(naechstes); return; }
    }
    if (istDunkel()) {
      if (schwarm) neuesGluehwuermchen(e.clientX, e.clientY);
    } else {
      neuesBlatt(e.clientX, e.clientY);
    }
  });

  // --- Initialen mischen ---------------------------------------------------
  var initialen = document.querySelector(".initialen");
  if (initialen) {
    var plaetze = Array.prototype.slice.call(initialen.querySelectorAll(".b"));
    initialen.addEventListener("click", function () {
      var alt = plaetze.map(function (p) { return p.textContent; });
      var reihe, neu;
      do {
        reihe = plaetze.map(function (_, i) { return i; });
        for (var i = reihe.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = reihe[i]; reihe[i] = reihe[j]; reihe[j] = tmp;
        }
        neu = reihe.map(function (k) { return alt[k]; });
      } while (neu.join("") === alt.join(""));

      var vorher = plaetze.map(function (p) {
        var r = p.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, s: parseFloat(getComputedStyle(p).fontSize) };
      });
      plaetze.forEach(function (p, i) {
        p.textContent = neu[i];
        if (ruhig.matches) return;
        var von = vorher[reihe[i]], nach = vorher[i];
        p.style.transition = "none";
        p.style.transform =
          "translate(" + (von.x - nach.x) + "px," + (von.y - nach.y) + "px) scale(" + (von.s / nach.s) + ")";
      });
      if (ruhig.matches) return;
      initialen.getBoundingClientRect();
      plaetze.forEach(function (p, i) {
        p.style.transition = "transform 0.7s cubic-bezier(0.34, 1.4, 0.64, 1) " + (i * 40) + "ms";
        p.style.transform = "";
      });
    });
  }
})();
