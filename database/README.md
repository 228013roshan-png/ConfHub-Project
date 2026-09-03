# ConfHub Database Store

This directory contains local JSON flat-file storage for the ConfHub platform. All state is maintained in persistent, human-readable JSON documents managed by `/server/services/dbService.ts`.

## Data Files Overview

| File | Purpose | Schema Details |
| :--- | :--- | :--- |
| `conference_hall.json` | Active and upcoming academic conferences and timetable presentation slots | `conferences`: Conference metadata, dates, venues, deadlines, and dynamic ticket tiers.<br>`schedule`: Time blocks, room locations, speakers, and paper assignments. |
| `abstract_paper.json` | Submitted manuscripts, abstracts, and peer-review statuses | `papers`: Paper titles, author info, abstract text, extracted domain tags, assigned reviewers, file sizes, and review statuses (`Pending`, `Under Review`, `Accepted`, `Rejected`). |
| `reviewer.json` | Registered peer-review experts and their academic specializations | `reviewers`: Reviewer ID, name, email, and domain tags (e.g., AI, Cyber Security, etc.) for automated keyword matching. |
| `review.json` | Completed and in-progress peer-review rubric evaluations | `reviews`: Reviewer scores (originality, clarity, methodology), recommendation verdicts, and comments. |
| `transaction.json` | Conference pass registration ledger and payment orders | `orders`: Order ID, attendee contact, conference ID, pass tier, amount, payment gateway (`eSewa`, `Khalti`, `Stripe`), status, and timestamp. |
| `post.json` | Author conference debriefs and feedback posts | `posts`: Attendee reviews, star ratings, sentiment analysis, comments, and reviewer committee responses. |
| `user.json` | User authentication credentials, RBAC roles, and profiles | `users`: User profiles with encrypted/plain passwords (local demo), roles (`admin`, `reviewer`, `author`), affiliations, and permissions. |

---

## Modifying & Resetting Data

- To start with a clean database, keep each file initialized with an empty collection:
  - `conference_hall.json`: `{"conferences": [], "schedule": []}`
  - `abstract_paper.json`: `{"papers": []}`
  - `reviewer.json`: `{"reviewers": []}`
  - `review.json`: `{"reviews": []}`
  - `transaction.json`: `{"orders": []}`
  - `post.json`: `{"posts": []}`
  - `user.json`: `{"users": []}`
- Any data written via the frontend portals or API routes (`/api/*`) immediately persists into these files.
