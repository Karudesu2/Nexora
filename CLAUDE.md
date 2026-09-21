## Claude Code Cost Control Rules

* Work on one feature or module at a time.
* Do not rebuild working code unnecessarily.
* Inspect only the files relevant to the current task when possible.
* Do not repeatedly explain or regenerate the entire project architecture.
* Reuse existing components, services, models, and utilities.
* Do not modify unrelated files.
* Do not run unnecessary commands or tests.
* Keep responses and progress summaries concise.
* Before making large changes, explain the planned changes first.
* If a task can be completed with a small change, do not perform a large refactor.
* Do not automatically continue to the next module after completing a task.
* Stop after the requested feature is implemented and verified.
* Prefer targeted fixes over rebuilding entire systems.
* Use lower reasoning effort for simple coding, formatting, CRUD, and configuration tasks.
* Use higher reasoning effort only for difficult architecture, debugging, database design, security, or complex business logic.

NEXORA
Teacher Lesson Planning, Curriculum Alignment & Pacing System
FINAL MASTER DEVELOPMENT INSTRUCTION
________________________________________
1. PROJECT OBJECTIVE
Build a complete, production-ready educational management platform called:
NEXORA
NEXORA is a teacher-focused system for organizing:
•	School calendars
•	Three-term academic schedules
•	Instructional days
•	Curriculum competencies
•	Competency-to-day mapping
•	Daily lesson planning
•	Learning activities
•	Assessments
•	Learning resources
•	Lesson evidence
•	Teacher reflections
•	Curriculum coverage
•	Lesson pacing
•	Curriculum alignment
•	Reports
•	Notifications
The system must help teachers move from:
CURRICULUM
    ↓
COMPETENCY
    ↓
PLANNING
    ↓
DAILY LESSON
    ↓
ACTIVITY
    ↓
ASSESSMENT
    ↓
EVIDENCE
    ↓
REFLECTION
    ↓
PROGRESS
    ↓
ADJUSTMENT
NEXORA must be a fully functional application.
Do not create a static UI prototype.
Every major interface must connect to real application logic and real database records.
________________________________________
2. TECHNOLOGY STACK
The project will use:
Web Frontend
Use:
React
Recommended:
React + TypeScript
The web application will be the primary interface for teachers and administrators.
________________________________________
3. MOBILE APPLICATION
Use:
React Native
Prefer:
React Native + Expo
The mobile application should provide the most important teacher functions.
Mobile should focus on:
Dashboard
Today's Lesson
Calendar
Lessons
Competencies
Assessments
Notifications
Pacing
Quick Lesson Updates
Reflection
Do not duplicate every administrator feature inside the mobile application.
Admin-heavy operations can remain web-only.
________________________________________
4. BACKEND
Use:
Laravel
Laravel is the main backend/API layer.
Laravel must handle:
•	API endpoints
•	Request validation
•	Business logic
•	Authorization
•	Database access
•	Data transformation
•	Report generation
•	Notification logic
•	Scheduling logic
•	Pacing calculations
•	Alignment calculations
•	File handling coordination
•	Audit logging
The frontend must not contain critical business logic that should be controlled by the backend.
________________________________________
5. DATABASE
Use:
Supabase PostgreSQL
Supabase is the primary database platform.
Use Supabase for:
•	PostgreSQL database
•	Database relationships
•	Authentication where appropriate
•	Storage
•	Row Level Security where applicable
•	Realtime features where needed
Laravel communicates with the Supabase PostgreSQL database.
Do not create a second unrelated production database.
Do not use:
JSON files
localStorage
hard-coded arrays
temporary mock databases
as the permanent data source.
Mock data may only be used temporarily during UI development.
________________________________________
6. ARCHITECTURE
Use this architecture:
                    NEXORA
                       │
          ┌────────────┴────────────┐
          │                         │
     WEB CLIENT                MOBILE CLIENT
       React                 React Native
          │                         │
          └────────────┬────────────┘
                       │
                     REST API
                       │
                    Laravel
                       │
       ┌───────────────┼────────────────┐
       │               │                │
   Controllers      Services       Policies
       │               │                │
       └───────────────┼────────────────┘
                       │
                  Supabase DB
                  PostgreSQL
                       │
                    Storage
The basic request flow should be:
User
 ↓
React / React Native
 ↓
API Request
 ↓
Laravel Route
 ↓
Controller
 ↓
Request Validation
 ↓
Authorization / Policy
 ↓
Service Layer
 ↓
Database
 ↓
Laravel Response
 ↓
Frontend
 ↓
UI Update
________________________________________
7. IMPORTANT ARCHITECTURE RULE
Do not put everything inside controllers.
Avoid:
Controller
    ↓
Huge database queries
    ↓
