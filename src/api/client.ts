import axios, { AxiosError } from "axios";
import { getStoredToken, clearSession } from "./auth/auth.storage";
import type { ApiError } from "./types";

/**
 * URL de base du backend, injectée à la compilation par Vite depuis le .env
 * (VITE_API_URL). Ne jamais coder l'URL du backend en dur dans le code.
 */
const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  // Erreur de configuration explicite plutôt qu'un échec silencieux des appels API.
  throw new Error("VITE_API_URL est manquant. Définissez-le dans bright-dark-mode-app/.env");
}

/**
 * Instance axios partagée par tous les services d'API du front.
 * Pas de Content-Type par défaut ici : axios met "application/json" tout
 * seul pour les objets JS, et laisse le navigateur poser le bon en-tête
 * multipart/boundary pour les FormData (upload de fichiers) — un en-tête
 * forcé en dur casserait silencieusement ces uploads.
 */
export const apiClient = axios.create({ baseURL });

// Joint automatiquement le JWT (s'il existe) à chaque requête sortante.
apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * FastAPI renvoie `detail` comme une simple chaîne pour les HTTPException,
 * mais comme un tableau d'objets {type, loc, msg, input} pour les erreurs
 * de validation Pydantic (422) — il faut gérer les deux formes pour ne
 * jamais tenter d'afficher un objet brut dans l'UI.
 */
function extractErrorMessage(detail: unknown, fallback: string): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d) => (d && typeof d === "object" && "msg" in d ? String(d.msg) : JSON.stringify(d)))
      .join(" · ");
  }
  return fallback;
}

// Normalise les erreurs axios en `ApiError` (message lisible + statut HTTP)
// et déconnecte l'utilisateur si le token n'est plus valide (401).
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: unknown }>) => {
    const status = error.response?.status;

    if (status === 401) {
      clearSession();
    }

    const apiError: ApiError = {
      status: status ?? 0,
      message: extractErrorMessage(
        error.response?.data?.detail,
        error.message || "Erreur réseau inconnue.",
      ),
    };
    return Promise.reject(apiError);
  },
);
