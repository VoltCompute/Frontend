# VoltCompute

Plateforme de calcul décentralisé permettant de louer ou monétiser de la puissance GPU/CPU, avec paiement en Satoshis via le Lightning Network. Frontend branché sur l'API backend FastAPI (voir `../backend`).

## Stack technique

- **Framework** : [TanStack Start](https://tanstack.com/start) (React 19 + SSR)
- **Routing** : TanStack Router (file-based)
- **HTTP** : axios (client centralisé dans `src/api/client.ts`)
- **Styles** : Tailwind CSS v4
- **UI** : Radix UI + composants personnalisés
- **Build** : Vite 8

## Prérequis

Le backend VoltCompute (FastAPI) doit tourner en parallèle — voir `backend/README.md`. Sans lui, aucune page authentifiée ne fonctionnera (marketplace vide, connexion impossible, etc).

## Lancer le projet

```bash
# Installer les dépendances
npm install

# Configurer l'URL du backend
cp .env.example .env   # ajuster VITE_API_URL si besoin

# Démarrer en développement
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

L'URL exacte s'affiche dans le terminal au démarrage (Vite choisit le premier port libre, ex. `http://localhost:8082`).

## Structure

```
src/
├── api/                     # Couche d'appels API (axios), un dossier par domaine
│   ├── client.ts               # Instance axios (baseURL via VITE_API_URL, JWT auto, erreurs normalisées)
│   ├── types.ts                # Type ApiError partagé
│   ├── auth/                   # register, login, logout, getMe + persistance localStorage
│   ├── marketplace/             # getMarketplaceMachines
│   ├── machines/                 # getMyMachines, addMachine, toggleMachine, deleteMachine
│   ├── wallet/                    # getWalletSummary, getTransactions, withdraw
│   └── sessions/                   # cycle de vie complet d'une session d'exécution
├── components/
│   ├── AppShell.tsx        # Layout principal (sidebar, header, dropdowns)
│   └── ui/                 # Composants UI réutilisables (Radix)
├── routes/
│   ├── index.tsx            # Landing page publique
│   ├── auth.tsx              # Connexion / inscription (branché sur l'API)
│   └── _authenticated/       # Pages protégées (garde via GET /api/auth/me)
│       ├── marketplace.tsx      # Liste des machines actives + en ligne
│       ├── execution.tsx        # Upload → facture → paiement → exécution → clôture
│       ├── machines.tsx         # Gestion des machines du fournisseur (CRUD)
│       ├── wallet.tsx           # Solde, historique, retrait Lightning
│       ├── notifications.tsx    # ⚠️ données factices — pas de route backend correspondante
│       └── profile.tsx          # Infos de compte réelles (lecture seule)
├── lib/
│   └── theme.tsx           # Gestion du thème dark/light
└── styles.css              # Variables CSS globales & utilitaires
```

## Authentification

Le JWT est obtenu via `POST /api/auth/login`, stocké en `localStorage` (`auth_token` + `auth_user`) par `src/api/auth/auth.storage.ts`, et joint automatiquement à chaque requête par l'intercepteur axios dans `src/api/client.ts`.

Le garde de route `_authenticated/route.tsx` ne se contente pas de vérifier la présence du token : il appelle `GET /api/auth/me` à chaque navigation pour confirmer qu'il est toujours valide côté serveur, et redirige vers `/auth` sinon (token expiré, révoqué, falsifié...).

## Pages

| Route | Description | Backend |
|---|---|---|
| `/` | Landing page publique | — |
| `/auth` | Connexion et inscription | ✅ intégré |
| `/marketplace` | Parcourir les machines disponibles | ✅ intégré |
| `/execution` | Configurer et lancer un workload | ✅ intégré (cycle complet) |
| `/machines` | Gérer ses machines (ajout, activation, suppression) | ✅ intégré |
| `/wallet` | Solde, transactions, retrait Lightning | ✅ intégré |
| `/profile` | Informations de compte (lecture seule) | ✅ intégré (`GET /api/auth/me`) |
| `/notifications` | Centre de notifications | ❌ pas de route backend — reste en mock |

## Variables d'environnement

Fichier `.env` (voir `.env.example`), jamais commité (`.gitignore`) :

```env
VITE_API_URL=http://localhost:8000
```

Ne jamais coder l'URL du backend en dur dans le code — toujours passer par `import.meta.env.VITE_API_URL` (déjà fait dans `src/api/client.ts`).
