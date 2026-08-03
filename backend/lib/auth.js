const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const TOKEN_TTL = "12h";

function signAdminToken(email) {
  return jwt.sign({ sub: email, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_TTL,
  });
}

function verifyAdminToken(event) {
  const header = event.headers.authorization || event.headers.Authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload.role === "admin" ? payload : null;
  } catch {
    return null;
  }
}

async function checkAdminPassword(password) {
  return bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH || "");
}

module.exports = { signAdminToken, verifyAdminToken, checkAdminPassword };
