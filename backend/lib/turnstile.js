const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

async function verifyTurnstile(token, remoteIp) {
  if (!token) return false;

  const body = new URLSearchParams();
  body.set("secret", process.env.TURNSTILE_SECRET_KEY);
  body.set("response", token);
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await fetch(VERIFY_URL, { method: "POST", body });
    const data = await response.json();
    return data.success === true;
  } catch {
    return false;
  }
}

module.exports = { verifyTurnstile };
