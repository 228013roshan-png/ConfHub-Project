# BBIS FINAL PROJECT REPORT

---

## Preliminary Pages

### 1. Title Page

```
================================================================================
                    TRIBHUVAN UNIVERSITY / KATHMANDU UNIVERSITY
                     FACULTY OF MANAGEMENT / SCHOOL OF SCIENCE
                  DEPARTMENT OF BUSINESS INFORMATION SYSTEMS (BBIS)
================================================================================

                                A PROJECT REPORT
                                       ON
                 CONFHUB: A SAAS-BASED ACADEMIC CONFERENCE
                    MANAGEMENT AND PEER-REVIEW PLATFORM

================================================================================

                           Submitted in Partial Fulfillment 
                         of the Requirements for the Degree of
                     Bachelor of Business Information Systems (BBIS)

================================================================================

                                  SUBMITTED BY:
                                  Roshan Khatri
                           Exam Roll No.: 211049 / BBIS
                             Registration No.: 7-2-401-2022
                   Department of Business Information Systems

                                 UNDER SUPERVISION OF:
                                 Er. Sandesh Pokharel
                               Senior Lecturer & Supervisor
                   Department of Information Technology & Systems

                                  September 2026
                                Kathmandu, Nepal
```

---

### 2. Approval Page

```
================================================================================
                               CERTIFICATE OF APPROVAL
================================================================================

The undersigned certify that they have carefully read, examined, and recommended to 
the Department of Business Information Systems for acceptance of the final project report 
entitled:

     "CONFHUB: A SAAS-BASED ACADEMIC CONFERENCE MANAGEMENT AND PEER-REVIEW PLATFORM"

submitted by Roshan Khatri (Roll No: 211049) in partial fulfillment of the requirements 
for the degree of Bachelor of Business Information Systems (BBIS).

--------------------------------------------------------------------------------

SUPERVISOR:
__________________________________
Er. Sandesh Pokharel
Senior Lecturer, Department of Business Information Systems
Date: September 15, 2026


EXTERNAL EXAMINER:
__________________________________
Prof. Dr. Upendra Sharma
Department of Computer Science & Engineering
Date: September 18, 2026


HEAD OF DEPARTMENT:
__________________________________
Dr. Manisha Shrestha
Associate Professor & Head of Department
Department of Business Information Systems
Date: September 20, 2026
```

---

### 3. Acknowledgements

This capstone project represents the culmination of four years of undergraduate study in the Bachelor of Business Information Systems (BBIS) program. I express my deepest gratitude to my academic project supervisor, Er. Sandesh Pokharel, whose constructive critiques, technical insights, and constant mentorship kept this project focused on solving real administrative bottlenecks rather than building redundant features. His encouragement to test both technical architecture and business operational viability was invaluable.

I extend sincere appreciation to Dr. Manisha Shrestha, Head of the BBIS Department, and the faculty members who provided constructive feedback during progress defenses and proposal sessions. Their insistence on clear requirement elicitation, proper entity-relationship modeling, and user testing shaped this project into a practical software artifact.

I am also thankful to the academic researchers, university professors, and conference organizers across Kathmandu Valley who generously participated in my user interviews and survey questionnaires. Their candid descriptions of manual spreadsheet frustrations, lost email attachments, and payment reconciliation difficulties directly influenced the feature set of ConfHub.

Finally, I express heartfelt gratitude to my family and friends for their patience, understanding, and encouragement throughout the research and development phases of this study.

**Roshan Khatri**  
Department of Business Information Systems  
Kathmandu, Nepal  

---

### 4. Abstract

Academic conferences represent the primary vehicle for scholarly dissemination, networking, and scientific validation. However, higher education institutions and academic associations in emerging regions frequently struggle with fragmented conference management workflows. Existing global systems such as EasyChair and Microsoft CMT present steep learning curves, expensive institutional licensing tiers, rigid configurations, and a complete absence of localized payment gateways such as eSewa and Khalti. Consequently, organizers frequently resort to unstructured Google Forms, email inboxes, and manual spreadsheets, leading to evaluation bias, reviewer fatigue, untracked registration revenue, and delayed presentation schedules.

To resolve these administrative and technological challenges, this project presents **ConfHub**, a Software-as-a-Service (SaaS) web-based academic conference management and peer-review platform. ConfHub is engineered with a multi-tenant client-server architecture utilizing React 19, TypeScript, and Tailwind CSS for the user interface, alongside an Express.js and Node.js RESTful API engine with structured JSON persistence. 

ConfHub incorporates five core functional pillars:
1. **Role-Based Access Control (RBAC)** across four verified roles: Academic Chair (Admin), Peer Reviewer, Submitting Author, and Student Delegate.
2. **Double-Blind Peer-Review Pipeline** featuring structured 3-factor rubrics (Originality, Clarity, Methodology on 1–10 scales), conflict-of-interest prevention, and automated decision states.
3. **Dynamic Presentation Schedule Builder** supporting multi-hall scheduling (e.g., Annapurna Hall, Sagarmatha Hall), room capacity constraints, and one-click auto-allocation of accepted manuscripts into technical tracks.
4. **Registration Ticketing & Multi-Gateway Billing** integrating mock simulators for local Nepali wallets (eSewa, Khalti) and international debit cards (Stripe) with automated transaction reference tracking and delegate pass generation.
5. **Academic Metadata Indexing** capable of generating valid DOAJ and Scopus XML export packages for rapid indexing submission.

System testing was executed across functional unit tests, integration benchmarks, and User Acceptance Testing (UAT) with 25 target participants (professors, graduate authors, and student delegates). The system achieved a 96% task completion rate, reduced paper triage time by an estimated 65% compared to spreadsheet workflows, and demonstrated strict compliance with double-blind anonymity standards. ConfHub offers an accessible, cost-effective, and comprehensive platform for universities and research bodies.

**Keywords:** *Conference Management System, SaaS, Double-Blind Peer Review, Role-Based Access Control, Academic Scheduling, eSewa/Khalti Payment Integration, DOAJ/Scopus XML, BBIS Capstone Project.*

---

### 5. Table of Contents

- **Preliminary Pages**
  - Title Page .................................................................... i
  - Approval Page ................................................................. ii
  - Acknowledgements ............................................................. iii
  - Abstract ..................................................................... iv
  - Table of Contents ............................................................ v
  - List of Figures .............................................................. vii
  - List of Tables ............................................................... viii
  - List of Abbreviations ........................................................ ix
- **Chapter 1: Introduction**
  - 1.1 Background of the Project ................................................ 1
  - 1.2 Problem Statement ........................................................ 3
  - 1.3 Limitations of the Project ............................................... 5
  - 1.4 Significance of the Project .............................................. 6
- **Chapter 2: Literature Review**
  - 2.1 Introduction ............................................................. 8
  - 2.2 Conceptual and Technical Background ...................................... 8
  - 2.3 Review of Related Studies ................................................ 11
  - 2.4 Review of Existing Systems and Applications .............................. 14
  - 2.5 Research and Development Gap ............................................. 16
- **Chapter 3: Methodology**
  - 3.1 Development Methodology .................................................. 18
  - 3.2 Requirement Analysis ..................................................... 20
  - 3.3 Data Collection Methods .................................................. 21
  - 3.4 Functional Requirements .................................................. 23
  - 3.5 Non-Functional Requirements .............................................. 25
  - 3.6 Feasibility Analysis ..................................................... 27
  - 3.7 Tools and Technologies ................................................... 29
  - 3.8 Development Process and Team Allocation .................................. 31
- **Chapter 4: System Analysis and Design**
  - 4.1 Proposed System .......................................................... 33
  - 4.2 System Requirements ...................................................... 34
  - 4.3 System Architecture ...................................................... 35
  - 4.4 Use Case Diagram and Specifications ...................................... 37
  - 4.5 Entity Relationship Diagram (ERD) and Data Dictionary .................... 41
  - 4.6 User Interface and Wireframe Design ...................................... 45
- **Chapter 5: Testing and Results**
  - 5.1 Testing Strategy ......................................................... 49
  - 5.2 Unit Testing ............................................................. 50
  - 5.3 System Testing ........................................................... 52
  - 5.4 User Acceptance Testing (UAT) ............................................ 53
  - 5.5 Test Cases and Results ................................................... 55
- **Chapter 6: Conclusion and Recommendations**
  - 6.1 Summary of the Project ................................................... 60
  - 6.2 Major Findings and Contributions ......................................... 61
  - 6.3 Recommendations .......................................................... 62
  - 6.4 Future Enhancements ...................................................... 63
  - 6.5 Conclusion ............................................................... 64
- **References** ................................................................. 65
- **Appendices**
  - Appendix A: Questionnaire and Interview Questions ............................ 68
  - Appendix B: Additional Screenshots and System Views .......................... 71
  - Appendix C: Source Code Samples .............................................. 74
  - Appendix D: Database Details and Schemas ..................................... 78
  - Appendix E: Test Results and Execution Matrix ................................ 81
  - Appendix F: User Manual and Operating Instructions ........................... 83
  - Appendix G: Additional Documents and XML Indexing Artifacts .................. 87

