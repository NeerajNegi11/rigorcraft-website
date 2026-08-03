const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function notify(subject, html) {
  await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: process.env.NOTIFY_EMAIL,
    subject,
    html,
  });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]
  ));
}

module.exports = { notify, escapeHtml };
