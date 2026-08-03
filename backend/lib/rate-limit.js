const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 5;

function getClientIp(event) {
  const headers = event.headers || {};
  return (
    headers["x-nf-client-connection-ip"] ||
    (headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    null
  );
}

async function isRateLimited(prismaModel, ipAddress) {
  if (!ipAddress) return false;

  const count = await prismaModel.count({
    where: {
      ipAddress,
      createdAt: { gte: new Date(Date.now() - WINDOW_MS) },
    },
  });

  return count >= MAX_PER_WINDOW;
}

module.exports = { getClientIp, isRateLimited };
