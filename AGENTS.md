# Repository Guidelines

## Project Structure & Module Organization
Spenza is a monorepo with an Express/MongoDB API and an Expo React Native client.

- `backend/src/` contains API entry points, routes, controllers, services, models, middleware, and utilities.
- `backend/tests/` contains Node service tests.
- `frontend/` contains the active Expo app. Screen code lives in `frontend/src/screens/`; shared API, state, UI, constants, hooks, and types live under `frontend/src/`.
- `frontend_flutter_legacy/` contains the archived Flutter implementation for reference only.
- `frontend/android/`, `frontend/ios/`, `frontend/.expo/`, generated builds, `node_modules/`, logs, and mock browser folders are generated artifacts.

## Build, Test, and Development Commands
Run commands from the relevant package directory.

- `cd backend && npm run dev`: start the API with Node watch mode.
- `cd backend && npm start`: run the API normally from `src/server.js`.
- `cd backend && npm test`: run the Node test suite with `node --test`.
- `cd frontend && npm install`: install Expo dependencies.
- `cd frontend && npm start`: start Expo Metro for device, emulator, or web preview.
- `cd frontend && npm run android`: start Expo for an Android emulator or connected device.
- `cd frontend && npm run web`: start the Expo web preview.
- `cd frontend && npm run typecheck`: run TypeScript checks.
- `cd frontend && npm run build:android`: start an EAS preview Android APK build.

## Coding Style & Naming Conventions
Backend code uses CommonJS JavaScript, two-space indentation, semicolons, and role-based filenames such as `transactions.controller.js` and `dashboard.service.js`. Keep request handling in controllers and business rules in services or utilities.

Expo frontend code uses TypeScript, React function components, and existing `frontend/src/` organization. Use `PascalCase` for components/screens, `lowerCamelCase` for functions and values, and keep screen-level UI in `src/screens/` with shared primitives in `src/components/`.

## Testing Guidelines
Backend tests use the built-in Node test runner. Name tests `*.test.js` and place them in `backend/tests/`. Add service tests when parsing, deduplication, auth, dashboard, or insight rules change.

Frontend checks currently use TypeScript. Run `npm run typecheck` in `frontend/` before UI handoff. Add focused React Native tests under `frontend/src/` or `frontend/test/` when UI logic becomes complex.

## Commit & Pull Request Guidelines
This workspace does not include Git history, so follow concise conventional commit-style subjects such as `feat: add insights summary` or `fix: reject duplicate transactions`. Keep each commit scoped to one behavior change.

Pull requests should include a short problem statement, change summary, test results, linked issues when available, and screenshots or recordings for visible Expo UI changes. Note any new environment variables or platform setup steps.

## Security & Configuration Tips
Copy `backend/.env.example` to `backend/.env` and set `DB_URL` and `JWT_SECRET` locally. Do not commit secrets, local logs, generated builds, or dependency folders.