Business logic
    ↓
Calculations
    ↓
Notifications
Prefer:
Controller
    ↓
Validation
    ↓
Service
    ↓
Repository / Model
    ↓
Database
For example:
LessonController
LessonService
LessonPolicy
LessonRequest
LessonResource
Lesson Model
________________________________________
8. LARAVEL PROJECT STRUCTURE
Organize Laravel approximately as:
app/
├── Http/
│   ├── Controllers/
│   │   ├── Auth/
│   │   ├── Dashboard/
│   │   ├── Lessons/
│   │   ├── Competencies/
│   │   ├── Calendar/
│   │   ├── Assessments/
│   │   ├── Resources/
│   │   ├── Reports/
│   │   └── Admin/
│   │
│   ├── Requests/
│   └── Resources/
│
├── Models/
│
├── Services/
│   ├── LessonService.php
│   ├── CalendarService.php
│   ├── CompetencyService.php
│   ├── PacingService.php
│   ├── AlignmentService.php
│   ├── AssessmentService.php
│   └── ReportService.php
│
├── Policies/
│
└── Notifications/
The exact structure can be adjusted when implementation begins, but maintain clear separation of responsibilities.
________________________________________
9. API DESIGN
Laravel must expose organized REST API endpoints.
Example:
/api/auth/login
/api/auth/logout
/api/auth/me

/api/dashboard
/api/calendar
/api/calendar/events

/api/competencies
/api/competencies/{id}

/api/lessons
/api/lessons/{id}

/api/assessments
/api/assessments/{id}

/api/resources
/api/notifications

/api/pacing
/api/alignment

/api/reports
Use consistent response structures.
Example:
{
  "success": true,
  "message": "Lesson retrieved successfully.",
  "data": {}
}
For validation errors:
{
  "success": false,
  "message": "Validation failed.",
  "errors": {}
}
Do not expose raw database errors to users.
________________________________________
10. AUTHENTICATION
Implement secure authentication.
Users should be able to:
Register
Login
Logout
View Profile
Change Password
Reset Password
Authenticated requests must use secure authentication tokens/session handling appropriate to the chosen Laravel + React architecture.
Never store passwords as plain text.
________________________________________
11. USER ROLES
At minimum:
Teacher
Can:
•	Manage own lessons
•	Manage own lesson plans
•	View assigned competencies
•	Create assessments
•	Upload resources
•	Track pacing
•	Complete reflections
•	View own reports
•	Receive notifications
Curriculum Coordinator / Master Teacher
Can:
•	Review curriculum coverage
•	Review lessons
•	Review alignment
•	Monitor pacing
•	Review teacher submissions
•	Provide feedback
School Administrator
Can:
•	Manage teachers
•	Manage school calendar
•	Manage school year
•	Manage terms
•	Manage grades
•	Manage sections
•	Manage subjects
•	Manage curriculum data
•	View school-wide reports
System Administrator
Can:
•	Manage users
•	Manage roles
•	Manage permissions
•	Manage system configuration
•	Review audit logs
________________________________________
12. AUTHORIZATION
Do not rely only on hiding buttons.
Every protected operation must also be checked by Laravel authorization.
Example:
Teacher A
    ↓
Can edit
    ↓
Teacher A's lesson

Teacher A
    ↓
Cannot edit
    ↓
Teacher B's private lesson
Use:
Policies
Gates
Middleware
Database security
where appropriate.
________________________________________
13. SUPABASE DATABASE DESIGN
Create a relational PostgreSQL structure.
Minimum conceptual entities:
users
roles
schools
school_years
terms
grades
sections
subjects

curriculum_versions
competencies
standards

teacher_assignments
teacher_schedules

lessons
lesson_objectives
lesson_activities
lesson_resources
lesson_reflections

competency_mappings

assessments
assessment_competencies

calendar_events

resources

notifications

pacing_records

alignment_rules
alignment_results

recovery_plans

activity_logs
Use foreign keys and proper relationships.
Avoid unnecessary duplication.
________________________________________
14. CURRICULUM VERSIONING
Never permanently hard-code curriculum competencies.
Competencies must belong to a:
Curriculum Version
Example:
2026–2027
2027–2028
Historical lessons must remain associated with the curriculum version used when the lesson was created.
Updating the curriculum must not unexpectedly modify old lesson records.
________________________________________
15. SCHOOL YEAR
Administrators can create:
School Year
Start Date
End Date
Status
Example:
2026–2027
Only one school year should normally be marked as active unless the application intentionally supports multiple active planning contexts.
________________________________________
16. THREE-TERM STRUCTURE
NEXORA must support:
Term 1
Term 2
Term 3
Each term contains:
Start Date
End Date
Instructional Days
Calendar Events
Lessons
Assessments
Competencies
Do not hard-code term dates.
________________________________________
17. SCHOOL CALENDAR
The calendar must support:
•	Regular class
•	Holiday
•	Class suspension
•	Examination
•	Assessment
•	School activity
•	LAC session
•	Training
•	Seminar
•	Catch-up day
•	Remediation day
•	Enrichment day
•	Special event
•	Teacher activity
Each event should contain:
Title
Type
Date
Start Time
End Time
Description
Status
Created By
________________________________________
18. INSTRUCTIONAL DAY ENGINE
Calculate:
Available Instructional Days
based on actual calendar records.
Basic logic:
Calendar Period
    ↓
