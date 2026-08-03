const { prisma } = require("../../lib/db");
const { verifyAdminToken } = require("../../lib/auth");
const { getResumeDownloadUrl } = require("../../lib/r2");
const { jsonResponse, handlePreflight } = require("../../lib/cors");

// GET /resume?id=<applicantId> — returns a short-lived signed download URL
// for that applicant's resume. Requires an admin bearer token because R2
// objects are private.
exports.handler = async (event) => {
  const preflight = handlePreflight(event);
  if (preflight) return preflight;

  if (event.httpMethod !== "GET") {
    return jsonResponse(event, 405, { error: "Method not allowed" });
  }

  if (!verifyAdminToken(event)) {
    return jsonResponse(event, 401, { error: "Unauthorized" });
  }

  const id = event.queryStringParameters && event.queryStringParameters.id;
  if (!id) {
    return jsonResponse(event, 400, { error: "Missing id" });
  }

  const applicant = await prisma.applicant.findUnique({ where: { id } });
  if (!applicant) {
    return jsonResponse(event, 404, { error: "Not found" });
  }

  const url = await getResumeDownloadUrl(applicant.resumeKey);
  return jsonResponse(event, 200, { url });
};
