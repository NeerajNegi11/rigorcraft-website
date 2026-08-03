const { z } = require("zod");
const { checkAdminPassword, signAdminToken } = require("../../lib/auth");
const { jsonResponse, handlePreflight } = require("../../lib/cors");

const LoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

exports.handler = async (event) => {
  const preflight = handlePreflight(event);
  if (preflight) return preflight;

  if (event.httpMethod !== "POST") {
    return jsonResponse(event, 405, { error: "Method not allowed" });
  }

  let payload;
  try {
    payload = LoginSchema.parse(JSON.parse(event.body || "{}"));
  } catch {
    return jsonResponse(event, 400, { error: "Invalid submission" });
  }

  const validEmail = payload.email.toLowerCase() === (process.env.ADMIN_EMAIL || "").toLowerCase();
  const validPassword = validEmail && (await checkAdminPassword(payload.password));

  if (!validEmail || !validPassword) {
    return jsonResponse(event, 401, { error: "Invalid email or password" });
  }

  const token = signAdminToken(payload.email);
  return jsonResponse(event, 200, { token });
};
