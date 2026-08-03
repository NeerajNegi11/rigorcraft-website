const { PrismaClient } = require("@prisma/client");

// Module-scope singleton: Netlify reuses the same warm container/module
// cache across invocations, so this avoids opening a new DB connection
// pool on every request. Use Neon's pooled connection string in
// DATABASE_URL so concurrent cold starts don't exhaust Postgres connections.
const prisma = new PrismaClient();

module.exports = { prisma };
