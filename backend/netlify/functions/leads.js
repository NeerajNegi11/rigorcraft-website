const { prisma } = require("../../lib/db");
const { verifyAdminToken } = require("../../lib/auth");
const { jsonResponse, handlePreflight } = require("../../lib/cors");

exports.handler = async (event) => {
  const preflight = handlePreflight(event);
  if (preflight) return preflight;

  if (event.httpMethod !== "GET") {
    return jsonResponse(event, 405, { error: "Method not allowed" });
  }

  if (!verifyAdminToken(event)) {
    return jsonResponse(event, 401, { error: "Unauthorized" });
  }

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return jsonResponse(event, 200, { leads });
};
