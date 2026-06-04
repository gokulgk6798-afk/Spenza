import * as AuthSession from "expo-auth-session";

type GoogleProfile = {
  email: string;
  name?: string;
};

const googleDiscovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke"
};

const googleClientId =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export async function signInWithGoogle(): Promise<GoogleProfile> {
  if (!googleClientId) {
    throw new Error(
      "Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID. Add your Google OAuth client ID and restart Expo."
    );
  }

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "spenza",
    preferLocalhost: true
  });

  const request = new AuthSession.AuthRequest({
    clientId: googleClientId,
    redirectUri,
    responseType: AuthSession.ResponseType.Token,
    scopes: ["openid", "profile", "email"],
    extraParams: {
      prompt: "select_account"
    }
  });

  const result = await request.promptAsync(googleDiscovery);

  if (result.type !== "success" || !result.params.access_token) {
    throw new Error("Google sign-in was cancelled.");
  }

  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${result.params.access_token}`
    }
  });

  if (!profileResponse.ok) {
    throw new Error("Unable to read Google profile.");
  }

  const profile = (await profileResponse.json()) as GoogleProfile;
  if (!profile.email) {
    throw new Error("Google profile did not include an email address.");
  }

  return profile;
}
