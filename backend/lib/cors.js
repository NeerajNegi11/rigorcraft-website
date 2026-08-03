const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function corsHeaders(event) {
  const origin = event.headers.origin || event.headers.Origin || "";
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || "";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    Vary: "Origin",
  };
}

function jsonResponse(event, statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(event),
    },
    body: JSON.stringify(body),
  };
}

function handlePreflight(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(event), body: "" };
  }
  return null;
}

module.exports = { corsHeaders, jsonResponse, handlePreflight };