Remove weekends
    ↓
Remove holidays
    ↓
Remove suspensions
    ↓
Remove unavailable days
    ↓
Add approved catch-up days
    ↓
Actual Instructional Days
The dashboard, pacing monitor, and planning system should use this calculated value.
________________________________________
19. CLASS SUSPENSION ADJUSTMENT
When an authorized user creates a suspension:
September 24
Class Suspended
NEXORA should:
1.	Find affected lessons.
2.	Find affected assessments.
3.	Find affected competency mappings.
4.	Calculate schedule impact.
5.	Suggest possible adjustments.
6.	Notify affected teachers.
7.	Require teacher confirmation.
Never silently move lessons.
________________________________________
20. TEACHER DASHBOARD
The dashboard should show real data.
Primary sections:
Greeting
Current Teaching Context
Statistics
Today's Lesson
Upcoming Lessons
Upcoming Assessments
Pacing
Curriculum Coverage
Alignment
Recent Activity
Notifications
Quick Actions
Example:
Good morning, Teacher.

Grade 7 English
Term 1
Week 5
Day 3
________________________________________
21. DASHBOARD STATISTICS
Show:
Lessons Completed
Lessons Remaining
Upcoming Assessments
Curriculum Coverage
Alignment Confidence
Pacing Status
All numbers must be calculated from database records.
Never use fake static numbers in production.
________________________________________
22. TODAY'S LESSON
Automatically identify today's lesson based on:
Current Date
Teacher
Schedule
School Calendar
Lesson Records
Display:
Lesson Title
Competency
Grade
Subject
Section
Date
Status
Actions:
View
Edit
Mark Complete
Reflect
________________________________________
23. DAILY LESSON PLANNER
Create a multi-step lesson creation process.
Step 1
Grade
Section
Subject
Term
Teaching Date
Step 2
Select Competency
Step 3
Learning Objectives
Step 4
Content
Step 5
Learning Activities
Step 6
Assessment
Step 7
Learning Resources
Step 8
Teacher Reflection
Step 9
Review
Step 10
Alignment Check
Step 11
Save / Schedule
________________________________________
24. LESSON STATUS
Support:
Draft
Scheduled
In Progress
Completed
Missed
Rescheduled
Cancelled
Archived
________________________________________
25. AUTO-SAVE
Lesson drafts should be automatically saved.
Show:
Saved just now
If a user leaves unexpectedly:
Draft available
Continue editing?
Do not lose unfinished lesson plans.
________________________________________
26. COMPETENCY LIBRARY
The competency browser should follow:
Curriculum Version
↓
Grade
↓
Subject
↓
Term
↓
Learning Area
↓
Competency
Each competency should have:
Code
Description
Grade
Subject
Term
Curriculum Version
Learning Area
Status
________________________________________
27. COMPETENCY MAPPING
Allow teachers to map:
Competency
↓
Teaching Date
↓
Lesson
↓
Objective
↓
Activity
↓
Assessment
Show coverage visually.
________________________________________
28. COMPETENCY OVERLOAD DETECTION
If a competency is repeatedly scheduled:
⚠ Competency already scheduled multiple times.
Show existing lessons.
Do not automatically prevent repetition.
Teachers may intentionally repeat a competency for remediation or mastery.
________________________________________
29. LESSON CONTINUITY
After completing a lesson, the next lesson should be able to reference previous lesson information.
Example:
Previous Lesson:
Introduction to Expository Text

Previous Status:
Completed

Teacher Reflection:
Learners struggled with structure.

Suggested Planning Reminder:
Consider reviewing text structure.
The system must distinguish between:
Stored teacher reflection
and:
System-generated suggestion
Do not present generated suggestions as factual observations.
________________________________________
30. ASSESSMENT MODULE
Create:
Diagnostic
Formative
Performance
Written Work
Project
Quiz
Summative
Examination
Each assessment:
Title
Type
Date
Grade
Subject
Section
Competency
Duration
Total Items
Status
________________________________________
31. ASSESSMENT-COMPETENCY RELATIONSHIP
Assessments must be connected to competencies.
Example:
Assessment
    ↓
