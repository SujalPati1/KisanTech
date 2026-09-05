# TechKisan backend

Express API providing the auth endpoints (`POST /api/signup`, `POST /api/login`) that the `Admin` and `client` frontends call. Recovered from the `sujal` branch of [SujalPati1/TechKisan](https://github.com/SujalPati1/TechKisan) — the git submodule that originally pointed here went dangling because `.gitmodules` was never committed, so this is a plain copy rather than a submodule.

**Scope:** auth only — user signup/login backed by MongoDB (`src/models/user.model.js`) and Firebase Admin for email verification and token issuance (`src/config/firebase.js`). It does not implement the schemes/farmers/instruments/content endpoints or the `/sell` and `/buy` Socket.IO namespaces the frontends also expect — those still need to be written.

## Setup

```bash
cd TechKisan
npm install
```

Create `TechKisan/.env` from `.env.example`:

```env
PORT=5000
MONGO_URI=your-mongodb-connection-string
```

Download a Firebase service account key for the `techkisan-c0700` project and save it as `TechKisan/src/config/serviceAccountKey.json` (gitignored — never commit this file).

```bash
npm run dev
```
