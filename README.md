# Mini Kanban Board

A full-stack, production-quality collaborative Kanban board application. Users can register, create boards, share them with other registered users, and manage columns and tasks — including moving tasks within and across columns with stable, gap-free ordering.

The project is split into two parts:

- **`backend/`** — a REST API built with NestJS, TypeScript, PostgreSQL, and Prisma.
- **`frontend/`** — a SaaS-style Next.js (App Router) client built against the backend's exact REST API contracts.

All authorization is enforced **server-side**. No endpoint trusts a client-supplied `ownerId`, `userId`, or `boardId` for access control — every check is resolved from the database.

---

## Tech stack

### Backend
- NestJS + TypeScript (strict mode)
- PostgreSQL + Prisma ORM
- JWT authentication (`@nestjs/jwt`, `passport-jwt`)
- `bcrypt` password hashing
- `class-validator` / `class-transformer` for DTO validation
- Swagger / OpenAPI (`@nestjs/swagger`)
- Jest + Supertest for unit and e2e tests
- Docker & Docker Compose

### Frontend
- Next.js 14 (App Router) + TypeScript (strict)
- Tailwind CSS with light/dark design tokens and semantic colors (success/warning/destructive/info)
- Radix UI primitives, hand-styled to a consistent shadcn-like system (Button, Dialog, DropdownMenu, Avatar, Tooltip, etc.)
- `@dnd-kit` for accessible drag-and-drop
- `react-icons` (Feather set) for iconography
- `sonner` for toasts
- No Redux — auth via React Context, everything else via small custom hooks

---

## Project structure

```
.
├── backend/
│   ├── src/
│   │   ├── auth/            # register, login, /auth/me, JWT strategy & guard
│   │   ├── users/            # shared user lookups, safe response mapping
│   │   ├── boards/            # board CRUD + BoardAccessService (authorization helper)
│   │   ├── board-members/    # board sharing (add/list/remove members)
│   │   ├── columns/          # column CRUD, auto position assignment
│   │   ├── tasks/             # task CRUD + the task-move algorithm
│   │   ├── prisma/            # PrismaService / PrismaModule
│   │   ├── common/            # guards, decorators, exception filter, shared types
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── test/                  # e2e tests (supertest against a real Postgres DB)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── .env.example
│
└── frontend/
    ├── app/
    │   ├── page.tsx                          # redirect based on auth state
    │   ├── login/page.tsx
    │   ├── register/page.tsx
    │   ├── dashboard/page.tsx                # board list
    │   └── boards/[boardId]/
    │       ├── page.tsx                      # the Kanban board
    │       └── settings/page.tsx             # board details + members
    ├── components/
    │   ├── auth/       # LoginForm, RegisterForm, PasswordInput, route guards
    │   ├── boards/     # BoardCard, BoardFormDialog, BoardHeader
    │   ├── kanban/     # KanbanBoard (DnD), KanbanColumn, TaskCard, Add*Button
    │   ├── tasks/      # TaskDialog (create/edit)
    │   ├── members/    # ShareDialog, AvatarStack
    │   ├── layout/     # Navbar, ThemeToggle
    │   └── ui/         # reusable primitives (Button, Dialog, DropdownMenu, ...)
    ├── lib/
    │   ├── api.ts               # centralized fetch client (JWT, error normalization, 401 handling)
    │   ├── auth.ts               # localStorage token access (only place that touches it)
    │   ├── auth-context.tsx      # AuthProvider - user/isLoading/isAuthenticated + actions
    │   ├── error.ts               # getErrorMessage(unknown) -> string
    │   ├── utils.ts                # cn(), getInitials(), formatRelativeTime()
    │   └── services/               # one file per backend module: auth/boards/members/columns/tasks
    ├── hooks/
    │   ├── useAuth.ts     # re-exports the auth context
    │   ├── useBoards.ts   # dashboard board list + CRUD
    │   ├── useBoard.ts    # single board: columns/tasks state + optimistic move
    │   ├── useMembers.ts  # board sharing state
    │   └── useTasks.ts    # generic isSubmitting/error wrapper used by task dialogs
    └── types/index.ts      # types mirroring the backend's exact response shapes
```