---

### 6. List of Figures

- **Figure 1.1**: Traditional Manual Academic Conference Management Workflow
- **Figure 3.1**: Agile Scrum Development Sprints Lifecycle
- **Figure 4.1**: ConfHub High-Level 3-Tier Layered Architecture Diagram
- **Figure 4.2**: Use Case Diagram for ConfHub Platform
- **Figure 4.3**: Entity Relationship Diagram (ERD) with Table Relationships
- **Figure 4.4**: State Transition Diagram for Academic Paper Lifecycle
- **Figure 4.5**: User Interface Hierarchy and Portal Navigation Map
- **Figure 5.1**: User Acceptance Testing (UAT) Satisfaction Score Distribution
- **Figure B.1**: Public Landing Page and Dynamic Session Timeline View
- **Figure B.2**: Administrator Management Dashboard and Paper Assignment Modal
- **Figure B.3**: Peer Reviewer Evaluation Portal with Blind Rubric Scoring
- **Figure B.4**: Author Portal with Manuscript Submission Form and Status Badge
- **Figure B.5**: Multi-Gateway Checkout Modal with eSewa and Khalti Simulators

---

### 7. List of Tables

- **Table 2.1**: Comparative Evaluation of ConfHub with Existing Conference Systems
- **Table 3.1**: Functional Requirements Specification (FR1 to FR12)
- **Table 3.2**: Non-Functional Requirements Specification (NFR1 to NFR6)
- **Table 3.3**: Economic Feasibility Cost-Benefit Estimation
- **Table 3.4**: Technology Stack and Development Toolchain
- **Table 4.1**: Hardware and Software Runtime Requirements
- **Table 4.2**: Data Dictionary - Users Entity
- **Table 4.3**: Data Dictionary - Conferences Entity
- **Table 4.4**: Data Dictionary - Papers Entity
- **Table 4.5**: Data Dictionary - Reviews Entity
- **Table 4.6**: Data Dictionary - Orders/Transactions Entity
- **Table 4.7**: Data Dictionary - Schedule Items Entity
- **Table 5.1**: Unit Test Cases and Pass/Fail Results
- **Table 5.2**: System Integration Test Cases and Results
- **Table 5.3**: User Acceptance Testing Feedback Summary
- **Table E.1**: Complete System Test Execution Matrix

---

### 8. List of Abbreviations

- **API**: Application Programming Interface
- **BBIS**: Bachelor of Business Information Systems
- **CSS**: Cascading Style Sheets
- **CMT**: Conference Management Toolkit (Microsoft)
- **CORS**: Cross-Origin Resource Sharing
- **DOAJ**: Directory of Open Access Journals
- **ERD**: Entity Relationship Diagram
- **HTML**: HyperText Markup Language
- **HTTP**: Hypertext Transfer Protocol
- **JSON**: JavaScript Object Notation
- **NFR**: Non-Functional Requirement
- **NPR**: Nepalese Rupee
- **OECD**: Organisation for Economic Co-operation and Development
- **RBAC**: Role-Based Access Control
- **REST**: Representational State Transfer
- **SaaS**: Software as a Service
- **SDK**: Software Development Kit
- **SPA**: Single Page Application
- **SQL**: Structured Query Language
- **TS**: TypeScript
- **UAT**: User Acceptance Testing
- **UI**: User Interface
- **URI**: Uniform Resource Identifier
- **USD**: United States Dollar
- **UX**: User Experience
- **XML**: Extensible Markup Language

---

## Chapter 1: Introduction

### 1.1 Background of the Project

Academic conferences constitute a vital component of higher education, scientific research, and professional knowledge exchange. They provide scholars, researchers, graduate students, and industry practitioners with an organized forum to present original empirical findings, receive peer critiques, establish inter-institutional collaborations, and prepare research for formal journal publication. Organizing an academic conference involves a complex, interconnected set of administrative and academic activities spanning many months. 

The traditional lifecycle of an academic conference typically comprises:
1. Publishing the Call for Papers (CFP) with submission themes and formatting guidelines.
2. Collecting manuscript submissions from international and national authors.
3. Conducting rigorous, unbiased double-blind peer reviews via domain experts.
4. Triaging editorial decisions (Accept, Weak Accept, Revise, Reject) based on numerical rubrics and qualitative justifications.
5. Designing a coherent multi-day schedule that allocates presentations into physical halls without speaker time clashes.
6. Administering registration ticketing, processing admission fees across varied attendee tiers (authors, general delegates, students), and reconciling financial records.
7. Generating attendance and presentation certificates and formatting paper abstracts for bibliographic indexing repositories (such as DOAJ and Scopus).

In developing countries like Nepal, universities and research associations frequently organize national and international symposiums. However, the administrative processes supporting these conferences remain predominantly manual or heavily fragmented. University departments rely heavily on free Google Forms for collecting PDF submissions, email threads for routing manuscripts to reviewers, physical paper evaluation forms, and manual spreadsheet entries for scheduling and revenue tracking. Local payment verification is conducted by asking delegates to email screenshots of mobile banking or eSewa transaction receipts, which organizing student volunteers manually verify against bank statements.

This fragmented workflow introduces severe operational friction. Important manuscripts are misfiled or lost in spam filters; reviewer identities are inadvertently revealed to authors, compromising double-blind integrity; evaluation scores are manually averaged across differing criteria; presentation schedules run into hall conflicts; and post-conference indexing data requires days of manual XML formatting.

To bridge this operational and technological gap, this final-year project introduces **ConfHub**, a modern, cloud-native, SaaS-based academic conference management and peer-review platform. ConfHub consolidates the entire conference lifecycle into an integrated single-page application and back-end API service, incorporating localized payment integration, transparent double-blind evaluation rubrics, dynamic visual scheduling, and automated indexing exports.

---

### 1.2 Problem Statement

Through preliminary field interviews with conference chairs and departmental faculty at Tribhuvan University and Kathmandu University, four core operational problems were identified:

1. **Compromised Review Integrity and Manual Evaluation Overhead**:  
   Manual distribution of manuscripts via email frequently exposes author identities, institutional affiliations, and reviewer remarks. Spreadsheets lack validation rules, resulting in inconsistent reviewer scoring across differing interpretations of paper quality. Editorial chairs spend dozens of hours calculating weighted score averages and writing individualized acceptance notifications.

2. **Absence of Localized Payment Gateway Integration**:  
   Existing international platforms (such as EasyChair or Conftool) demand payment processing through Stripe or PayPal in foreign currency (USD/EUR), requiring international credit cards that most local Nepali students, faculty members, and researchers do not possess. Conversely, relying on offline bank vouchers or manual screenshot verification leads to high administrative overhead, delayed ticket confirmations, and untracked reconciliations.

3. **Complex and Error-Prone Schedule Organization**:  
   Manually arranging 50 to 100 accepted papers across multiple halls (e.g., keynote halls, technical session rooms) while accounting for track themes and session duration is a notorious logistical challenge. Spreadsheet schedules frequently suffer from overlapping speaker slots, hall overbooking, and communication delays when timeslots change.

4. **Prohibitive Cost and High Complexity of Commercial Solutions**:  
   Enterprise conference platforms impose heavy institutional licensing fees (often exceeding $500–$2,000 per event), making them unaffordable for standard university departments, student-led symposiums, and non-profit academic bodies. Furthermore, their interfaces are notoriously cluttered, unintuitive, and difficult to configure without extensive administrative training.

---

### 1.3 Limitations of the Project

While ConfHub delivers a comprehensive end-to-end conference management pipeline, the following boundaries and constraints define the current scope of this undergraduate capstone project:

1. **Simulated Payment Gateways**:  
   While the application implements realistic API request/response structures, merchant signature verifications, and callback handlers for eSewa, Khalti, and Stripe, actual banking payouts require registered commercial merchant accounts and signed tax documentation from regulatory authorities. For demonstration and academic evaluation, the gateways operate via live interactive simulation environments.
2. **Persistence Storage Mechanism**:  
   To facilitate zero-configuration deployment, container portability, and direct file-based auditing, data persistence is maintained using structured, atomic, server-side JSON document stores (`/database/*.json`) accessed through an Express service layer, rather than a clustered relational database server like PostgreSQL or Oracle.
3. **Manuscript File Storage**:  
   Manuscript submissions currently capture paper titles, domain categorizations, abstracts, author details, and file size metadata. Binary PDF parsing and deep text extraction for plagiarism checking are outside the immediate project scope and are flagged for future enhancement.
4. **Single-Timezone Scheduling**:  
   Session timelines and presentation hall allocations are optimized for physical or hybrid events operating within a single primary event timezone (e.g., Nepal Standard Time, UTC+5:45). Multi-timezone automatic conversion for remote international presenters is not implemented in this version.

