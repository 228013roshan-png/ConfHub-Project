# ConfHub — Academic Conference & Peer-Review Management System
## Comprehensive System Architecture, Data Flow, and Project Defense Guide

---

## 1. General Idea & Executive Summary

### What is ConfHub?
**ConfHub** is an end-to-end, full-stack Academic Conference, Peer-Review, and Delegate Pass Management platform. It serves the entire lifecycle of scholarly and institutional conferences — from Call for Papers (CFP), automated AI-assisted manuscript classification, peer-reviewer assignment, and rubric-based evaluations, to interactive schedule building, authenticated delegate pass checkout (eSewa / Khalti / Fonepay integration simulations), and community discussion feeds.

### The Core Problem It Solves
1. **Fragmented Academic Workflows**: Traditional conferences manage manuscript submissions via email or disparate portals, ticket registrations on external event tools, and schedules in static PDFs.
2. **Reviewer Bottlenecks & Domain Mismatch**: Assigning manuscripts to matching subject-matter experts manually takes days and often leads to reviewer fatigue or mismatched evaluations.
3. **Unauthorized Ticket Purchasing & Lack of Delegate Verification**: Publicly exposed ticket links allow unregistered users to initiate checkout without verified accounts, complicating attendance tracking, student concessions, and on-site credential validation.

### ConfHub Solution Highlights
- **Role-Based Access Control (RBAC) & Token Authentication**: Distinct, secure experiences for **Student Delegates**, **Authors/Researchers**, **Peer Reviewers**, and **Conference Administrators/Chairs**. Every authenticated user receives a persistent session token (`cfh_tok_...`).
- **Gated Ticket Purchasing Workflow**: Only authenticated users with valid account tokens can access the ticket registration interface or initiate pass purchases. Anonymous or unauthorized requests are rejected both client-side and server-side (`401 Unauthorized`).
- **AI-Assisted Manuscript Intelligence**: Automated classification of abstract keywords, research domains, novelty scoring, and reviewer matching suggestions powered by the Gemini API (`@google/genai`).
- **Interactive Schedule Builder**: Visual timeline manager mapping accepted papers and keynote slots to multi-track halls and session times.
- **Digital Passes & Revenue Analytics**: Complete financial ledger recording delegate orders, pass generation, verifiable digital tickets, and financial CSV export.
- **Author-Reviewer Discussion Channel**: Asynchronous Q&A and clarification forum between authors and evaluating reviewers.

---

## 2. End-to-End Architecture & Tech Stack

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|  React 19 + TypeScript + Tailwind CSS + Lucide Icons + Motion Layout Animations  |
|                                                                                   |
|  [Landing & Public Info]   [Author Portal]   [Reviewer Portal]   [Admin Dashboard]|
|  [Authenticated Passes]    [Schedule View]   [Login / Signup]    [Checkout Modal] |
+-----------------------------------------------------------------------------------+
                                         |
                       (REST API / JSON + Bearer Token)
                                         v
+-----------------------------------------------------------------------------------+
|                                 SERVER TIER                                       |
|                  Node.js + Express 4.x + TypeScript (TSX/ESBuild)                 |
|                                                                                   |
|  [Controllers & Routes]      [Authentication & RBAC]      [Gemini AI Service]     |
|   /api/conferences            Token Validation (Bearer)    Domain Tagging,        |
|   /api/papers                 Role Authorization           Novelty Scoring        |
|   /api/reviews                Error Handling Middleware    Schedule Optimization  |
|   /api/tickets (Gated)        Token Issuance & Check                              |
+-----------------------------------------------------------------------------------+
                                         |
                                (Persistent File I/O)
                                         v
+-----------------------------------------------------------------------------------+
|                                PERSISTENCE TIER                                   |
|                        Local JSON Data Stores in /database                        |
|  - conference_hall.json   - abstract_paper.json   - user.json (w/ tokens)         |
|  - transaction.json       - reviewer.json         - review.json  - post.json      |
+-----------------------------------------------------------------------------------+
```

---

## 3. High-Level Data Flow Diagrams

### Flow A: User Authentication & Token Issuance
```
[User on Frontend]
      │
      ├─► Enters credentials on /login or registers on /signup
      │
      ▼ (POST /api/users/login or /api/users/register)
