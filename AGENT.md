# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# App runs inside Docker — do NOT use local CLI commands (ng build, npm start, etc.)
docker compose up --build   # build and start
docker compose up           # start without rebuilding
```

## Architecture

**Angular 20 standalone-first, zoneless** — no NgModules anywhere. All components use `standalone: true` with explicit imports. Change detection is `OnPush` everywhere. `provideZonelessChangeDetection()` is set in `app.config.ts`.

### Structure

```
src/app/
├── pages/
│   ├── login/
│   ├── register/
│   ├── boards/
│   └── board-detail/       — kanban board view (columns + task cards + add-column form)
├── shared/
│   ├── components/
│   │   ├── header/         — top navigation bar
│   │   ├── shell/          — authenticated layout wrapper (header + sidebar + router-outlet)
│   │   └── sidebar/        — collapsible sidebar with My Tasks, Boards, Goals sections
│   ├── guards/
│   │   └── auth.guard.ts   — CanActivateFn, redirects to /login if not authenticated
│   ├── interceptors/
│   │   └── auth.interceptor.ts  — attaches Bearer token; retries once after token refresh on 401
│   ├── models/             — DTOs mirroring backend API contracts
│   ├── services/
│   │   ├── AuthService.ts
│   │   ├── BoardService.ts
│   │   ├── ColumnService.ts    — createColumn, deleteColumn
│   │   ├── TaskService.ts
│   │   └── SidebarStateService.ts  — collapsed signal shared between shell and sidebar
│   └── utils/
│       └── swal.ts         — themed SweetAlert2 wrapper (swal.success / swal.error)
├── app.routes.ts
└── app.config.ts
```

### Routing

```
/           → redirectTo: login
/login      → LoginComponent
/register   → RegisterComponent
/           → ShellComponent (canActivate: authGuard)   ← all protected routes live here
  boards         → BoardsComponent (lazy)
  boards/:id     → BoardDetailComponent (lazy)
  (empty)        → redirectTo: boards
```

`ShellComponent` owns the persistent header + sidebar. Public pages (login, register) render without any shell.

### Authentication

JWT pair flow: login → `{ accessToken, refreshToken }` → stored in `localStorage` as `access_token` / `refresh_token`.

- **`AuthService`** — `saveToken`, `getToken`, `getRefreshToken`, `logout`, `decodeToken`, `getClaims`, `isLoggedIn` (checks `exp` claim, not just token presence), `getUserName`, `getUserEmail`, `getUserId`.
- **`authInterceptor`** — attaches `Authorization: Bearer <accessToken>` to every request. On 401, attempts one silent refresh via `POST /api/v1/auth/refresh`; on success retries the original request; on failure clears tokens and redirects to `/login`.
- **`authGuard`** — calls `authService.isLoggedIn()` (validates token expiry); redirects to `/login` if false.

### Backend

Proxied through Nginx at `/api/v1/` in Docker. No environment files — base URLs are hardcoded in each service as `/api/v1/<resource>`.

| Endpoint | Description |
|---|---|
| `POST /api/v1/auth/register` | RegisterRequest → 201 |
| `POST /api/v1/auth/login` | LoginRequest → LoginResponse |
| `POST /api/v1/auth/refresh` | RefreshRequest → RefreshResponse |
| `GET /api/v1/boards` | → BoardSummaryResponse[] |
| `POST /api/v1/boards` | CreateBoardRequest → BoardSummaryResponse |
| `GET /api/v1/boards/{id}` | → BoardResponse (includes columns + tasks) |
| `POST /api/v1/boards/{boardId}/columns` | BoardColumnCreateRequest → BoardColumnResponse |
| `DELETE /api/v1/boards/{boardId}/columns/{columnId}` | → 204 |
| `GET /api/v1/tasks/me` | → TaskResponse[] (current user's tasks) |

### Models

All DTOs in `src/app/shared/models/`:

| File | Key types |
|---|---|
| `auth.model.ts` | `LoginRequest`, `LoginResponse`, `RefreshRequest`, `RefreshResponse`, `RegisterRequest`, `UserDTO`, `JwtClaims` |
| `user.model.ts` | `SimpleUser` |
| `board.model.ts` | `BoardResponse`, `BoardSummaryResponse`, `CreateBoardRequest` |
| `board-column.model.ts` | `BoardColumnResponse`, `BoardColumnCreateRequest` |
| `task.model.ts` | `TaskResponse`, `CreateTaskRequest`, `MoveTaskRequest` |

### UI Conventions

- **Dialogs** — always use `swal.success(title, text)` / `swal.error(title, text)` from `src/app/shared/utils/swal.ts`. Never call `Swal.fire()` directly.
- **Forms** — `ReactiveFormsModule` everywhere, no template-driven forms.
- **Color palette** — dark navy/slate theme (Catppuccin Mocha-inspired). Key tokens:
  - Page bg: `#13131f` · Surface: `#1e1e2e` · Elevated: `#181825`
  - Primary text: `#cdd6f4` · Secondary: `#a6adc8` · Muted: `#45475a`
  - Accent gradient: `linear-gradient(135deg, #89b4fa 0%, #b4befe 100%)`
  - Danger: `#f38ba8` · Border: `rgba(255,255,255,0.06–0.08)`
- **Sidebar state** — inject `SidebarStateService` to read `collapsed()` signal or call `toggle()`.
