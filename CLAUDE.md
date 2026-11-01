# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Two separate npm packages, no root package.json. Run `npm install` in both `client/` and `server/`.

Client (`client/`, React 18 + Vite):
- `npm run dev` — Vite dev server on http://localhost:5173
- `npm run build` — production build to `client/dist`
- `npm run lint` — ESLint, fails on any warning (`--max-warnings 0`)
- `npm run preview` — serve the production build locally

Server (`server/`, Express + Mongoose):
- `npm run dev` — nodemon
- `npm start` — `node server.js`

No test framework is configured in either package.

## Environment

Client `.env` (baked in at Vite build time, so a redeploy is needed after changing it):
- `VITE_API_URL` — bare server origin, no path, no trailing slash. `services/api.js` appends `/api` itself.

Server `.env`:
- `PORT` (defaults to 5000), `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (CORS origin, e.g. `http://localhost:5173`), `API_KEY` (Google Generative AI), `COOKIE_DOMAIN` (production only).

## Deployment

- Client is deployed to Vercel; server is deployed to Render with the `server/` folder as the root directory (`render.yaml` is at the repo root but the live service runs from `server/`).
- Render's working directory is `server/`, so `path.resolve()` in `server.js` is `server/`, not the repo root.
- `main` and `master` branches both exist on origin; `main` is the default and they have historically been kept identical.

## Architecture

Monorepo-style layout: `client/` (SPA) and `server/` (JSON API). They only talk over HTTP; nothing is shared.

**Auth flow (cookie-based JWT):**
- Login sets an `httpOnly` cookie named `token` (`authController.login`); in production it is `secure`, `sameSite: None`, scoped to `COOKIE_DOMAIN`.
- `server/src/middleware/auth.js` reads that cookie, verifies the JWT, and sets `req.userId`. `projectRoutes` applies it to every route; `authRoutes` only on `/me`.
- Client axios instance (`client/src/services/api.js`) uses `withCredentials: true` so the cookie is sent cross-origin. `handleUnauthorized` installs an interceptor that calls `logout` on any 401.
- `useAuth` hook holds `user`/`loading` and calls `/auth/me` on mount; it is exposed app-wide through `AuthContext` (`useAuthContext()`). `PrivateRoute` gates `/dashboard` and `/project/*`.

**Server layering:** `routes → controllers → services → models`. Controllers only unpack `req` and call `next(error)`; services throw subclasses of `AppError` from `src/utils/errors.js` (`BadRequestError`, `UnauthorizedError`, `NotFoundError`). `errorHandler` turns any error into `{ status, statusCode, message }`; non-`AppError` errors become 500. The client reads `error.response.data.statusCode` for 401 handling.

**Exception to the layering:** `src/routes/aiRoutes.js` calls Gemini (`gemini-1.5-flash`, JSON response mode) directly from the route and returns its own error shape (`{ error, details }`), not the `errorHandler` shape.

**Core domain:** a `Project` belongs to a `User` via `userId` and stores `name`, `description`, `language`, a free-form `classStructure` object, and generated `code`. The client `ProjectPage` edits the class structure with the `ClassStructure` component (tree of classes, members, methods) and `CodeEditor` (Monaco/CodeMirror), persisting via `PUT /api/projects/:id`. `ClassStructure` calls `POST /api/ai/suggest` to have Gemini fill in a C++ method body.

**Styling:** plain CSS per component/page (`style.css` next to each `index.jsx`, shared rules in `pages/CommonStyles`). Tailwind was removed; `AGENT.md` and `README.md` still mention it and are stale on that point.

**Server routing order in `server.js` matters:** API routers are mounted first, then a `HEAD *` handler, then static/catch-all handlers. Anything added after the catch-all `app.get("*")` will never see GET requests.
