# Mini Kanban Board — Frontend

A modern, SaaS-style Kanban board frontend built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**, built against the Mini Kanban Board NestJS backend's exact REST API contracts.

## Tech stack

- Next.js 14 (App Router) + TypeScript (strict)
- Tailwind CSS with light/dark design tokens and semantic colors (success/warning/destructive/info)
- Radix UI primitives, hand-styled to a consistent shadcn-like system (Button, Dialog, DropdownMenu, Avatar, Tooltip, etc.)
- `@dnd-kit` for accessible drag-and-drop
- `react-icons` (Feather set) for iconography
- `sonner` for toasts
- No Redux — auth via React Context, everything else via small custom hooks

## Getting started

```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm run dev
```

The app runs at `http://localhost:3000` by default. Make sure the backend is running (see the backend's own README) and `NEXT_PUBLIC_API_URL` points at it — if the backend also runs on port 3000, change one of the two ports.

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint (next/core-web-vitals)
```

## Project structure

```
app/
├── page.tsx                          # redirect based on auth state
├── login/page.tsx
├── register/page.tsx
├── dashboard/page.tsx                # board list
└── boards/[boardId]/
    ├── page.tsx                      # the Kanban board
    └── settings/page.tsx             # board details + members

components/
├── auth/       # LoginForm, RegisterForm, PasswordInput, route guards
├── boards/     # BoardCard, BoardFormDialog, BoardHeader
├── kanban/     # KanbanBoard (DnD), KanbanColumn, TaskCard, Add*Button
├── tasks/      # TaskDialog (create/edit)
├── members/    # ShareDialog, AvatarStack
├── layout/     # Navbar, ThemeToggle
└── ui/         # reusable primitives (Button, Dialog, DropdownMenu, ...)

lib/
├── api.ts               # centralized fetch client (JWT, error normalization, 401 handling)
├── auth.ts               # localStorage token access (only place that touches it)
├── auth-context.tsx      # AuthProvider - user/isLoading/isAuthenticated + actions
├── error.ts               # getErrorMessage(unknown) -> string
├── utils.ts                # cn(), getInitials(), formatRelativeTime()
└── services/               # one file per backend module: auth/boards/members/columns/tasks

hooks/
├── useAuth.ts     # re-exports the auth context
├── useBoards.ts   # dashboard board list + CRUD
├── useBoard.ts    # single board: columns/tasks state + optimistic move
├── useMembers.ts  # board sharing state
└── useTasks.ts    # generic isSubmitting/error wrapper used by task dialogs

types/index.ts      # types mirroring the backend's exact response shapes
```

## How this maps to the backend API

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

One small backend addition was made to support the dashboard: `GET /boards` now also returns a `taskCount` per board (previously only `_count.columns`/`_count.members` were available), since the assessment's dashboard mock explicitly shows a task count per board card.

## Authentication

The JWT is stored in `localStorage` behind a single module (`lib/auth.ts`) — no component reads or writes it directly. `AuthProvider` (`lib/auth-context.tsx`):

- Bootstraps by calling `GET /auth/me` with any stored token to restore the session.
- Exposes `login`, `register`, `logout`, `user`, `isAuthenticated`, `isLoading`.
- Listens for a `kanban:unauthorized` event, dispatched by `lib/api.ts` whenever the backend returns `401`, to clear the session and redirect to `/login` from anywhere in the app.

`RequireAuth` / `RequireGuest` wrap pages to enforce `/dashboard` and `/boards/*` being auth-only, and `/login` / `/register` redirecting away when already authenticated.

## Drag-and-drop & optimistic UI

`useBoard(boardId)` owns the columns/tasks state for the board page. `moveTask(taskId, sourceColumnId, targetColumnId, targetIndex)`:

1. Snapshots the current columns state.
2. Applies the move to local state **immediately** (same shift-and-insert logic as the backend, so the UI never has to guess).
3. Calls `PATCH /tasks/:taskId/move`.
4. On failure, restores the snapshot and rethrows so the caller can show an error toast.

`KanbanBoard.tsx` wires `@dnd-kit`'s `DndContext` to resolve the source/target column and index from the drop target, then calls `moveTask`. Every `TaskCard` also exposes a **"Move to [column]"** menu item as a non-drag alternative, so moving a task never depends on drag-and-drop alone (keyboard/screen-reader users can still move cards).

## Loading, empty, and error states

- Dashboard and board pages show skeleton placeholders (`BoardGridSkeleton`, `KanbanBoardSkeleton`) instead of blank screens.
- `EmptyState` covers "no boards yet" and "no tasks yet".
- `ErrorState` covers failed fetches with a retry action; toasts (`sonner`) cover action-level success/failure (create/update/delete/move/share), deliberately not spamming a toast for every read.
- The API client normalizes every backend error (`{statusCode, message, path, timestamp}`) into a single readable string via `getErrorMessage()`.

## Responsive design & dark mode

- The Kanban board scrolls horizontally (`overflow-x-auto`) with a fixed minimum column width (`w-72`) rather than squeezing columns — per the assessment's explicit guidance.
- The dashboard grid reflows from 1 to 3 columns by breakpoint.
- Dark mode is implemented via CSS variables + a `dark` class on `<html>`, toggled by `ThemeToggle` (persisted to `localStorage`, respects `prefers-color-scheme` on first visit, and is applied before hydration via an inline script to avoid a flash).

## Accessibility

- All interactive icon-only controls have `aria-label`s.
- Dialogs and dropdown menus are built on Radix primitives (focus trapping, `Escape` to close, ARIA roles handled for you).
- Visible focus rings (`focus-visible:ring-2`) on all interactive elements.
- Drag-and-drop has a non-drag alternative (see above).
