# RigorWorks Backend

Serverless API (Netlify Functions) backing the contact form and careers
applications on the main site. Deployed as its own Netlify site, separate
from the static frontend (which stays on GitHub Pages).

## Endpoints

- `POST /.netlify/functions/contact` — save a contact-form lead, email a notification
- `POST /.netlify/functions/apply` — save a career application + resume (multipart/form-data)
- `POST /.netlify/functions/login` — admin login, returns a JWT
- `GET /.netlify/functions/leads` — list leads (requires `Authorization: Bearer <token>`)
- `GET /.netlify/functions/applicants` — list applicants (requires auth)
- `GET /.netlify/functions/resume?id=<applicantId>` — short-lived signed resume download URL (requires auth)

## One-time setup

### 1. Database — Neon

1. Create a free project at [neon.tech](https://neon.tech).
2. Copy the **pooled** connection string (has `-pooler` in the hostname) into `DATABASE_URL`.
3. Once `DATABASE_URL` is set locally, run:
   ```bash
   cd backend
   npm install
   npx prisma migrate dev --name init
   ```
   This creates the `Lead` and `Applicant` tables.

### 2. Resume storage — Cloudflare R2

1. In the Cloudflare dashboard, create an R2 bucket (e.g. `rigorworks-resumes`). Keep it **private** — the app serves resumes via short-lived signed URLs, not public access.
2. Create an R2 API token (Account → R2 → Manage API Tokens) with read/write access to that bucket.
3. Fill in `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.

### 3. Email — Resend

1. Create a free account at [resend.com](https://resend.com) and verify a sending domain (or use their test domain while developing).
2. Copy the API key into `RESEND_API_KEY`.
3. Set `FROM_EMAIL` (must be on the verified domain) and `NOTIFY_EMAIL` (where you want submissions sent).

### 4. Admin login

1. Set `ADMIN_EMAIL` to the email you'll log in with.
2. Generate a password hash:
   ```bash
   npm run hash-password -- "your-chosen-password"
   ```
3. Put the printed hash in `ADMIN_PASSWORD_HASH`.
4. Set `JWT_SECRET` to a long random string, e.g. `openssl rand -hex 32`.

### 5. CORS

Set `ALLOWED_ORIGINS` to a comma-separated list of frontend origins allowed to call this API, e.g.:
```
ALLOWED_ORIGINS=https://neerajnegi11.github.io,http://localhost:8080
```

## Deploying

1. Push this repo to GitHub (the `backend/` folder can live alongside the frontend).
2. In Netlify, "Add new site → Import an existing project", point it at this repo, and set:
   - **Base directory**: `backend`
   - **Build command**: `npm run prisma:generate`
   - **Publish directory**: `public` (relative to the base directory, not the repo root)
3. Add all the variables from `.env.example` under Site settings → Environment variables.
4. Deploy. Note the resulting site URL, e.g. `https://rigorworks-backend.netlify.app`.

## Connect the frontend

Update [`assets/js/config.js`](../assets/js/config.js) in the site root with the deployed URL:

```js
window.RIGORWORKS_API_BASE = "https://rigorworks-backend.netlify.app/.netlify/functions";
```

Then visit `/admin/login.html` on the frontend to log in and view submissions.