---

## Data model

| Model         | Notes                                                                 |
|---------------|------------------------------------------------------------------------|
| `User`        | `email` unique, `passwordHash` never returned by the API              |
| `Board`       | one `ownerId`, cascades to columns/members on delete                   |
| `BoardMember` | `@@unique([boardId, userId])`, `role` is `OWNER` \| `MEMBER`           |
| `Column`      | belongs to a board, `position` is a contiguous zero-based integer      |
| `Task`        | belongs to a column, `position` is a contiguous zero-based integer     |

Indexes: `User.email`, `Board.ownerId`, `BoardMember.boardId`, `BoardMember.userId`, `Column(boardId, position)`, `Task(columnId, position)`.

---

## Getting started

### 1. Prerequisites
- Node.js 20+
- PostgreSQL 14+ (or use the provided Docker Compose setup)

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env if your local Postgres credentials differ

npx prisma migrate dev      # creates the schema
npx prisma generate         # generates the Prisma Client (also runs automatically after install)
npm run prisma:seed         # optional: seeds sample users/boards/columns/tasks

npm run start:dev
```

The API listens on `http://localhost:3000` by default. Interactive API docs are at:

```
http://localhost:3000/api/docs
```

#### Running the backend with Docker

```bash
cd backend
docker compose up --build
```