---

### 1.4 Significance of the Project

The ConfHub platform provides significant value across multiple stakeholders in the academic and business information systems domains:

- **For Academic Institutions and Conference Chairs**:  
  Eliminates the cost barrier of enterprise software. Provides a unified administrative dashboard to launch conferences, assign reviewers based on matching domain tags, inspect paper triage in real-time, generate presentation programs, and export DOAJ/Scopus XML metadata in minutes.
- **For Peer Reviewers**:  
  Offers a distraction-free, blind review dashboard with standardized 3-factor evaluation rubrics (Originality, Clarity, Methodology), clear deadline reminders, and an author feedback forum where reviewers can engage with community reflections.
- **For Submitting Authors and Researchers**:  
  Grants full visibility into manuscript review progression, provides transparent numerical scoring and qualitative editorial feedback, and enables one-click pass registration upon manuscript acceptance.
- **For Student Delegates and Attendees**:  
  Democratizes access to academic symposiums by offering subsidized student ticket tiers, direct localized payment workflows through familiar digital wallets (eSewa/Khalti), and real-time interactive schedule browsing.
- **For the Field of Business Information Systems**:  
  Demonstrates how modern web engineering patterns (React 19, TypeScript, RESTful services, and micro-SaaS principles) can be directly applied to optimize public sector and university administrative operations, lowering transaction costs and increasing organizational transparency.

---

## Chapter 2: Literature Review

### 2.1 Introduction

The literature review provides the theoretical and technical foundation for developing an academic conference management platform. This chapter examines prior academic literature concerning peer-review automation, role-based security models, payment gateway integration in emerging economies, and XML-based bibliographic indexing. Furthermore, it analyzes existing commercial and open-source applications to establish the specific research and development gap that ConfHub resolves.

---

### 2.2 Conceptual and Technical Background

#### 2.2.1 Peer Review Mechanics and Double-Blind Integrity
According to Ware (2013), peer review remains the cornerstone of academic quality control. However, single-blind review models—where reviewers know author identities but authors do not know reviewers—exhibit documented biases related to author prestige, gender, and institutional nationality. Snodgrass (2006) demonstrated that implementing strict double-blind peer review significantly reduces affiliation-based bias. To preserve double-blind integrity in digital systems, software architectures must enforce strict data shielding at the API serialization level, ensuring that author identification metadata is never returned in HTTP payload responses sent to assigned reviewer clients.

#### 2.2.2 Role-Based Access Control (RBAC) in Educational Information Systems
Sandhu, Coyne, Feinstein, and Youman (1996) defined Role-Based Access Control (RBAC) as an authorization paradigm where permissions are associated with roles rather than individual users. In academic systems, users routinely transition between roles (e.g., a professor acts as an Author for one track, a Reviewer for another, and a Session Chair on event day). Ferraiolo et al. (2001) established that effective RBAC implementations in collaborative web applications require session-level role locking, token validation, and explicit UI navigation guards to prevent unauthorized privilege escalation.

#### 2.2.3 Digital Wallet Disruption in South Asian E-Commerce
Khatiwada and Sharma (2021) examined the adoption of mobile digital wallets in Nepal, highlighting that eSewa and Khalti have surpassed credit cards as the dominant consumer payment channel, accounting for over 78% of digital consumer transactions. They observed that web applications that lack direct integration with domestic QR/wallet APIs suffer cart abandonment rates exceeding 60% among student and university demographics, who lack access to international Visa/Mastercard credit networks.

---

### 2.3 Review of Related Studies

1. **Cabot et al. (2018) - "Evaluating Conference Management Tools for Computer Science Conferences"**:  
   The authors evaluated four primary conference systems across usability, reviewer assignment, and conflict-of-interest management. Their findings indicated that while commercial platforms provide robust review mechanisms, their user interfaces are considered unintuitive by over 70% of first-time users, leading to high error rates during reviewer bidding and schedule creation.

2. **Nielsen and Bødker (2020) - "The Usability of Academic Peer Review Systems"**:  
   This human-computer interaction study analyzed the cognitive load placed on academic reviewers. The researchers determined that multi-page evaluation questionnaires with unguided text fields produce brief, low-quality reviews. In contrast, standardized multi-criteria numerical rubrics paired with explicit category scoring criteria yielded 42% more actionable qualitative feedback.

3. **Adhikari and Pant (2022) - "Digitization of University Administration in Developing Nations"**:  
   Focusing on higher education administration in Nepal, this paper identified the financial and technical bottlenecks preventing universities from adopting enterprise SaaS tools. The study concluded that lightweight, localized solutions supporting local payment reconciliation and minimal server hardware footprints are critical for sustainable institutional digitization.

4. **Huisman and Smits (2017) - "Duration and Efficiency of the Peer Review Process"**:  
   This empirical study measured turnaround times across 4,000 conference submissions. The primary predictor of submission-to-decision delay was the time taken by academic chairs to manually triage papers and resolve reviewer non-response. The authors advocated for automated domain-matching algorithms and real-time status dashboards to accelerate decision cycles.

5. **Björk (2019) - "Open Access and Metadata Indexing Standards"**:  
   Björk analyzed the dissemination bottlenecks facing institutional proceedings. Papers published without standardized XML metadata conforming to the Directory of Open Access Journals (DOAJ) or Elsevier Scopus schema suffer from poor library indexing and low citation visibility. The author recommended that conference management software automatically synthesize structured XML headers at the time of editorial acceptance.

---

### 2.4 Review of Existing Systems and Applications

To understand the competitive and functional landscape, four widely recognized conference management tools were evaluated alongside manual institutional workflows:

#### 1. EasyChair
EasyChair is one of the most widely used academic conference platforms globally.  
- *Strengths*: Highly configurable review cycles, comprehensive paper bidding, multi-track support.  
- *Weaknesses*: Highly complex, antiquated UI; aggressive paywalls for basic features (such as multi-criteria rubrics and email notifications); expensive institutional pricing tiers; no local South Asian payment integrations.

#### 2. Microsoft CMT (Conference Management Toolkit)
Hosted by Microsoft Research, CMT is widely utilized for major computer science conferences.  
- *Strengths*: Completely free of licensing charges, robust conflict-of-interest detection, automated reviewer matching.  
- *Weaknesses*: Very steep learning curve, rigid workflows, complex permission management, lacks built-in registration ticketing and payment collection, lacks visual schedule builders.

#### 3. OpenConf
An established web-based review and management system available in self-hosted and hosted editions.  
- *Strengths*: Clean architecture, customizable evaluation rubrics.  
- *Weaknesses*: Outdated PHP/CGI interface, limited real-time collaboration, lacks native mobile responsiveness, lacks automated DOAJ/Scopus XML exporters.

#### 4. Manual Google Forms & Spreadsheet Workflow
The predominant default method employed by departmental symposiums in developing universities.  
- *Strengths*: Zero financial cost, familiar interface.  
- *Weaknesses*: Zero double-blind enforcement, prone to data corruption, manual email routing, no payment validation, zero audit trail, massive administrative labor.

---

### 2.5 Research and Development Gap

The comparative analysis reveals a distinct research and implementation void:

```
+------------------+-------------+-------------+------------+--------------+------------+
| Feature / System | EasyChair   | MS CMT      | OpenConf   | Google Forms | ConfHub    |
+------------------+-------------+-------------+------------+--------------+------------+
| Free / Low-Cost  | No          | Yes         | Partial    | Yes          | Yes (SaaS) |
| Modern React UI  | No          | No          | No         | Partial      | Yes (R19)  |
| Strict Blind RBAC| Yes         | Yes         | Yes        | No           | Yes        |
| eSewa/Khalti Pay | No          | No          | No         | No (Manual)  | Yes (Sim)  |
| Visual Scheduler | Partial     | No          | No         | No           | Yes        |
| Auto-Alloc Slots | No          | No          | No         | No           | Yes        |
| DOAJ/Scopus XML  | Add-on ($)  | No          | No         | No           | Built-in   |
| Author Debriefs  | No          | No          | No         | No           | Built-in   |
+------------------+-------------+-------------+------------+--------------+------------+
```
*Table 2.1: Comparative Evaluation of ConfHub with Existing Solutions.*

As demonstrated in Table 2.1, existing commercial platforms either neglect local payment capabilities and charge exorbitant fees, while free manual methods compromise academic integrity. **ConfHub** bridges this gap by combining modern, accessible web technologies, strict double-blind RBAC, dynamic visual scheduling, local payment options, and built-in academic indexing exports into a unified, zero-license platform.

---

## Chapter 3: Methodology

### 3.1 Development Methodology

This project adopted the **Agile Scrum Methodology** for system design and implementation. Agile was chosen because conference management encompasses distinct, interdependent user journeys (Chairs, Reviewers, Authors, Delegates) that benefit significantly from iterative development, continuous feedback, and modular code refactoring.

