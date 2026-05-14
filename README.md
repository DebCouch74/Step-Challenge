# Team Step Challenge 2026

A web app for running a 4-week team step challenge with a live leaderboard, daily step logging, and an admin dashboard.

**Challenge dates:** May 20, 2026 – June 20, 2026  
**Prizes:** 🥇 $150 · 🥈 $100 · 🥉 $50 Visa Gift Cards

---

## Setup Guide

### Step 1 — Create a Supabase project (free)

1. Go to [supabase.com](https://supabase.com) and sign up / log in
2. Click **New Project**, give it a name (e.g. `step-challenge`), set a database password
3. Wait ~2 minutes for the project to provision
4. Go to **Database → SQL Editor**, paste the entire contents of `supabase-schema.sql`, and click **Run**
5. Go to **Settings → API** and copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key

### Step 2 — Configure environment variables

1. Copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
2. Fill in your values:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_ADMIN_SECRET=pick-any-secret-word
   ```
   > **ADMIN_SECRET** is a code you give yourself (and any other admins) to register as admin.  
   > Keep it private — anyone with this code gets admin access.

### Step 3 — Run locally (optional test)

```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

### Step 4 — Deploy to Netlify

**Option A — Netlify CLI (quickest)**
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```
When prompted, set build command to `npm run build` and publish directory to `dist`.

**Option B — GitHub + Netlify UI**
1. Push this folder to a GitHub repository
2. Go to [netlify.com](https://netlify.com), click **Add new site → Import from Git**
3. Connect your GitHub repo
4. Set:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click **Deploy site**

**Add environment variables in Netlify:**  
Go to **Site settings → Environment variables** and add all three variables from your `.env` file.

---

## First-time admin setup

1. Go to your deployed app (or localhost)
2. Click **Join Challenge**
3. At the bottom of the register form click **"Admin? Enter secret code"**
4. Enter the `VITE_ADMIN_SECRET` you chose
5. Register — you now have admin access
6. The **Admin** link will appear in the nav bar

---

## How participants join

1. Share the Netlify URL with your team
2. Each person clicks **Join Challenge** and registers with their name and email
3. Starting May 20, they log daily steps from the Dashboard
4. The leaderboard updates in real time

---

## Features

| Feature | Details |
|---|---|
| Registration & login | Supabase email/password auth |
| Daily step logging | Enter steps for any date in the challenge window |
| Edit / delete entries | Participants can correct their own entries |
| Live leaderboard | Ranked by total cumulative steps |
| Top 3 prizes | Highlighted with 🥇🥈🥉 and prize amounts |
| Admin dashboard | Overview, participants list, all entries |
| Suspicious entry flag | Entries over 50,000 steps flagged with ⚠️ |
| CSV export | Export results and all entries to CSV |

---

## Tech Stack

- **React + Vite** — frontend
- **Tailwind CSS** — styling
- **Supabase** — auth + PostgreSQL database
- **Netlify** — hosting
