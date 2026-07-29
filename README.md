# நற்பணி இயக்கம் — Backend

A small Node.js + Express backend for the website. It does two things:

1. Serves the website itself (the `public/` folder — your `index.html`)
2. Provides an API that the "Get Joined" volunteer form submits to, and
   saves every submission into a local SQLite database file

No external database service needed — everything is stored in
`data/volunteers.db`, a file that's created automatically the first time
the server runs.

## 1. Install

You'll need [Node.js](https://nodejs.org) (version 18 or newer) installed.

```bash
cd backend
npm install
```

## 2. Configure

```bash
cp .env.example .env
```

Open `.env` and set:

- `ADMIN_KEY` — any random string you choose. This protects the page
  where you view volunteer submissions, so don't skip it.
- `EMAIL_USER` / `EMAIL_PASS` *(optional)* — if you want an email sent to
  you every time someone submits the form. Use a Gmail address and an
  **App Password** (not your normal Gmail password) — generate one at
  https://myaccount.google.com/apppasswords. Leave both blank to skip
  email notifications entirely (submissions are still saved either way).
- `NOTIFY_EMAIL` — where those notification emails should go. Defaults
  to `nammadoctoremmanuelnarpanieyakaam@gmail.com`.

## 3. Run it

```bash
npm start
```

Visit `http://localhost:3000` — that's your live website, form and all.

## 4. View volunteer submissions

Once the server is running, you (or a tool like a browser extension,
Postman, or `curl`) can fetch the list of everyone who's signed up:

```bash
curl -H "x-api-key: YOUR_ADMIN_KEY" http://localhost:3000/api/volunteers
```

This returns every submission as JSON (name, phone, email, program
interest, message, and the time they submitted). This route is locked
behind your `ADMIN_KEY`, so nobody else can see volunteers' contact
details.

If you'd like a proper visual admin page (a simple table in the browser
instead of raw JSON) instead of this API-only view, just ask and I'll
add one.

## 5. Putting it online

This is a normal Node.js app, so it can be hosted almost anywhere. A
few straightforward, low-cost/free options:

- **Render.com** — connect this folder as a repo, set the environment
  variables from your `.env` in their dashboard, and it deploys
  automatically. Good free tier for a small site like this.
- **Railway.app** — similar to Render, also has a simple free tier.
- **A basic VPS** (e.g. DigitalOcean, Hostinger VPS) — install Node,
  copy this folder up, run `npm install && npm start` (ideally under a
  process manager like `pm2` so it stays running).

One thing to know: `data/volunteers.db` lives on whatever server this
runs on. On some free hosts, the filesystem resets on redeploy — if you
outgrow that, moving to a hosted database (like Postgres on Render) is
a natural next step and I can help with that migration whenever you're
ready.

## Project structure

```
backend/
  server.js        → the Express app and all API routes
  db.js             → SQLite setup (creates data/volunteers.db)
  public/
    index.html      → your website (served at "/")
  data/
    volunteers.db    → created automatically — all form submissions live here
  .env               → your local settings (never commit this)
  .env.example       → template showing what settings exist
```