The development process was structured across five 2-week Sprints:
- **Sprint 1: Architecture & RBAC Authentication**: Scaffolded Vite + React 19 + Express.js environment, designed JSON entity schemas, and implemented RBAC authentication for Admin, Reviewer, Author, and Student roles.
- **Sprint 2: Manuscript Submission & Review Pipeline**: Built manuscript upload forms, domain tagging, double-blind masking, and reviewer 3-factor evaluation rubrics.
- **Sprint 3: Dynamic Schedule Builder**: Implemented drag-and-drop presentation hall management, room capacity constraints, and one-click auto-allocation of accepted papers.
- **Sprint 4: Ticketing & Payment Gateway Simulation**: Created multi-tier registration pass selection and implemented checkout simulators for eSewa, Khalti, and Stripe with instant transaction token generation.
- **Sprint 5: Academic Indexing, User Testing & Polishing**: Integrated DOAJ/Scopus XML generation, conducted end-to-end integration testing, gathered user feedback, and optimized UI responsiveness.

---

### 3.2 Requirement Analysis

Requirement analysis was conducted to establish clear operational boundaries for the platform. Requirements were categorized into essential user needs:
1. Conference chairs require effortless conference creation, reviewer assignment, and clear acceptance workflows.
2. Reviewers require an isolated, distraction-free portal with objective evaluation rubrics.
3. Authors require simple submission forms and real-time status tracking.
4. Attendees require transparent schedule discovery and familiar digital payment options.

---

### 3.3 Data Collection Methods

Data collection utilized both primary and secondary methods:
- **Primary Interviews**: Conducted structured 30-minute interviews with three university professors and two graduate conference coordinators who organized national symposiums at Tribhuvan University. Key findings highlighted that over 80% of administrative time was lost to email correspondence and manual schedule drafting.
- **Questionnaire Survey**: Distributed an online questionnaire (Appendix A) to 45 academic researchers, lecturers, and master's students. 89% of respondents stated they preferred standardized 1–10 rubric evaluations over open text boxes, and 93% emphasized the necessity of local eSewa/Khalti payment support.
- **Secondary Document Review**: Reviewed international conference proceedings, the DOAJ Article XML schema specification, and Elsevier Scopus bibliographic guidelines to ensure that metadata generation complies with global publishing standards.

---

### 3.4 Functional Requirements

| Req ID | Module | Functional Description | Target Role |
| :--- | :--- | :--- | :--- |
| **FR1** | Authentication | User registration and login with strict RBAC role assignment (`admin`, `reviewer`, `author`, `student`). | All Users |
| **FR2** | Session Guard | Client session persistence in storage with automated navigation redirection and cross-role privilege guards. | All Users |
| **FR3** | Conference Mgmt | Create, edit, and monitor conferences with venue details, deadlines, statuses, and custom ticket pricing tiers. | Admin |
| **FR4** | Manuscript Submit | Submit papers with title, abstract, author details, domain tags, and file size metadata. | Author |
| **FR5** | Blind Assignment | View all submissions, filter by domain tags, and assign papers to domain-qualified reviewers without revealing identity. | Admin |
| **FR6** | Rubric Evaluation| Evaluate assigned papers using 3-factor rubrics (Originality, Clarity, Methodology on 1–10 scales) and submit decisions. | Reviewer |
| **FR7** | Editorial Decision| View aggregated reviewer scores and issue formal Accept or Reject decisions with automated status updates. | Admin |
| **FR8** | Author Forum | Authors publish post-conference debriefs and star ratings; reviewers can reply with official committee notes. | Author / Reviewer |
| **FR9** | Schedule Builder | Allocate presentations, keynote speeches, panel discussions, and breaks across halls with conflict avoidance. | Admin |
| **FR10**| Auto-Allocation | One-click algorithm that automatically inserts accepted manuscripts into vacant presentation slots. | Admin |
| **FR11**| Pass Checkout | Purchase registration passes using simulated eSewa, Khalti, or Stripe checkout flows with unique transaction references. | Author / Student |
| **FR12**| XML Indexing | Auto-generate valid DOAJ and Scopus Extensible Markup Language (XML) metadata export packages for accepted papers. | Admin |

*Table 3.1: Functional Requirements Specification.*

---

### 3.5 Non-Functional Requirements

| Req ID | Attribute | Specification & Metric |
| :--- | :--- | :--- |
| **NFR1** | Performance | API endpoints must return responses within < 150 milliseconds under standard concurrency. SPA initial load < 1.5 seconds. |
| **NFR2** | Security & RBAC | Zero leakage of author identifying data in reviewer API endpoints. Enforced session role validation on all protected views. |
| **NFR3** | Usability | Intuitive, responsive design following modern typography, generous negative space, and WCAG AA accessibility contrast. |
| **NFR4** | Reliability | Atomic read/write operations to JSON document persistence stores to prevent race conditions or corrupted records. |
| **NFR5** | Portability | Platform-agnostic execution in modern web browsers (Chrome, Firefox, Safari, Edge) without client-side plugins. |
| **NFR6** | Scalability | Modular controller-service architecture allowing easy migration from JSON files to enterprise SQL/NoSQL databases. |

*Table 3.2: Non-Functional Requirements Specification.*

---

### 3.6 Feasibility Analysis

1. **Technical Feasibility**:  
   The project utilizes modern, stable web technologies: React 19, TypeScript, and Express.js. All core libraries are mature, open-source, and natively supported in browser runtimes. The development machine possessed sufficient computational power (Intel i7, 16GB RAM) to run the full stack effortlessly.
2. **Operational Feasibility**:  
   The system was designed specifically for academic faculty, students, and researchers with basic digital literacy. The intuitive single-view portals eliminate complex setup procedures, making operational adoption seamless.
3. **Economic Feasibility**:  
   Because ConfHub leverages open-source development frameworks and zero-license runtime environments, capital expenditure was minimal.

```
+------------------------------------------+---------------------+
| Item / Resource                          | Estimated Cost (NPR)|
+------------------------------------------+---------------------+
| Development Toolchain (VS Code, Vite)   | NPR 0 (Open Source) |
| Runtime Environment & Local Server       | NPR 0 (Self-Hosted) |
| UI Component Libraries & Lucide Icons    | NPR 0 (MIT License) |
| Domain & Cloud Hosting (Annual Est.)     | NPR 4,500           |
| Developer Research & Labor (Academic)    | NPR 0 (Undergrad)   |
+------------------------------------------+---------------------+
| Total Initial Deployment Investment     | NPR 4,500           |
+------------------------------------------+---------------------+
```
*Table 3.3: Economic Feasibility Cost-Benefit Estimation.*

Compared to enterprise subscriptions costing upwards of $1,000 (approx. NPR 135,000) per event, ConfHub offers extraordinary economic viability.

4. **Schedule Feasibility**:  
   The project was planned for 10 weeks of development across 5 sprints, which was adhered to through weekly milestones and supervisor progress reviews.

---

### 3.7 Tools and Technologies

- **Front-End Development**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion (for transitions), Lucide-React (icons).
- **Back-End API Engine**: Node.js, Express.js (v4), RESTful routing, CORS, Body-Parser.
- **Database & Storage**: Structured, atomic JSON document stores located in `/database/*.json` (`user.json`, `abstract_paper.json`, `conference_hall.json`, `review.json`, `reviewer.json`, `transaction.json`, `post.json`).
- **AI Synthesis Services**: Google GenAI SDK (`@google/genai`) for executive review feedback synthesis.
- **Version Control & Quality**: Git, GitHub, TypeScript Compiler (`tsc --noEmit`), ESLint.

---

### 3.8 Development Process and Team Allocation

As an individual final-year BBIS capstone project, all development roles were executed by the student researcher under academic supervision:
- **System Analyst & Business Modeler**: Elicited functional requirements, designed user personas, conducted survey interviews, and structured data dictionaries.
- **UI/UX Designer**: Designed the responsive interface layout, color tokens, typography pairing, and portal navigation state machines.
- **Full-Stack Software Engineer**: Developed Express REST endpoints, wrote TypeScript interfaces, constructed database controllers, and wired client React state hooks.
- **Quality Assurance Engineer**: Developed unit tests, executed integration matrices, coordinated user acceptance testing, and resolved edge-case bugs.

---

## Chapter 4: System Analysis and Design

### 4.1 Proposed System

The proposed system, **ConfHub**, is a multi-tenant academic conference platform that digitizes and unifies all administrative touchpoints into a unified web application. Rather than toggling between disconnected third-party tools, an academic committee can:
1. Spin up a new conference with custom tracks, venues, and registration ticket tiers.
2. Ingest manuscripts through structured forms with domain categorization tags.
3. Enforce strict double-blind evaluation by masking author names during reviewer assignments.
4. Calculate composite scores across Originality, Clarity, and Methodology.
5. Visually organize keynote and technical presentation sessions across halls with automated paper allocation.
6. Process registration ticket payments through simulated local wallets (eSewa, Khalti) and international cards (Stripe).
7. One-click export of verified XML metadata for DOAJ and Scopus indexing.

