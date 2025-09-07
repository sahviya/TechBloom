# MindBloom - AI-Powered Wellness Application

## Overview

MindBloom is a comprehensive mental health and wellness web application that combines AI-powered support with community features, personal journaling, and curated content recommendations. The application serves as a digital companion for users seeking mental health support, providing personalized guidance through an AI assistant called "Genie" while fostering community connections and offering various wellness resources.

The platform integrates modern web technologies with AI capabilities to deliver a holistic wellness experience, including mood tracking, journaling, media recommendations, games, books, shopping therapy, and peer support through community features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Build Tool**: Vite for fast development and optimized production builds
- **Theme System**: Custom theme provider supporting light/dark/system themes with CSS variables

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: OpenID Connect integration with Replit Auth for secure user authentication
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful API endpoints with consistent error handling

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Schema**: Comprehensive schema including users, journal entries, community posts, mood tracking, and AI conversations
- **Relationships**: Proper foreign key relationships between users, posts, comments, and likes
- **Session Storage**: Dedicated sessions table for authentication state management

### AI Integration
- **Provider**: Google Gemini AI (via @google/genai) for natural language processing
- **Features**: Conversational AI companion with emotional support capabilities
- **Response Format**: Structured JSON responses with tone classification and suggestions
- **Context Awareness**: Conversation history tracking for personalized interactions

### Authentication System
- **Method**: OpenID Connect (OIDC) with Replit as identity provider
- **Session Management**: Secure session cookies with PostgreSQL backing
- **User Profile**: Comprehensive user profiles with customizable themes and preferences
- **Authorization**: Route-level protection with middleware-based authentication checks

### Data Models
- **Users**: Profile information, preferences, theme settings, and authentication data
- **Journal Entries**: Personal journal entries with mood tracking and content analysis
- **Community Posts**: User-generated content with likes, comments, and engagement metrics
- **Mood Tracking**: Daily mood entries with historical data for trend analysis
- **AI Conversations**: Chat history with the AI companion for continuity

### UI/UX Architecture
- **Component Library**: Radix UI primitives with shadcn/ui styling for accessibility
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Navigation**: Sticky header with mobile-optimized navigation
- **Theme System**: CSS custom properties for seamless theme switching
- **Animations**: Tailwind CSS animations with custom keyframes for enhanced user experience

### Content Management
- **Media Recommendations**: Curated lists of movies, music, and TED talks
- **Games Integration**: External game links with categorization
- **Books Library**: Free self-help resources with download links
- **Shopping Integration**: Wellness-focused product recommendations with external links

### Performance Optimizations
- **Caching**: TanStack Query for intelligent data caching and background updates
- **Bundle Optimization**: Vite with code splitting and tree shaking
- **Asset Management**: Optimized static asset serving with proper cache headers
- **Database Optimization**: Indexed queries with efficient relationship loading

## External Dependencies

### Core Infrastructure
- **Database**: PostgreSQL via Neon Database (@neondatabase/serverless)
- **Authentication**: Replit OpenID Connect service
- **AI Services**: Google Gemini AI API for conversational intelligence

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessible component foundation
- **Styling**: Tailwind CSS for utility-first styling approach
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Icons**: Font Awesome 6 for comprehensive icon library
- **Fonts**: Google Fonts (Playfair Display, Inter) for typography

### Backend Dependencies
- **Web Framework**: Express.js with TypeScript support
- **Database ORM**: Drizzle with migration support
- **Session Storage**: connect-pg-simple for PostgreSQL session management
- **Validation**: Zod for runtime type validation

### Development Tools
- **Build System**: Vite with React plugin and hot module replacement
- **TypeScript**: Full-stack type safety with strict configuration
- **Package Management**: npm with lockfile for dependency consistency
- **Environment**: Replit-specific plugins for development environment integration

### Third-Party Integrations
- **Media Content**: YouTube and Spotify embed integration for media recommendations
- **E-commerce**: Amazon affiliate links for wellness product recommendations
- **External Resources**: Project Gutenberg and Internet Archive for free book access
- **Game Platforms**: Links to web-based games and wellness applications

### Security Dependencies
- **Session Security**: Secure session configuration with HTTP-only cookies
- **CORS**: Express CORS middleware for cross-origin request handling
- **Environment Variables**: Secure API key and database URL management
- **Input Validation**: Zod schemas for request validation and sanitization