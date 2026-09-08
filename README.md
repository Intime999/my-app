# React + TypeScript + Vite

## MongoDB setup

The app uses a small Express API to keep MongoDB credentials out of the browser. Copy `.env.example` to `.env` and set `MONGODB_URI` to your local MongoDB or MongoDB Atlas connection string. The API loads `.env` automatically.

Run the frontend and API in separate terminals:

```bash
npm run dev:api
npm run dev
```

The API listens on port `3001`; Vite proxies `/api` requests to it. If the API is unavailable, the app falls back to its existing browser storage so the UI can still be used offline.

## Production deployment

GitHub Pages hosts the React frontend only. Deploy the Express API separately to a Node service such as Render, Railway, or Fly.io, and set these variables on the API service:

```bash
MONGODB_URI=your-mongodb-atlas-connection-string
MONGODB_DB=educampus
CLIENT_ORIGIN=https://intime999.github.io
PORT=3001
```

Set `VITE_API_URL` to the public API URL when building the GitHub Pages site, for example:

```bash
VITE_API_URL=https://your-api.example.com npm run build
```

Without `VITE_API_URL`, the local Vite proxy is used during development. Without a deployed API, GitHub Pages uses browser storage because Pages cannot run the Express server.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
