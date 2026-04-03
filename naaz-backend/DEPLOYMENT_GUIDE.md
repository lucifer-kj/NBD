# Step-By-Step: Deploying Naaz Book Depot

This guide ensures your Backend (Render) and Frontend (Vercel) connect perfectly.

---

## 🏗️ Step 1: Prepare the Repository
Since we cleaned up junk files, we need to ensure Git knows they are gone. Run these in your terminal:
```bash
git add .
git commit -m "Cleanup junk files and harden gitignore"
git push origin master
```

---

## 🚀 Step 2: Deploy Backend to Render
1.  **Open Render Dashboard**: Go to [dashboard.render.com](https://dashboard.render.com).
2.  **Create Blueprint**: Click **"New"** -> **"Blueprint"**.
3.  **Connect Repo**: Select your `NBD` repository.
4.  **Confirm**: Render will read your `render.yaml`. Click **"Apply"**.
5.  **Wait**: It will create a database, a Redis instance, and your API.
6.  **Copy URL**: Once the `naaz-backend` service is green, copy its "Base URL" (e.g., `https://naaz-backend.onrender.com`).

---

## 🎨 Step 3: Deploy Frontend to Vercel
1.  **Open Vercel Dashboard**: Go to [vercel.com](https://vercel.com).
2.  **Import Project**: Select the `naaz-frontend` folder from your repo.
3.  **Environment Variables**: In the "Environment Variables" section, add:
    -   `NEXT_PUBLIC_API_URL`: **[Paste your Render URL here]**
    -   `NEXT_PUBLIC_APP_URL`: your Vercel site URL (e.g. `https://nbd-tan.vercel.app`) — used for payment redirects if you reference it in the app.
    -   `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: from [Google Cloud Console](https://console.cloud.google.com/) OAuth 2.0 Client (Web); must match `GOOGLE_OAUTH_CLIENT_ID` on the backend.
4.  **Deploy**: Click "Deploy".

---

## 🔗 Step 4: Final Connection (CORS)
To make sure Vercel (`https://nbd-tan.vercel.app/`) can talk to Render:
1.  In the **Render Dashboard**, go to your **naaz-backend** service.
2.  Go to **Settings** -> **Environment Variables**.
3.  Check `CORS_ALLOWED_ORIGINS`. It should already be set to `https://nbd-tan.vercel.app` (added by the Blueprint).
4.  If not, add it or update it.

---

## 💳 Instamojo & Google (production)

On **Render** → `naaz-backend` → **Environment**, set at least:

| Variable | Purpose |
|----------|---------|
| `INSTAMOJO_SALT` | Private salt from Instamojo (required for webhook MAC verification). |
| `INSTAMOJO_API_KEY` / `INSTAMOJO_AUTH_TOKEN` | Or `CONSUMER_KEY` / `CONSUMER_SECRET` (same values). |
| `INSTAMOJO_ENV` | `sandbox` or `production` |
| `GOOGLE_OAUTH_CLIENT_ID` | Same Web client ID as `NEXT_PUBLIC_GOOGLE_CLIENT_ID` on Vercel. |

Webhook URL is `https://<your-render-host>/api/payments/webhook/` — Instamojo must reach it over HTTPS (use your public API URL, not localhost).

---

## 🐘 Database Migration (First Time)
Once Render is live, you must run the initial migrations to set up the database:
1.  In **Render**, go to your `naaz-backend` service.
2.  Click **"Shell"** on the left menu.
3.  Run:
    ```bash
    python manage.py migrate
    python manage.py createsuperuser
    ```

---
**Done!** Your backend and frontend are now fully connected and secure.
