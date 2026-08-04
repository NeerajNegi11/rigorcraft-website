const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_IP = 5;
const MAX_GLOBAL = 50; // backstop against distributed/rotating-IP floods

function getClientIp(event) {
  const headers = event.headers || {};
  return (
    headers["x-nf-client-connection-ip"] ||
    (headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    null
  );
}

async function isRateLimited(prismaModel, ipAddress) {
  const since = new Date(Date.now() - WINDOW_MS);

  const globalCount = await prismaModel.count({
    where: { createdAt: { gte: since } },
  });
  if (globalCount >= MAX_GLOBAL) return true;

  if (!ipAddress) return false;

  const ipCount = await prismaModel.count({
    where: { ipAddress, createdAt: { gte: since } },
  });
  return ipCount >= MAX_PER_IP;
}

module.exports = { getClientIp, isRateLimited };