[Express authController]
      │
      ├─► Reads database/user.json
      ├─► Validates credentials
      ├─► Assigns / verifies unique persistent token (`cfh_tok_...`)
      ├─► Updates `lastLogin` timestamp & saves to user.json
      │
      ▼ (Returns { success: true, token, user: { role, email, name, institution, token } })
[React App.tsx State]
      │
      ├─► Stores user and token in `confhub_user_session` (localStorage & React state)
      ├─► Displays token badge in top navigation bar
      └─► Dynamically renders specific portal or authenticated landing experience:
            • "admin"    ──► <AdminPortal />
            • "reviewer" ──► <ReviewerPortal />
            • "author"   ──► <AuthorPortal />
            • "student"  ──► <LandingPage /> with authenticated Ticket & Schedule access
```

---

### Flow B: Manuscript Submission & AI-Powered Classification
```
[Author] 
   │
   ├─► Fills Submission Form: Title, Abstract, Conference ID, PDF Metadata
   │
   ▼ (POST /api/papers)
[Express paperController]
   │
   ├─► Passes Abstract text to `aiService.ts` / `gemini.ts`
   │      │
   │      └─► Gemini Model analyzes text and extracts Domain Tags
   │          (e.g., ["Machine Learning", "NLP", "Robotics"])
   │
   ├─► Generates unique Paper ID (e.g. `pap-178819...`)
   ├─► Sets initial status: `"Under Review"` or `"Pending"`
   ├─► Appends new record to `database/abstract_paper.json`
   │
   ▼ (Returns 201 Created with enriched Paper object)
[Author Portal UI]
   │
   ├─► Displays real-time status card
   ├─► Enables downloadable Submission Receipt & Certificate
   └─► Unlocks Community Discussion Forum for the paper
```

---

### Flow C: Peer Review & Double-Blind Rubric Scoring
```
[Admin Portal]
   │
   ├─► Reviews manuscript domain tags & assigns Reviewer (`assignedReviewerId`)
   └─► Writes assignment update to `database/abstract_paper.json`
          │
          ▼
[Reviewer Portal]
   │
   ├─► Fetches assigned papers (`GET /api/papers?reviewerId=rev-01`)
   ├─► Reviewer views Abstract, Keywords, and Submission Details
   ├─► Enters Evaluation Matrix (Originality, Technical Rigor, Clarity, Impact)
   ├─► Writes Qualitative Recommendation (`Accept`, `Minor Revision`, `Reject`)
   │
   ▼ (POST /api/reviews)
[Express reviewController]
   │
   ├─► Saves evaluation to `database/review.json`
   ├─► Automatically updates Paper status in `database/abstract_paper.json`
   │
   ▼
[Author & Admin Portals]
   │
   └─► Instantly reflects updated evaluation status & aggregate score
```

---

### Flow D: Authenticated Delegate Registration, Checkout & Digital Pass
```
[Attendee / Student / Author]
   │
   ├─► Must be logged in with a valid account and session token.
   │   (Unauthenticated users attempting to view passes are shown an "Authentication Required" guard
   │    or redirected to /login; direct API calls without token fail with 401 Unauthorized)
   │
   ├─► Selects Conference & Pass Tier (Standard, Student, VIP Academic)
   ├─► Clicks "Get Pass / Register" ──► Opens <CheckoutModal />
   ├─► Chooses Payment Method: eSewa, Khalti, Fonepay, or Bank Card
   │
   ▼ (POST /api/tickets/purchase with Header `Authorization: Bearer <token>` & `x-auth-token`)
[Express ticketController]
   │
   ├─► Verifies presence of Bearer token / `x-auth-token`
   ├─► Validates token against registered users in `database/user.json`
   │      │
   │      ├─► If missing / invalid: Responds with 401 Unauthorized & rejects purchase
   │      └─► If valid: Resolves authenticated delegate identity
   │
   ├─► Validates ticket quota in `database/conference_hall.json`
   ├─► Increments registered attendee count (`registeredAttendees++`)
   ├─► Generates Order & Pass ID (`ORD-...` / `TKT-...`)
   ├─► Appends transaction record to `database/transaction.json`
   ├─► Links ticket order to the authenticated user in `database/user.json`
   │
   ▼ (Returns 200 OK with Confirmed Order object)
