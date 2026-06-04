# Spenza

Spenza is a chat-first financial tracking app built as a simple monorepo:

- `backend/` contains an Express + MongoDB API with auth, transaction parsing, deduplication, dashboard summaries, insights, and financial safety rules.
- `frontend/` contains an Expo + React Native app with auth, dashboard, transactions, chat-based entry, and insights screens.
- `frontend_flutter_legacy/` contains the previous Flutter implementation for reference.

## Backend setup

1. Copy `backend/.env.example` to `backend/.env`
2. Set `DB_URL` and `JWT_SECRET`
3. Run `npm install`
4. Run `npm run dev`

## Frontend setup

1. Install Node.js
2. Run `npm install` inside `frontend/`
3. Start the app with:

```bash
$env:EXPO_PUBLIC_API_BASE_URL="http://10.0.2.2:4000"
npm start
```

Use `http://localhost:4000` for desktop/web targets instead of the Android emulator host.

## API contract

- `POST /auth/login`
- `POST /transactions/parse`
- `POST /transactions`
- `GET /transactions`
- `GET /dashboard`
- `GET /insights`

## Notes

- Google login is still visible in the Expo UI, but Expo AuthSession/provider configuration is required before running it on a real device.
- Google login uses Expo AuthSession. Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` before starting the frontend.
- SMS and notification tracking should be revisited with Expo-compatible native modules or a development build.
