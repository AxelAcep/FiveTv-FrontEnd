# FiveTV Frontend

This is the frontend for the FiveTV application, built with Next.js and TypeScript. It provides the user interface for interacting with the FiveTV backend.

## Table of Contents

- [FiveTV Frontend](#fivetv-frontend)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Technologies](#technologies)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Configuration](#configuration)
    - [Running the Development Server](#running-the-development-server)
  - [Project Structure](#project-structure)
  - [Environment Variables](#environment-variables)
  - [API Services](#api-services)

## Features

- User-facing and Admin interfaces.
- Content browsing (articles and programs).
- Detailed content views.
- Search functionality.
- Admin dashboard for content management.
- CRUD operations for articles, programs, and members.
- Website configuration management for admins.

## Technologies

- **Next.js**: React framework for production.
- **TypeScript**: Typed JavaScript for robust application development.
- **React**: JavaScript library for building user interfaces.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Supabase**: Used for image storage.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd FiveTv-FrontEnd
    ```

2.  Install the dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

### Configuration

1.  Create a `.env.local` file in the root of the project and add the necessary environment variables. See the [Environment Variables](#environment-variables) section for more details.

### Running the Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Project Structure

The project follows the Next.js App Router structure.

```
src/
├── app/                  # Application routes
│   ├── (admin)/          # Admin-only routes
│   └── (user)/           # Public user routes
├── components/           # Reusable React components
├── model/                # TypeScript interfaces and type definitions
├── services/             # API service layer for backend communication
└── tailwind.config.js    # Tailwind CSS configuration
```

-   **`app/(admin)`**: Contains all pages related to the admin dashboard. These routes are protected and require authentication.
-   **`app/(user)`**: Contains all publicly accessible pages for users, such as the homepage, articles, and programs.
-   **`components`**: Shared components used across different pages (e.g., `Header`, `Footer`, `Sidebar`).
-   **`model`**: Defines the TypeScript types for data structures used throughout the application (e.g., `UserModel`, `AdminModel`).
-   **`services`**: Handles all communication with the backend API. Each service file corresponds to a specific domain (e.g., `AdminServices`, `ArticleServices`).

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
# URL of your backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:5500

# Supabase credentials for file storage
NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
NEXT_PUBLIC_SUPABASE_SERVICE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
NEXT_PUBLIC_SUPABASE_BUCKET_NAME="FiveTv"
```

## API Services

The `src/services` directory contains modules responsible for making API calls to the backend.

-   **`AdminServices.ts`**: Handles admin login, dashboard data, and content management.
-   **`ArticleServices.ts`**: Manages CRUD operations for articles, including image uploads to Supabase.
-   **`ConfigServices.ts`**: Manages website configuration settings.
-   **`MemberSercives.ts`**: Manages CRUD operations for "pengurus" (members/staff).
-   **`UserServices.ts`**: Fetches data for public-facing pages like the dashboard, articles, and programs.
