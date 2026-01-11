# TeamUp Frontend

Application Next.js pour la plateforme TeamUp - Événements locaux.

## Stack technique

- **Next.js 14** (App Router, SSR/ISR)
- **React 18**
- **TypeScript**
- **Tailwind CSS v3**
- **Police Poppins**

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
npm start
```

## Configuration

Variables d'environnement dans `.env.local` :

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Structure

```
teamup_frontend/
├── app/
│   ├── layout.tsx       # Layout principal
│   ├── page.tsx         # Page d'accueil
│   └── globals.css      # Styles globaux
├── components/          # Composants réutilisables
├── lib/                 # Utilitaires et helpers
└── public/              # Assets statiques
```
