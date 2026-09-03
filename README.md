# ConfHub &mdash; Academic Conference Management & Peer-Review Platform

ConfHub is a full-stack academic conference management application designed to organize scholarly conferences, streamline double-blind peer-review pipelines, build dynamic presentation schedules, and manage role-based author, reviewer, and attendee accounts.

---

## 🌟 Key Capabilities & Modules

1. **Role-Based Access Control (RBAC) & Session Management**
   - **Three Distinct Roles**: `Admin` (Chief Academic Chair), `Reviewer` (Peer Review Specialist), and `Author / Attendee`.
   - **Persistent Client Session**: User credentials and active roles are persisted in browser session storage (`confhub_user_session`).
   - **Smart Navigation Interceptor**: Logged-in users navigating to the login/signup page are automatically redirected to their active workspace without disruptive re-authentication.
   - **Role Switcher & Guard**: Prevents cross-role privilege escalation while allowing seamless account switching when desired.

2. **User Database (`data.json`)**
   - Dedicated JSON-backed storage for all registered user accounts, affiliations, credentials, specialized domain tags, assigned papers, and granular permissions.
   - Server endpoints at `/api/users`, `/api/users/login`, and `/api/users/register` sync directly with `data.json`.

3. **Double-Blind Peer Review Engine & Enhanced Reviewer Dashboard**
   - Reviewers evaluate assigned manuscripts with author details concealed.
   - Multi-criteria scoring rubrics (Originality, Clarity, Methodology rated 1–5, plus decision recommendation) and Gemini AI-assisted review suggestions.
   - **Author Conference Debriefs & Reviews Feed**: Reviewers can review detailed feedback posted by authors and presenters about how the conference went (star ratings, session impressions, hall acoustics, moderation, networking value, and constructive feedback).
   - **Reviewer Committee Replies**: Reviewers can reply directly to author conference debriefs with official notes and committee acknowledgments.
   - **AI Executive Debrief Synthesis**: Gemini-powered executive briefing that synthesizes overall author satisfaction scores, top praised aspects, and actionable recommendations.
   - **Reviewer Analytics & Audit Trail**: Tracks completion rate, rubric averages, and double-blind compliance.

4. **Dynamic Program Schedule Builder**
   - Live visual schedule organizer with room allocation, keynote slots, and automated presenter insertion.
   - **Auto-Allocate Tool**: Automatically populates presentation slots using verified accepted papers.

5. **Ticketing & Registration**
   - Pass selection (Student Delegates, Professional Pass, VIP Keynote).
   - Mock gateway integrations for eSewa, Khalti, and Stripe with instant transaction verification.

---

## 📁 Database Architecture

The system utilizes structured JSON files for persistence:

### 1. `data.json` &mdash; User Accounts & Permissions
Stores all user profiles, roles, credentials, and authorization details.

```json
{
  "users": [
    {
      "id": "usr-admin-01",
      "name": "Chief Academic Chair (Admin)",
      "email": "admin@confhub.saas",
      "password": "admin123",
      "role": "admin",
      "designation": "Conference Chair & Program Director",
      "institution": "Central Academic Board / ConfHub Governance",
      "domains": ["Academic Administration", "AI Governance"],
      "status": "Active",
      "createdAt": "2026-01-15T09:00:00.000Z",
      "lastLogin": "2026-08-30T07:15:00.000Z",
      "permissions": [
        "manage_conferences",
        "manage_papers",
        "assign_reviewers",
        "accept_reject_manuscripts",
        "manage_schedule",
        "view_financials"
      ]
    },
    {
      "id": "usr-rev-01",
      "name": "Prof. Dr. Binod Adhikari",
      "email": "binod.adhikari@tribhuvan-edu.np",
      "password": "reviewer123",
      "role": "reviewer",
      "designation": "Senior Professor of Computer Engineering",
      "institution": "Institute of Engineering, Tribhuvan University",
      "domains": ["Artificial Intelligence", "Machine Learning", "Climate Modeling", "GIS"],
      "status": "Active",
      "assignedPaperCount": 3,
      "completedReviewCount": 2
    },
    {
      "id": "usr-auth-01",
      "name": "Ankit Thapa",
      "email": "ankit.thapa@ioe.edu.np",
      "password": "author123",
      "role": "author",
      "designation": "Graduate Research Scholar",
      "institution": "Department of Electronics & Computer Engineering, IOE",
      "domains": ["Artificial Intelligence", "GIS", "Machine Learning"],
      "status": "Active"
    }
  ]
}
```

### 2. `confhub-db.json` &mdash; Conference Artifacts
Stores active conferences, submitted papers, reviewer assignments, evaluation scores, ticket orders, and conference schedule slots.

---

## 🔑 Demo User Accounts

| Role | Name | Email | Password | Access / Focus Area |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Chief Academic Chair | `admin@confhub.saas` | `admin123` | Full admin governance, reviewer allocation, paper decisions |
| **Reviewer** | Prof. Dr. Binod Adhikari | `binod.adhikari@tribhuvan-edu.np` | `reviewer123` | AI, Machine Learning, GIS, Climate Modeling |
| **Reviewer** | Dr. Sandipa Shrestha | `sandipa.shrestha@kathmandu-uni.edu` | `reviewer123` | Telemedicine, Healthcare IoT, Bioinformatics |
| **Reviewer** | Er. Ramesh Pokharel | `ramesh.pokharel@ioe.edu.np` | `reviewer123` | Cyber Security, Cloud Computing, Blockchain |
| **Author** | Ankit Thapa | `ankit.thapa@ioe.edu.np` | `author123` | Paper submission, status tracking, ticket passes |
| **Author** | TeamConfHub | `ioe.author@gmail.com` | `author123` | Abstract submissions, delegate pass checkout |

---

## 🔌 REST API Endpoints

### User & Authentication (`/api/users`)
- `GET /api/users` &mdash; Fetch all registered users (passwords sanitized).
- `POST /api/users/login` &mdash; Authenticate user with role validation.
- `POST /api/users/register` &mdash; Register a new user account into `data.json`.

### Conferences & Programs (`/api/conferences`)
- `GET /api/conferences` &mdash; List active and upcoming conferences.
- `POST /api/conferences` &mdash; Create a new conference.

### Papers & Submissions (`/api/papers`)
- `GET /api/papers` &mdash; Retrieve paper manuscripts.
- `POST /api/papers` &mdash; Submit a research paper abstract.
- `PATCH /api/papers/:id/assign` &mdash; Assign reviewer to manuscript.
- `PATCH /api/papers/:id/status` &mdash; Update paper status (`Accepted`, `Rejected`, `Under Review`).

### Peer Reviews (`/api/reviews`)
- `GET /api/reviews` &mdash; List all completed peer reviews.
- `POST /api/reviews` &mdash; Submit rubric evaluation and verdict.

### Schedule & Timetable (`/api/schedule`)
- `GET /api/schedule` &mdash; Retrieve program session schedule.
- `POST /api/schedule` &mdash; Add individual session slot.
- `POST /api/schedule/bulk` &mdash; Bulk update / auto-allocate presentation slots.

### Ticketing (`/api/tickets`)
- `GET /api/tickets` &mdash; Retrieve ticket orders.
- `POST /api/tickets` &mdash; Process delegate registration order.

---

## 💻 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Backend**: Express.js, TypeScript (`tsx` dev runner, `esbuild` production bundler)
- **Data Persistence**: JSON-based state engines (`data.json` for users, `confhub-db.json` for conference state)
- **Port**: `3000` (Unified Vite + Express server)

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start full-stack development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```