Competency A
Competency B
Competency C
This allows the system to calculate assessment coverage.
________________________________________
32. RESOURCE LIBRARY
Support:
PDF
DOCX
PPTX
Images
Videos
Links
Worksheets
Rubrics
Reference Materials
Use Supabase Storage for uploaded files.
Store file metadata in the database.
________________________________________
33. PACING MONITOR
The pacing module answers:
Are planned lessons being completed according to schedule?
Show:
Planned Lessons
Completed Lessons
Remaining Lessons
Expected Progress
Actual Progress
Difference
Example:
Planned: 32
Completed: 29
Remaining: 3
________________________________________
34. PACING CALCULATION
Basic completion:
Completed ÷ Planned × 100
Also calculate expected progress based on instructional days.
Possible statuses:
Ahead
On Track
Behind
At Risk
Thresholds must be configurable.
________________________________________
35. RECOVERY PLANNING
If lessons fall behind:
Pacing issue detected.
Show possible actions:
Create Catch-up Day
Reschedule Lesson
Move Assessment
Adjust Lesson Sequence
Keep Current Plan
Never automatically change the teacher's schedule without confirmation.
________________________________________
36. ALIGNMENT CHECKER
Create an Alignment module.
Check relationships among:
Competency
Objectives
Content
Activities
Assessment
Resources
Differentiation
Reflection
Example:
Competency       ✓
Objectives       ✓
Activities       ✓
Assessment       ⚠
Resources        ✓
Differentiation  ⚠
________________________________________
37. ALIGNMENT CONFIDENCE
Use:
Alignment Confidence
This is a system-generated planning indicator.
It must never be represented as:
Official DepEd certification
Official DepEd score
Official government evaluation
Suggested default ranges:
90–100%  Very Strong
75–89%   Strong
50–74%   Partial
0–49%    Weak
Make these thresholds configurable.
________________________________________
38. ALIGNMENT ENGINE
Create an AlignmentService.
Example weighted calculation:
Competency Match       20%
Objective Alignment    20%
Activity Alignment     20%
Assessment Alignment   20%
Resource Alignment     10%
Differentiation        10%
The exact weights must be stored as configuration data.
Do not hard-code the values inside React components.
Example:
Competency Match = 100
Objectives = 90
Activities = 95
Assessment = 80
Resources = 100
Differentiation = 70
The service calculates the final result.
Store:
Final Score
Component Scores
Rules Used
Date Calculated
Lesson ID
________________________________________
39. ALIGNMENT WARNINGS
Examples:
Assessment has no linked competency.

Objective has no matching activity.

Lesson has no assessment.

Lesson has no resource.

Differentiation section is empty.
Clicking a warning should take the user to the relevant section.
________________________________________
40. LEARNING EVIDENCE
Allow teachers to record evidence:
Quiz
Worksheet
Performance Task
Project
Presentation
Portfolio
Written Output
Observation
Connect evidence to:
Lesson
Competency
Assessment
Date
________________________________________
41. TEACHER REFLECTION
After a lesson:
What worked?

What did learners struggle with?

What should be adjusted?

