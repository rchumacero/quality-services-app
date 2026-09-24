PROMPTS IA:

######### 1 ######### Create project structure
Create a monorepo for a full-stack application with the following requirements:

## Tooling
- Package manager: pnpm with workspaces
- Task orchestration: Turborepo
- Language: TypeScript everywhere (strict mode)

## Structure

apps/
  web/       -> Frontend
  api/       -> Backend

packages/
  types/     -> Shared TypeScript types/interfaces/DTOs used by both web and api
  config/    -> Shared configs (eslint, tsconfig base, tailwind base)
  utils/     -> Shared utility functions/constants

supabase/
  migrations/
  config.toml

## Frontend (apps/web)
- NextJs + TypeScript (Vite as bundler)
- Tailwind CSS with daisyUI plugin configured
- React Router for client-side routing
- Folder structure inside src/: features/, routes/, components/, hooks/, lib/ (for API client / supabase client)
- Import shared types from packages/types

## Backend (apps/api)
- NestJS + TypeScript
- Modular structure: src/modules/<feature>/ with controller, service, module, dto per feature
- src/common/ for guards, interceptors, filters, pipes
- Supabase client integration (as a NestJS provider/module, using @supabase/supabase-js)
- Import shared types from packages/types
- Environment variables handled via @nestjs/config

## Supabase should be displayed local with docker

## Root level
- package.json with workspaces config
- pnpm-workspace.yaml
- turbo.json with pipelines for dev, build, lint, test
- tsconfig.base.json extended by each app/package
- .env.example at root and per app if needed
- .gitignore appropriate for node, pnpm, turbo, build artifacts, and .env files
- README.md explaining how to install dependencies, run dev mode for both apps concurrently, and run builds

## Deliverable
Generate the folder/file skeleton first (empty or minimal placeholder files), explain the reasoning behind the structure briefly, and then we will fill in the implementation feature by feature.

Do not implement business logic yet — focus only on scaffolding the monorepo, workspace configuration, and the base setup for React+Tailwind+daisyUI+React Router on the frontend and NestJS+Supabase on the backend.

## Follow git-workflow rule
The public repository is: https://github.com/rchumacero/quality-services-app

######### 2 ######### Create backend

Based on the attached Entity-Relationship diagram, generate the complete file structure and clean, production-ready TypeScript code to implement a fully functional REST API using NestJS.

Please include:
1. All necessary Entities and DTOs (with validation decorators).
2. Modules, Controllers, and Services for each domain model, handling standard CRUD operations and relationships shown in the diagram.
3. The complete project file tree structure using the standard NestJS modular architecture.

Focus on best practices, dependency injection, and proper TypeScript types.

And, for every entity add this audit fields: @Column(name = "created_at", nullable = false, updatable = false)
private LocalDateTime createdAt;

@Column(name = "created_by", length = 100, updatable = false)
private String createdBy;

@Column(name = "updated_at")
private LocalDateTime updatedAt;

@Column(name = "updated_by", length = 100)
private String updatedBy;

@Column(name = "status", length = 50)
private String status;

######### 3 ######### Review comments in PR

Check pending comments on active pull request, apply the requested fixes and update de PR with a new push

######### 4 ######### Create readme

Create a `README` with a brief and precise explanation of how to set up and run the project.

######### 5 ######### Frontend login, main interface

now let's work in frontend. Create login interface and main interface based on attached images. Implement logic to opne first login, when user logedd in redirect to main interface. We implement a fake login, I mean don't call and external endpoint, just request for user and password and when press login allow to enter into system

######### 6 ######### test data

now let's generate test data in SQL file for migrations:
- brand: IBM, NVIDIA, APPLE
- user: (juan, role: specialist), (carla, role: specialist), (miguel, role: team_lead), (lorena, role: team_lead)
- user_brand: (juan->IBM, NVIDIA), (carla->NVIDIA, APPLE), (miguel->IBM, APPLE), (lorena->NVIDIA)
- reply: Generate 6 and 8 replies for Juan and Carla, respectively, using only the brands assigned to each of them. The replies should be random and represent responses to customer complaints related to product defects or issues. Some cases may involve unfounded complaints or problems caused by improper use of the product. Randomly distribute different response styles: some with a certain degree of disrespect, others overly verbose or taking too long to get to the point, others well-written, direct, and professional, and some with a condescending tone.

######### 7 #########

create functional interface for 'Evaluation' opened when user click in menu 'Evaluation'.  First list of 'replies' should be displayed just to look, we have to left join with tevaluation. Display data for Replies and evaluation data. We have to add three filters: tag_errors (tevaluation.tag_error plus 'Pending' option to query replies without Evaluation) brand (tbrand) and created_by (treplies.created_by), three should be multiselect and between filters we have to apply 'AND' in database. Also create form of Evaluation. Use real endpoints.


######### 8 ######### Menu grants

we have to work again in menu and it's access. First, add option 'Dashboard' at the top of the menu and should be selected after user was logged and load main interface. Then, we have to create a static method (or facke) to validate who users can see anoption menu by role in backend. Create new endpoint with this rules: role specialist just see 'Dashboard' and 'Replies', team_lead could see 'Dashboard' and 'Replies', admin could see all. Finally, when this endpoint it's ready, apply this login when user try to login and load just options that has granted

