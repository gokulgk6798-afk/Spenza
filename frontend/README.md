# Spenza Expo Frontend

This folder is now the active Expo + React Native client for Spenza.

## Setup

```bash
npm install
npm start
```

Set the API URL with Expo's public env convention:

```bash
$env:EXPO_PUBLIC_API_BASE_URL="http://localhost:4000"
npm start
```

Use `http://10.0.2.2:4000` for Android emulator targets.

## Local Mock Login

The Expo app keeps the previous local mock login:

- Email: `mock@spenza.local`
- Password: `Mock@1234`

## Google Sign-In

Create a Google OAuth client in Google Cloud Console, add the redirect URI shown by Expo during auth setup, and expose the client ID before starting the app:

```bash
$env:EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID="your-google-web-client-id.apps.googleusercontent.com"
npm start
```

Optional platform-specific env vars are also supported:

- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

The frontend reads the Google profile and sends `provider: "google"` to the existing backend `/auth/login` endpoint.

## Notes

- The Express/MongoDB backend API contract is unchanged.
- The former Flutter implementation has been archived at `../frontend_flutter_legacy/`.
- Google sign-in uses Expo AuthSession and requires a Google OAuth client ID.
