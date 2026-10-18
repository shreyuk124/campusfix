# CampusFix

### A Campus Issue Reporting and Resolution Platform

CampusFix is a web-based platform designed to simplify how students report campus problems and how college authorities manage and resolve them. From broken classroom equipment and Wi-Fi connectivity issues to water leakage and infrastructure problems, CampusFix aims to make campus maintenance more transparent, organised, and accountable.

**Project Status:** In Development — Initial Planning and Repository Setup

---

## Problem Statement

Campus maintenance issues can be difficult to report and track when there is no centralised system. Students may not know whom to contact, authorities may struggle to prioritise complaints, and reporters may have no convenient way to check the progress of an issue.

CampusFix aims to address these challenges through a centralised platform where issues can be reported, assigned, tracked, and resolved through a structured workflow.

## Objectives

- Provide students with a simple way to report campus issues.
- Give college authorities a centralised view of reported problems.
- Enable maintenance staff to manage assigned tasks and update their progress.
- Improve transparency by allowing students to track the status of their reports.
- Maintain a record of issues and their resolution history.

## Planned Features

### Student Portal

- Submit campus issues with a title, description, category, and location.
- View submitted reports and their current status.
- Track progress from submission to resolution.
- View issue updates and resolution notes.

### Authority Portal

- View and manage reported campus issues.
- Review issues and set priorities.
- Assign issues to maintenance staff.
- Update issue status and monitor resolution progress.
- View basic issue statistics and summaries.

### Maintenance Staff Portal

- View assigned maintenance tasks.
- Track task details and priorities.
- Update task status as work progresses.
- Add resolution notes when completing a task.

*These features describe the planned scope and have not necessarily been implemented.*

## Intended Workflow

1. **Report:** A student submits a campus issue.
2. **Review:** An authorised college representative reviews the report.
3. **Assign:** The issue is assigned to an appropriate maintenance staff member.
4. **Resolve:** Staff work on the issue and update its status.
5. **Track:** The student can view the latest status and resolution details.

**Planned status flow:**

`Reported → Assigned → In Progress → Resolved`

## Planned Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React | Building the user interface |
| Development Tooling | Vite | Running and bundling the frontend |
| Styling | Tailwind CSS | Creating a responsive interface |
| Backend | Node.js | Running server-side JavaScript |
| API Framework | Express.js | Handling API requests and business logic |
| Database | MongoDB | Storing users, issues, and related records |
| Database Integration | Mongoose | Defining schemas and interacting with MongoDB |
| Version Control | Git and GitHub | Tracking changes and collaboration |
| Development Assistance | Cursor | AI-assisted coding, debugging, and code explanation |

*The technology stack is proposed and will be finalised by the team before implementation.*

## High-Level Architecture

CampusFix is planned as a client-server application.

```text
        STUDENTS / AUTHORITIES / STAFF
                       |
                       v
              React Frontend
             (Vite + Tailwind CSS)
                       |
                 HTTP / REST API
                       |
                       v
              Node.js + Express
          Authentication and Business Logic
                       |
                       v
                 MongoDB Atlas
              Persistent Data Storage
```

The backend will validate incoming requests, enforce role-based permissions, manage issue workflows, and interact with the database. The frontend will display the appropriate information and actions for each user role.

## User Roles

| Role | Responsibility |
|---|---|
| Student | Report issues and track submitted reports |
| Authority / Admin | Review reports, prioritise issues, and assign staff |
| Maintenance Staff | Handle assigned tasks and update their progress |

Access to actions and data will be controlled by the user's role.

## Development Roadmap

- [x] Create the initial GitHub repository.
- [ ] Finalise product requirements and the minimum viable product (MVP).
- [ ] Finalise the architecture, database design, and API contract.
- [ ] Set up the frontend and backend projects.
- [ ] Implement authentication and role-based access.
- [ ] Implement issue reporting and database storage.
- [ ] Implement issue management, assignment, and status tracking.
- [ ] Integrate the frontend and backend.
- [ ] Test the end-to-end workflow.
- [ ] Deploy the application and prepare a working demonstration.

## Getting Started

CampusFix is currently in its planning and initial setup stage. Installation instructions, environment configuration, and development commands will be added once the application scaffold is ready.

### Prerequisites (Planned)

- Node.js and npm
- Git
- A MongoDB database, such as MongoDB Atlas
- A code editor such as Cursor or VS Code

Do not configure production credentials or commit database passwords or API secrets to GitHub.

## Team Collaboration

CampusFix is being developed collaboratively by a four-member student team.

The team intends to use Git and GitHub for version control, feature branches for individual tasks, and pull requests for code review and integration.

Team members will review changes, test their contributions, and document important implementation decisions to keep the project maintainable and understandable.

## Security Considerations

- Validate user input on the server.
- Enforce authentication and role-based authorisation on protected endpoints.
- Keep secrets and environment variables out of version control.
- Prevent users from modifying issues or assignments without the required permissions.

These protections will be implemented and tested as development progresses.

## Project Vision

CampusFix aims to make campus issue resolution more organised, transparent, and accountable by connecting students, college authorities, and maintenance staff through one centralised platform.

---

**CampusFix — Report it. Track it. Resolve it.**
