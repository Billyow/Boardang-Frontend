# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at localhost:4200
ng build           # Production build
ng test            # Unit tests with Karma
ng generate component src/app/pages/<name>/<name>  # New standalone component
```

## Architecture

**Angular 20 standalone-first** — no NgModules anywhere. All components use `standalone: true` with explicit imports.

### Structure

- `src/app/pages/` — Feature pages (login, register, search-user)
- `src/app/shared/models/` — DTOs mirroring backend API contracts
- `src/app/shared/services/` — Injectable services (AuthService, UserService)
- `src/app/app.routes.ts` — All route definitions
- `src/app/app.config.ts` — App-level providers (`provideHttpClient`, `provideRouter`)

### Authentication

JWT flow: user logs in → backend returns `{ token, tokenType, expiresIn }` → stored in localStorage under keys `auth_token`, `token_type`, `expires_in`.

`AuthService` (`src/app/shared/services/AuthService.ts`) owns token persistence (`saveToken`, `getToken`, `logout`).

**No HTTP interceptor exists yet** — JWT is not automatically attached to outgoing requests. When implementing protected endpoints, add an interceptor to inject the `Authorization: Bearer <token>` header.

**No route guards exist yet** — protected routes (e.g. `/boards`) are not guarded. Add a `CanActivate` guard that checks `AuthService.getToken()`.

### Backend

Base URL: `http://localhost:8080` (hardcoded in each service — no environment files).

- `POST /auth/register` — RegisterRequest → void
- `POST /auth/login` — LoginRequest → LoginResponse

### Models

All DTOs are in `src/app/shared/models/`:

| File | Key types |
|---|---|
| `auth.model.ts` | `LoginRequest`, `LoginResponse`, `RegisterRequest`, `UserDTO` |
| `user.model.ts` | `SimpleUser` |
| `board.model.ts` | `BoardResponse`, `BoardSummaryResponse`, `CreateBoardRequest` |
| `board-column.model.ts` | `BoardColumnResponse`, `BoardColumnCreateRequest` |
| `task.model.ts` | `TaskResponse`, `CreateTaskRequest`, `MoveTaskRequest` |

### UI

SweetAlert2 (`swal`) is used for user-facing dialogs (e.g. error toasts on login failure). Reactive forms (`ReactiveFormsModule`) are used for all forms — no template-driven forms.