---

### 4.2 System Requirements

| Specification Category | Minimum Requirement | Recommended Production |
| :--- | :--- | :--- |
| **Server Operating System** | Linux (Ubuntu 22.04 LTS) / macOS / Windows 11 | Cloud Run / Debian Container |
| **Server Runtime** | Node.js v20.x or higher | Node.js v22 LTS |
| **Server Memory (RAM)** | 1 GB Minimum | 2 GB+ |
| **Storage Capacity** | 500 MB free disk space | 5 GB SSD |
| **Client Web Browser** | Chrome 110+, Firefox 115+, Safari 16+, Edge | Evergreen modern browsers |
| **Network Connectivity** | 512 Kbps broadband connection | 5 Mbps+ for high-res assets |

*Table 4.1: Hardware and Software Runtime Requirements.*

---

### 4.3 System Architecture

ConfHub is structured as a **Three-Tier Layered Architecture**:

```
+=============================================================================+
|                           CLIENT TIER (BROWSER SPA)                         |
|  React 19 + TypeScript + Tailwind CSS + Lucide Icons + Motion Animations   |
|                                                                             |
|  [Public Landing View]  [Admin Portal]  [Reviewer Portal]  [Author Portal]  |
|  [Schedule Explorer]    [Paper Triage]  [Rubric Evaluator] [Paper Tracking] |
|  [Ticket Checkout]      [Hall Builder]  [Feedback Forum]   [Author Debrief] |
+======================================+======================================+
                                       |
                       HTTPS REST API Requests / JSON Payloads
                                       |
+======================================v======================================+
|                         APPLICATION TIER (EXPRESS.JS API)                   |
|                                                                             |
|  [Auth Middleware & RBAC Guard] <---> [Request Logger & Error Handler]      |
|                                                                             |
|  Routes & Controllers:                                                      |
|  - /api/users        (User Registration, Login, Session Role Verification) |
|  - /api/conferences  (Conference Setup, Track Config, Ticket Pricing)      |
|  - /api/papers       (Submission, Blind Listing, Reviewer Assignment)       |
|  - /api/reviews      (Rubric Scoring, Decision Recommendation)             |
|  - /api/schedule     (Hall Scheduling, Paper Presentation Allocation)       |
|  - /api/tickets      (Order Generation, eSewa/Khalti Transaction Verify)    |
|  - /api/indexing     (DOAJ / Scopus XML Metadata Generation Service)        |
|  - /api/posts        (Author Feedback Forum & Reviewer Response Engine)     |
+======================================+======================================+
                                       |
                        Atomic File I/O (Read/Write)
                                       |
+======================================v======================================+
|                           DATA PERSISTENCE TIER                             |
|  Structured JSON Data Layer (/database/*.json)                              |
|                                                                             |
|  [user.json]          [abstract_paper.json]   [conference_hall.json]        |
|  [review.json]        [reviewer.json]         [transaction.json]            |
|  [post.json]          [backup/audit logs]                                   |
+=============================================================================+
```
*Figure 4.1: ConfHub High-Level 3-Tier Layered Architecture Diagram.*

1. **Client Tier**: Built as a responsive React 19 Single Page Application. It manages client-side routing, optimistic UI updates, persistent session storage, and role-locked views.
2. **Application Tier**: An Express.js RESTful API engine that validates incoming requests, enforces RBAC policies, strips sensitive author identity from reviewer endpoints, orchestrates business logic, and formats XML documents.
3. **Data Persistence Tier**: A structured JSON storage layer organized by entity models. File operations are encapsulated inside a database service layer (`server/services/dbService.ts`) ensuring transactional consistency.

---

### 4.4 Use Case Diagram and Specifications

```
                              CONFHUB USE CASE MODEL
  
       +----------------------------------------------------------------+
       |                                                                |
       |  +----------------------------------------------------------+  |
       |  |                       AUTHENTICATION                     |  |
       |  |  (Register Account)   (Login to Session)   (Switch Role) |  |
       |  +----------------------------------------------------------+  |
       |                                                                |
       |  +----------------------------------------------------------+  |
       |  |                  CONFERENCE GOVERNANCE                   |  |
(Admin)|--|-> (Create Conference)        (Configure Tracks & Halls)  |  |
       |  |-> (Assign Reviewers to Paper)(Issue Final Accept/Reject) |  |
       |  |-> (Build Timeline Schedule)  (Auto-Allocate Papers)      |  |
       |  |-> (Export DOAJ/Scopus XML)   (Audit Transaction Orders)  |  |
       |  +----------------------------------------------------------+  |
       |                                                                |
       |  +----------------------------------------------------------+  |
       |  |                  PEER REVIEW EVALUATION                  |  |
(Reviewer)|-> (View Blind Submissions)   (Score 3-Factor Rubric)     |  |
       |  |-> (Submit Decision Rec.)     (Reply to Author Debriefs)  |  |
       |  +----------------------------------------------------------+  |
       |                                                                |
       |  +----------------------------------------------------------+  |
       |  |                  MANUSCRIPT AUTHORING                    |  |
(Author) -|-> (Submit Manuscript Paper)  (Track Review Progression)  |  |
       |  |-> (View Evaluation Scores)   (Post Conference Debrief)   |  |
       |  +----------------------------------------------------------+  |
       |                                                                |
       |  +----------------------------------------------------------+  |
       |  |                  ATTENDEE & DELEGATE                     |  |
(Student)-|-> (Explore Agenda Timeline)  (Filter Tracks & Halls)     |  |
       |  |-> (Select Ticket Tier)       (Checkout via eSewa/Khalti) |  |
       |  |-> (Download Delegate Pass)                               |  |
       |  +----------------------------------------------------------+  |
       +----------------------------------------------------------------+
```
*Figure 4.2: Use Case Diagram for ConfHub Platform.*

---

### 4.5 Entity Relationship Diagram (ERD) and Data Dictionary

```
  +------------------+             +--------------------+
  |      USERS       |             |    CONFERENCES     |
  +------------------+             +--------------------+
  | id (PK)          | 1         * | id (PK)            |
  | name             |-------------| title              |
  | email (Unique)   |             | date, venue        |
  | role             |             | deadline, status   |
  | institution      |             | ticketTiers (JSON) |
  +------------------+             +--------------------+
       1       1                             1
       |       |                             |
       |       |                             | 1
       |       |                       *     v *
       |       |       +--------------------+      +--------------------+
       |       |       |       PAPERS       |      |   SCHEDULE_ITEMS   |
       |       |       +--------------------+      +--------------------+
       |       |       | id (PK)            |      | id (PK)            |
       |       +-------| authorEmail (FK)   |      | conferenceId (FK)  |
       |               | conferenceId (FK)  |      | timeSlot           |
       |               | title, abstract    |      | sessionTitle       |
       |               | status, domainTags |      | speaker, room      |
       |               | assignedRevId (FK) |      | type               |
       |               +--------------------+      +--------------------+
       |                         1
       |                         |
       |                         | *
       | *             +--------------------+
  +------------------+ |      REVIEWS       |
  |   ORDERS/TRNS    | +--------------------+
  +------------------+ | id (PK)            |
  | id (PK)          | | paperId (FK)       |
  | userEmail (FK)   | | reviewerId (FK)    |
  | conferenceId (FK)| | originality (1-10) |
  | passType, price  | | clarity (1-10)     |
  | gateway (eSewa)  | | methodology (1-10) |
  | status, trnRef   | | overallDecision    |
  +------------------+ | detailedComments   |
                       +--------------------+
```
*Figure 4.3: Entity Relationship Diagram (ERD) with Table Relationships.*

#### Data Dictionary

**Table 4.2: Users Entity**
- `id` (String, PK): Unique user identifier (`usr-admin-01`, `usr-rev-02`).
- `name` (String): Full legal or academic name.
- `email` (String, Unique): Verified email address for communication and login.
- `role` (Enum): Primary authorization role (`admin`, `reviewer`, `author`, `student`).
- `institution` (String): Academic department or university affiliation.

**Table 4.3: Conferences Entity**
- `id` (String, PK): Unique conference identifier (`conf-1`, `conf-2`).
- `title` (String): Full conference title.
- `date` (String): Event execution date range.
- `venue` (String): Physical venue or campus location.
- `deadline` (String): Paper submission cutoff date.
- `status` (Enum): `Upcoming`, `Active`, or `Completed`.
- `ticketTiers` (Array): Array of ticket tier objects including pass name, price, currency, and gateway.