[Frontend Client]
   │
   ├─► Generates high-fidelity visual Pass with Barcode / QR
   ├─► Offers immediate PDF / Text Receipt and Certificate download
   └─► Updates Admin Financial Ledger in real time
```

---

## 4. Complete Project File Directory & File-by-File Breakdown

### Root Configuration Files
- **`package.json`**: Project manifest declaring dependencies (React 19, Express 4, `@google/genai`, Lucide icons, Tailwind CSS, TSX, ESBuild) and lifecycle scripts (`dev`, `build`, `start`, `lint`).
- **`server.ts`**: The main Express backend server entry point. Configures API routes, middleware, and wraps Vite dev server in non-production environments.
- **`vite.config.ts`**: Vite configuration with React and Tailwind plugins, directory path aliases (`@`), and watch filters to prevent client reloads when JSON database files are updated.
- **`tsconfig.json`**: TypeScript compiler configuration enforcing strict typing, modern ESNext modules, and JSX support.
- **`metadata.json`**: Platform metadata defining app name, description, capabilities, and iframe permissions.
- **`.env.example`**: Documents required environment variables (such as `GEMINI_API_KEY`).
- **`help.md`**: Project defense documentation, architecture references, and verification guides.

---

### Frontend Client Files (`/src`)

#### Main Entry Points
- **`src/main.tsx`**: Application root entry point. Mounts `<App />` to the DOM within `React.StrictMode`.
- **`src/index.css`**: Global stylesheet importing Tailwind CSS utility directives.
- **`src/types.ts`**: Global TypeScript definitions, including `Conference`, `Paper`, `Reviewer`, `Review`, `Order`, `ScheduleItem`, `AuthorPost`, `User`, and `UserSession` with `token?: string`.

#### Top-Level View Manager
- **`src/App.tsx`**: The core state orchestrator and router.
  - Manages global state: active logged-in user with token, conferences list, submitted papers, reviewer rosters, active orders, and notifications.
  - Controls modal windows (Login, Signup, Ticket Purchase Checkout).
  - Handles synchronization with Express backend REST endpoints (`/api/conferences`, `/api/papers`, `/api/reviews`, `/api/tickets`, etc.).
  - Attaches `Authorization: Bearer <token>` and `x-auth-token` headers to ticket checkout requests and enforces login redirects on 401 Unauthorized.
  - Displays user session info and token badge in the top navigation bar.

#### Presentation & Portal Components (`/src/components`)
- **`src/components/LandingPage.tsx`**:
  - Public-facing homepage showcasing conferences, keynotes, dates, and venue details.
  - Interactive conference search and category filters (AI, Physics, Biotechnology, etc.).
  - **Dynamic Program Schedule & Timetables**:
    - Multi-conference switcher (All Conferences or specific symposium).
    - Multi-filter engine (real-time keyword search, session type pills, and hall/room selector).
    - Personal Agenda / Bookmarking with local state persistence (`My Saved Agenda`).
    - Multi-mode views (Chronological Timeline View & Grouped by Hall/Track View).
    - Calendar integration: one-click standard `.ics` download & direct Google Calendar event generation.
  - **Authenticated Ticket System**:
    - Clean landing page with unauthenticated student pass quick buttons removed from hero and nav.
    - Protected Tickets tab: unauthenticated visitors are presented with an "Authentication Required" card with prompt to log in or sign up.
    - Direct pass checkout gated exclusively to logged-in users with valid account tokens.
    - Renders user token badge for logged-in delegates.
- **`src/components/AdminPortal.tsx`**:
  - Comprehensive conference administrative dashboard.
  - Allows chairs to create/edit conferences, set ticket prices, manage venue halls, and assign reviewers to incoming manuscripts.
  - Real-time revenue analytics, financial CSV export, and delegate attendee rosters.
- **`src/components/ReviewerPortal.tsx`**:
  - Double-blind peer-review workspace.
  - Review queue for assigned papers, multi-criteria scoring rubrics, qualitative feedback forms, and access to all submitted manuscripts repository.
  - Community discussion forum with authors.
- **`src/components/AuthorPortal.tsx`**:
  - Dedicated author research hub.
  - Paper submission form with abstract uploads and automated status tracking.
  - Digital presentation certificate generator, submission invoice generator, and reviewer correspondence thread.
- **`src/components/ScheduleBuilder.tsx`**:
  - Visual timeline planner for conference chairs.
  - Organizes accepted papers and keynote speeches into chronological tracks, halls, and time blocks.
- **`src/components/CheckoutModal.tsx`**:
  - Modal checkout flow supporting regional digital wallets (eSewa, Khalti, Fonepay) and card gateways.
  - Validates phone numbers/credentials, calculates subtotal, and issues immediate digital passes for authenticated delegates.
- **`src/components/LoginPage.tsx`**:
  - Authentication portal supporting role-based logins (`admin`, `reviewer`, `author`, `student`).
  - Pre-authorized Admin credentials support and dynamic user token retrieval.
- **`src/components/SignupPage.tsx`**:
  - New user registration form capturing institutional affiliation, research field, and role preference.
  - Automatically issues persistent session tokens upon account creation and signs in the user.

---

### Backend Server Files (`/server`)

#### Core Server Infrastructure & Types
- **`server/types/index.ts`**: TypeScript definitions for server data structures, including `StoredUser` with `token?: string`.
- **`server/db.ts`**: Legacy/base database wrapper providing safe JSON file read/write operations.
- **`server/gemini.ts`**: Lazy-initialized client for the Gemini SDK (`@google/genai`), ensuring secure server-side execution of AI classification and novelty evaluation.

#### Services (`/server/services`)
- **`server/services/dbService.ts`**:
  - Centralized Data Access Layer (DAL).
  - Encapsulates safe file operations, concurrency guards, and default seed data for conferences, reviewers, users, and orders.
  - Automatically assigns persistent tokens (`cfh_tok_...`) to all existing and incoming users in `database/user.json`.
- **`server/services/aiService.ts`**:
  - Interfaces with the Gemini API to analyze academic abstracts.
  - Extracts subject matter domain tags, calculates novelty scores (1-100), and generates executive summaries.

#### Controllers (`/server/controllers`)
- **`server/controllers/authController.ts`**:
  - Handles `/api/users/login` and `/api/users/register`.
  - Generates and persists unique session tokens (`cfh_tok_...`) in `database/user.json`.
  - Returns `{ user, token, message }` for authenticated sessions.
- **`server/controllers/ticketController.ts`**:
  - Manages pass purchasing, payment verification, order generation, and attendee lists.
  - **Strict Security Gate**: Validates token in `Authorization: Bearer <token>` or `x-auth-token` header against `database/user.json`. Rejects unauthenticated requests with `401 Unauthorized`.
  - Associates issued passes with the authenticated user record in `database/user.json` and records transactions in `database/transaction.json`.
- **`server/controllers/conferenceController.ts`**: Handles CRUD operations for conference events in `conference_hall.json`.
- **`server/controllers/paperController.ts`**: Manages manuscript submissions, triggers AI tagging, updates paper review status, and handles reviewer assignments.
- **`server/controllers/reviewController.ts`**: Handles peer-review rubric submissions and calculates aggregate decision scores.
- **`server/controllers/reviewerController.ts`**: Manages reviewer registrations, expertise tags, and workload allocation.
- **`server/controllers/postController.ts`**: Manages author-reviewer discussion board threads and replies.
- **`server/controllers/scheduleController.ts`**: Handles timeline creation, session ordering, and hall schedule persistence.
- **`server/controllers/dbController.ts`**: Administrative utility providing diagnostic database export and reset endpoints.

#### Routes (`/server/routes`)
- **`server/routes/index.ts`**: Aggregates all modular sub-routers into the primary `/api` router.
- **`server/routes/conferences.ts`**: Express routes for `/api/conferences`.
- **`server/routes/papers.ts`**: Express routes for `/api/papers`.
- **`server/routes/reviews.ts`**: Express routes for `/api/reviews`.
- **`server/routes/reviewers.ts`**: Express routes for `/api/reviewers`.
- **`server/routes/tickets.ts`**: Express routes for `/api/tickets` (with `/purchase` endpoint).
- **`server/routes/users.ts`**: Express routes for `/api/users`.
- **`server/routes/posts.ts`**: Express routes for `/api/posts`.
- **`server/routes/schedule.ts`**: Express routes for `/api/schedule`.

---

### Database Files (`/database`)
- **`database/conference_hall.json`**: Stores conference events, venue rooms, capacities, schedule timelines, and pass pricing.
- **`database/abstract_paper.json`**: Stores submitted research papers, author info, abstracts, AI domain tags, status, and assigned reviewer IDs.
- **`database/user.json`**: Stores registered user accounts, passwords, affiliations, role permissions, and persistent authentication tokens (`token: "cfh_tok_..."`).
- **`database/reviewer.json`**: Stores peer-reviewer profiles, qualifications, and domain expertise.
- **`database/review.json`**: Stores completed evaluation rubrics, scores, and reviewer recommendations.
- **`database/transaction.json`**: Stores all ticket orders, delegate passes, payment methods, and revenue transactions.
- **`database/post.json`**: Stores community Q&A forum threads between authors and reviewers.

---

## 5. Defense Talking Points & Frequently Asked Questions

### Q1: Why did you choose a Full-Stack Express + React architecture instead of a pure client-side SPA?
> **Answer**: 
> "A pure client-side application cannot securely handle AI API keys or maintain a persistent database across different users and devices. By pairing React with a lightweight Express backend, all database writes, authentication checks, and Gemini API calls happen securely server-side. Additionally, this allows different users (e.g., an Admin on one browser and a Reviewer on another) to share real-time conference and paper state."

### Q2: How does the AI manuscript classification work?
> **Answer**: 
> "When an author submits an abstract, the server-side `paperController` sends the text to `aiService.ts`. Using Gemini Flash via `@google/genai`, the model analyzes the research methodology, extracts canonical domain tags (e.g., *Machine Learning*, *Cybersecurity*, *Quantum Computing*), and assigns a novelty index. This removes manual classification overhead from the conference chair."

### Q3: How are roles, permissions, and ticket purchases secured?
> **Answer**: 
> "The system utilizes Role-Based Access Control (RBAC) paired with token authentication. Each user in `database/user.json` is assigned a unique session token (`cfh_tok_...`). When accessing protected actions such as purchasing a conference pass, the client includes the token in the `Authorization: Bearer <token>` header. The server's `ticketController` validates this token against registered users in `user.json`. If a user is not logged in, the server immediately denies the transaction with a `401 Unauthorized` status, and the frontend gracefully redirects the user to the login screen."

### Q4: Why were direct student pass purchase buttons removed from the public landing page?
> **Answer**: 
> "To enforce proper delegate accounting and institutional verification, attendees must not be allowed to bypass the registration and authentication lifecycle. Removing unauthenticated quick-buy shortcuts ensures that all orders are tied to authenticated student or delegate accounts with valid session tokens, preventing phantom orders and ensuring accurate delegate rosters in the administrative ledger."

### Q5: How is data consistency preserved during local execution?
> **Answer**: 
> "We implemented safe JSON read/write helpers with fallbacks and atomic in-memory updates in `dbService.ts`. Furthermore, Vite's development watcher is specifically configured to ignore the `database/` folder, ensuring backend database writes never cause disruptive browser reloads during presentations."

---

## 6. Verification & Quick-Start Checklist

1. **Development Start**: `npm run dev` boots both the Express API and Vite middleware at `http://localhost:3000`.
2. **Pre-Configured Administrator Account**:
   - **Email**: `roshankc@admin.com`
   - **Password**: `admin123`
   - **Role**: `admin`
   - **Assigned Token**: `cfh_tok_admin_7f9c2d1b84e3a502`
3. **Student / Author / Reviewer Access**:
   - Register a new account via `/signup` with the desired role (`student`, `author`, or `reviewer`).
   - A unique session token is automatically minted and stored in `database/user.json`.
4. **Ticket Purchasing Verification**:
   - Attempting to purchase a ticket or visit the Tickets tab while logged out triggers an authentication gate or redirects to `/login`.
   - Logging in unlocks the Tickets tab, displays the session token badge in the navbar, and allows successful checkout via regional payment simulations (eSewa / Khalti / Fonepay).
5. **Production Build**: `npm run build` bundles the frontend into `dist/` and compiles `server.ts` into a standalone `dist/server.cjs` bundle.
