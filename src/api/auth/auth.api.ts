import { apiClient } from "../client";
import { storeSession, clearSession, updateStoredUser } from "./auth.storage";
import type { LoginPayload, LoginResponse, RegisterPayload, AuthUser } from "./auth.types";

/**
 * Crée un compte utilisateur (POST /api/auth/register).
 * Ne stocke pas de session : l'utilisateur doit ensuite se connecter via `login()`.
 * Rejette avec un `ApiError` (status 409 si l'email est déjà utilisé).
 */
export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthUser>("/api/auth/register", payload);
  return data;
}

/**
 * Authentifie l'utilisateur (POST /api/auth/login) et persiste la session
 * (token + utilisateur) en localStorage pour les appels suivants.
 * Rejette avec un `ApiError` (status 401 si identifiants invalides).
 */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/api/auth/login", payload);
  storeSession(data.access_token, data.user);
  return data;
}

/**
 * Renvoie l'utilisateur courant déduit du token JWT (GET /api/auth/me).
 * Sert à vérifier que le token est toujours valide côté serveur (pas
 * seulement présent en localStorage) et à rafraîchir les infos en cache.
 */
export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>("/api/auth/me");
  updateStoredUser(data);
  return data;
}

/**
 * Déconnexion. Le JWT étant sans état, POST /api/auth/logout ne fait
 * qu'auditer/valider côté serveur que le token était encore actif — la
 * session locale est de toute façon effacée, même si l'appel échoue
 * (token déjà expiré, backend injoignable, etc).
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post("/api/auth/logout");
  } finally {
    clearSession();
  }
}
