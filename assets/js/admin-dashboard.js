(function () {
  const token = localStorage.getItem("rw_admin_token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const statusEl = document.getElementById("status");
  const leadsBody = document.getElementById("leads-body");
  const applicantsBody = document.getElementById("applicants-body");

  document.getElementById("logout-btn").addEventListener("click", function () {
    localStorage.removeItem("rw_admin_token");
    window.location.href = "login.html";
  });

  document.querySelectorAll("[data-tab]").forEach(function (tabBtn) {
    tabBtn.addEventListener("click", function () {
      document.querySelectorAll("[data-tab]").forEach((b) => b.classList.remove("active"));
      tabBtn.classList.add("active");
      const name = tabBtn.getAttribute("data-tab");
      document.querySelectorAll("[data-panel]").forEach((panel) => {
        panel.classList.toggle("d-none", panel.getAttribute("data-panel") !== name);
      });
    });
  });

  async function authedFetch(path) {
    const response = await fetch(window.RIGORCRAFT_API_BASE + path, {
      headers: { Authorization: "Bearer " + token },
    });

    if (response.status === 401) {
      localStorage.removeItem("rw_admin_token");
      window.location.href = "login.html";
      throw new Error("Session expired");
    }

    if (!response.ok) {
      throw new Error("Request failed");
    }

    return response.json();
  }

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value == null ? "" : String(value);
    return div.innerHTML;
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleString();
  }

  async function loadLeads() {
    const { leads } = await authedFetch("/leads");
    leadsBody.innerHTML = leads
      .map(
        (lead) => `<tr>
          <td>${formatDate(lead.createdAt)}</td>
          <td>${escapeHtml(lead.name)}</td>
          <td><a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a></td>
          <td>${escapeHtml(lead.company)}</td>
          <td>${escapeHtml(lead.phone)}</td>
          <td>${escapeHtml(lead.service)}</td>
          <td style="white-space:pre-wrap;">${escapeHtml(lead.message)}</td>
        </tr>`
      )
      .join("") || `<tr><td colspan="7" class="text-center text-muted">No leads yet</td></tr>`;
  }

  async function loadApplicants() {
    const { applicants } = await authedFetch("/applicants");
    applicantsBody.innerHTML = applicants
      .map(
        (applicant) => `<tr>
          <td>${formatDate(applicant.createdAt)}</td>
          <td>${escapeHtml(applicant.name)}</td>
          <td><a href="mailto:${escapeHtml(applicant.email)}">${escapeHtml(applicant.email)}</a></td>
          <td>${escapeHtml(applicant.role)}</td>
          <td style="white-space:pre-wrap;">${escapeHtml(applicant.note)}</td>
          <td><button class="btn btn-sm btn-outline-primary" data-resume-id="${applicant.id}">${escapeHtml(applicant.resumeName)}</button></td>
        </tr>`
      )
      .join("") || `<tr><td colspan="6" class="text-center text-muted">No applicants yet</td></tr>`;

    applicantsBody.querySelectorAll("[data-resume-id]").forEach((btn) => {
      btn.addEventListener("click", async function () {
        try {
          const { url } = await authedFetch("/resume?id=" + encodeURIComponent(btn.getAttribute("data-resume-id")));
          window.open(url, "_blank", "noopener");
        } catch (err) {
          statusEl.textContent = "Could not load resume link.";
          statusEl.className = "form-status form-status-error";
        }
      });
    });
  }

  Promise.all([loadLeads(), loadApplicants()]).catch(function () {
    statusEl.textContent = "Failed to load dashboard data.";
    statusEl.className = "form-status form-status-error";
  });
})();
