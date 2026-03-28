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
4.  **Deploy**: Click "Deploy".

---

## 🔗 Step 4: Final Connection (CORS)
To make sure Vercel (`https://nbd-tan.vercel.app/`) can talk to Render:
1.  In the **Render Dashboard**, go to your **naaz-backend** service.
2.  Go to **Settings** -> **Environment Variables**.
3.  Check `CORS_ALLOWED_ORIGINS`. It should already be set to `https://nbd-tan.vercel.app` (added by the Blueprint).
4.  If not, add it or update it.

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
