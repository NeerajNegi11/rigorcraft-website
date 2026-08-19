(function () {
  function handleSubmit(form) {
    const button = form.querySelector("button[type=submit], button:not([type])");
    const statusEl = form.querySelector("[data-form-status]");
    const originalButtonText = button ? button.textContent : "";

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      let message = form.message.value;
      if (form.budget && form.budget.value) {
        message = "Estimated budget: " + form.budget.value + "\n\n" + message;
      }

      const turnstileInput = form.querySelector('[name="cf-turnstile-response"]');
      const turnstileToken = turnstileInput ? turnstileInput.value : "";

      if (!turnstileToken) {
        if (statusEl) {
          statusEl.textContent = "Please complete the verification check before submitting.";
          statusEl.className = "form-status form-status-error";
        }
        return;
      }

      const payload = {
        name: form.name.value,
        email: form.email.value,
        company: form.company ? form.company.value : "",
        phone: form.phone ? form.phone.value : "",
        service: form.service ? form.service.value : "",
        message: message,
        turnstileToken: turnstileToken,
      };

      if (button) {
        button.disabled = true;
        button.textContent = "Sending...";
      }
      if (statusEl) {
        statusEl.textContent = "";
        statusEl.className = "form-status";
      }

      try {
        const response = await fetch(window.RIGORCRAFT_API_BASE + "/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Request failed");
        }

        form.reset();
        if (statusEl) {
          statusEl.textContent = "Thanks — we've received your enquiry and will be in touch shortly.";
          statusEl.className = "form-status form-status-success";
        }
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = err.message === "Request failed"
            ? "Something went wrong sending your enquiry. Please try again or email us directly."
            : err.message;
          statusEl.className = "form-status form-status-error";
        }
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = originalButtonText;
        }
        if (window.turnstile) {
          window.turnstile.reset("#cf-turnstile-widget");
        }
      }
    });
  }

  document.querySelectorAll("form[data-contact-form]").forEach(handleSubmit);
})();