What should be continued?
Save reflections as historical lesson data.
________________________________________
42. REPORTS
Generate:
Curriculum Coverage Report
Total Competencies
Covered
Partially Covered
Uncovered
Lesson Report
Planned
Completed
Missed
Rescheduled
Assessment Report
Assessments
Competency Coverage
Assessment Schedule
Pacing Report
Expected Progress
Actual Progress
Delayed Lessons
Recovery Plans
Alignment Report
Lessons Evaluated
Alignment Results
Warnings
________________________________________
43. NOTIFICATION SYSTEM
Generate notifications for:
Upcoming assessment
Calendar change
Class suspension
Missed lesson
Pacing issue
Unmapped competency
Recovery plan
Lesson reminder
The notification center must contain actual records.
________________________________________
44. AUDIT LOG
Track important actions:
User
Action
Entity
Entity ID
Timestamp
Old Value
New Value
IP / metadata where appropriate
Examples:
Teacher created lesson
Admin updated calendar
Teacher completed lesson
Coordinator reviewed lesson
Admin updated competency
Do not log unnecessary sensitive information.
________________________________________
45. SEARCH
Create global search.
Search across:
Lessons
Competencies
Assessments
Resources
Calendar
Reports
Results must link to real records.
________________________________________
46. WEB DESIGN
The web interface must be:
Modern
Minimalist
Professional
Responsive
Accessible
Fast
Clean
Use a modern education/SaaS visual language.
Avoid:
•	Excessive gradients
•	Overcrowded dashboards
•	Giant cards
•	Too many colors
•	Unnecessary animations
•	Tiny text
•	Excessive shadows
•	Complicated navigation
________________________________________
47. DESIGN HIERARCHY
Use:
Page Title
↓
Context
↓
Primary Action
↓
Important Information
↓
Secondary Information
↓
Details
The user should immediately understand:
Where am I?
What am I looking at?
What should I do next?
________________________________________
48. NEXORA BRANDING
Primary identity:
NEXORA
Suggested tagline:
Plan. Align. Teach.
Alternative:
From Curriculum to Classroom.
Use a professional academic-tech identity.
The logo should be simple and recognizable at:
Desktop
Tablet
Mobile
Favicon
________________________________________
49. REACT WEB STRUCTURE
Organize React approximately:
src/
├── components/
├── layouts/
├── pages/
├── features/
│   ├── dashboard/
│   ├── calendar/
│   ├── competencies/
│   ├── lessons/
│   ├── assessments/
│   ├── resources/
│   ├── pacing/
│   ├── alignment/
│   └── reports/
│
├── services/
│   └── api/
│
├── hooks/
├── contexts/
├── types/
├── utils/
└── routes/
Do not place the entire application in one component.
________________________________________
50. REACT NATIVE STRUCTURE
Use a clean feature-oriented structure:
app/
├── (auth)/
├── (tabs)/
│   ├── dashboard
│   ├── calendar
│   ├── lessons
│   ├── assessments
│   └── profile
│
├── lessons/
├── competencies/
├── notifications/
└── settings/
Use reusable components.
________________________________________
51. MOBILE-FIRST FUNCTIONS
React Native should prioritize:
Today's Lesson
Quick Lesson Update
Mark Complete
Add Reflection
View Calendar
View Competency
View Assessment
View Notifications
View Pacing
Allow teachers to perform common actions quickly.
________________________________________
52. RESPONSIVENESS
The web application must work on:
Desktop
Laptop
Tablet
Mobile Browser
The React Native application handles the dedicated mobile experience.
Do not simply shrink the desktop layout into a mobile screen.
________________________________________
53. ERROR HANDLING
Every API request must handle:
Loading
Success
Empty
Validation Error
Unauthorized
Forbidden
Not Found
Server Error
Network Error
Example:
Unable to load lessons.

Please check your connection and try again.
Do not display raw:
500 Internal Server Error
SQLSTATE...
to normal users.
________________________________________
54. FORM VALIDATION
Validate both:
Frontend
Backend
Backend validation is mandatory.
Example:
Lesson title is required.

Teaching date is required.

Competency must be selected.
________________________________________
55. LOADING STATES
Use:
Skeleton loaders
Loading indicators
Disabled submit buttons
Progress indicators
Avoid blank screens during API requests.
________________________________________
56. EMPTY STATES
Example:
No lessons planned yet.

Create your first lesson to begin building your teaching schedule.

[Create Lesson]
Every major list should have a useful empty state.
________________________________________
57. CONFIRMATION DIALOGS
Dangerous operations must require confirmation.
Example:
Delete Lesson?

This action cannot be easily undone.

[Cancel] [Delete]
For archive operations:
Archive Lesson?

The lesson will be removed from active planning
but retained in historical records.

[Cancel] [Archive]
________________________________________
58. DATA CONSISTENCY
When creating a lesson:
Lesson
↓
Competency Mapping
↓
Calendar
↓
Dashboard
↓
Pacing
↓
Alignment
When deleting or archiving:
Check dependencies first.
Do not create orphaned records.
Use database constraints and backend validation.
________________________________________
59. TRANSACTIONS
Use database transactions when multiple related records must be created or updated together.
Example:
Creating a lesson may involve:
Lesson
Objectives
Activities
Assessment Link
Competency Mapping
Activity Log
These should be handled safely so partial records are not left behind if something fails.
________________________________________
60. SECURITY
Implement:
Authentication
Authorization
Input validation
SQL injection protection
CSRF protection where applicable
Secure file uploads
File type validation
File size limits
Rate limiting
Secure API responses
Database security
Audit logging
Never expose:
Database passwords
Supabase service keys
Laravel secrets
Private API keys
inside React or React Native source code.
________________________________________
61. ENVIRONMENT VARIABLES
Use environment variables.
Example concept:
Laravel:
DATABASE_URL
SUPABASE_URL
SUPABASE_KEY
APP_KEY

React:
VITE_API_URL

