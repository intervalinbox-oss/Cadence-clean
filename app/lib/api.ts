import { auth } from "./firebase";

const API_BASE_URL = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL || "";

/**
 * Validate that API base URL is configured
 */
function validateApiUrl(): void {
  if (!API_BASE_URL || API_BASE_URL.trim() === "") {
    throw new Error(
      "API base URL is not configured. Please set NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL environment variable. " +
      "This should be your deployed Firebase Functions URL (e.g., https://us-central1-your-project.cloudfunctions.net/api)"
    );
  }
  
  // Validate URL format
  try {
    new URL(API_BASE_URL);
  } catch {
    throw new Error(
      `Invalid API base URL format: ${API_BASE_URL}. Please ensure NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL is a valid URL.`
    );
  }
}

/**
 * Get the current user's auth token for API requests.
 * Uses forceRefresh: true so the backend always gets a valid token.
 */
async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    return await user.getIdToken(true);
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
}

/**
 * Make an authenticated API request to Firebase Functions
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Validate API URL is configured
  try {
    validateApiUrl();
  } catch (error: any) {
    throw error;
  }
  
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error("Not authenticated");
  }

  // From the browser, use same-origin proxy to avoid CORS with Firebase Functions
  const baseUrl =
    typeof window !== "undefined" ? "/api/proxy" : API_BASE_URL;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${path}`;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Firebase-ID-Token": token,
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkError) {
    const message =
      networkError instanceof Error ? networkError.message : String(networkError);
    throw new Error(
      "Could not reach the API. Make sure Firebase Functions are deployed (firebase deploy --only functions) and NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL in .env.local is correct. " +
        (message ? `(${message})` : "")
    );
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    const backendMsg = typeof (error as { message?: string }).message === "string" ? (error as { message: string }).message : "";
    const msg = error.error || `API request failed: ${response.statusText}`;
    const fullMsg = backendMsg ? `${msg} (backend: ${backendMsg})` : msg;
    const indexUrl = backendMsg;
    const err = new Error(fullMsg) as Error & { indexUrl?: string };
    if (indexUrl && indexUrl.includes("firebase.google.com") && indexUrl.includes("indexes")) err.indexUrl = indexUrl;
    throw err;
  }

  const result = await response.json();
  return result;
}

/**
 * Generate communication content using Claude
 */
export async function generateContent(inputs: any, rulesResult: any) {
  return apiRequest<{
    output: {
      recommendation: string;
      meetingAgenda?: string;
      emailDraft?: string;
      asyncMessage?: string;
    };
  }>("/generate", {
    method: "POST",
    body: JSON.stringify({ inputs, rulesResult }),
  });
}

/**
 * Save decision to Firestore
 */
export async function saveDecision(decisionData: any, timeSavedMinutes: number) {
  return apiRequest<{ success: boolean; id: string }>("/save", {
    method: "POST",
    body: JSON.stringify({ decisionData, timeSavedMinutes }),
  });
}

/**
 * Export apiRequest for use in other components
 */
export { apiRequest };
