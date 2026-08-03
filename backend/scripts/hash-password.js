// Usage: npm run hash-password -- "your-plaintext-password"
// Prints a bcrypt hash to put in ADMIN_PASSWORD_HASH.
const bcrypt = require("bcryptjs");

const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run hash-password -- "your-plaintext-password"');
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log(hash);
});