React Native:
EXPO_PUBLIC_API_URL
Never commit real secrets to GitHub.
Create:
.env.example
instead.
________________________________________
62. API SECURITY
Never trust IDs received from the frontend.
For every request:
Authenticate
↓
Authorize
↓
Validate
↓
Process
Example:
PATCH /lessons/45
Laravel must verify that the authenticated user is actually authorized to modify lesson 45.
________________________________________
63. FILE STORAGE
Use Supabase Storage for:
Lesson files
Resources
Worksheets
Presentations
PDFs
Images
Database stores:
File name
Path
Type
Size
Uploaded by
Related lesson
Created date
Do not store large files directly inside PostgreSQL.
________________________________________
64. REAL-TIME FEATURES
Use realtime only where it provides real value.
Potential examples:
Notifications
Calendar updates
Lesson review status
Administrative updates
Do not add realtime functionality unnecessarily.
________________________________________
65. PERFORMANCE
Avoid:
Fetching entire database tables
Repeated API calls
Huge dashboard queries
Unnecessary realtime subscriptions
Unoptimized images
Use:
Pagination
Filtering
Search
Indexes
Caching where appropriate
Lazy loading
Selective queries
________________________________________
66. DATABASE INDEXING
Add indexes to frequently searched fields such as:
teacher_id
school_year_id
term_id
subject_id
grade_id
section_id
competency_id
teaching_date
status
Analyze query performance as the database grows.
________________________________________
67. TESTING
Create tests for important backend logic.
At minimum test:
Authentication
Authorization
Lesson creation
Lesson updating
Competency mapping
Calendar calculations
Instructional day calculation
Pacing calculation
Alignment calculation
Assessment linking
Notifications
Also test API validation.
________________________________________
68. FRONTEND TESTING
Test:
Forms
Navigation
API states
Empty states
Error states
Responsive behavior
Important user flows
________________________________________
69. CRITICAL USER FLOWS
The following flows must work from beginning to end.
Flow 1 — Teacher Login
Login
↓
Authentication
↓
Dashboard
Flow 2 — Create Lesson
Dashboard
↓
Create Lesson
↓
Select Class
↓
Select Competency
↓
Add Objectives
↓
Add Activities
↓
Add Assessment
↓
Alignment Check
↓
Save
↓
Lesson appears on Calendar
↓
Dashboard updates
Flow 3 — Complete Lesson
Today's Lesson
↓
Open Lesson
↓
Mark Complete
↓
Reflection
↓
Save
↓
Pacing updates
↓
Dashboard updates
↓
Activity log updates
Flow 4 — Class Suspension
Admin
↓
Calendar
↓
Mark Date Suspended
↓
Affected Lessons Detected
↓
Teacher Notification
↓
Suggested Adjustment
↓
Teacher Approves
↓
Schedule Updates
Flow 5 — Assessment
Teacher
↓
Create Assessment
↓
Select Competency
↓
Schedule Date
↓
Save
↓
Calendar Updates
↓
Dashboard Updates
↓
Notification Generated
________________________________________
70. ADMIN FLOW
Admin Login
↓
Admin Dashboard
↓
School Year
↓
Terms
↓
Calendar
↓
Curriculum Version
↓
Competencies
↓
Teachers
↓
Subjects
↓
Sections
↓
Reports
________________________________________
71. DATA FLOW EXAMPLE
A teacher creates:
Lesson:
Identifying Philosophical Ideas
The system stores:
Lesson
↓
Grade 7
↓
English
↓
Term 1
↓
Competency
↓
Teaching Date
↓
Objectives
↓
Activities
↓
Assessment
Then automatically:
Calendar
      ↓
Dashboard
      ↓
Pacing
      ↓
Alignment
      ↓
Reports
The teacher should not need to manually enter the same information repeatedly.
________________________________________
72. NO DUPLICATE SOURCE OF TRUTH
For example:
Do not separately store:
Dashboard Lesson Count
Calendar Lesson Count
Pacing Lesson Count
Instead:
LESSON DATABASE
      ↓
