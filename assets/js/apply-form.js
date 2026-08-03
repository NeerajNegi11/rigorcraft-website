(function () {
  const params = new URLSearchParams(window.location.search);
  const role = params.get("role") || "Open Application";

  const headingEl = document.querySelector("[data-role-heading]");
  if (headingEl) headingEl.textContent = role;

  const roleInput = document.querySelector("[data-role-input]");
  if (roleInput) roleInput.value = role;

  const form = document.querySelector("form[data-apply-form]");
  if (!form) return;

  const button = form.querySelector("button[type=submit]");
  const statusEl = form.querySelector("[data-form-status]");
  const originalButtonText = button ? button.textContent : "";

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const turnstileInput = form.querySelector('[name="cf-turnstile-response"]');
    if (!turnstileInput || !turnstileInput.value) {
      if (statusEl) {
        statusEl.textContent = "Please complete the verification check before submitting.";
        statusEl.className = "form-status form-status-error";
      }
      return;
    }

    if (button) {
      button.disabled = true;
      button.textContent = "Submitting...";
    }
    if (statusEl) {
      statusEl.textContent = "";
      statusEl.className = "form-status";
    }

    try {
      const response = await fetch(window.RIGORWORKS_API_BASE + "/apply", {
        method: "POST",
        body: new FormData(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
      }

      form.reset();
      if (roleInput) roleInput.value = role;
      if (statusEl) {
        statusEl.textContent = "Thanks — we've received your application and will be in touch.";
        statusEl.className = "form-status form-status-success";
      }
    } catch (err) {
      if (statusEl) {
        statusEl.textContent = err.message === "Request failed"
          ? "Something went wrong submitting your application. Please try again or email careers@rigorworks.com."
          : err.message;
        statusEl.className = "form-status form-status-error";
      }
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = originalButtonText;
      }
      if (window.turnstile) {
        window.turnstile.reset("cf-turnstile-widget");
      }
    }
  });
})();
