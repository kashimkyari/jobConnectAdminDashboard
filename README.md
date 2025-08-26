# Admin Dashboard for JobConnect Platform

## Overview

This is a comprehensive admin dashboard for the JobConnect platform, a job marketplace connecting employers and freelancers. The application provides administrators with tools to manage users, jobs, disputes, KYC verification, content moderation, and payment oversight. Built with a modern full-stack architecture, it features a React frontend with TypeScript, a Node.js/Express backend, and PostgreSQL database integration using Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with protected routes for authenticated admin users
- **State Management**: Zustand for authentication state and TanStack Query for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS styling
- **Design System**: Custom design tokens using CSS variables for theming, "new-york" shadcn style variant
- **Form Handling**: React Hook Form with Zod validation schemas for type-safe form management
- **Charts**: Chart.js integration for dashboard metrics and analytics visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js framework using ES modules
- **Language**: TypeScript with strict type checking enabled
- **API Design**: RESTful API endpoints following `/api/v1/*` pattern for versioning
- **Authentication**: JWT-based authentication with role-based access control (admin-only access)
- **Database ORM**: Drizzle ORM for type-safe database operations with PostgreSQL
- **Request Handling**: Express middleware for logging, JSON parsing, and error handling
- **Development**: Hot reload with tsx for TypeScript execution in development

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless configuration
- **ORM**: Drizzle ORM with schema-first approach for type safety
- **Connection Pooling**: Neon serverless pool for efficient database connections
- **Schema Management**: Centralized schema definitions in shared directory for consistency
- **Migrations**: Drizzle Kit for database schema migrations and deployments

### Authentication and Authorization
- **Authentication Method**: JWT tokens with 7-day expiration
- **Token Storage**: Secure localStorage implementation with automatic token validation
- **Role-Based Access**: Admin-only access enforcement at both frontend and backend levels
- **Session Management**: Automatic token refresh and logout on expiration
- **Security**: Protected routes with authentication middleware and role verification

### Key Features and Modules
- **Dashboard Overview**: Real-time statistics, user growth metrics, and job completion analytics
- **User Management**: CRUD operations, role filtering, verification, suspension, and deactivation
- **Job Management**: Job listing, status tracking, dispute identification, and detailed job views
- **Dispute Resolution**: Dispute management with resolution workflows and status tracking
- **KYC Verification**: Document review, approval/rejection workflows, and compliance tracking
- **Content Moderation**: Flagged content review, approval/removal actions, and moderation history
- **Payment Reports**: Transaction history, payment analytics, and financial reporting

## External Dependencies

### Authentication and Security
- **JWT**: jsonwebtoken library for secure token generation and verification
- **Password Handling**: Basic password comparison (production should use bcrypt)
- **Session Storage**: Browser localStorage for client-side token persistence

### UI and Styling
- **Radix UI**: Comprehensive set of low-level UI primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography across the application
- **Chart.js**: Canvas-based charting library for dashboard analytics

### Development and Build Tools
- **Vite**: Fast build tool with hot module replacement for development
- **TypeScript**: Static type checking across frontend, backend, and shared code
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer plugins

### State Management and Data Fetching
- **TanStack Query**: Server state management with caching, background updates, and error handling
- **Zustand**: Lightweight state management for authentication and global application state
- **React Hook Form**: Performant form library with minimal re-renders and validation

### Validation and Type Safety
- **Zod**: TypeScript-first schema validation for runtime type checking
- **Shared Schemas**: Common validation schemas used across frontend and backend
- **Type Generation**: Automatic TypeScript types from Zod schemas for consistency