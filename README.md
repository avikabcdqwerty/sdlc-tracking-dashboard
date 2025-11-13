# SDLC Tracking Dashboard

A modern dashboard for Project Managers to track project status and identify bottlenecks across all SDLC stages, enabling proactive risk management, resource allocation, and timely project delivery.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [Testing](#testing)
- [Security](#security)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)

---

## Features

- **SDLC Status Visualization:** View the current status of each SDLC stage for any project in progress.
- **Bottleneck Detection:** Stages with delayed tasks or unmet entry/exit criteria are visually highlighted as bottlenecks.
- **Project Filtering & Search:** Quickly filter and search projects to view SDLC status and bottleneck indicators.
- **Role-Based Access Control (RBAC):** Only users with Project Manager or higher-level permissions can access the dashboard.
- **Secure Error Handling:** System/data errors are handled gracefully with clear, non-sensitive error messages.
- **Responsive & Accessible UI:** Built with Chakra UI for fast, accessible, and responsive design.

---

## Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/) (React, TypeScript), [Chakra UI](https://chakra-ui.com/)
- **Backend:** [Next.js API Routes], [Prisma ORM](https://www.prisma.io/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Authentication/Authorization:** [JWT](https://jwt.io/), [next-auth](https://next-auth.js.org/) (recommended)
- **Testing:** [Jest](https://jestjs.io/) (unit), [Cypress](https://www.cypress.io/) (e2e)
- **Containerization:** [Docker](https://www.docker.com/)
- **Code Quality:** [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)

---

## Architecture Overview

- **Modular, Secure Design:** All components are modular and reusable. RBAC is enforced at both API and UI layers.
- **Data Integration:** Dashboard integrates with existing project management and SDLC data sources via secure API endpoints.
- **Error Boundaries:** UI and API handle errors gracefully, never exposing sensitive data.
- **Testing:** Comprehensive unit, integration, and security tests.

---

## Setup & Installation

### Prerequisites

- Node.js (v18+)
- Yarn or npm
- Docker (optional, for containerization)
- PostgreSQL database

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/sdlc-tracking-dashboard.git
cd sdlc-tracking-dashboard
```

### 2. Install Dependencies

```bash
yarn install
# or
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your database and JWT secrets:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL` (PostgreSQL connection string)
- `JWT_SECRET`
- `NEXTAUTH_URL` (if using next-auth)

### 4. Setup Database

Run Prisma migrations to set up the database schema:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start the Development Server

```bash
yarn dev
# or
npm run dev
```

The dashboard will be available at [http://localhost:3000](http://localhost:3000).

### 6. (Optional) Run in Docker

```bash
docker-compose up --build
```

---

## Usage

1. **Login:** Authenticate with your Project Manager or Admin credentials.
2. **Dashboard:** Access the SDLC Tracking Dashboard from the main navigation.
3. **Filter/Search:** Use the search bar and project selector to find projects.
4. **View SDLC Status:** See each SDLC stage's status, bottleneck indicators, and details.
5. **Error Handling:** If a system/data error occurs, a clear, non-sensitive message will be shown.

---

## Testing

### Unit & Integration Tests

```bash
yarn test
# or
npm test
```

### End-to-End Tests

```bash
yarn cypress open
# or
npm run cypress:open
```

### Linting & Formatting

```bash
yarn lint
yarn format
```

---

## Security

- **RBAC:** All API and UI entry points enforce role-based access control.
- **Error Handling:** No sensitive project data is exposed in error states.
- **Authentication:** JWT and next-auth recommended for secure authentication.
- **Dependencies:** All dependencies are kept up-to-date and monitored for vulnerabilities.

---

## Contribution Guidelines

We welcome contributions! Please follow these steps:

1. **Fork the repository** and create your branch from `main`.
2. **Write clear, modular code** with documentation and tests.
3. **Run all tests and linters** before submitting a PR.
4. **Describe your changes** and reference any relevant issues.
5. **Ensure RBAC and error handling** are not compromised.

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Contact & Support

For questions, issues, or feature requests, please open an issue or contact the maintainers at [support@your-org.com](mailto:support@your-org.com).

---