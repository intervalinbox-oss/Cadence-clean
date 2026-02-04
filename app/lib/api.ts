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
 * Get the current user's auth token for API requests
 */
async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken();
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

  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `API request failed: ${response.statusText}`);
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
