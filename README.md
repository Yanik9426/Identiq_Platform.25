# Identiq Recruitment Platform (Identiq_Platform.25)

## 📖 Overview

Identiq is a Software-as-a-Service (SaaS) Progressive Web Application (PWA) designed to revolutionize the recruitment process within the South African security industry. It connects vetted security professionals (Candidates) with security companies (Companies) seeking qualified personnel, facilitated by platform administrators (Admins). The platform aims to streamline candidate sourcing, verification, matching, and onboarding.

**Project Status:** 🌱 Active Development (Currently undergoing a fresh rebuild following a phased roadmap, starting April 2025).

## ✨ Core Features (Planned based on Roadmap)

* **Candidate Portal:** Profile creation (detailed 7-step process), document uploads & verification tracking, self-assessments, vacancy search & application, endorsement system.
* **Company Portal:** Dashboard & analytics, vacancy management, advanced candidate search & filtering, profile downloads (billing integrated), interview scheduling, team management (RBAC).
* **Admin Portal:** Platform metrics dashboard, user & company management, assessment builder, document verification workflow, billing management, system configuration.
* **Key Functionalities:** OTP/2FA Authentication, Role-Based Access Control (RBAC), AI-powered vacancy matching, background check integration (Ndende), geolocation (Mapbox), notifications (WhatsApp), scheduling (Outlook Calendar), OCR verification, payment processing.

## 🚀 Technology Stack

* **Frontend:** React `18.2.0`, TypeScript `4.9.5`
* **Styling:** Tailwind CSS
* **State Management:** React Context API (initially)
* **Routing:** React Router v6
* **Backend & Infrastructure:** Firebase (`IdentiqPlatform-25`)
    * Authentication (OTP, Google Authenticator)
    * Firestore (Database)
    * Cloud Storage (File Uploads)
    * Cloud Functions (Serverless Backend Logic - Planned)
    * Hosting (PWA Deployment with CDN)
* **Build Tool:** Create React App (`react-scripts@5.0.1`)
* **CI/CD:** GitHub Actions (Planned)

## 셋 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Node.js (v20.x recommended)
* npm (v9.x or later, usually bundled with Node.js)
* Git

### Installation

1.  **Clone the repository:** (Assuming you link your local project to the remote repo later)
    ```bash
    # Navigate to where you want to store the project, then:
    git clone [https://github.com/Yanik9426/Identiq_Platform.25.git](https://www.google.com/search?q=https://github.com/Yanik9426/Identiq_Platform.25.git)
    cd Identiq_Platform.25
    ```
    *(Note: If you already initialized the project locally using the previous prompt, skip the clone step and ensure your local project is linked to this remote repository later using `git remote add origin ...`)*

2.  **Install dependencies:**
    *It is crucial to use `npm ci` for installing dependencies. This ensures consistency by using the exact versions specified in the `package-lock.json` file.*
    ```bash
    npm ci
    ```

3.  **Firebase Configuration (Local Environment):**
    * Create a file named `.env.local` in the root directory of the project (`Identiq_Platform.25/.env.local`). **This file should NOT be committed to Git.**
    * Add your Firebase project's configuration keys to this file. You must prefix environment variables with `REACT_APP_` for Create React App to recognize them.
        ```dotenv
        REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY
        REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
        REACT_APP_FIREBASE_PROJECT_ID=IdentiqPlatform-25
        REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
        REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
        REACT_APP_FIREBASE_APP_ID=YOUR_APP_ID
        ```
    * You can find these configuration values in your Firebase project settings:
        * Go to Firebase Console > Project `IdentiqPlatform-25`.
        * Click the Gear icon ⚙️ > Project settings > General tab.
        * Scroll down to "Your apps". If no app is registered yet, click the Web icon (`</>`) to register a new web app.
        * Give it a nickname (e.g., "Identiq Web App") and complete registration.
        * Find the `firebaseConfig` object in the "SDK setup and configuration" section and copy the values into your `.env.local` file.

### Running the Application

* **Development Mode:** Starts the app with hot-reloading. Ensure Tailwind directives are processed correctly (CRA setup should handle this).
    ```bash
    npm start
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

* **Production Build:** Creates an optimized build in the `build` folder.
    ```bash
    npm run build
    ```

* **Run Tests:** Executes the test suite (initial setup might have basic tests).
    ```bash
    npm test
    ```

## 📜 Available Scripts

In the `package.json`, you can run the following core scripts:

* `npm start`: Runs the app in development mode.
* `npm test`: Launches the test runner.
* `npm run build`: Builds the app for production.
* `npm run lint`: *(To be configured)* Placeholder for running ESLint checks.
* `npm run format:check`: *(To be configured)* Placeholder for running Prettier formatting checks.
* `npm run eject`: Ejects from Create React App (Use with extreme caution! This is a one-way operation).

*(Tailwind-specific scripts like `build:css` or `watch:css` might also be present depending on the exact setup chosen)*

## 📁 Project Structure (Simplified Initial)

Identiq_Platform.25/
├── .github/             # GitHub Actions workflows (CI/CD - Planned)
│   └── workflows/
├── public/              # Static assets, index.html, manifest.json
├── src/                 # Main application source code
│   ├── assets/          # Images, fonts, etc. (To be added)
│   ├── components/      # Reusable UI components (Layout, Shared, etc.)
│   ├── config/          # Firebase initialization/config
│   ├── contexts/        # React Context providers (To be added)
│   ├── features/        # Feature-specific modules (Auth, Candidate, Company, Admin - To be added)
│   ├── hooks/           # Custom React hooks (To be added)
│   ├── locales/         # Internationalization files (Planned)
│   ├── pages/           # Page-level components (e.g., LandingPage, LoginPage)
│   ├── routes/          # Routing configuration (To be added)
│   ├── services/        # API calls, Firebase interactions (To be added)
│   ├── store/           # Global state management (If needed beyond Context - To be added)
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions (To be added)
│   ├── App.tsx          # Main application component
│   ├── index.css        # Global styles / Tailwind directives
│   └── index.tsx        # Application entry point
├── .env.local           # Local environment variables (Firebase keys, etc. - DO NOT COMMIT)
├── .gitignore           # Files/folders ignored by Git
├── package.json         # Project dependencies and scripts
├── package-lock.json    # Exact dependency versions lock file
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration (for Tailwind)
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file

## 🤝 Contributing

*(Placeholder: Contribution guidelines will be added here if the project becomes open to external contributions.)*

## 📄 License

*(Placeholder: Specify the project license here. E.g., MIT License or Proprietary.)*