Dashboard Count
Calendar
Pacing
Reports
One source of truth.
________________________________________
73. ADMIN CONFIGURATION
Avoid hard-coding:
Terms
Subjects
Grades
Curriculum Versions
Alignment Weights
Pacing Thresholds
Calendar Dates
These should be configurable through the database/admin interface.
________________________________________
74. DEPED DATA
If curriculum information is imported from official DepEd materials, preserve:
Competency Code
Exact Competency Wording
Curriculum Version
Source
Source Date / Version
Do not invent official competency codes.
Do not label NEXORA's generated alignment score as an official DepEd evaluation.
________________________________________
75. AI FEATURES
AI functionality should be optional and clearly separated from official curriculum data.
Potential AI-assisted functions:
Lesson Draft Suggestions
Activity Suggestions
Objective Suggestions
Differentiation Suggestions
Lesson Continuity Suggestions
Reflection Summaries
AI-generated content must remain editable by teachers.
The system must never silently replace teacher-created content.
________________________________________
76. AI CONTENT LABELING
When AI generates a suggestion, display:
AI-generated suggestion
The teacher should be able to:
Accept
Edit
Reject
Regenerate
AI suggestions must not be presented as official DepEd requirements.
________________________________________
77. OBSIDIAN PROJECT DOCUMENTATION
Maintain the project documentation in Obsidian.
Recommended vault structure:
NEXORA/
│
├── 00 - Project Overview/
│   ├── Project Vision.md
│   ├── Goals.md
│   └── Scope.md
│
├── 01 - Requirements/
│   ├── Functional Requirements.md
│   ├── Non Functional Requirements.md
│   └── User Roles.md
│
├── 02 - Architecture/
│   ├── System Architecture.md
│   ├── API Architecture.md
│   └── Data Flow.md
│
├── 03 - Database/
│   ├── ERD.md
│   ├── Tables.md
│   ├── Relationships.md
│   └── RLS Policies.md
│
├── 04 - Modules/
│   ├── Dashboard.md
│   ├── Calendar.md
│   ├── Competencies.md
│   ├── Lessons.md
│   ├── Assessments.md
│   ├── Resources.md
│   ├── Pacing.md
│   ├── Alignment.md
│   └── Reports.md
│
├── 05 - API/
│   ├── Authentication.md
│   ├── Lessons API.md
│   ├── Calendar API.md
│   └── Reports API.md
│
├── 06 - Frontend/
│   ├── React.md
│   └── React Native.md
│
├── 07 - Laravel/
│   ├── Controllers.md
│   ├── Services.md
│   ├── Models.md
│   └── Policies.md
│
├── 08 - Testing/
│
└── 09 - Deployment/
________________________________________
78. CODE DOCUMENTATION
Every important module should have documentation explaining:
Purpose
Inputs
Outputs
Database tables
API endpoints
Business rules
Authorization
Dependencies
Known limitations
________________________________________
79. CODEx AI DEVELOPMENT RULE
When using Codex AI, do NOT ask it to build the entire application in one uncontrolled operation.
Implement NEXORA in phases.
________________________________________
80. DEVELOPMENT PHASES
PHASE 1 — FOUNDATION
Implement:
Laravel setup
React setup
React Native setup
Supabase connection
Environment configuration
Git repository
Authentication
Base layouts
Navigation
Do not build advanced features yet.
________________________________________
PHASE 2 — DATABASE
Implement:
Users
Roles
School
School Year
Terms
Grades
Sections
Subjects
Curriculum Versions
Competencies
Verify all relationships.
________________________________________
PHASE 3 — CALENDAR
Implement:
School Calendar
Terms
Events
Instructional Days
Suspensions
Calendar filtering
Test instructional-day calculations.
________________________________________
PHASE 4 — LESSON SYSTEM
Implement:
Lesson CRUD
Objectives
Activities
Resources
Reflection
Lesson status
Calendar integration
________________________________________
PHASE 5 — COMPETENCY MAPPING
Implement:
Competency mapping
Day mapping
Coverage
Duplicate warnings
Lesson relationship
________________________________________
PHASE 6 — ASSESSMENTS
Implement:
Assessment CRUD
Competency linking
Calendar integration
Assessment dashboard
________________________________________
PHASE 7 — PACING
Implement:
Planned lessons
Completed lessons
Expected progress
Actual progress
Pacing status
Recovery plans
________________________________________
PHASE 8 — ALIGNMENT
Implement:
Alignment rules
Component scoring
Alignment confidence
Warnings
Alignment reports
________________________________________
PHASE 9 — RESOURCES
Implement:
Supabase Storage
File upload
File metadata
Resource library
Lesson-resource linking
________________________________________
PHASE 10 — NOTIFICATIONS
Implement:
Notification records
Notification center
Read/unread status
Lesson reminders
Assessment reminders
Calendar notifications
Pacing warnings
________________________________________
PHASE 11 — REPORTS
Implement:
Curriculum reports
Lesson reports
Assessment reports
Pacing reports
Alignment reports
PDF export
CSV/Excel export
________________________________________
PHASE 12 — REACT NATIVE
Connect the mobile application to the same Laravel API.
Implement:
Authentication
Dashboard
Today's Lesson
Lessons
Calendar
Assessments
Notifications
Pacing
Reflection
Profile
________________________________________
PHASE 13 — SECURITY
Verify:
Authentication
Authorization
RLS
Policies
Validation
File security
Rate limits
API security
Secret management
________________________________________
PHASE 14 — TESTING
Test every major workflow.
Do not proceed to deployment while core CRUD operations are broken.
________________________________________
81. CODEX AI WORKING RULES
When modifying the project:
1.	Inspect the existing project before changing files.
2.	Do not overwrite working functionality unnecessarily.
3.	Reuse existing components and services.
4.	Follow the current architecture.
5.	Do not create duplicate systems.
6.	Check database relationships before modifying models.
7.	Check API contracts before changing frontend requests.
8.	Keep TypeScript types synchronized with API responses.
9.	Validate backend input.
10.	Test changed functionality.
11.	Explain important architectural changes.
12.	Do not fabricate missing data.
13.	Do not hard-code production data.
14.	Do not expose secrets.
15.	Do not mark a feature complete until it works end-to-end.
________________________________________
82. CODEX FEATURE IMPLEMENTATION FORMAT
For each feature, Codex should work using:
1. Inspect
2. Plan
3. Database
4. Backend
5. API
6. Frontend
7. Mobile
8. Validation
9. Testing
10. Documentation
Example:
FEATURE:
Lesson Creation

