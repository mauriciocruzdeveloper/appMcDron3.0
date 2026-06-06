# App MC Dron 3.0 - Gemini Context

## Project Overview
App MC Dron 3.0 is a mobile and web application designed to manage a drone repair business. It facilitates the administration of budgets, repairs, and communication with clients. 

The application follows a **Local First** philosophy, storing and managing data locally (using a cache-first approach) and synchronizing with the cloud (Firebase) as needed to ensure offline functionality and high performance.

### Key Technologies
- **Frontend Framework:** React (using a mix of JavaScript, JSX, and TypeScript)
- **State Management:** Redux Toolkit (with a flow from Presentational -> Container -> Actions -> Redux -> Container -> Presentational).
- **Styling/UI:** Bootstrap (React Bootstrap), custom CSS.
- **Backend & Database:** Firebase (Firestore, Authentication).
- **Mobile Wrapper:** Apache Cordova (targets Android and browser).

## Architecture & Conventions
- **Container-Presentational Pattern:** The application historically separates components into `*.container.jsx/tsx` and `*.presentational.jsx/tsx`. Note that the project is currently in the process of refactoring to use Custom Hooks instead of this strict separation.
- **State Syncing:** The app listens for changes in Firebase collections at the persistence level and automatically updates the Redux store, which in turn reactively updates the UI.
- **File Naming:** Components generally follow a `ComponentName.component.tsx` or `.jsx` convention (or container/presentational suffixes).
- **TypeScript:** The project is configured for TypeScript (`tsconfig.json` is present), but allows JavaScript (`allowJs: true`). New code should ideally be written in TypeScript, but be mindful of existing JavaScript files.

## Building and Running

### Local Web Development
To run the React application in the browser for local development:
```bash
npm start
```

### Build & Deploy
The project includes automated scripts for building the Cordova application (Android APK and Browser) and deploying it.

**Unified Build and Deploy (Recommended)**
This script automatically checks for dependencies, builds the Android APK, aligns and signs it, builds the browser version, and deploys it to the server.
```bash
./build_and_deploy.sh
```

**Alternative/Specific Scripts:**
- `npm run build`: Standard React build.
- `cordova run browser`: Run the app in the browser using Cordova.
- `./scripts/sh/build_and_sign_auto.sh`: Only build and sign the Android APK.
- `./scripts/sh/build_and_deploy_browser.sh`: Only build and deploy the browser version.

## Key Directories
- `src/`: Main source code.
  - `components/`: UI components (React).
  - `redux-tool-kit/`: Redux store, slices, and actions.
  - `hooks/`: Custom React hooks (part of the refactoring effort).
  - `firebase/`: Firebase configuration and initialization.
  - `persistencia/`: Local storage and caching layer logic.
  - `usecases/`: Business logic.
- `scripts/`: Various utility scripts for build, deployment, and database migrations/fixes.
- `sql/`: SQL scripts for database migrations (likely for a secondary database or historical data, as primary is Firebase).
- `platforms/`: Cordova platform-specific code (Android, Browser).
- `plugins/`: Cordova plugins.
