import { readFileSync } from "fs";
import { join } from "path";

export function getFirebaseApiKey(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    process.env.FIREBASE_API_KEY ||
    "";
  if (fromEnv) return fromEnv;
  try {
    const configPath = join(process.cwd(), "public", "firebase-config.json");
    const raw = readFileSync(configPath, "utf-8");
    const config = JSON.parse(raw) as { apiKey?: string };
    return config.apiKey || "";
  } catch {
    return "";
  }
}
