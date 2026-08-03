(function () {
  document.querySelectorAll("[data-turnstile-container]").forEach(function (container) {
    var widget = document.createElement("div");
    widget.className = "cf-turnstile";
    widget.id = "cf-turnstile-widget";
    widget.setAttribute("data-sitekey", window.RIGORWORKS_TURNSTILE_SITE_KEY);
    container.appendChild(widget);
  });
})();
