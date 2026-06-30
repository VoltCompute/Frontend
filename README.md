# VoltCompute

Plateforme de calcul décentralisé permettant de louer ou monétiser de la puissance GPU/CPU, avec paiement en Satoshis via le Lightning Network.

## Stack technique

- **Framework** : [TanStack Start](https://tanstack.com/start) (React 19 + SSR)
- **Routing** : TanStack Router (file-based)
- **Styles** : Tailwind CSS v4
- **UI** : Radix UI + composants personnalisés
- **Build** : Vite 8

## Lancer le projet

```bash
# Installer les dépendances
npm install

# Démarrer en développement
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

L'app est disponible sur `http://localhost:5173`.

## Structure

```
src/
├── components/
│   ├── AppShell.tsx        # Layout principal (sidebar, header, dropdowns)
│   └── ui/                 # Composants UI réutilisables (Radix)
├── routes/
│   ├── auth.tsx            # Page connexion / inscription
│   └── _authenticated/     # Pages protégées (nécessitent auth_token)
│       ├── index.tsx       # Marketplace — liste et filtrage des nodes
│       ├── execution.tsx   # Lancement de workloads (fichier, ZIP, GitHub)
│       ├── machines.tsx    # Gestion des machines connectées
│       ├── wallet.tsx      # Portefeuille Lightning & historique
│       ├── notifications.tsx # Centre de notifications
│       └── profile.tsx     # Profil utilisateur & sécurité
├── lib/
│   └── theme.tsx           # Gestion du thème dark/light
└── styles.css              # Variables CSS globales & utilitaires
```

## Authentification

L'authentification est gérée côté client via `localStorage`. À la connexion, un `auth_token` est stocké. Les routes sous `/_authenticated` vérifient sa présence et redirigent vers `/auth` si absent.

> L'intégration avec l'API backend est à brancher dans `src/routes/auth.tsx` (fonction `handleSubmit`) et dans chaque page pour les appels de données.

## Pages

| Route | Description |
|---|---|
| `/auth` | Connexion et inscription |
| `/` | Marketplace — parcourir les nodes disponibles |
| `/execution` | Configurer et lancer un workload |
| `/machines` | Gérer ses machines (ajout, modification, suppression) |
| `/wallet` | Solde, transactions, retrait Lightning |
| `/notifications` | Historique des notifications |
| `/profile` | Informations personnelles et mot de passe |

## Variables d'environnement

Créez un fichier `.env` à la racine pour configurer l'API :

```env
VITE_API_URL=https://votre-api.com
```

> Le fichier `.env` est dans `.gitignore` et ne sera jamais commité.
