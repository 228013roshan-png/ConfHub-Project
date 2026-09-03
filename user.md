# ConfHub User Roles & Access Control Guide

This document outlines the **Role-Based Access Control (RBAC)** architecture of **ConfHub (SaaS Conference Management & Peer-Review Platform)**. It explains the user types, permissions, capabilities, portal navigation, and security boundaries.

---

## 1. Overview of User Roles

ConfHub defines four primary user roles, each tailored to a specific stakeholder in the academic conference lifecycle:

| Role | Role Key | Primary Portal | Target Audience | Primary Focus |
| :--- | :--- | :--- | :--- | :--- |
| **Academic Chair / Administrator** | `admin` | Admin Portal | Conference organizers, program chairs, track directors | Full platform governance, paper triage, reviewer assignment, scheduling, ticketing, indexing XML |
| **Peer Reviewer** | `reviewer` | Reviewer Portal | Domain experts, academic researchers, committee members | Blind review evaluation, scoring rubrics, qualitative feedback, author interaction |
| **Submitting Author** | `author` | Author Portal | Researchers, professors, graduate scholars, authors | Manuscript submission, review tracking, feedback inspection, community discussion posts |
| **Student Delegate** | `student` | Landing & Attendee Portal | Undergraduate/graduate students, student delegates | Conference discovery, subsidized ticketing, schedule exploration, delegate certificates |

---

## 2. Detailed Role Specifications

### 2.1. Academic Chair / Administrator (`admin`)

The **Administrator** serves as the conference organizer, academic chair, and platform manager. Admins hold global permissions across the entire platform.

#### Key Capabilities:
- **Conference Management**:
  - Create and configure conferences, tracks, venues, submission deadlines, and conference statuses (`Upcoming`, `Active`, `Completed`).
  - Configure ticket tiers (e.g., Early Bird, Author Pass, Student Pass, VIP Access) and set pricing in NPR/USD.
- **Paper & Manuscript Governance**:
  - View all submitted papers across all conference tracks.
  - Inspect abstracts, domain tags, author contact details, and current review statuses (`Pending`, `Under Review`, `Accepted`, `Rejected`).
  - Assign manuscripts to qualified reviewers based on matching domain tags.
  - Issue final editorial decisions: **Accept** or **Reject** manuscripts.
- **Peer-Review Oversight**:
  - Track review completion rates and inspect reviewer scoring across originality, clarity, and methodology.
- **Schedule Builder**:
  - Build interactive conference timelines by adding keynote sessions, paper presentation blocks, panels, and breaks into designated conference halls.
- **Academic Indexing & Export**:
  - Auto-generate standard **DOAJ** and **Scopus** XML metadata exports for accepted manuscripts ready for publication indexing.
- **Financials & Ticketing**:
  - Monitor registration orders and payment transaction logs processed via **eSewa**, **Khalti**, or **Stripe** payment simulators.
- **Certificate Issuance**:
  - Manage and trigger academic certificates for presentation, organization, and attendance.

#### Default / Demo Access:
- **Email**: `roshankc@admin.com`
- **Role Identifier**: `admin`
- **Permissions**: `manage_conferences`, `manage_papers`, `assign_reviewers`, `accept_reject_manuscripts`, `manage_schedule`, `view_financials`, `export_metadata`

---

### 2.2. Peer Reviewer (`reviewer`)

The **Reviewer** is an academic specialist assigned to evaluate submitted manuscripts objectively and constructively.

#### Key Capabilities:
- **Assigned Submissions Dashboard**:
  - Access a dedicated queue displaying only papers assigned to the reviewer by the Conference Chair.
  - Review paper titles, abstracts, domain tags, submission timestamps, and manuscript metadata.
- **Standardized Scoring Rubric**:
  - Score papers across three distinct academic dimensions on a 1–10 scale:
    - **Originality & Novelty**
    - **Clarity & Structure**
    - **Methodology & Technical Rigor**