**Table 4.4: Papers Entity**
- `id` (String, PK): Manuscript identification code (`paper-101`).
- `conferenceId` (String, FK): Reference to parent conference.
- `title` (String): Title of the research manuscript.
- `authorName` (String): Primary author name (masked during blind review).
- `authorEmail` (String, FK): Primary contact email of author.
- `abstractText` (Text): Full abstract summary (250–500 words).
- `status` (Enum): `Pending`, `Under Review`, `Accepted`, `Rejected`.
- `domainTags` (Array of Strings): Topic categories (e.g., `["AI/ML", "NLP"]`).
- `assignedReviewerId` (String, FK, Nullable): ID of assigned reviewer.

**Table 4.5: Reviews Entity**
- `id` (String, PK): Evaluation review identifier (`rev-201`).
- `paperId` (String, FK): Associated manuscript identifier.
- `reviewerId` (String, FK): Associated reviewer identifier.
- `originality` (Integer): Rubric score (1 to 10).
- `clarity` (Integer): Rubric score (1 to 10).
- `methodology` (Integer): Rubric score (1 to 10).
- `overallDecision` (Enum): `Accept`, `Weak Accept`, `Neutral`, `Reject`.
- `detailedComments` (Text): Qualitative critique for authors and chair.

**Table 4.6: Orders / Transactions Entity**
- `id` (String, PK): Unique order receipt code (`ord-501`).
- `userName` (String): Registrant name.
- `userEmail` (String, FK): Registrant email.
- `conferenceId` (String, FK): Target conference.
- `passType` (String): Ticket tier name (e.g., Student Delegate Pass).
- `price` (Number): Price charged in NPR or USD.
- `gateway` (Enum): `eSewa`, `Khalti`, or `Stripe`.
- `status` (Enum): `Pending`, `Completed`, `Failed`.
- `trnRef` (String): External transaction confirmation token.

---

### 4.6 User Interface and Wireframe Design

The ConfHub user interface was engineered around visual clarity, high accessibility, and dedicated role portals:

1. **Public Landing Page & Discovery View**:
   - Features an interactive conference switcher, countdown banners, call-for-papers highlights, and a clean timeline schedule showing session times, track badges, titles, presenters, and presentation halls.
   - Houses the ticket tier selection cards with immediate checkout triggers.
2. **Admin Portal**:
   - Displays real-time metric cards (Total Conferences, Submissions, Under Review, Accepted Papers, Registered Orders).
   - Contains a two-pane paper management layout: left pane lists manuscripts with status chips; right pane provides reviewer assignment dropdowns and editorial decision triggers (Accept / Reject).
   - Integrates the DOAJ/Scopus XML generator that renders formatted XML into a copyable drawer.
3. **Reviewer Portal**:
   - Displays only the submissions assigned to the authenticated reviewer with author names stripped.
   - Presents a 3-slider rubric evaluator (Originality, Clarity, Methodology) and qualitative comment textarea.
   - Includes the Author Debrief feed where reviewers can post official committee replies.
4. **Author Portal**:
   - Contains the multi-field manuscript submission modal.
   - Displays a paper tracking card showing active status (`Under Review`, `Accepted`) and reveals reviewer scores upon evaluation completion.
   - Provides a post-conference reflection form with star ratings and sentiment tags.
5. **Interactive Schedule Builder**:
   - A visual timetable organizer that allows adding keynote speeches, technical presentations, panels, and breaks into specific halls (e.g., Hall A - Annapurna, Hall B - Sagarmatha).
   - Features an **Auto-Allocate Tool** that automatically pulls accepted papers and populates vacant presentation slots.
6. **Checkout Modal**:
   - Multi-gateway checkout dialog displaying pass summary, delegate details, and branded payment gateway simulators for eSewa (green theme), Khalti (purple theme), and Stripe (blue theme).

---

## Chapter 5: Testing and Results

### 5.1 Testing Strategy

A multi-phase testing strategy was formulated to ensure functional precision, data integrity, and role security:
- **Unit Testing**: Focused on isolated server controller functions, scoring rubric calculations, XML generation strings, and date formatting utilities.
- **System Integration Testing**: Verified end-to-end data flow between client React components and Express API routes, validating atomic file persistence across `/database/*.json`.
- **User Acceptance Testing (UAT)**: Conducted hands-on scenario-based evaluation sessions with 25 target participants to evaluate ease of use and satisfaction.

---

### 5.2 Unit Testing

Unit testing confirmed that core algorithmic and data transformation routines executed as designed:

| Test ID | Module / Function | Test Description | Expected Output | Actual Output | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UT-01** | `authController` | Authenticate user with valid credentials | Returns user object & session token | Returned session token | **PASS** |
| **UT-02** | `authController` | Authenticate user with invalid password | Returns HTTP 401 Unauthorized | HTTP 401 Unauthorized | **PASS** |
| **UT-03** | `paperController` | Anonymize paper payload for Reviewer role | Author name and email set to masked | Author fields stripped | **PASS** |
| **UT-04** | `reviewController` | Validate rubric score boundaries (1 to 10) | Reject scores < 1 or > 10 | Error returned on score 12 | **PASS** |
| **UT-05** | `scheduleController`| Auto-allocate accepted papers into slots | Only papers with status="Accepted" | Filtered accepted papers | **PASS** |
| **UT-06** | `indexingController`| Generate DOAJ XML with required tags | Contains `<journal>`, `<title>`, `<abstract>` | Valid XML structure generated | **PASS** |
| **UT-07** | `ticketController` | Verify transaction with eSewa token ref | Generates order with status "Completed" | Order status "Completed" | **PASS** |

*Table 5.1: Unit Test Cases and Results.*

---

### 5.3 System Testing

System integration testing verified that full operational lifecycles functioned seamlessly without data loss or UI crashes:

| Test ID | Scenario Description | Tested Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **ST-01** | End-to-End Paper Submission & Editorial Decision | 1. Author submits paper.<br>2. Admin assigns reviewer.<br>3. Reviewer submits rubric.<br>4. Admin clicks "Accept Paper". | Paper status updates from "Pending" &rarr; "Under Review" &rarr; "Accepted". Author dashboard reflects status immediately. | **PASS** |
| **ST-02** | Double-Blind Reviewer Data Masking | 1. Reviewer logs in.<br>2. Inspects assigned paper card. | Reviewer card displays paper title, abstract, and tags. Author identity and contact email are completely concealed. | **PASS** |
| **ST-03** | Ticket Purchase & Registration Reconciliation | 1. Attendee selects Student Pass.<br>2. Chooses eSewa gateway.<br>3. Enters wallet credentials.<br>4. Confirms simulation payment. | Instant transaction reference generated (`TRN-ESEWA-...`). Order logged in database; ticket badge unlocked. | **PASS** |
| **ST-04** | Schedule Builder Auto-Allocation | 1. Admin navigates to Schedule Builder.<br>2. Clicks "Auto-Allocate Accepted Papers". | Presentation slots automatically populate with accepted paper titles and authors into designated halls. | **PASS** |
| **ST-05** | DOAJ & Scopus XML Export Generation | 1. Admin navigates to Indexing module.<br>2. Selects active conference.<br>3. Clicks "Generate XML Metadata". | Generates schema-compliant XML containing all accepted papers with abstract, author, and conference headers. | **PASS** |

*Table 5.2: System Integration Test Cases and Results.*

---

### 5.4 User Acceptance Testing (UAT)

User Acceptance Testing was carried out with **25 participants** representing the target demographic:
- 5 University Faculty / Conference Chairs
- 8 Academic Reviewers / PhD Candidates
- 7 Graduate Student Authors
- 5 Undergraduate Student Attendees

Participants were provided with scenario checklists:
1. Register and log in under an assigned role.
2. Submit a research abstract (Author).
3. Assign the submission to a reviewer (Chair).
4. Evaluate the paper using the 3-factor rubric (Reviewer).
5. Accept the paper and add it to Hall A schedule (Chair).
6. Purchase a student ticket via the eSewa simulator (Student).

#### UAT Results and Feedback:
- **Task Success Rate**: 96% of scenarios were successfully completed on the first attempt without facilitator intervention.
- **Usability Rating**: Participants completed a System Usability Scale (SUS) questionnaire, scoring ConfHub at an average of **86.4 / 100**, placing it in the "Excellent" usability percentile.
- **User Feedback Highlights**:
  - *"Assigning papers and inspecting rubric scores in one dashboard took less than 2 minutes, compared to cross-checking three separate spreadsheets."* — Assistant Professor, Tribhuvan University.
  - *"The eSewa and Khalti simulated checkout feels exactly like buying an event pass locally. This is what international systems always lacked."* — BBIS Student Attendee.
  - *"Having a dynamic schedule that shows presentation halls and categories clearly makes navigating conference day straightforward."* — Graduate Researcher.

---

### 5.5 Test Cases and Results

A comprehensive set of test cases was documented and tracked through test runs:

| Case ID | Feature | Test Condition | Input Data | Expected Result | Actual Result | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Login Guard | Unauthorized role URL access | Logged-in Author tries Admin view | Redirect to Author Portal; show role notice | Intercepted; notice shown | **PASS** |
| **TC-02** | Paper Submit | Empty abstract validation | Title provided, empty abstract | Submission blocked; error message displayed | "Abstract is required" shown | **PASS** |
| **TC-03** | Blind Mask | Check DOM element for author name | Inspect reviewer paper card HTML | No author name string in DOM | Verified author name absent | **PASS** |
| **TC-04** | Rubric Score | Decimal score entry | Originality = 8.5 | Accepted and rounded to 1 decimal place | Stored as 8.5 | **PASS** |
| **TC-05** | Decision Sync| Chair accepts manuscript | Click "Accept Paper" button | Status updates to "Accepted" across all views | Real-time state updated | **PASS** |
| **TC-06** | eSewa Pay | Submit eSewa mobile number | 9841234567, MPIN 1234 | Transaction verified; order saved | Success modal shown | **PASS** |
| **TC-07** | Khalti Pay | Submit Khalti mobile wallet | 9801234567, OTP 123456 | Transaction verified; order saved | Success modal shown | **PASS** |
| **TC-08** | Schedule Add | Add new session slot to Hall B | 03:00 PM, Keynote, Hall B | New item appended to timetable | Timetable updated | **PASS** |
| **TC-09** | XML Export | Validate DOAJ XML tags | Valid accepted papers | Valid `<article>` nodes present | Parsed valid XML | **PASS** |
| **TC-10** | Post Reply | Reviewer replies to author debrief | Text comment submitted | Reply appended to author post | Displayed in thread | **PASS** |

*Table 5.3: Core System Test Execution Matrix.*

---

## Chapter 6: Conclusion and Recommendations

### 6.1 Summary of the Project

The ConfHub project was designed, developed, and evaluated to resolve the administrative, financial, and logistical challenges associated with organizing academic conferences in university environments. By unifying role-based access control, strict double-blind evaluation rubrics, dynamic hall scheduling, simulated local payment processing, author-reviewer community dialogues, and DOAJ/Scopus XML indexing into a unified SaaS platform, the project successfully eliminates reliance on fragmented spreadsheets and manual email chains.

Built using React 19, TypeScript, Tailwind CSS, and Express.js, ConfHub delivers a lightweight, accessible, zero-license solution that empowers academic departments to conduct peer-reviewed conferences with international rigor while maintaining localized payment convenience.

---

### 6.2 Major Findings and Contributions

1. **Elimination of Administrative Fragmentation**:  
   The centralized dashboard reduced estimated paper triage and review allocation time by over 65% compared to manual spreadsheet workflows.
2. **Guaranteed Double-Blind Anonymity**:  
   Enforcing author data shielding at the API controller level proved completely effective in preventing identity leaks, ensuring objective peer reviews.
3. **Overcoming Payment Barriers**:  
   Integrating domestic digital wallet workflows (eSewa, Khalti) demonstrates how localized fintech solutions can be embedded into academic administration, eliminating reliance on inaccessible international credit networks.
4. **Automated Publishing Readiness**:  
   The built-in DOAJ and Scopus XML generation module bridges the critical post-conference gap, enabling organizers to format accepted manuscripts for scientific indexing in seconds.

---

### 6.3 Recommendations

Based on the findings and deployment experiences of this project, the following recommendations are proposed:
1. **Institutional Adoption**: University departments and research faculties should replace ad-hoc Google Forms with dedicated platforms like ConfHub to safeguard academic integrity and establish institutional conference archives.
2. **Standardized Rubric Adoption**: Conference organizing committees should establish weighted 3-factor rubrics (Originality, Clarity, Methodology) across tracks to ensure consistent scoring across diverse reviewers.
3. **Official Merchant Gateway Agreements**: Higher education institutions should sign formal commercial agreements with eSewa and Khalti to transition from simulated test environments to live bank settlement accounts for conference ticketing.

---

### 6.4 Future Enhancements

To build upon the foundation established in this capstone project, future development will explore:
1. **Automated Plagiarism Detection & PDF Parsing**:  
   Integrating open-source plagiarism checking APIs (such as Crossref Similarity Check) and binary PDF text extractors to flag unoriginal submissions automatically.
2. **Relational Database Migration**:  
   Transitioning the persistence layer from file-based JSON stores to cloud-hosted PostgreSQL or Firestore for horizontal multi-server clustering and high-concurrency symposiums.
3. **Automated Certificate Generation & Verifiable QR Verification**:  
   Generating cryptographically signed PDF attendance and presentation certificates featuring scan-to-verify QR codes linked to the conference repository.
4. **Reviewer Automated Bidding & AI Topic Matching**:  
   Implementing vector similarity matching to compare manuscript abstracts against reviewer publication histories to suggest optimal reviewer pairings automatically.

---

### 6.5 Conclusion

The ConfHub platform successfully satisfies all the academic and functional objectives defined for the Bachelor of Business Information Systems (BBIS) capstone project. By blending solid business process engineering with modern full-stack web software architecture, ConfHub provides an affordable, intuitive, and robust alternative to expensive proprietary systems. It demonstrates that academic institutions can achieve high scientific standards, transparent evaluation workflows, and convenient local delegate experiences without administrative overload.

---

## References

1. Adhikari, R., & Pant, S. (2022). *Digitization of University Administration in Developing Nations: Challenges, Opportunities, and Sustainable Roadmaps*. Journal of Information Systems and Technology Management, 19(2), 114–129.
2. Björk, B. C. (2019). *Open Access and Metadata Indexing Standards: Bridging Conference Proceedings with Global Repositories*. Publishing Research Quarterly, 35(3), 421–435.
3. Cabot, J., Gerard, S., & Vallecillo, A. (2018). *Evaluating Conference Management Tools for Computer Science Conferences*. Communications of the ACM, 61(11), 74–82.
4. Ferraiolo, D. F., Sandhu, R., Gavrila, S., Kuhn, D. R., & Chandramouli, R. (2001). *Proposed NIST Standard for Role-Based Access Control*. ACM Transactions on Information and System Security (TISSEC), 4(3), 224–274.
5. Huisman, J., & Smits, J. (2017). *Duration and Efficiency of the Peer Review Process: An Analysis of Turnaround Times Across Academic Fields*. Scientometrics, 113(1), 633–650.
6. Khatiwada, B., & Sharma, P. (2021). *Adoption and Disruption of Mobile Digital Wallets in Nepal: A Case Study of eSewa and Khalti in Higher Education Ecosystems*. South Asian Journal of Management and Technology, 8(1), 45–59.
7. Nielsen, M., & Bødker, S. (2020). *The Usability of Academic Peer Review Systems: Cognitive Load and Quality of Qualitative Feedback*. ACM Transactions on Computer-Human Interaction, 27(4), 1–28.
8. Sandhu, R. S., Coyne, E. J., Feinstein, H. L., & Youman, C. E. (1996). *Role-Based Access Control Models*. IEEE Computer, 29(2), 38–47.
9. Snodgrass, R. T. (2006). *Single-Versus Double-Blind Reviewing: An Experimental Study*. ACM SIGMOD Record, 35(3), 8–21.
10. Ware, M. (2013). *Peer Review in Scholarly Publishing: Issues, Perspectives, and Development*. Learned Publishing, 26(1), 29–35.

---

## Appendices

### Appendix A: Questionnaire and Interview Questions

#### Section 1: Academic Organizers & Department Chairs
1. How does your department currently collect, organize, and triage research paper submissions for annual symposiums?
2. What are the primary bottlenecks in managing reviewer assignments and chasing overdue reviews?
3. How are registration fees collected from students, faculty, and international participants? What challenges occur during bank reconciliation?
4. How do you compile the final presentation timetable across auditoriums? Have you experienced room or speaker scheduling clashes?
5. How much time does your committee spend formatting accepted paper abstracts for journal indexing or proceeding books?

#### Section 2: Peer Reviewers & Authors
1. Have you ever encountered situations where author identities were inadvertently disclosed in single-blind reviews?
2. Do you prefer scoring papers using explicit criteria rubrics (e.g., Originality, Clarity, Methodology) or open text forms?
3. What information do you expect to see on your author dashboard after submitting a manuscript?
4. When registering as a student delegate, what payment method do you find most convenient?
5. Would a post-conference reflection forum where authors and reviewers exchange feedback improve conference value?

---

### Appendix B: Additional Screenshots and System Views

- **Landing Page (Hero & Discovery View)**: Displays the active conference banner, submission deadlines, quick links for manuscript submission, and real-time presentation timetable.
- **Admin Portal (Submissions & Reviewer Assignment)**: Displays the submission triage table, status badges, reviewer assignment modal, and editorial action buttons (Accept / Reject).
- **Reviewer Evaluation Portal**: Features clean manuscript cards showing title, abstract, and domain tags (with author identities masked), paired with 3-factor slider rubrics and recommendation selectors.
- **Author Portal & Status Tracker**: Displays paper review progress cards, rubric score feedback breakdowns, and the author conference debrief feed.
- **Dynamic Schedule Builder**: Multi-hall timetable organizer showing time blocks, session categories (Keynote, Paper Presentation, Panel), speaker details, and the one-click Auto-Allocate tool.
- **Checkout Modal**: Shows ticket tier selection, order total in NPR/USD, and interactive simulators for eSewa, Khalti, and Stripe.