DATABASE:
Verify lessons table
Verify lesson objectives
Verify lesson activities

BACKEND:
LessonRequest
LessonController
LessonService
LessonPolicy

API:
POST /api/lessons

WEB:
CreateLessonPage

MOBILE:
CreateLessonScreen

TEST:
Create lesson
Validation
Authorization
Database persistence
Dashboard update
Calendar update
________________________________________
83. DEFINITION OF DONE
A feature is only considered complete when:
✓ Database works
✓ Backend works
✓ API works
✓ Web UI works
✓ Mobile UI works where applicable
✓ Validation works
✓ Authorization works
✓ Error handling works
✓ Loading states work
✓ Empty states work
✓ Data persists
✓ Related modules update
✓ Tests pass
✓ Documentation is updated
________________________________________
84. PRODUCTION QUALITY CHECK
Before declaring NEXORA complete, verify:
Authentication
✓ Login
✓ Logout
✓ Password handling
✓ Authorization
Calendar
✓ Terms
✓ Events
✓ Holidays
✓ Suspensions
✓ Instructional days
Curriculum
✓ Curriculum versions
✓ Competencies
✓ Mapping
✓ Coverage
Lessons
✓ Create
✓ Read
✓ Update
✓ Archive
✓ Complete
✓ Reflection
Assessments
✓ Create
✓ Schedule
✓ Link competency
✓ Display
Pacing
✓ Planned
✓ Completed
✓ Expected
✓ Actual
✓ Difference
✓ Recovery
Alignment
✓ Rules
✓ Calculation
✓ Explanation
✓ Warnings
Resources
✓ Upload
✓ Store
✓ Link
✓ Retrieve
Notifications
✓ Generate
✓ Display
✓ Read/unread
Reports
✓ Generate
✓ Filter
✓ Export
________________________________________
85. FINAL SYSTEM PRINCIPLE
NEXORA should not simply be a:
Lesson Plan Generator
It should function as an integrated:
Teacher Planning & Curriculum Management Platform
The central idea is:
PLAN
  ↓
ALIGN
  ↓
TEACH
  ↓
ASSESS
  ↓
REFLECT
  ↓
TRACK
  ↓
ADJUST
The teacher remains in control of the lesson plan.
NEXORA provides organization, calculations, reminders, connections, and planning assistance.
The system must never present automated planning or alignment calculations as official government certification.
________________________________________
86. FINAL TECHNOLOGY SUMMARY
PROJECT
NEXORA

WEB
React + TypeScript

MOBILE
React Native + Expo

BACKEND
Laravel

DATABASE
Supabase PostgreSQL

STORAGE
Supabase Storage

AUTHENTICATION
Laravel/Supabase-compatible authentication architecture

API
Laravel REST API

DOCUMENTATION
Obsidian

VERSION CONTROL
Git + GitHub

DEPLOYMENT
Web frontend + Laravel API + Supabase backend
________________________________________
87. FINAL DEVELOPMENT COMMAND FOR CODEX
When starting work on NEXORA, follow this instruction:
First inspect the existing repository and identify the current Laravel, React, React Native, and Supabase structure. Do not immediately rewrite the project. Compare the existing implementation against this NEXORA specification. Identify what already works, what is missing, what is incorrectly implemented, and what should be refactored. Then create a phased implementation plan. Implement one module at a time, beginning with the foundation and database architecture. After each module, verify database persistence, API functionality, frontend functionality, authorization, validation, error handling, and related-module synchronization before proceeding to the next module. Preserve working code whenever possible and avoid unnecessary rewrites.
________________________________________
NEXORA CORE IDENTITY
NEXORA
Plan. Align. Teach.
Curriculum
     ↓
Planning
     ↓
Teaching
     ↓
Assessment
     ↓
Evidence
     ↓
Progress
     ↓
Improvement
NEXORA should ultimately provide one connected environment where teachers can plan, execute, monitor, and improve their lessons while administrators can manage the underlying curriculum and school planning structure.

