# Skill: NestJS Backend Architecture

Apply these rules strictly when developing or modifying backend modules, controllers, or services in NestJS:

1. **Modular Structure:**
   - Keep code strictly organized by feature modules (Controller, Service, Module, DTOs, Entities). Avoid monolithic or unorganized files.
2. **DTOs and Validation:**
   - Every incoming request payload must be validated using DTO classes with `class-validator` and `class-transform` decorators.
   - Do not accept raw `any` objects in controller parameters.
3. **Business Logic & Dependency Injection:**
   - Keep controllers thin. They should only handle HTTP routing and delegate business logic entirely to injectable services.
   - Handle errors cleanly using NestJS built-in exceptions (`HttpException`, `NotFoundException`, etc.) and global filters.