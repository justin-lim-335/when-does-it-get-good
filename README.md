## 🎬 WhenDoesItGetGood

**WhenDoesItGetGood** is a full-stack web app that helps users decide *when* a TV show or anime “gets good.”
It aggregates community votes by episode to visualize where a show starts to become worth watching.

Built with **React**, **Express**, **Supabase**, and **TMDB API**, the app allows users to vote on the episode that made them love the show, view total vote counts, and see visual summaries of trends.

---

## 🌐 Live Demo

👉 [https://www.whendoesitgetgood.net](https://www.whendoesitgetgood.net)

---

## 🧠 Overview

Many shows start slow — and people often ask, *“When does it get good?”*
This project aims to answer that question with data, by letting users:

* Search a show from TMDB
* Vote on the episode where it “gets good”
* View aggregated results and total votes
* Reset their passwords securely (via Supabase Auth)

---

## 🏗️ Architecture

**Frontend:** React (Vite + TypeScript)
**Backend:** Express.js (Node)
**Database + Auth:** Supabase
**Hosting:** Vercel / Render / Supabase Hosting (depending on environment)
**Data Source:** TMDB API for show metadata

---

## ⚙️ Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/whendoesitgetgood.git
cd whendoesitgetgood
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

Include the following variables (replace with your actual keys):

```env
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
TMDB_API_KEY=your_tmdb_api_key
API_BASE=https://your-backend-url.com
```

### 4. Run the development servers

Frontend (React + Vite):

```bash
npm run dev
```

Backend (Express):

```bash
npm run server
```

The app should now be running locally.
Frontend typically runs on `http://localhost:5173`, backend on `http://localhost:3001`.

---

## 🗂️ Project Structure

```
.
└── 📁server
    Express backend server that handles authentication, votes, user data, and API communication.
    └── 📁routes
        Contains all API route handlers for various app functionalities.
        ├── auth.ts              # Handles Supabase auth logic.
        ├── check-username.ts    # Verifies if a username is taken
        ├── delete-user.ts       # Deletes a user’s account
        ├── delete-vote.ts       # Removes an existing vote 
        ├── get-average.ts       # Calculates the “gets good” episode 
        ├── get-vote.ts          # Retrieves user’s vote for a given show.
        ├── search.ts            # Queries TMDB API for shows
        ├── signup-user.ts       # Registers a new user
        ├── submit-vote.ts       # Submits a new vote for a show/episode 
        ├── total-votes.ts       # Fetches a show's total votes
        ├── update-user.ts       # Updates a user’s display name 
        ├── update-vote.ts       # Modifies an existing vote in Supabase.
        ├── users.ts             # Retrieves general user data 
    ├── index.ts                 # Entry point for the Express server.
    ├── supabase.ts              # Configures the Supabase client
    ├── tsconfig.json            # TypeScript configuration
└── 📁src
    React frontend application built with Vite and TypeScript.
    └── 📁assets
        Stores image and static assets.
        ├── logo.png             # App logo.
    └── 📁components
        Reusable UI components shared across pages.
        ├── Carousel.tsx         # Displays shows in a carousel
        ├── Footer.tsx           # Footer component 
        ├── Header.tsx           # Top navigation bar and logo header
        ├── ScrollToTop.tsx      # Automatically scrolls to top
    └── 📁context
        Context providers for global state management.
        ├── AuthContext.tsx      # Provides authentication context
    └── 📁lib
        Helper libraries and Supabase clients.
        ├── supabaseAdmin.ts     # Admin-level Supabase client 
        ├── supabaseClient.ts    # Public Supabase client 
    └── 📁pages
        Page-level React components that map to routes.
        ├── About.tsx            # About page
        ├── Account.tsx          # User account page for managing profile
        ├── APIDocs.tsx          # Public documentation for API endpoints
        ├── HomePage.tsx         # Main landing page
        ├── Login.tsx            # Login form for user authentication
        ├── NoPageFound.tsx      # 404 fallback page for invalid routes
        ├── PrivacyPolicy.tsx    # Legal privacy policy page
        ├── ResetPassword.tsx    # Password reset page 
        ├── ShowPage.tsx         # Individual show page 
        ├── SignUp.tsx           # New user registration form
        ├── TermsOfUse.tsx       # Legal terms and conditions page
        ├── VotingHistory.tsx    # Displays a user’s previous votes
        ├── Waiting.tsx          # Loading/waiting screen for sign up
    ├── App.css                  # Global styling for the app.
    ├── App.tsx                  # Root React component
    ├── index.css                # TailwindCSS imports and base styling
    ├── main.tsx                 # App entry point
    ├── testApi.js               # Local script used to test backend 
    ├── vite-env.d.ts            # TypeScript definitions for Vite
```

---

## 🗳️ API Routes

| Route                  | Method | Description                                            |
| ---------------------- | ------ | ------------------------------------------------------ |
| `/vote`                | `POST` | Records a user’s vote for a show and episode           |
| `/votes/:show_tmdb_id` | `GET`  | Fetches all votes for a show                           |
| `/count/:show_tmdb_id` | `GET`  | Returns the total number of votes for that show        |
| `/auth/reset-password` | `POST` | Sends a Supabase password reset email                  |
| `/reset-password`      | `GET`  | Handles the reset password link and token verification |

---

## 🔐 Password Reset Flow

1. User requests a password reset via Supabase.
2. Supabase sends a recovery email with a link like:

   ```
   https://www.whendoesitgetgood.net/reset-password?token_hash=...&type=recovery
   ```
3. The frontend reads the token from the URL.
4. User enters a new password.
5. The app calls the Supabase API to complete the reset.

---

## 💡 Features

✅ Search shows via TMDB
✅ Cast votes per episode
✅ Display total votes with real-time updates
✅ Responsive UI with TailwindCSS
✅ Secure user authentication with Supabase
✅ Password recovery and login flow
✅ Express + Supabase backend API integration

---

## 📈 Example Output

When visiting a show page:

* A progress chart displays episode votes.
* A blue bubble below the title shows total votes (e.g., *“134 total votes”*).
* The data updates live as users cast votes.

---

## 🚀 Deployment

### Frontend:

Deploy on **Vercel**.
Make sure to set your environment variables in the platform settings.

### Backend:

Deploy on **Render**, **Railway**, or **Supabase Edge Functions**.

Set up **CORS** to allow access from:

```
https://www.whendoesitgetgood.net
http://localhost:5173
```

---

## 🧾 License

MIT License — feel free to fork, modify, and build upon it.

---

## 🙌 Acknowledgements

* [Supabase](https://supabase.com) for authentication and database hosting
* [TMDB](https://www.themoviedb.org/) for TV data and episode info
* [Vercel](https://vercel.com) for frontend deployment
* [Express](https://expressjs.com) for backend API
* Everyone who votes to help answer the eternal question: *When does it get good?*

