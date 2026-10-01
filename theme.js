// Klick auf das G schaltet zwischen hell und dunkel um; die Wahl bleibt im
// localStorage des Browsers (kein Cookie, nichts wird übertragen).
(function () {
  var root = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  var system = matchMedia("(prefers-color-scheme: dark)");

  function istDunkel() {
    return root.dataset.theme ? root.dataset.theme === "dark" : system.matches;
  }
  function leisteFaerben() {
    if (meta) meta.content = istDunkel() ? "#0b1a13" : "#f4f1ea";
  }

  leisteFaerben();
  system.addEventListener("change", leisteFaerben);

  var g = document.querySelector("button.monogramm");
  if (!g) return;
  g.addEventListener("click", function () {
    root.dataset.theme = istDunkel() ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
    leisteFaerben();
  });
})();
