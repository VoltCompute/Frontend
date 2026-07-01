import type { AuthUser } from "./auth.types";

/**
 * Persistance de la session côté navigateur (localStorage).
 *
 * Clé `auth_token` conservée telle quelle : c'est elle que vérifie le garde
 * de route `_authenticated/route.tsx` pour autoriser l'accès aux pages privées.
 */
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

const isBrowser = () => typeof window !== "undefined";

export function getStoredToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/** Enregistre le token JWT et l'utilisateur après un login/register réussi. */
export function storeSession(token: string, user: AuthUser): void {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Rafraîchit l'utilisateur en cache (ex: après GET /me) sans toucher au token. */
export function updateStoredUser(user: AuthUser): void {
  if (!isBrowser()) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Efface la session (déconnexion ou token expiré/invalide). */
export function clearSession(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
