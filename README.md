# SBI PO System

Your personal SBI PO preparation website. Full vision is in `SPEC.md`.

## Run it on your computer (optional)

```bash
npm install
cp .env.example .env.local     # then fill in the two Supabase values (step 1 below)
npm run dev                    # open http://localhost:3000
```

Without the Supabase values it still works in "local mode" (data stays in that browser only).

## Deploy: step by step

### 1. Create the free database (Supabase), about 5 minutes
1. Go to supabase.com, sign up, click **New project** (any name, pick a region near you, set a database password).
2. Open **SQL Editor, New query**, paste everything from `supabase/schema.sql`, click **Run**.
3. Open **Project Settings, API**. Copy the **Project URL** and the **anon public key**.
4. Open **Authentication, Providers** and make sure **Email** is enabled. For the easiest first login, go to **Authentication, Sign In / Providers, Email** and turn off "Confirm email".

### 2. Put the code on GitHub
Create a new empty repository on github.com, then upload this folder (or `git init`, `git add .`, `git commit`, `git remote add origin ...`, `git push`).

### 3. Deploy on Vercel
1. Go to vercel.com, **Add New, Project**, import your GitHub repo. Framework is detected as Next.js.
2. Before clicking Deploy, open **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon public key
3. Click **Deploy**. When it finishes, open the link and create your account (email + password). Your data now syncs between phone and laptop.

Tip: on your phone, use "Add to Home Screen" so it opens like an app.

## Things to check yourself
- **Exam pattern** lives in `src/data/exam.ts`. Sources disagreed on the Mains descriptive paper (30 vs 50 marks), so confirm it against the official SBI notification when the 2027 advertisement is out.
- **Home page** dreams and photos are placeholders. Edit them directly on the Home page.
- Settings has **Export / Import backup**. Use it once a month.