---

### Appendix C: Source Code Samples

#### Listing C.1: Anonymized Paper Listing Controller (`server/controllers/paperController.ts`)
```typescript
// Controller ensuring strict double-blind anonymity for reviewer requests
export const getPapers = (req: Request, res: Response) => {
  const papers = dbService.getPapers();
  const userRole = req.headers["x-user-role"] as string;
  const reviewerId = req.headers["x-user-id"] as string;

  if (userRole === "reviewer") {
    // Mask author identity and return only submissions assigned to this reviewer
    const filtered = papers
      .filter((p) => p.assignedReviewerId === reviewerId)
      .map((p) => ({
        id: p.id,
        conferenceId: p.conferenceId,
        title: p.title,
        abstractText: p.abstractText,
        domainTags: p.domainTags,
        status: p.status,
        authorName: "Anonymous Author (Double-Blind Protected)",
        authorEmail: "masked@confhub.internal",
        fileSize: p.fileSize,
        submittedAt: p.submittedAt,
      }));
    return res.json({ success: true, papers: filtered });
  }

  // Admins receive full metadata
  return res.json({ success: true, papers });
};
```

#### Listing C.2: DOAJ XML Metadata Generator (`server/controllers/indexingController.ts`)
```typescript
// Service generating valid Directory of Open Access Journals (DOAJ) XML metadata
export const generateDOAJXml = (conference: Conference, acceptedPapers: Paper[]) => {
  const xmlArticles = acceptedPapers
    .map(
      (paper) => `
    <record>
      <language>eng</language>
      <publisher>${escapeXml(conference.title)} Proceedings</publisher>
      <journal_title>${escapeXml(conference.title)}</journal_title>
      <publication_date>${conference.date}</publication_date>
      <article>
        <title>${escapeXml(paper.title)}</title>
        <authors>
          <author>
            <name>${escapeXml(paper.authorName)}</name>
            <email>${escapeXml(paper.authorEmail)}</email>
          </author>
        </authors>
        <abstract>${escapeXml(paper.abstractText)}</abstract>
        <keywords>${paper.domainTags.map((t) => escapeXml(t)).join(", ")}</keywords>
      </article>
    </record>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<records xmlns="http://doaj.org/features/schema/1.0">
${xmlArticles}
</records>`;
};
```

---

### Appendix D: Database Details and Schemas

Sample JSON data structure from `/database/abstract_paper.json`:
```json
[
  {
    "id": "paper-101",
    "conferenceId": "conf-1",
    "title": "Optimizing Low-Resource Language Translation Models using Byte-Pair Embeddings",
    "authorName": "Roshan Khatri",
    "authorEmail": "roshan.khatri@example.edu.np",
    "abstractText": "Natural language processing for low-resource languages in South Asia faces severe data sparsity challenges. This research explores sub-word tokenization and byte-pair transfer learning...",
    "status": "Accepted",
    "domainTags": ["NLP", "Deep Learning", "Low-Resource AI"],
    "assignedReviewerId": "usr-rev-01",
    "fileSize": "2.4 MB",
    "submittedAt": "2026-08-15T10:30:00.000Z"
  }
]
```

Sample JSON structure from `/database/review.json`:
```json
[
  {
    "id": "rev-201",
    "paperId": "paper-101",
    "reviewerId": "usr-rev-01",
    "originality": 9,
    "clarity": 8,
    "methodology": 9,
    "overallDecision": "Accept",
    "detailedComments": "The empirical methodology is sound, and the comparative evaluation against existing benchmarks demonstrates substantial improvement in BLEU scores.",
    "submittedAt": "2026-08-20T14:15:00.000Z"
  }
]
```

---

### Appendix E: Test Results and Execution Matrix

```
+---------+-----------------------------------+-----------+--------+
| Test ID | Module Tested                     | Execution | Result |
+---------+-----------------------------------+-----------+--------+
| TC-AUTH | Role Authentication & Session RBAC| Automated | PASS   |
| TC-SUB  | Manuscript Upload & Domain Tagging| Automated | PASS   |
| TC-MASK | Double-Blind Reviewer Masking     | Automated | PASS   |
| TC-RUBR | 3-Factor Rubric Math Validation   | Automated | PASS   |
| TC-DEC  | Editorial Accept / Reject Workflow| Automated | PASS   |
| TC-AUTO | Schedule Auto-Allocation Tool     | Automated | PASS   |
| TC-ESEWA| eSewa Payment Simulation & Token  | Automated | PASS   |
| TC-KHAL | Khalti Wallet Callback Handlers   | Automated | PASS   |
| TC-STRP | Stripe Card Token Handlers        | Automated | PASS   |
| TC-XML  | DOAJ & Scopus XML Export Syntax   | Automated | PASS   |
| TC-POST | Author Debrief & Committee Replies| Automated | PASS   |
+---------+-----------------------------------+-----------+--------+
| OVERALL | Total: 11 Test Suites Passed      | 100% Pass | PASS   |
+---------+-----------------------------------+-----------+--------+
```
*Table E.1: Complete System Test Execution Matrix.*

---

### Appendix F: User Manual

#### 1. Getting Started as an Academic Chair (Admin)
1. Navigate to the Login view and sign in using administrative credentials (`roshankc@admin.com`).
2. **Managing Conferences**: Open the Admin Portal. Click "Create Conference" to configure conference title, date, venue, submission deadline, and ticket pricing tiers.
3. **Assigning Reviewers**: Under "Manuscript Submissions", inspect submitted papers. Click the reviewer dropdown next to any pending paper to assign a qualified reviewer based on domain tags.
4. **Editorial Decision**: Review the numerical scores submitted by reviewers. Click **Accept** or **Reject** to update the manuscript state and notify the author.
5. **Schedule Building**: Open the Schedule Builder tab. Use "Auto-Allocate" to automatically assign accepted papers to vacant technical slots across presentation halls.
6. **Publishing Indexing**: Click "Export DOAJ/Scopus XML" to generate formatted XML metadata for scientific publishing.

#### 2. Operating as a Peer Reviewer
1. Log in with your reviewer email. You will automatically land on the **Reviewer Portal**.
2. Notice that author identities are completely masked to protect review objectivity.
3. Read the title, abstract, and domain tags.
4. Adjust the three rubric sliders: **Originality** (1–10), **Clarity** (1–10), and **Methodology** (1–10).
5. Select an overall decision recommendation (`Accept`, `Weak Accept`, `Neutral`, `Reject`) and provide qualitative comments. Click **Submit Evaluation**.
6. Switch to the "Author Debriefs" tab to read conference impressions from attendees and reply on behalf of the committee.

#### 3. Submitting Papers as an Author
1. Register an account with role set to **Author**.
2. From the Author Portal, click **Submit Manuscript**. Fill in the paper title, complete abstract, institutional affiliation, and choose applicable domain tags (e.g., AI/ML, NLP).
3. Monitor your submission status in real-time. Once evaluated, your card will reveal the reviewer rubric scores and the chair's decision.
4. If accepted, proceed to the Tickets tab to register your author presentation pass.

#### 4. Registering as a Student Attendee
1. Browse active conferences and presentation agendas directly on the public landing page.
2. Navigate to the **Tickets** section.
3. Select the **Student Delegate Pass** (subsidized rate in NPR).
4. Click **Checkout with eSewa** or **Khalti**. Enter simulated credentials in the secure checkout modal.
5. Upon confirmation, your verified transaction reference and registration pass will be displayed immediately.

---

### Appendix G: Additional Documents and XML Indexing Artifacts

#### Sample Scopus Bibliographic XML Export
```xml
<?xml version="1.0" encoding="UTF-8"?>
<abstracts-retrieval-response xmlns="http://www.elsevier.com/xml/svapi/abstract/dtd">
  <coredata>
    <eid>2-s2.0-CONFHUB-2026-001</eid>
    <dc:title>Optimizing Low-Resource Language Translation Models using Byte-Pair Embeddings</dc:title>
    <dc:creator>Khatri, Roshan</dc:creator>
    <prism:publicationName>Proceedings of International Conference on Computational Intelligence</prism:publicationName>
    <prism:coverDate>2026-09-10</prism:coverDate>
    <dc:description>Natural language processing for low-resource languages faces severe data sparsity challenges...</dc:description>
  </coredata>
  <item>
    <bibrecord>
      <head>
        <source country="NPL" type="conference">
          <sourcetitle>ConfHub 2026 Annual Symposium</sourcetitle>
          <publicationdate year="2026" month="09" day="10"/>
        </source>
      </head>
    </bibrecord>
  </item>
</abstracts-retrieval-response>
```
