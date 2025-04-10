# Budget Tracking System (Kazi Chap Chap)

The Budget and Tracking System is designed to help users manage their budgets and track their expenses in an intuitive, secure, and efficient manner. This repository contains a full-stack solution featuring a modern front-end, API-based back-end, data persistence, and an automated testing suite. The project is structured to support containerization (Docker), continuous integration, and robust documentation.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture & Directory Structure](#architecture--directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Development](#development)
  - [Front-End](#front-end)
  - [Back-End API](#back-end-api)
  - [Data Layer](#data-layer)
- [Testing](#testing)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

The **Budget and Tracking System** is built to:

- Allow users to add, manage, and monitor personal budgets
- Track expenses with detailed categorization.
- Provide administrative features for advanced budget management.
- Export data in common formats.
- Offer a responsive, modern web interface with authentication features.

The project includes several components:

- A **front-end client** (built with modern JavaScript/TypeScript and Vite) located in the `expense-tracker/` directory.
- A **back-end API** (.NET-based, built on .NET 7/8) located in the `KaziChapChap.API/` directory.
- A **domain and business logic layer** in `KaziChapChap.Core/`.
- A **data access layer** in `KaziChapChap.Data/` that manages persistence using Entity Framework.
- A **testing suite** in `KaziChapChap.Tests/` that includes unit and integration tests.
- **Documentation** and additional configuration files to support Docker deployments and continuous integration in the `.github/workflows/` directory.

## Features

- **Budget Management:** Create and manage budgets.
- **Expense Tracking:** Record expenses with categorization and timestamps.
- **Authentication & Authorization:** Secure endpoints with token-based authentication.
- **Data Visualization:** Render charts and graphs for spending trends.
- **Exporting Capabilities:** Export records in CSV format.
- **Containerization:** Docker files and Compose support for both development and production.
- **Extensive Documentation:** Detailed guides for database schemas, file structures, and API usage.

## Architecture & Directory Structure

The repository is organized into several key areas:

- **Documentation/**
  - Contains detailed guides such as `DATABASE_Schema.md`, `DBSQL.md`, and `File_Structure.md`.
- **expense-tracker/**
  - Houses the front-end client with its own README, configuration files (Vite, TypeScript, Docker, ESLint), and source files.
- **KaziChapChap.API/**
  - Holds the back-end API code, including controllers, middleware, and startup configurations.
- **KaziChapChap.Core/**
  - Implements core business entities and interfaces such as `Budget.cs`, `Expense.cs`, `User.cs`, and authentication-related DTOs.
- **KaziChapChap.Data/**
  - Contains the data context, migrations, and data repository logic.
- **KaziChapChap.Tests/**
  - Provides tests for the API controllers and core logic.
- **.github/workflows/**
  - Includes workflow configurations for CI/CD pipelines (e.g., dotnet.yml).

## Getting Started

### Prerequisites

Before getting started, ensure you have the following installed:

- [.NET SDK (7.0 or 8.0)](https://dotnet.microsoft.com/)
- [Node.js and npm](https://nodejs.org/)
- [Docker](https://www.docker.com/) (if using containerized deployment)
- [Visual Studio Code or Visual Studio](https://code.visualstudio.com/) (optional, for development)

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/your-username/voste126-kazi_chap_chap.git
   cd voste126-kazi_chap_chap
   ```

2. **Restore Dependencies:**

   - For the API and Core components (from the root folder or their respective directories):

     ```bash
     dotnet restore
     ```

   - For the front-end:
  
     ```bash
     cd expense-tracker
     npm install
     ```

### Running the Application

#### Using Docker

1. **Build & Run Containers:**

   - For development mode:

     ```bash
     docker-compose -f expense-tracker/docker-compose.debug.yml up --build
     ```

   - For production:

     ```bash
     docker-compose -f expense-tracker/docker-compose.yml up --build
     ```

2. **Access the Application:**
   - The front-end and API will be accessible on their configured ports. Please refer to the docker-compose files for details.

#### Without Docker

1. **Front-End:**

   ```bash
   cd expense-tracker
   npm run dev
   ```

2. **Back-End API:**

   Open the `KAZI_CHAP_CHAP.sln` solution file in Visual Studio (or your preferred IDE) and run the project, or use the following command in the terminal:

   ```bash
   dotnet run --project KaziChapChap.API/KaziChapChap.API.csproj
   ```

## Development

### Front-End

The front-end client is built with TypeScript, React, and Vite. Key folders include:

- **public/**: Static assets.
- **src/**: Application code.
  - **components/**: Reusable UI components such as `BudgetManager.tsx`, `ExpenseList.tsx`, and authentication components.
  - **pages/**: Page-level components for routing (e.g., `Dashboard.tsx`, `ProfilePage.tsx`).
  - **services/**: Business logic including API calls (e.g., `authService.ts`).
  - **utils/**: Utility modules like API clients and configuration.

### Back-End API

- The API is implemented using .NET, offering RESTful endpoints for budget and expense management.
- Controllers include endpoints for budgets, expenses, authentication, notifications, and CSV data exports.
- Middleware handles logging, error-handling, and request/response inspection.
- Configuration files (`appsettings.json`, `appsettings.Development.json`) are set up for environment-specific settings.

### Data Layer

- Uses Entity Framework for managing database connections and migrations.
- Migrations are located within the `KaziChapChap.Data/Migrations/` directory.
- The data context is defined in `KaziDbContext.cs` and is used across the solution.

## Testing

- Unit and integration tests are provided within the `KaziChapChap.Tests/` project.
- Tests cover API endpoints and core business logic.
- To execute tests, run:

  ```bash
  dotnet test KaziChapChap.Tests/KaziChapChap.Tests.csproj
  ```

## Documentation

Additional documentation can be found in the `Documentation/` folder, which includes:

- **DATABASE_Schema.md:** Detailed database schema information.
- **DBSQL.md:** SQL scripts and database commands.
- **File_Structure.md:** Explanation of the repository’s file and folder hierarchy.

## Contributing

Contributions are welcome! To contribute:

1. Fork this repository.
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request and describe your feature.

Please ensure your code follows existing style guidelines and passes tests.

## License

This project is licensed under the terms of the [LICENSE](./LICENSE) file. Make sure to adhere to the licensing terms when using or contributing to this project.

## Contact

For additional information or inquiries, please open an issue or contact the project maintainer at [Steveaustine126@gmail.com](mailto:steveaustine126@gmail.com).

---
