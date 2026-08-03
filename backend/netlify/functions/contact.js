const { z } = require("zod");
const { prisma } = require("../../lib/db");
const { notify, escapeHtml } = require("../../lib/email");
const { jsonResponse, handlePreflight } = require("../../lib/cors");

const ContactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(200),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  service: z.string().trim().max(100).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(5000),
});

exports.handler = async (event) => {
  const preflight = handlePreflight(event);
  if (preflight) return preflight;

  if (event.httpMethod !== "POST") {
    return jsonResponse(event, 405, { error: "Method not allowed" });
  }

  let payload;
  try {
    payload = ContactSchema.parse(JSON.parse(event.body || "{}"));
  } catch (err) {
    return jsonResponse(event, 400, { error: "Invalid submission", details: err.errors });
  }

  const lead = await prisma.lead.create({
    data: {
      name: payload.name,
      email: payload.email,
      company: payload.company || null,
      phone: payload.phone || null,
      service: payload.service || null,
      message: payload.message,
    },
  });

  try {
    await notify(
      `New enquiry from ${payload.name}`,
      `<p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
       <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
       <p><strong>Company:</strong> ${escapeHtml(payload.company)}</p>
       <p><strong>Phone:</strong> ${escapeHtml(payload.phone)}</p>
       <p><strong>Service:</strong> ${escapeHtml(payload.service)}</p>
       <p><strong>Message:</strong><br>${escapeHtml(payload.message).replace(/\n/g, "<br>")}</p>`
    );
  } catch (err) {
    // Lead is already saved; a failed notification email shouldn't fail the request.
    console.error("Failed to send contact notification email", err);
  }

  return jsonResponse(event, 201, { id: lead.id });
};
