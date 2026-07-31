# 修行 SHUGYO — DBMS/SQL Mastery Tracker

SHUGYO is a database-backed, single-user SQL and DBMS mastery tracker. It allows you to track your learning progress, practice SQL queries in an in-browser sandbox, take theory quizzes, and dynamically unlock achievements as you complete your goals.

## Technology Stack
- **Frontend:** React + Vite + React Router (SPA)
- **Styling:** Vanilla CSS (cyberpunk dark-theme and glassmorphic panels)
- **Backend/DB/Auth:** Supabase (Postgres + Supabase Auth)
- **Local Sandbox:** Alasql SQL database engine (via CDN)
- **Hosting Target:** Netlify

---

## Getting Started

### 1. Set Up Your Supabase Project
1. Go to [Supabase](https://supabase.com) and create a new project.
2. Under **Project Settings** → **API**, copy your **Project URL** and **API Anon Key**.
3. Under **Auth** → **Providers** → **Email**, ensure **Confirm email** is **enabled** (requires users to verify email before log in).
4. Go to the **SQL Editor** in your Supabase dashboard:
   - Copy the entire contents of [supabase/schema.sql](file:///d:/Shugyo/supabase/schema.sql).
   - Paste it into the editor and click **Run**.
   - This sets up the `profiles`, `progress`, `checklist_items`, `test_attempts`, and `streaks` tables, triggers, and Row Level Security (RLS) policies.

### 2. Configure Local Environment
1. In the project root, create a file named `.env.local`. Note: This file is already added to `.gitignore` to prevent leaking keys.
2. Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
   ```

### 3. Run Locally
To start the development server:
```bash
npm install
npm run dev
```
Open your browser to the local address provided (typically `http://localhost:5173`).

---

## Deployment to Netlify

SHUGYO includes a [netlify.toml](file:///d:/Shugyo/netlify.toml) configured with a SPA redirect rule (`/* → /index.html, status 200`) so that React Router paths are resolved correctly on refresh.

### Deployment Steps:
1. Push your project code to GitHub/GitLab. (Remember that `.env.local` will NOT be committed).
2. Log into Netlify, select **Add new site** → **Import an existing project**.
3. Choose your repository.
4. Set the following build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Go to **Site Configuration** → **Environment variables** in Netlify and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy site**.
