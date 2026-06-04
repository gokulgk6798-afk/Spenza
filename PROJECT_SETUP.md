# Spenza - Project Setup Guide

---

# 1. Architecture

* Frontend: Expo + React Native + TypeScript
* Backend: Node.js + Express
* Database: MongoDB

---

# 2. Folder Structure

## Frontend (Expo)

frontend/
|-- App.tsx
|-- app.json
|-- package.json
`-- src/
    |-- api/
    |-- components/
    |-- constants/
    |-- context/
    |-- screens/
    `-- types/

The previous Flutter implementation is archived in:

frontend_flutter_legacy/

---

## Backend

backend/src/
|-- controllers/
|-- routes/
|-- models/
|-- services/
|-- utils/
|-- middleware/
|-- app.js
`-- server.js

---

# 3. Packages

## Expo Frontend

* expo
* react
* react-native
* react-native-web
* react-native-svg
* react-native-safe-area-context
* @expo/vector-icons
* expo-status-bar
* expo-asset
* expo-auth-session
* expo-web-browser
* expo-font
* typescript

---

## Backend

* express
* mongoose
* dotenv
* cors
* bcryptjs
* jsonwebtoken

---

# 4. Database Schema

## User

* id
* email
* displayName
* provider
* createdAt

---

## Transaction

* id
* userId
* amount
* type
* category
* vendor
* timestamp
* source
* rawText
* mergeCount

---

# 5. API Structure

* POST /auth/login
* POST /transactions/parse
* POST /transactions
* GET /transactions
* GET /dashboard
* GET /insights

---

# 6. Permissions Setup

The current Expo app keeps the UI ready for permission-driven features, but SMS and notification tracking should be implemented with Expo-compatible modules or an Expo development build.

Planned mobile capabilities:

* Notification access
* SMS parsing or import flow
* Voice input

---

# 7. Parsing Logic

Backend parsing detects:

* Amounts
* Transaction type
* Category keywords
* Vendor hints
* Source text

---

# 8. Deduplication

Backend deduplication checks:

* amount
* timestamp
* vendor
* category
* userId

---

# 9. Run Setup

## Backend

```bash
cd backend
npm install
npm run dev
```

## Frontend

```bash
cd frontend
npm install
$env:EXPO_PUBLIC_API_BASE_URL="http://localhost:4000"
npm start
```

Use `http://10.0.2.2:4000` instead of `http://localhost:4000` for Android emulator targets.

## Expo build

```bash
cd frontend
npm run typecheck
npm run build:android
```

The Android build command uses EAS profile `preview`, which is configured in `frontend/eas.json` to produce an internal APK. Before the first build on a machine or Expo account, run `npx eas login` and `npx eas init` from `frontend/`.

Local mock login:

* Email: `mock@spenza.local`
* Password: `Mock@1234`

---

# 10. Environment

Backend `.env`:

* DB_URL
* JWT_SECRET
* CLIENT_URL
* PORT

Frontend environment:

* EXPO_PUBLIC_API_BASE_URL
* EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
* EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
* EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID

---

# 11. Dev Workflow

* Feature-based frontend screens under `frontend/src/screens/`
* Shared app state under `frontend/src/context/`
* API-first backend contract
* Keep controllers thin and business logic in backend services/utilities
* Run `npm run typecheck` in `frontend/` before UI handoff
* Run `npm test` in `backend/` after backend logic changes

---

# 12. Future Ready

* Production Google OAuth client setup for Android/iOS builds
* AI-assisted parsing
* Bank integration
* Voice input
* Native SMS/notification listeners through a development build