- **Editorial Recommendations**:
  - Submit an overall verdict: `Accept`, `Weak Accept`, `Neutral`, or `Reject`.
  - Provide constructive qualitative feedback and critique to assist the chair's decision and help the author improve their research.
- **Academic Discussion**:
  - Respond to community posts, participant questions, and author discussion threads.

#### Sample Access:
- Reviewers can log in via their registered academic email (e.g., `dr.sharma@tribhuvan.edu.np`, `sarah.chen@ai-institute.org`).

---

### 2.3. Submitting Author (`author`)

The **Author** is a researcher or scholar who submits papers to the conference and participates in academic exchanges.

#### Key Capabilities:
- **Manuscript Submission**:
  - Submit academic manuscripts to any active conference track.
  - Specify paper title, full abstract, primary author contact information, institution, and domain categorization tags (e.g., AI/ML, NLP, Computer Vision, Distributed Systems).
- **Submission Tracking**:
  - Monitor manuscript progression in real-time (`Pending` &rarr; `Under Review` &rarr; `Accepted` / `Rejected`).
- **Review Feedback Inspection**:
  - Once reviewed, view reviewer scores across criteria along with qualitative comments and acceptance decisions.
- **Author Community & Experience Posts**:
  - Publish conference reflections, session ratings, and research queries in the author community forum.
  - Interact with fellow authors and receive replies from conference reviewers.
- **Schedule & Presentation Confirmation**:
  - Confirm presentation slots on the conference program once accepted.

---

### 2.4. Student Delegate (`student`)

The **Student Delegate** role is a streamlined attendee role designed specifically for students, early-career researchers, and learners attending the conference.

#### Key Capabilities:
- **Conference Discovery**:
  - Explore conference schedules, keynote speakers, session halls, and agenda topics directly from the public landing portal.
- **Subsidized Student Ticketing**:
  - Purchase subsidized Student Delegate passes with student discounts.
  - Checkout through integrated **eSewa**, **Khalti**, and **Stripe** payment simulators.
- **Delegate Experience**:
  - Access session timings and room allocations without the cognitive overhead of paper submission workflows or administrative dashboards.
- **Participation Verification**:
  - Obtain proof of registration and student attendance credentials.

---

## 3. RBAC Permissions Matrix

The following matrix compares permissions across all user roles:

| Feature / Action | Admin (`admin`) | Reviewer (`reviewer`) | Author (`author`) | Student (`student`) |
| :--- | :---: | :---: | :---: | :---: |
| **Browse Conferences & Schedules** |  |  |  |  |
| **Purchase Registration Tickets** |  |  |  |  |
| **Submit New Paper Manuscript** |  |  |  |  |
| **Track Own Paper Status & Reviews** |  |  |  |  |
| **Publish Author Discussion Posts** |  |  |  |  |
| **View Assigned Review Queue** |  |  |  |  |
| **Submit Scores & Review Decisions** |  |  |  |  |
| **Create / Modify Conferences** |  |  |  |  |
| **Assign Reviewers to Papers** |  |  |  |  |
| **Final Accept / Reject Decisions** |  |  |  |  |
| **Configure Schedule & Sessions** |  |  |  |  |
| **View Financials & Transaction Logs**|  |  |  |  |
| **Generate DOAJ / Scopus XML** |  |  |  |  |

---

## 4. Session Security & Role Switching Guardrails

ConfHub enforces strict client and server-side RBAC safeguards:

1. **Session Role Locking**:
   - When a user logs in, their authenticated role (`admin`, `reviewer`, `author`, `student`) is saved in the user session.
   - The UI automatically locks navigation to their authorized portal and prevents privilege escalation.

2. **Role Switch Protection**:
   - If an authenticated user attempts to access an unauthorized portal (e.g., an author trying to open the Admin Portal), an **Unauthorized Role Attempt** dialog intercepts the action.
   - The dialog informs the user of their current session role and offers them the option to continue in their current portal or sign out to authenticate with different credentials.

3. **Student Role Scoping**:
   - Student accounts are automatically directed to the conference landing and attendee view, keeping their experience simple, relevant, and focused on learning.