This starts PostgreSQL and the API together. The API container runs `prisma migrate deploy` automatically on startup before booting the server.

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm run dev
```

The app runs at `http://localhost:3000` by default. Make sure the backend is running and `NEXT_PUBLIC_API_URL` points at it — if the backend also runs on port 3000, change one of the two ports.

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint (next/core-web-vitals)
```

### Seeded accounts

Running `npm run prisma:seed` (in `backend/`) creates:

| Email                        | Role                                   | Password      |
|-------------------------------|-----------------------------------------|---------------|
| `alice.owner@example.com`    | Owns both seeded boards                 | `Password123` |
| `bob.member@example.com`     | Member of "Product Roadmap"             | `Password123` |
| `carol.member@example.com`   | Member of "Product Roadmap"             | `Password123` |
| `dave.outsider@example.com`  | No access to any seeded board (for testing 403s) | `Password123` |

---

## API overview

All protected routes require `Authorization: Bearer <accessToken>`.

### Auth
| Method | Path             | Description                     |
|--------|------------------|----------------------------------|
| POST   | `/auth/register` | Create an account                |
| POST   | `/auth/login`    | Log in, receive a JWT            |
| GET    | `/auth/me`       | Get the current user (protected) |

### Boards
| Method | Path              | Description                                  |
|--------|-------------------|-----------------------------------------------|
| POST   | `/boards`          | Create a board (creator becomes OWNER)       |
| GET    | `/boards`          | List boards you own or are a member of (includes `taskCount` per board) |
| GET    | `/boards/:boardId` | Get a board with its columns and tasks       |
| PATCH  | `/boards/:boardId` | Update a board (owner only)                  |
| DELETE | `/boards/:boardId` | Delete a board (owner only)                  |

### Board sharing
| Method | Path                                | Description                            |
|--------|--------------------------------------|------------------------------------------|
| POST   | `/boards/:boardId/members`           | Add a registered user by email (owner only) |
| GET    | `/boards/:boardId/members`           | List members of a board                |
| DELETE | `/boards/:boardId/members/:userId`   | Remove a member (owner only, cannot remove the owner) |

### Columns
| Method | Path                         | Description                              |
|--------|-------------------------------|--------------------------------------------|
| POST   | `/boards/:boardId/columns`    | Create a column (position auto-assigned)  |
| GET    | `/boards/:boardId/columns`    | List columns (with tasks) on a board      |
| PATCH  | `/columns/:columnId`          | Rename and/or reposition a column         |
| DELETE | `/columns/:columnId`          | Delete a column and its tasks             |

### Tasks
| Method | Path                          | Description                             |
|--------|--------------------------------|--------------------------------------------|
| POST   | `/columns/:columnId/tasks`    | Create a task (position auto-assigned)    |
| GET    | `/columns/:columnId/tasks`    | List tasks in a column                    |
| GET    | `/tasks/:taskId`               | Get a single task                         |
| PATCH  | `/tasks/:taskId`               | Update a task's title/description         |
| DELETE | `/tasks/:taskId`               | Delete a task                             |
| PATCH  | `/tasks/:taskId/move`          | Move a task within or across columns      |

**Move request body:**
```json
{
  "targetColumnId": "b3f1a2c4-9d3e-4b1a-8f2e-7a6c5d4e3f21",
  "position": 1
}
```

### How the frontend maps to the API

| Frontend action              | Backend endpoint                          |
|-------------------------------|---------------------------------------------|
| Register / Login / Me         | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| List / create / update / delete board | `GET/POST /boards`, `PATCH/DELETE /boards/:boardId` |
| Share / list / remove member   | `POST/GET /boards/:boardId/members`, `DELETE /boards/:boardId/members/:userId` |
| Create / list columns          | `POST/GET /boards/:boardId/columns`         |
| Rename / reposition / delete column | `PATCH/DELETE /columns/:columnId`      |
| Create / list tasks             | `POST/GET /columns/:columnId/tasks`        |
| Update / delete task            | `PATCH/DELETE /tasks/:taskId`               |
| **Move task**                    | `PATCH /tasks/:taskId/move` — `{ targetColumnId, position }` |

---

## Authorization model

`BoardAccessService` (`backend/src/boards/board-access.service.ts`) is the single, reusable source of truth for access control:

- `assertAccess(boardId, userId)` — throws `404` if the board doesn't exist, `403` if the user is neither the owner nor a member.
- `assertOwner(boardId, userId)` — throws `403` unless the user owns the board. Used for board update/delete and member management.
- `assertColumnAccess(columnId, userId)` — resolves the column's board **from the database** (never trusts a client-supplied `boardId`) and delegates to `assertAccess`.
- `assertTaskAccess(taskId, userId)` — resolves the task's column and board from the database and delegates to `assertAccess`.

Every columns/tasks/move endpoint resolves ownership this way, so a user cannot access or mutate resources on a board they don't belong to, even if they know a valid UUID.

---

## Task ordering & the move algorithm

Positions are plain, contiguous, zero-based integers per column (`Task`) or per board (`Column`). `TasksService.move` (`backend/src/tasks/tasks.service.ts`) implements the move inside a single `prisma.$transaction`:

1. Load the task and confirm the caller has access to its board (via `BoardAccessService`).
2. Load the target column and verify it belongs to the **same board** as the source column — cross-board moves are rejected with `403`.
3. Clamp the requested position into the valid range for the destination column (so an out-of-range position lands on the last valid slot instead of erroring).
4. **Same column:** shift the tasks strictly between the old and new position by ±1, then set the task's new position.
5. **Different column:** close the gap in the source column (`position > oldPosition → decrement`), open a slot in the target column (`position >= newPosition → increment`), then move the task (new `columnId` + `position`).

All updates happen atomically — if any step fails, the whole move rolls back and ordering is never left inconsistent. Deleting a task/column also re-compacts the remaining positions inside a transaction so there are never any gaps.

### Frontend drag-and-drop & optimistic UI

`useBoard(boardId)` owns the columns/tasks state for the board page. `moveTask(taskId, sourceColumnId, targetColumnId, targetIndex)`:

1. Snapshots the current columns state.
2. Applies the move to local state **immediately** (same shift-and-insert logic as the backend, so the UI never has to guess).
3. Calls `PATCH /tasks/:taskId/move`.
4. On failure, restores the snapshot and rethrows so the caller can show an error toast.

`KanbanBoard.tsx` wires `@dnd-kit`'s `DndContext` to resolve the source/target column and index from the drop target, then calls `moveTask`. Every `TaskCard` also exposes a **"Move to [column]"** menu item as a non-drag alternative, so moving a task never depends on drag-and-drop alone (keyboard/screen-reader users can still move cards).

---

## Authentication (frontend)

The JWT is stored in `localStorage` behind a single module (`lib/auth.ts`) — no component reads or writes it directly. `AuthProvider` (`lib/auth-context.tsx`):

- Bootstraps by calling `GET /auth/me` with any stored token to restore the session.
- Exposes `login`, `register`, `logout`, `user`, `isAuthenticated`, `isLoading`.
- Listens for a `kanban:unauthorized` event, dispatched by `lib/api.ts` whenever the backend returns `401`, to clear the session and redirect to `/login` from anywhere in the app.

`RequireAuth` / `RequireGuest` wrap pages to enforce `/dashboard` and `/boards/*` being auth-only, and `/login` / `/register` redirecting away when already authenticated.

---

## Validation & error handling

**Backend:**
- A global `ValidationPipe` runs with `whitelist: true`, `forbidNonWhitelisted: true`, and `transform: true` — unexpected fields (like a client-supplied `ownerId`) are rejected outright.
- `ParseUUIDPipe` validates all `:id` route params.
- A global `AllExceptionsFilter` normalizes every error into `{ statusCode, message, path, timestamp }` and maps common Prisma errors (`P2002` unique violation → `409`, `P2025` not found → `404`) without leaking internals.

**Frontend:**
- The API client normalizes every backend error into a single readable string via `getErrorMessage()`.
- Dashboard and board pages show skeleton placeholders (`BoardGridSkeleton`, `KanbanBoardSkeleton`) instead of blank screens.
- `EmptyState` covers "no boards yet" and "no tasks yet".
- `ErrorState` covers failed fetches with a retry action; toasts (`sonner`) cover action-level success/failure (create/update/delete/move/share), deliberately not spamming a toast for every read.

---

## Responsive design & dark mode

- The Kanban board scrolls horizontally (`overflow-x-auto`) with a fixed minimum column width (`w-72`) rather than squeezing columns.
- The dashboard grid reflows from 1 to 3 columns by breakpoint.
- Dark mode is implemented via CSS variables + a `dark` class on `<html>`, toggled by `ThemeToggle` (persisted to `localStorage`, respects `prefers-color-scheme` on first visit, and is applied before hydration via an inline script to avoid a flash).

---

## Accessibility

- All interactive icon-only controls have `aria-label`s.
- Dialogs and dropdown menus are built on Radix primitives (focus trapping, `Escape` to close, ARIA roles handled for you).
- Visible focus rings (`focus-visible:ring-2`) on all interactive elements.
- Drag-and-drop has a non-drag alternative (see above).

---

## Testing (backend)

```bash
npm test              # unit tests (mocked Prisma, no DB required)
npm run test:e2e       # integration tests against a real Postgres database
```

The e2e suite (`test/*.e2e-spec.ts`) requires `DATABASE_URL` to point at a running, migrated Postgres database (it cleans relevant tables before each test). It covers:

- **Auth:** register, duplicate email, login, wrong password, protected route access
- **Authorization:** owner access, member access, unauthenticated requests, cross-board access blocked on boards/columns/tasks/move
- **Boards:** create (rejecting a client-supplied `ownerId`), list, update, delete
- **Sharing:** add/list/remove members, duplicate-member rejection, non-owner blocked from managing members, owner cannot be removed
- **Tasks:** create, update, delete, contiguous re-numbering after delete
- **Movement:** same-column (front/middle/last/position-0), cross-column, into an empty column, out-of-range position clamping, cross-board rejection

Unit tests (`src/**/*.spec.ts`) cover `BoardAccessService` and the `TasksService.move` algorithm in isolation with a mocked `PrismaService`.

---

## Environment variables

### Backend (`backend/.env`)

| Variable         | Description                                  |
|-------------------|------------------------------------------------|
| `DATABASE_URL`    | PostgreSQL connection string                  |
| `JWT_SECRET`      | Secret used to sign JWTs                       |
| `JWT_EXPIRES_IN`  | Token lifetime (e.g. `1d`, `12h`)              |
| `PORT`             | HTTP port (default `3000`)                     |

See `backend/.env.example`.

### Frontend (`frontend/.env.local`)

| Variable                | Description                                       |
|--------------------------|-----------------------------------------------------|
| `NEXT_PUBLIC_API_URL`    | Base URL of the backend API                         |

See `frontend/.env.example`.
