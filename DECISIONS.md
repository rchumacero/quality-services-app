# Progress Report – Customer Response Evaluation System

## Product

I think the real problem here is that we can't quantify how good a job the customer support specialists are doing, so it's hard to be objective about whether things are actually improving in the field. One really important piece is nailing down the KPIs that'll let us see the health of the processes.

The first thing we did was define a data structure solid enough to collect the main info about **Response Evaluations**. We set aside the first part — the info about the Replies sent to customer support requests — and we're also leaving all the information security stuff for later. It matters, but it wasn't really the point of this proposal.

The understanding is that Response Evaluations are the most valuable (and operationally expensive) part, given the volume of data involved. So it could be a good move to use an AI model combined with an LLM to do an initial weighting/scoring of all the responses, which Team Leaders could then review on significant samples.

For v2, we'd need a clear definition of the KPIs so we know exactly what info we need to collect.

---

## Architecture

The app is set up as a **modular monorepo** with two main modules: **Frontend** (web) and **Backend** (REST API).

- **Frontend:** SPA built with **React 18**, **Vite**, **TypeScript**, and **TailwindCSS**, with access control and dynamic navigation based on roles.
- **Backend:** REST API built with **NestJS** and **TypeScript**, handling business logic, permission validation, and database communication.
- **Persistence:** **PostgreSQL** (managed with **TypeORM** and **Supabase**), ensuring data isolation and multi-level security via native **Row-Level Security (RLS)** policies evaluated by role and user context.

This architecture was chosen to keep presentation and business logic separated, mainly to close off security gaps.

### Security

To get an MVP out for evaluation tracking, login and permission checks are currently **hardcoded**. First recommendation is to integrate an OIDC tool or similar (e.g. Zitadel, or Supabase's own), which would mean handling JWTs to validate security properly. The backend should be validating the JWT. An API Gateway could be a good option, but at this stage things should stay simple so we can ship the final product quickly.

### Data Model

The data model is shown in the image below:

![Data model](ER_diagram.png)

We implemented real RLS in Supabase to keep user data isolated, so people can only access info they're actually allowed to see.

---

## AI

*(still pending)*

---

## Status

The app currently has these sections:

| Module | Description | Status |
|---|---|---|
| Admin → Brands | Interface for managing Brands in the app, Admin role only | ❌ Not implemented |
| Admin → Users | Interface for managing users, role assignment, and brand assignment | ❌ Not implemented |
| Replies | Interface to view replies sent to customers (in real life, this data would come from another system) | ✅ Implemented |
| Evaluations | Interface for evaluating replies sent to customers. Lets registered users evaluate the responses specialists send to customers | ✅ Implemented |
| Dashboard | Interface for viewing KPIs (metrics) | ❌ Not implemented |

### Things not covered yet

- API Gateway for frontend-backend communication
- Real JWT authentication
- Defining protected endpoints
- Soft deletes at the database level
- Login and permissions are hardcoded
- Structured role/profile management

### Notes

- None of the branches created were deleted after PR approval and merge — kept for traceability
- Assuming Team Leaders oversee all specialists under the brands assigned to them