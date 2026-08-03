const crypto = require("crypto");
const { prisma } = require("../../lib/db");
const { uploadResume } = require("../../lib/r2");
const { notify, escapeHtml } = require("../../lib/email");
const { jsonResponse, handlePreflight } = require("../../lib/cors");
const { parseMultipart, MAX_FILE_BYTES } = require("../../lib/multipart");

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

exports.handler = async (event) => {
  const preflight = handlePreflight(event);
  if (preflight) return preflight;

  if (event.httpMethod !== "POST") {
    return jsonResponse(event, 405, { error: "Method not allowed" });
  }

  const contentType = event.headers["content-type"] || event.headers["Content-Type"] || "";
  if (!contentType.startsWith("multipart/form-data")) {
    return jsonResponse(event, 400, { error: "Expected multipart/form-data" });
  }

  let fields;
  let file;
  let fileTooLarge;
  try {
    ({ fields, file, fileTooLarge } = await parseMultipart(event));
  } catch (err) {
    return jsonResponse(event, 400, { error: "Could not parse submission" });
  }

  const name = (fields.name || "").trim();
  const email = (fields.email || "").trim();
  const role = (fields.role || "").trim();
  const note = (fields.note || "").trim();

  if (!name || !email || !role) {
    return jsonResponse(event, 400, { error: "Name, email, and role are required" });
  }

  if (fileTooLarge) {
    return jsonResponse(event, 400, { error: `Resume must be under ${MAX_FILE_BYTES / (1024 * 1024)}MB` });
  }

  if (!file) {
    return jsonResponse(event, 400, { error: "Resume file is required" });
  }

  if (!ALLOWED_MIME_TYPES.has(file.mimeType)) {
    return jsonResponse(event, 400, { error: "Resume must be a PDF or Word document" });
  }

  const resumeKey = `resumes/${crypto.randomUUID()}-${file.filename}`;

  await uploadResume(resumeKey, file.buffer, file.mimeType);

  const applicant = await prisma.applicant.create({
    data: {
      name,
      email,
      role,
      note: note || null,
      resumeKey,
      resumeName: file.filename,
    },
  });

  try {
    await notify(
      `New application: ${role} — ${name}`,
      `<p><strong>Name:</strong> ${escapeHtml(name)}</p>
       <p><strong>Email:</strong> ${escapeHtml(email)}</p>
       <p><strong>Role:</strong> ${escapeHtml(role)}</p>
       <p><strong>Note:</strong><br>${escapeHtml(note).replace(/\n/g, "<br>")}</p>
       <p>Resume attached in the admin dashboard.</p>`
    );
  } catch (err) {
    console.error("Failed to send application notification email", err);
  }

  return jsonResponse(event, 201, { id: applicant.id });
};
