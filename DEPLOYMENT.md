# 🚀 Production Deployment Guide

Your RepurposeAI app is ready for deployment!
We have configured the project to work seamlessly with **Vercel**, which is the best platform for Next.js applications (handling both the Frontend and the Backend API routes automatically).

## ✅ Step-by-Step Deployment to Vercel

### 1. Push to GitHub
1.  Initialize git if you haven't:
    ```bash
    git init
    git add .
    git commit -m "Ready for deploy"
    ```
2.  Create a new repository on GitHub.
3.  Push your code to the new repository.

### 2. Import to Vercel
1.  Go to [Vercel.com](https://vercel.com) and log in.
2.  Click **"Add New..."** -> **"Project"**.
3.  Select your `repurpose-ai` (or `SaaS`) repository.

### 3. Project Configuration (Crucial)
*   **Framework Preset:** Vercel should auto-detect `Next.js`.
*   **Root Directory:**
    *   **IF** you uploaded the entire `SaaS` folder: Click "Edit" and select `repurpose-ai` as the root.
    *   **IF** you uploaded just the `repurpose-ai` folder: Leave it as `./` (default).
    *   *Note: We included a `vercel.json` file to help Vercel auto-configure this, but double-checking manually is best.*

### 4. Application Keys (Environment Variables)
In the Vercel deployment screen, expand **"Environment Variables"** and copy these values from your local `.env.local` file:

| Name | Value (Example/Instruction) |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key-string` |
| `GEMINI_API_KEY` | `your-google-gemini-api-key` |
| `NEXT_PUBLIC_APP_URL` | Set this to your Vercel URL (e.g., `https://your-app.vercel.app`) once it's tailored, or `http://localhost:3000` for now. |

### 5. Deploy
1.  Click **"Deploy"**.
2.  Wait ~1 minute for the build to complete.
3.  **Success!** Your app is live.

---

## 🛠 Features Status
*   **Beta Mode Active:** The "Pro" plan is currently marked as "Coming Soon" / "Free during Beta" in the UI.
*   **Payments:** Stripe integration is present in the code but requires active API keys to function. Without keys, the payment flow will harmlessly fail or remaining hidden (as we've disabled the buttons).

## 🚀 Future Roadmap
*   **Enable Payments:** When ready, add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to Vercel env vars and re-enable the "Upgrade" buttons.
*   **User Analytics:** Connect Vercel Analytics for page views.
