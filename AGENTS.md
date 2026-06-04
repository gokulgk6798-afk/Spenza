# Repository Guidelines

## Project Structure & Module Organization
Spenza is a monorepo with an Express/MongoDB API and a Flutter client.

- `backend/src/` contains API entry points, routes, controllers, services, models, middleware, and utilities.
- `backend/tests/` contains Node service tests.
- `frontend/lib/` contains the Flutter app. Feature code lives in `features/<area>/data` and `features/<area>/presentation`; shared code lives in `core/`, `models/`, `services/`, and `widgets/`.
- `frontend/android/`, `frontend/macos/`, and `frontend/windows/` contain platform runners.
- `frontend/build/`, `node_modules/`, logs, and mock browser folders are generated artifacts.

## Build, Test, and Development Commands
Run commands from the relevant package directory.

- `cd backend && npm run dev`: start the API with Node watch mode.
- `cd backend && npm start`: run the API normally from `src/server.js`.
- `cd backend && npm test`: run the Node test suite with `node --test`.
- `cd frontend && flutter pub get`: install Flutter dependencies.
- `cd frontend && flutter analyze`: run Dart static analysis using `flutter_lints`.
- `cd frontend && flutter test`: run Flutter tests.
- `cd frontend && flutter run --dart-define=API_BASE_URL=http://localhost:4000`: run the app for desktop/web. Use `http://10.0.2.2:4000` for Android emulator targets.

## Coding Style & Naming Conventions
Backend code uses CommonJS JavaScript, two-space indentation, semicolons, and role-based filenames such as `transactions.controller.js` and `dashboard.service.js`. Keep request handling in controllers and business rules in services or utilities.

Flutter code follows `flutter_lints`. Use `snake_case.dart` filenames, `PascalCase` classes/widgets, and `lowerCamelCase` members. Keep Riverpod state and repository logic under feature `data/` folders and UI under `presentation/`.

## Testing Guidelines
Backend tests use the built-in Node test runner. Name tests `*.test.js` and place them in `backend/tests/`. Add service tests when parsing, deduplication, auth, dashboard, or insight rules change.

Flutter tests should live in `frontend/test/` with `*_test.dart` names. Run `flutter analyze` before `flutter test` for UI changes.

## Commit & Pull Request Guidelines
This workspace does not include Git history, so follow concise conventional commit-style subjects such as `feat: add insights summary` or `fix: reject duplicate transactions`. Keep each commit scoped to one behavior change.

Pull requests should include a short problem statement, change summary, test results, linked issues when available, and screenshots or recordings for visible Flutter UI changes. Note any new environment variables or platform setup steps.

## Security & Configuration Tips
Copy `backend/.env.example` to `backend/.env` and set `DB_URL` and `JWT_SECRET` locally. Do not commit secrets, local logs, generated builds, or dependency folders.
